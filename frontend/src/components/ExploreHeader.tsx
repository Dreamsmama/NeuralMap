import { Link } from 'react-router-dom'

interface ExploreHeaderProps {
  topic: string
  nodeCount: number
}

export default function ExploreHeader({ topic, nodeCount }: ExploreHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-6 py-4">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors group"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="group-hover:-translate-x-0.5 transition-transform"
            >
              <line x1="10" y1="3" x2="5" y2="8" />
              <line x1="10" y1="13" x2="5" y2="8" />
            </svg>
            <span className="text-sm">新建宇宙</span>
          </Link>

          <div className="w-px h-4 bg-white/10" />

          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 animate-pulse-glow" />
            <span className="text-sm text-slate-300 truncate max-w-[280px]">
              {topic}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-xs text-slate-500">
            已发现 <span className="text-indigo-400/90">{nodeCount}</span> 个节点
          </div>
          <div className="text-xs text-slate-600 tracking-wide hidden sm:block">
            WorldFlow
          </div>
        </div>
      </div>
    </header>
  )
}
