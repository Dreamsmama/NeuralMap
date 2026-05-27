import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import {
  NODE_TYPE_COLORS,
  NODE_TYPE_LABELS,
  type NodeTier,
  type WorldNodeData,
} from '../types'
import { truncateText } from '../utils/layoutEngine'

const TIER_STYLES: Record<
  NodeTier,
  { card: string; title: string; subtitle: string; showBadge: boolean; showHint: boolean }
> = {
  core: {
    card: 'px-6 py-4 min-w-[200px] max-w-[240px] rounded-2xl',
    title: 'text-[15px] font-semibold',
    subtitle: 'text-xs mt-1',
    showBadge: false,
    showHint: true,
  },
  primary: {
    card: 'px-4 py-3 min-w-[150px] max-w-[180px] rounded-xl',
    title: 'text-[13px] font-medium',
    subtitle: 'text-[11px] mt-0.5',
    showBadge: true,
    showHint: true,
  },
  secondary: {
    card: 'px-3 py-2 min-w-[110px] max-w-[140px] rounded-lg',
    title: 'text-xs font-medium',
    subtitle: '',
    showBadge: false,
    showHint: false,
  },
}

function WorldNode({ data, selected }: NodeProps & { data: WorldNodeData }) {
  const tier: NodeTier = data.tier ?? (data.isRoot ? 'core' : data.depth === 1 ? 'primary' : 'secondary')
  const styles = TIER_STYLES[tier]
  const colors = NODE_TYPE_COLORS[data.type] || NODE_TYPE_COLORS.concept
  const typeLabel = NODE_TYPE_LABELS[data.type] || data.type
  const isDimmed = data.isDimmed && !selected
  const isOnPath = data.isOnPath || selected

  return (
    <div
      className={`
        relative cursor-pointer
        transition-all duration-500 ease-out
        ${data.isNew ? 'animate-node-grow' : ''}
        ${selected ? 'scale-[1.04] z-10' : isOnPath ? 'scale-100 z-[5]' : 'hover:scale-[1.02]'}
        ${isDimmed ? 'opacity-[0.22] saturate-50' : 'opacity-100'}
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-0 !h-0 !opacity-0 !border-none"
      />

      <div
        className={`
          relative glass transition-all duration-500 border
          ${styles.card}
          ${isOnPath ? `${colors.border} shadow-[0_0_24px_rgba(99,102,241,0.18)]` : `${colors.border} border-opacity-30`}
          ${selected ? `ring-1 ring-indigo-400/40 ${colors.glow}` : ''}
          ${data.isExpanding ? 'animate-pulse' : ''}
        `}
      >
        {isOnPath && (
          <div
            className="absolute -inset-px rounded-[inherit] opacity-60 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(34,211,238,0.06))',
            }}
          />
        )}

        <div className="relative z-10">
          {styles.showBadge && (
            <div className="flex items-center gap-1 mb-1">
              <div className={`w-1 h-1 rounded-full ${colors.dot}`} />
              <span className={`text-[9px] tracking-wide px-1 py-px rounded ${colors.badge}`}>
                {typeLabel}
              </span>
            </div>
          )}

          <h3 className={`${styles.title} leading-snug text-slate-100 line-clamp-2`}>
            {data.title}
          </h3>

          {tier !== 'secondary' && data.description && (
            <p className={`${styles.subtitle} text-slate-500 line-clamp-1`}>
              {truncateText(data.description, tier === 'core' ? 28 : 20)}
            </p>
          )}

          {styles.showHint && data.isExpanding && (
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-cyan-400/70">
              <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
              延伸中…
            </div>
          )}

          {styles.showHint && !data.isExpanded && !data.isExpanding && tier === 'core' && (
            <div className="mt-2 text-[10px] text-indigo-400/50">
              点击展开
            </div>
          )}

          {tier === 'primary' && !data.isExpanded && !data.isExpanding && (
            <div className={`mt-1.5 w-1 h-1 rounded-full ${colors.dot} opacity-40`} />
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-0 !h-0 !opacity-0 !border-none"
      />
    </div>
  )
}

export default memo(WorldNode)
