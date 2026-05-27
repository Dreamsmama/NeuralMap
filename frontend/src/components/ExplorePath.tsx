interface ExplorePathProps {
  path: Array<{ id: string; title: string }>
  onNavigate: (nodeId: string) => void
  onGoBack: () => void
}

export default function ExplorePath({ path, onNavigate, onGoBack }: ExplorePathProps) {
  if (path.length === 0) return null

  return (
    <div className="fixed top-[4.5rem] left-6 right-[420px] z-40 pointer-events-none">
      <div className="flex items-center gap-2 flex-wrap pointer-events-auto">
        {path.length > 1 && (
          <button
            type="button"
            onClick={onGoBack}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-white/8
              text-xs text-slate-400 hover:text-slate-200 hover:border-indigo-500/25 hover:bg-indigo-500/5
              transition-all duration-200 cursor-pointer"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="7" y1="2" x2="3" y2="6" />
              <line x1="7" y1="10" x2="3" y2="6" />
            </svg>
            返回上一层
          </button>
        )}

        <div className="flex items-center gap-1 flex-wrap glass rounded-full px-3 py-1.5 border border-white/8 max-w-full">
          {path.map((item, index) => (
            <span key={item.id} className="flex items-center gap-1 min-w-0">
              {index > 0 && (
                <span className="text-slate-600 text-xs shrink-0 mx-0.5">→</span>
              )}
              <button
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`
                  text-xs truncate max-w-[140px] px-2 py-0.5 rounded-full transition-all duration-200 cursor-pointer
                  ${index === path.length - 1
                    ? 'text-indigo-300 bg-indigo-500/15'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }
                `}
                title={item.title}
              >
                {item.title}
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
