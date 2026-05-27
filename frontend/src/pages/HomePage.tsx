import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CosmicBackground from '../components/CosmicBackground'
import { PLACEHOLDER_TOPICS } from '../types'

export default function HomePage() {
  const [topic, setTopic] = useState('')
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [isFocused, setIsFocused] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDER_TOPICS.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = topic.trim()
    if (!trimmed) return
    navigate(`/explore?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <div className="relative min-h-full flex flex-col items-center justify-center overflow-hidden">
      <CosmicBackground />

      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/8 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/6 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-violet-600/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />

      <div className="relative z-10 w-full max-w-3xl px-6 text-center">
        <div className="mb-12 animate-node-enter">
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/90 to-violet-500/80 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="3" fill="white" opacity="0.9" />
                  <circle cx="4" cy="6" r="1.5" fill="white" opacity="0.5" />
                  <circle cx="16" cy="7" r="1" fill="white" opacity="0.4" />
                  <circle cx="14" cy="15" r="1.5" fill="white" opacity="0.5" />
                  <line x1="10" y1="10" x2="4" y2="6" stroke="white" strokeWidth="0.5" opacity="0.3" />
                  <line x1="10" y1="10" x2="16" y2="7" stroke="white" strokeWidth="0.5" opacity="0.3" />
                  <line x1="10" y1="10" x2="14" y2="15" stroke="white" strokeWidth="0.5" opacity="0.3" />
                </svg>
              </div>
              <div className="absolute -inset-1 rounded-xl bg-indigo-500/15 blur-md -z-10" />
            </div>
            <span className="text-sm text-slate-500 tracking-wide">
              WorldFlow
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-5 leading-[1.3] text-slate-100">
            探索任何问题背后的
            <br />
            <span className="text-gradient">无限世界</span>
          </h1>

          <p className="text-base md:text-lg text-slate-400 max-w-md mx-auto leading-relaxed font-light">
            AI 正在把知识、未来与世界
            <br />
            <span className="text-slate-500">连接成一张不断生长的宇宙网络</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="animate-node-enter" style={{ animationDelay: '0.15s' }}>
          <div
            className={`
              relative rounded-2xl transition-all duration-500
              ${isFocused
                ? 'shadow-[0_0_60px_rgba(99,102,241,0.12)] ring-1 ring-indigo-500/20'
                : 'shadow-[0_0_40px_rgba(99,102,241,0.04)]'
              }
            `}
          >
            <div className="glass-strong rounded-2xl p-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={PLACEHOLDER_TOPICS[placeholderIndex]}
                className="w-full bg-transparent text-lg md:text-xl text-slate-100 placeholder:text-slate-600
                  px-6 py-5 outline-none font-light"
                autoFocus
              />

              <div className="flex items-center justify-between px-4 pb-3">
                <div className="flex gap-2">
                  {PLACEHOLDER_TOPICS.slice(0, 3).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTopic(t)}
                      className="text-xs text-slate-500 hover:text-indigo-400/80
                        px-2.5 py-1 rounded-full border border-white/5 hover:border-indigo-500/15
                        transition-all duration-200 hidden sm:block"
                    >
                      {t.length > 10 ? t.slice(0, 10) + '…' : t}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={!topic.trim()}
                  className={`
                    flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm
                    transition-all duration-300
                    ${topic.trim()
                      ? 'bg-white/10 text-slate-100 border border-white/10 hover:bg-white/15 hover:border-white/20 hover:scale-[1.02]'
                      : 'bg-white/3 text-slate-600 cursor-not-allowed border border-transparent'
                    }
                  `}
                >
                  开始探索
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <line x1="2" y1="7" x2="12" y2="7" />
                    <line x1="8" y1="3" x2="12" y2="7" />
                    <line x1="8" y1="11" x2="12" y2="7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </form>

        <div className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto animate-node-enter" style={{ animationDelay: '0.3s' }}>
          {[
            { icon: '∞', label: '无限画布' },
            { icon: '✦', label: 'AI 世界模型' },
            { icon: '→', label: '展开与发现' },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-xl mb-2 opacity-50">{item.icon}</div>
              <div className="text-xs text-slate-500 tracking-wide">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-xs text-slate-600 tracking-widest">
          下一代 AI 探索界面
        </p>
      </div>
    </div>
  )
}
