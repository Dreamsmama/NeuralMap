import dagre from '@dagrejs/dagre'
import type { Edge, Node } from '@xyflow/react'
import type { NodeTier, WorldNodeData } from '../types'

export const MAX_CHILDREN_PER_LAYER = 6

export const NODE_DIMENSIONS: Record<NodeTier, { width: number; height: number }> = {
  core: { width: 220, height: 68 },
  primary: { width: 168, height: 52 },
  secondary: { width: 130, height: 36 },
}

export function getNodeTier(depth: number, isRoot?: boolean): NodeTier {
  if (isRoot || depth === 0) return 'core'
  if (depth === 1) return 'primary'
  return 'secondary'
}

export function truncateText(text: string, maxLen: number): string {
  const trimmed = text.trim()
  if (trimmed.length <= maxLen) return trimmed
  return trimmed.slice(0, maxLen) + '…'
}

export function layoutTree(
  nodes: Node<WorldNodeData>[],
  edges: Edge[],
): Node<WorldNodeData>[] {
  if (nodes.length === 0) return nodes

  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({
    rankdir: 'TB',
    nodesep: 72,
    ranksep: 110,
    edgesep: 40,
    marginx: 48,
    marginy: 48,
    ranker: 'network-simplex',
  })

  nodes.forEach((node) => {
    const tier = getNodeTier(node.data.depth ?? 0, node.data.isRoot)
    const { width, height } = NODE_DIMENSIONS[tier]
    g.setNode(node.id, { width, height })
  })

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target)
  })

  dagre.layout(g)

  return nodes.map((node) => {
    const tier = getNodeTier(node.data.depth ?? 0, node.data.isRoot)
    const { width, height } = NODE_DIMENSIONS[tier]
    const pos = g.node(node.id)
    if (!pos) return node
    return {
      ...node,
      position: {
        x: pos.x - width / 2,
        y: pos.y - height / 2,
      },
    }
  })
}

export function buildPathEdgeIds(path: Array<{ id: string }>): Set<string> {
  const ids = new Set<string>()
  for (let i = 0; i < path.length - 1; i++) {
    ids.add(`edge-${path[i].id}-${path[i + 1].id}`)
  }
  return ids
}

export function decorateGraph(
  nodes: Node<WorldNodeData>[],
  edges: Edge[],
  path: Array<{ id: string }>,
  hasSelection: boolean,
): { nodes: Node<WorldNodeData>[]; edges: Edge[] } {
  const laidOut = layoutTree(nodes, edges)
  const pathNodeIds = new Set(path.map((p) => p.id))
  const pathEdgeIds = buildPathEdgeIds(path)
  const hasActivePath = hasSelection && path.length > 0

  const highlightedNodes = laidOut.map((node) => {
    const isOnPath = pathNodeIds.has(node.id)
    const tier = getNodeTier(node.data.depth ?? 0, node.data.isRoot)
    return {
      ...node,
      data: {
        ...node.data,
        tier,
        isOnPath,
        isDimmed: hasActivePath && !isOnPath,
      },
    }
  })

  const highlightedEdges = edges.map((edge) => {
    const onPath = pathEdgeIds.has(edge.id)
    return {
      ...edge,
      animated: onPath,
      style: onPath
        ? { stroke: 'rgba(34, 211, 238, 0.8)', strokeWidth: 2.5 }
        : hasActivePath
          ? { stroke: 'rgba(99, 102, 241, 0.1)', strokeWidth: 1 }
          : { stroke: 'rgba(99, 102, 241, 0.3)', strokeWidth: 1.5 },
      className: onPath ? 'path-edge' : hasActivePath ? 'dim-edge' : '',
    }
  })

  return { nodes: highlightedNodes, edges: highlightedEdges }
}
