import { useCallback, useMemo, useRef, useState } from 'react'
import {
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type OnConnect,
} from '@xyflow/react'
import { expandNodes, getNodeDetail } from '../api/client'
import type { ExploreNode, NodeDetail, NodeType, WorldNodeData } from '../types'
import { decorateGraph, MAX_CHILDREN_PER_LAYER } from '../utils/layoutEngine'

let nodeIdCounter = 0
function generateId() {
  return `node-${++nodeIdCounter}-${Date.now()}`
}

function tempChildPosition(parent: Node<WorldNodeData>, index: number) {
  return {
    x: parent.position.x + (index - 2) * 80,
    y: parent.position.y + 160,
  }
}

export interface PathItem {
  id: string
  title: string
}

interface SelectedNode {
  id: string
  title: string
  description: string
  type: NodeType
}

function capNodes(nodes: ExploreNode[]): ExploreNode[] {
  return nodes.slice(0, MAX_CHILDREN_PER_LAYER)
}

export function useWorldFlow(rootTopic: string) {
  const [baseNodes, setBaseNodes, onNodesChange] = useNodesState<Node<WorldNodeData>>([])
  const [baseEdges, setBaseEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null)
  const [nodeDetail, setNodeDetail] = useState<NodeDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isExtending, setIsExtending] = useState(false)
  const [extendingLabel, setExtendingLabel] = useState('')
  const [explorationPath, setExplorationPath] = useState<PathItem[]>([])
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null)

  const expandedSet = useRef(new Set<string>())
  const contextPathMap = useRef(new Map<string, string[]>())
  const parentMap = useRef(new Map<string, string>())
  const newNodeIds = useRef(new Set<string>())
  const rootTopicRef = useRef(rootTopic)
  const baseNodesRef = useRef(baseNodes)
  baseNodesRef.current = baseNodes
  const baseEdgesRef = useRef(baseEdges)
  baseEdgesRef.current = baseEdges

  const buildPathFromNode = useCallback((nodeId: string, nds: Node<WorldNodeData>[]) => {
    const path: PathItem[] = []
    let current: string | undefined = nodeId
    while (current) {
      const node = nds.find((n) => n.id === current)
      if (node) path.unshift({ id: current, title: node.data.title })
      current = parentMap.current.get(current)
    }
    return path
  }, [])

  const markNodesAsNew = useCallback((ids: string[]) => {
    ids.forEach((id) => newNodeIds.current.add(id))
    setTimeout(() => {
      ids.forEach((id) => newNodeIds.current.delete(id))
      setBaseNodes((nds) => [...nds])
    }, 1200)
  }, [setBaseNodes])

  const loadDetail = useCallback(async (node: SelectedNode) => {
    setDetailLoading(true)
    setNodeDetail(null)
    try {
      const path = contextPathMap.current.get(node.id) || [rootTopicRef.current]
      const detail = await getNodeDetail({
        title: node.title,
        description: node.description,
        contextPath: path,
      })
      setNodeDetail(detail)
    } catch {
      setNodeDetail(null)
    } finally {
      setDetailLoading(false)
    }
  }, [])

  const selectNode = useCallback(
    (nodeId: string, nds?: Node<WorldNodeData>[]) => {
      const list = nds ?? baseNodesRef.current
      const node = list.find((n) => n.id === nodeId)
      if (!node) return

      const selected: SelectedNode = {
        id: nodeId,
        title: node.data.title,
        description: node.data.description,
        type: node.data.type,
      }
      setSelectedNode(selected)
      setExplorationPath(buildPathFromNode(nodeId, list))
      setFocusNodeId(nodeId)
      loadDetail(selected)
    },
    [buildPathFromNode, loadDetail]
  )

  const handleSelect = useCallback(
    (nodeId: string) => selectNode(nodeId),
    [selectNode]
  )

  const updateNodeData = useCallback(
    (nodeId: string, patch: Partial<WorldNodeData>) => {
      setBaseNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, ...patch } } : n
        )
      )
    },
    [setBaseNodes]
  )

  const handleExpand = useCallback(
    async (nodeId: string, options?: { skipSelect?: boolean }) => {
      if (expandedSet.current.has(nodeId)) return false

      let parentNode: Node<WorldNodeData> | undefined
      setBaseNodes((nds) => {
        parentNode = nds.find((n) => n.id === nodeId)
        return nds.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, isExpanding: true } } : n
        )
      })

      if (!parentNode) return false
      expandedSet.current.add(nodeId)

      const contextPath = contextPathMap.current.get(nodeId) || [rootTopicRef.current]
      const isRoot = parentNode.data.isRoot
      const parent = parentNode

      try {
        const rawNodes = capNodes(
          await expandNodes({
            topic: rootTopicRef.current,
            parentTitle: isRoot ? undefined : parent.data.title,
            contextPath,
          })
        )

        const childIds: string[] = []
        const childNodes: Node<WorldNodeData>[] = rawNodes.map((n, i) => {
          const id = generateId()
          childIds.push(id)
          parentMap.current.set(id, nodeId)
          contextPathMap.current.set(id, [...contextPath, n.title])
          return {
            id,
            type: 'worldNode',
            position: tempChildPosition(parent, i),
            data: {
              title: n.title,
              description: n.description,
              type: n.type,
              depth: (parent.data.depth ?? 0) + 1,
              isExpanded: false,
              isExpanding: false,
              isNew: true,
              onExpand: handleExpandRef.current,
              onSelect: handleSelectRef.current,
            },
          }
        })

        const newEdges: Edge[] = childNodes.map((child) => ({
          id: `edge-${nodeId}-${child.id}`,
          source: nodeId,
          target: child.id,
        }))

        let updatedNodes: Node<WorldNodeData>[] = []
        let updatedEdges: Edge[] = []
        setBaseNodes((nds) => {
          updatedNodes = [
            ...nds.map((n) =>
              n.id === nodeId
                ? { ...n, data: { ...n.data, isExpanded: true, isExpanding: false } }
                : n
            ),
            ...childNodes,
          ]
          return updatedNodes
        })
        setBaseEdges((eds) => {
          updatedEdges = [...eds, ...newEdges]
          return updatedEdges
        })
        markNodesAsNew(childIds)

        if (!options?.skipSelect) {
          selectNode(nodeId, updatedNodes)
        }
        setFocusNodeId(nodeId)
        return true
      } catch {
        expandedSet.current.delete(nodeId)
        updateNodeData(nodeId, { isExpanding: false })
        return false
      }
    },
    [setBaseNodes, setBaseEdges, updateNodeData, selectNode, markNodesAsNew]
  )

  const exploreFromSuggestion = useCallback(
    async (suggestion: string) => {
      if (!selectedNode || isExtending) return

      const parentId = selectedNode.id
      const parentNode = baseNodesRef.current.find((n) => n.id === parentId)
      if (!parentNode) return

      const normalized = suggestion.trim()
      if (!normalized) return

      setIsExtending(true)
      setExtendingLabel(normalized)

      const existingChild = baseNodesRef.current.find(
        (n) =>
          parentMap.current.get(n.id) === parentId &&
          (n.data.title === normalized ||
            n.data.title.includes(normalized.slice(0, 8)) ||
            normalized.includes(n.data.title.slice(0, 8)))
      )

      if (existingChild) {
        selectNode(existingChild.id)
        if (!expandedSet.current.has(existingChild.id)) {
          await handleExpand(existingChild.id)
        }
        setIsExtending(false)
        setExtendingLabel('')
        return
      }

      const parentContextPath =
        contextPathMap.current.get(parentId) || [rootTopicRef.current]
      const newContextPath = [...parentContextPath, normalized]

      const siblingCount = baseNodesRef.current.filter(
        (n) => parentMap.current.get(n.id) === parentId
      ).length

      const newNodeId = generateId()
      parentMap.current.set(newNodeId, parentId)
      contextPathMap.current.set(newNodeId, newContextPath)

      const placeholderNode: Node<WorldNodeData> = {
        id: newNodeId,
        type: 'worldNode',
        position: tempChildPosition(parentNode, siblingCount),
        data: {
          title: normalized,
          description: '正在展开…',
          type: 'concept',
          depth: (parentNode.data.depth ?? 0) + 1,
          isExpanded: false,
          isExpanding: true,
          isNew: true,
          onExpand: handleExpandRef.current,
          onSelect: handleSelectRef.current,
        },
      }

      const placeholderEdge: Edge = {
        id: `edge-${parentId}-${newNodeId}`,
        source: parentId,
        target: newNodeId,
      }

      setBaseNodes((nds) => [...nds, placeholderNode])
      setBaseEdges((eds) => [...eds, placeholderEdge])
      markNodesAsNew([newNodeId])
      selectNode(newNodeId, [...baseNodesRef.current, placeholderNode])

      try {
        const rawNodes = capNodes(
          await expandNodes({
            topic: rootTopicRef.current,
            parentTitle: normalized,
            contextPath: newContextPath,
          })
        )

        const childIds: string[] = []
        const childNodes: Node<WorldNodeData>[] = rawNodes.map((n, i) => {
          const id = generateId()
          childIds.push(id)
          parentMap.current.set(id, newNodeId)
          contextPathMap.current.set(id, [...newContextPath, n.title])
          return {
            id,
            type: 'worldNode',
            position: tempChildPosition(placeholderNode, i),
            data: {
              title: n.title,
              description: n.description,
              type: n.type,
              depth: (parentNode.data.depth ?? 0) + 2,
              isExpanded: false,
              isExpanding: false,
              isNew: true,
              onExpand: handleExpandRef.current,
              onSelect: handleSelectRef.current,
            },
          }
        })

        const childEdges: Edge[] = childNodes.map((child) => ({
          id: `edge-${newNodeId}-${child.id}`,
          source: newNodeId,
          target: child.id,
        }))

        expandedSet.current.add(newNodeId)

        let finalNodes: Node<WorldNodeData>[] = []
        setBaseNodes((nds) => {
          finalNodes = [
            ...nds.map((n) =>
              n.id === newNodeId
                ? {
                    ...n,
                    data: {
                      ...n.data,
                      isExpanded: true,
                      isExpanding: false,
                    },
                  }
                : n
            ),
            ...childNodes,
          ]
          return finalNodes
        })
        setBaseEdges((eds) => [...eds, ...childEdges])
        markNodesAsNew(childIds)

        selectNode(newNodeId, finalNodes)
        setFocusNodeId(newNodeId)
      } catch {
        updateNodeData(newNodeId, { isExpanding: false })
      } finally {
        setIsExtending(false)
        setExtendingLabel('')
      }
    },
    [
      selectedNode,
      isExtending,
      handleExpand,
      selectNode,
      setBaseNodes,
      setBaseEdges,
      updateNodeData,
      markNodesAsNew,
    ]
  )

  const navigateToPathNode = useCallback(
    (nodeId: string) => {
      selectNode(nodeId)
      setFocusNodeId(nodeId)
    },
    [selectNode]
  )

  const goBackOneLevel = useCallback(() => {
    if (explorationPath.length < 2) return
    const parent = explorationPath[explorationPath.length - 2]
    navigateToPathNode(parent.id)
  }, [explorationPath, navigateToPathNode])

  const handleExpandRef = useRef(handleExpand)
  handleExpandRef.current = handleExpand
  const handleSelectRef = useRef(handleSelect)
  handleSelectRef.current = handleSelect

  const initialize = useCallback(async () => {
    setIsInitializing(true)
    nodeIdCounter = 0
    expandedSet.current.clear()
    contextPathMap.current.clear()
    parentMap.current.clear()
    newNodeIds.current.clear()

    const rootId = generateId()
    contextPathMap.current.set(rootId, [rootTopic])

    const rootNode: Node<WorldNodeData> = {
      id: rootId,
      type: 'worldNode',
      position: { x: 0, y: 0 },
      data: {
        title: rootTopic,
        description: '探索起点',
        type: 'concept',
        isRoot: true,
        isExpanded: false,
        isExpanding: false,
        depth: 0,
        onExpand: handleExpandRef.current,
        onSelect: handleSelectRef.current,
      },
    }

    setBaseNodes([rootNode])
    setBaseEdges([])
    setSelectedNode(null)
    setNodeDetail(null)
    setExplorationPath([{ id: rootId, title: rootTopic }])

    expandedSet.current.add(rootId)
    updateNodeData(rootId, { isExpanding: true })

    try {
      const rawNodes = capNodes(
        await expandNodes({
          topic: rootTopic,
          contextPath: [rootTopic],
        })
      )

      const childIds: string[] = []
      const childNodes: Node<WorldNodeData>[] = rawNodes.map((n, i) => {
        const id = generateId()
        childIds.push(id)
        parentMap.current.set(id, rootId)
        contextPathMap.current.set(id, [rootTopic, n.title])
        return {
          id,
          type: 'worldNode',
          position: tempChildPosition(rootNode, i),
          data: {
            title: n.title,
            description: n.description,
            type: n.type,
            depth: 1,
            isExpanded: false,
            isExpanding: false,
            isNew: true,
            onExpand: handleExpandRef.current,
            onSelect: handleSelectRef.current,
          },
        }
      })

      const newEdges: Edge[] = childNodes.map((child) => ({
        id: `edge-${rootId}-${child.id}`,
        source: rootId,
        target: child.id,
      }))

      setBaseNodes([
        {
          ...rootNode,
          data: { ...rootNode.data, isExpanded: true, isExpanding: false },
        },
        ...childNodes,
      ])
      setBaseEdges(newEdges)
      markNodesAsNew(childIds)
      setFocusNodeId(rootId)
    } catch {
      setBaseNodes([rootNode])
    } finally {
      setIsInitializing(false)
    }
  }, [rootTopic, setBaseNodes, setBaseEdges, updateNodeData, markNodesAsNew])

  const onConnect: OnConnect = useCallback(
    (params) => setBaseEdges((eds) => addEdge(params, eds)),
    [setBaseEdges]
  )

  const closeDetail = useCallback(() => {
    setSelectedNode(null)
    setNodeDetail(null)
  }, [])

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node<WorldNodeData>) => {
      handleSelect(node.id)
      if (!expandedSet.current.has(node.id)) {
        handleExpand(node.id)
      }
    },
    [handleSelect, handleExpand]
  )

  const { nodes, edges } = useMemo(() => {
    const decorated = decorateGraph(
      baseNodes,
      baseEdges,
      explorationPath,
      !!selectedNode
    )
    return {
      nodes: decorated.nodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          isNew: newNodeIds.current.has(n.id) || n.data.isNew,
        },
      })),
      edges: decorated.edges,
    }
  }, [baseNodes, baseEdges, explorationPath, selectedNode])

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeClick,
    selectedNode,
    nodeDetail,
    detailLoading,
    isInitializing,
    isExtending,
    extendingLabel,
    explorationPath,
    focusNodeId,
    initialize,
    closeDetail,
    exploreFromSuggestion,
    navigateToPathNode,
    goBackOneLevel,
    clearFocusNodeId: () => setFocusNodeId(null),
  }
}
