export type NodeType =
  | 'concept'
  | 'future'
  | 'tool'
  | 'risk'
  | 'philosophy'
  | 'opportunity'

export interface ExploreNode {
  title: string
  description: string
  type: NodeType
}

export interface NodeDetail {
  explanation: string
  why_important: string
  future_impact: string
  related_directions: string[]
  next_explore: string[]
}

export type NodeTier = 'core' | 'primary' | 'secondary'

export interface WorldNodeData extends Record<string, unknown> {
  title: string
  description: string
  type: NodeType
  tier?: NodeTier
  isRoot?: boolean
  isExpanded?: boolean
  isExpanding?: boolean
  isNew?: boolean
  isOnPath?: boolean
  isDimmed?: boolean
  depth?: number
  onExpand?: (id: string) => void
  onSelect?: (id: string) => void
}

export const NODE_TYPE_COLORS: Record<
  NodeType,
  { border: string; glow: string; badge: string; dot: string }
> = {
  concept: {
    border: 'border-indigo-400/40',
    glow: 'shadow-indigo-500/30',
    badge: 'bg-indigo-500/20 text-indigo-300',
    dot: 'bg-indigo-400',
  },
  future: {
    border: 'border-violet-400/40',
    glow: 'shadow-violet-500/30',
    badge: 'bg-violet-500/20 text-violet-300',
    dot: 'bg-violet-400',
  },
  tool: {
    border: 'border-cyan-400/40',
    glow: 'shadow-cyan-500/30',
    badge: 'bg-cyan-500/20 text-cyan-300',
    dot: 'bg-cyan-400',
  },
  risk: {
    border: 'border-orange-400/40',
    glow: 'shadow-orange-500/30',
    badge: 'bg-orange-500/20 text-orange-300',
    dot: 'bg-orange-400',
  },
  philosophy: {
    border: 'border-purple-400/40',
    glow: 'shadow-purple-500/30',
    badge: 'bg-purple-500/20 text-purple-300',
    dot: 'bg-purple-400',
  },
  opportunity: {
    border: 'border-emerald-400/40',
    glow: 'shadow-emerald-500/30',
    badge: 'bg-emerald-500/20 text-emerald-300',
    dot: 'bg-emerald-400',
  },
}

export const NODE_TYPE_LABELS: Record<NodeType, string> = {
  concept: '概念',
  future: '未来',
  tool: '工具',
  risk: '风险',
  philosophy: '哲思',
  opportunity: '机遇',
}

export const PLACEHOLDER_TOPICS = [
  'AI 会取代程序员吗',
  '如果世界由 AI 管理',
  '为什么量化交易赚钱',
  '人类未来会灭亡吗',
  '如何成为超级个体',
]
