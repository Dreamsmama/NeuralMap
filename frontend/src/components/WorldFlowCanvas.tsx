import { useEffect } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  ReactFlowProvider,
  type NodeTypes,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import WorldNode from './WorldNode'
import { useWorldFlow } from '../hooks/useWorldFlow'
import DetailPanel from './DetailPanel'
import ExploreHeader from './ExploreHeader'
import ExplorePath from './ExplorePath'
import CosmicBackground from './CosmicBackground'

const nodeTypes: NodeTypes = {
  worldNode: WorldNode,
}

interface WorldFlowCanvasProps {
  topic: string
}

function CanvasInner({ topic }: WorldFlowCanvasProps) {
  const {
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
    clearFocusNodeId,
  } = useWorldFlow(topic)

  const { fitView, getNode } = useReactFlow()

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (!isInitializing && nodes.length > 0 && !focusNodeId) {
      setTimeout(() => fitView({ padding: 0.3, duration: 800 }), 100)
    }
  }, [isInitializing, nodes.length, focusNodeId, fitView])

  useEffect(() => {
    if (!focusNodeId) return
    const node = getNode(focusNodeId)
    if (!node) return

    const timer = setTimeout(() => {
      fitView({
        nodes: [{ id: focusNodeId }],
        padding: 0.5,
        duration: 900,
        maxZoom: 0.95,
      })
      clearFocusNodeId()
    }, 120)

    return () => clearTimeout(timer)
  }, [focusNodeId, nodes.length, fitView, getNode, clearFocusNodeId])

  return (
    <div className="relative w-full h-full">
      <CosmicBackground />

      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.6" />
          </linearGradient>
        </defs>
      </svg>

      <ExploreHeader topic={topic} nodeCount={nodes.length} />

      {explorationPath.length > 0 && (
        <ExplorePath
          path={explorationPath}
          onNavigate={navigateToPathNode}
          onGoBack={goBackOneLevel}
        />
      )}

      {isInitializing && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-4">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border border-indigo-500/30 animate-ping" />
              <div className="absolute inset-2 rounded-full border border-cyan-400/40 animate-ping" style={{ animationDelay: '0.5s' }} />
              <div className="absolute inset-4 rounded-full bg-indigo-500/20 animate-pulse" />
            </div>
            <p className="text-sm text-indigo-300/80 animate-pulse">
              AI 正在生成新的世界节点…
            </p>
          </div>
        </div>
      )}

      {isExtending && !isInitializing && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="glass px-5 py-3 rounded-2xl border border-cyan-500/20 shadow-[0_0_40px_rgba(34,211,238,0.1)] flex items-center gap-3">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-sm text-cyan-300/90">AI 正在延伸新的世界…</p>
          </div>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'default',
          animated: true,
        }}
        proOptions={{ hideAttribution: true }}
        className="bg-transparent"
      >
        <Background color="rgba(99, 102, 241, 0.03)" gap={40} size={1} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={() => 'rgba(99, 102, 241, 0.5)'}
          maskColor="rgba(3, 0, 20, 0.8)"
          className="!bottom-6 !right-6"
        />
      </ReactFlow>

      {!isInitializing && nodes.length > 1 && !selectedNode && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="glass px-5 py-2.5 rounded-full text-xs text-slate-400 animate-pulse-glow">
            点击节点展开探索 · 拖拽移动 · 滚轮缩放
          </div>
        </div>
      )}

      {selectedNode && (
        <DetailPanel
          title={selectedNode.title}
          description={selectedNode.description}
          type={selectedNode.type}
          detail={nodeDetail}
          isLoading={detailLoading}
          isExtending={isExtending}
          extendingSuggestion={extendingLabel}
          onClose={closeDetail}
          onExploreSuggestion={exploreFromSuggestion}
        />
      )}
    </div>
  )
}

export default function WorldFlowCanvas({ topic }: WorldFlowCanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner topic={topic} />
    </ReactFlowProvider>
  )
}
