import { NODE_TYPE_COLORS, NODE_TYPE_LABELS, type NodeDetail, type NodeType } from '../types'

interface DetailPanelProps {
  title: string
  description: string
  type: NodeType
  detail: NodeDetail | null
  isLoading: boolean
  isExtending: boolean
  extendingSuggestion: string
  onClose: () => void
  onExploreSuggestion: (suggestion: string) => void
}

export default function DetailPanel({
  title,
  description,
  type,
  detail,
  isLoading,
  isExtending,
  extendingSuggestion,
  onClose,
  onExploreSuggestion,
}: DetailPanelProps) {
  const colors = NODE_TYPE_COLORS[type] || NODE_TYPE_COLORS.concept
  const typeLabel = NODE_TYPE_LABELS[type] || type

  return (
    <div className="fixed right-0 top-0 h-full w-[400px] z-50 flex flex-col glass-strong border-l border-indigo-500/15 animate-node-enter">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
              <span className={`text-[10px] tracking-wide px-2 py-0.5 rounded ${colors.badge}`}>
                {typeLabel}
              </span>
            </div>
            <h2 className="text-lg font-medium text-slate-100 leading-snug">{title}</h2>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">{description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors shrink-0 cursor-pointer"
            aria-label="关闭面板"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="4" y1="4" x2="12" y2="12" />
              <line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {isExtending && (
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 flex items-center gap-3">
            <div className="flex gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-xs text-cyan-300/90 leading-relaxed">
              AI 正在延伸新的世界…
              {extendingSuggestion && (
                <span className="block text-slate-400 mt-0.5 truncate">「{extendingSuggestion}」</span>
              )}
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 animate-pulse">正在读取宇宙档案…</p>
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
                <div className="h-16 bg-white/5 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        ) : detail ? (
          <>
            <Section title="AI 洞见" icon="✦">
              <p className="text-sm text-slate-300 leading-relaxed">{detail.explanation}</p>
            </Section>

            <Section title="为何重要" icon="◈">
              <p className="text-sm text-slate-300 leading-relaxed">{detail.why_important}</p>
            </Section>

            <Section title="未来影响" icon="⟡">
              <p className="text-sm text-slate-300 leading-relaxed">{detail.future_impact}</p>
            </Section>

            <Section title="关联维度" icon="◎">
              <div className="flex flex-wrap gap-2">
                {detail.related_directions.map((dir) => (
                  <span
                    key={dir}
                    className="text-xs px-3 py-1.5 rounded-full glass border border-white/8 text-slate-300"
                  >
                    {dir}
                  </span>
                ))}
              </div>
            </Section>

            <Section title="继续探索" icon="→">
              <p className="text-[11px] text-slate-500 mb-3 -mt-1">点击任意方向，世界将继续生长</p>
              <div className="space-y-2">
                {detail.next_explore.map((suggestion) => {
                  const isActive = isExtending && extendingSuggestion === suggestion
                  return (
                    <button
                      key={suggestion}
                      type="button"
                      disabled={isExtending}
                      onClick={(e) => {
                        e.stopPropagation()
                        onExploreSuggestion(suggestion)
                      }}
                      className={`
                        explore-card w-full text-left text-sm px-4 py-3.5 rounded-xl
                        border transition-all duration-300 cursor-pointer
                        ${isActive
                          ? 'border-cyan-400/40 bg-cyan-500/10 shadow-[0_0_24px_rgba(34,211,238,0.15)]'
                          : 'border-indigo-500/10 bg-white/[0.02] hover:border-indigo-400/35 hover:bg-indigo-500/8 hover:shadow-[0_0_20px_rgba(99,102,241,0.12)] hover:-translate-y-0.5'
                        }
                        ${isExtending && !isActive ? 'opacity-50 cursor-not-allowed' : ''}
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
                      `}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className={`
                          shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-xs
                          ${isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-indigo-500/10 text-indigo-400/80 group-hover:bg-indigo-500/20'}
                        `}>
                          {isActive ? (
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                          ) : (
                            '→'
                          )}
                        </span>
                        <span className="text-slate-300 leading-snug">{suggestion}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </Section>
          </>
        ) : null}
      </div>

      <div className="p-4 border-t border-white/5">
        <p className="text-[10px] text-slate-500 text-center tracking-widest">
          WorldFlow · AI 宇宙百科
        </p>
      </div>
    </div>
  )
}

function Section({
  title,
  icon,
  children,
}: {
  title: string
  icon: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-xs tracking-wide text-indigo-400/80 mb-3">
        <span>{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  )
}
