import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import CosmicBackground from '../components/CosmicBackground'
import { PLACEHOLDER_TOPICS } from '../types'

function RevealSection({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`reveal-section ${visible ? 'is-visible' : ''} ${className}`}>
      {children}
    </div>
  )
}

export default function HomePage() {
  const [topic, setTopic] = useState('')
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [isFocused, setIsFocused] = useState(false)
  const navigate = useNavigate()

  const HOT_QUESTIONS = [
    'AI 会创造哪些新职业',
    '一人公司会成为未来吗',
    'AI 为什么改变世界',
    '普通人如何抓住 AI 红利',
    '人类未来会灭亡吗',
  ]

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
    <div className="relative h-full overflow-y-auto">
      <CosmicBackground />

      <div className="absolute top-16 left-[6%] w-72 h-72 bg-indigo-600/6 rounded-full blur-3xl animate-float" />
      <div className="absolute top-[40%] right-[6%] w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-24 left-[20%] w-80 h-80 bg-violet-600/6 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />

      {/* 第一屏：巨大标题 + 入口输入框 + 热门探索 */}
      <section className="relative z-10 flex min-h-[88vh] items-center">
        <div className="mx-auto w-full max-w-5xl px-6 pt-20 pb-16 md:pt-28 md:pb-24">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-2 h-2 rounded-full bg-cyan-400/80 animate-pulse-glow" />
            <span className="text-sm text-slate-500 tracking-[0.18em] uppercase">WorldFlow</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-semibold leading-[1.15] tracking-tight text-slate-100 max-w-4xl">
            探索任何问题背后的
            <br />
            <span className="text-gradient">无限世界</span>
          </h1>

          <p className="mt-6 text-base md:text-lg text-slate-300/90 leading-relaxed max-w-2xl">
            WorldFlow 会把一个问题，扩展成不断生长的 AI 世界网络。
            不是一问一答，而是进入一个会持续生成的新世界。
          </p>

          <form onSubmit={handleSubmit} className="mt-10">
            <div
              className={`
                home-input-shell glass-strong rounded-2xl p-2 transition-all duration-500
                ${isFocused
                  ? 'home-input-shell-focused'
                  : 'home-input-shell-idle'
                }
              `}
            >
              <div className="home-input-glow" />
              <div className="relative flex items-center gap-3 px-4 pt-3 pb-2">
                <div className="home-input-orb" />
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder={PLACEHOLDER_TOPICS[placeholderIndex]}
                  className="w-full bg-transparent text-lg md:text-xl text-slate-100 placeholder:text-slate-600 outline-none border-0"
                  autoFocus
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 pb-3 gap-3">
                <p className="text-xs text-slate-500">
                  输入一个问题，进入你的第一层世界。
                </p>
                <button
                  type="submit"
                  disabled={!topic.trim()}
                  className={`
                    home-cta-button flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm
                    ${topic.trim()
                      ? 'home-cta-active'
                      : 'home-cta-disabled'
                    }
                  `}
                >
                  开始探索
                </button>
              </div>
            </div>
          </form>

          <div className="mt-6 space-y-3">
            <p className="text-xs text-slate-500 tracking-[0.18em] uppercase">
              热门探索
            </p>
            <div className="flex flex-wrap gap-2.5">
              {HOT_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => {
                    setTopic(q)
                    navigate(`/explore?q=${encodeURIComponent(q)}`)
                  }}
                  className="home-hot-pill"
                >
                  <span className="text-base">🔥</span>
                  <span className="text-xs sm:text-sm">{q}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 后续信息区块：对比 / 机制 / 价值 / 探索步骤 / 产品宣言 */}
      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-20 md:pb-28 space-y-28">
        <RevealSection className="grid md:grid-cols-2 gap-8">
          <article className="glass-strong rounded-2xl p-8">
            <p className="text-xs tracking-[0.2em] text-slate-500 mb-4">02 / 对比认知</p>
            <h2 className="text-2xl md:text-3xl text-slate-100 mb-5">它和 ChatGPT 有什么不同？</h2>
            <p className="text-slate-300 leading-relaxed">
              ChatGPT 是对话。<br />
              WorldFlow 是探索。<br /><br />
              你不是在和 AI 聊天，<br />
              而是在一个由 AI 生成的世界里，不断发现新的连接。
            </p>
          </article>
          <article className="glass rounded-2xl p-8 border border-white/10">
            <div className="space-y-5">
              <CompareLine left="ChatGPT" right="一问一答" />
              <CompareLine left="WorldFlow" right="无限延伸" />
              <CompareLine left="WorldFlow" right="无限探索" />
              <CompareLine left="WorldFlow" right="无限连接" />
            </div>
          </article>
        </RevealSection>

        <RevealSection className="space-y-6">
          <p className="text-xs tracking-[0.2em] text-slate-500">03 / 生成机制</p>
          <h2 className="text-3xl md:text-4xl text-slate-100">这个世界是如何生成的？</h2>
          <p className="text-lg text-slate-300/95 leading-relaxed max-w-3xl">
            当你点击一个节点，AI 会重新理解你当前的探索方向。<br />
            然后生成新的趋势、新的问题、新的机会、新的世界连接。<br />
            每一次点击，世界都会继续生长。
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3">
            {['新的趋势', '新的问题', '新的机会', '新的世界连接'].map((item) => (
              <div key={item} className="glass rounded-xl px-4 py-4 text-slate-200 text-sm border border-white/8">
                ✦ {item}
              </div>
            ))}
          </div>
        </RevealSection>

        <RevealSection className="space-y-7">
          <p className="text-xs tracking-[0.2em] text-slate-500">04 / 真实价值</p>
          <h2 className="text-3xl md:text-4xl text-slate-100">它有什么用？</h2>
          <p className="text-lg text-slate-300 leading-relaxed max-w-3xl">
            WorldFlow 并不是搜索引擎。<br />
            它更像一个帮助你发现未来趋势、认知连接与隐藏机会的 AI 世界。
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              '探索 AI 时代的新职业',
              '理解未来商业趋势',
              '寻找创业方向',
              '学习陌生领域',
              '进行头脑风暴',
              '发现问题背后的关联',
            ].map((item) => (
              <div key={item} className="glass-strong rounded-xl px-5 py-4 border border-indigo-400/15 text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </RevealSection>

        <RevealSection className="space-y-8">
          <p className="text-xs tracking-[0.2em] text-slate-500">05 / 探索仪式</p>
          <h2 className="text-3xl md:text-4xl text-slate-100">如何开始探索？</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              '输入一个问题',
              'AI 生成第一层世界节点',
              '点击任意方向继续探索',
              '不断发现新的世界连接',
            ].map((step, index) => (
              <div key={step} className="glass rounded-xl p-5 border border-white/10">
                <p className="text-xs text-indigo-300 mb-3">STEP 0{index + 1}</p>
                <p className="text-slate-200 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </RevealSection>

        <RevealSection className="space-y-6">
          <p className="text-xs tracking-[0.2em] text-slate-500">06 / 产品宣言</p>
          <h2 className="text-3xl md:text-4xl text-slate-100">我们为什么要做它？</h2>
          <p className="text-lg text-slate-300 leading-relaxed max-w-4xl">
            未来的信息，不应该只是网页列表与聊天窗口。<br />
            我们相信，AI 会把知识、趋势、世界与未来，连接成一个不断生长的探索网络。<br />
            WorldFlow 不是答案机器，而是一种新的认知界面。
          </p>
        </RevealSection>

        <RevealSection className="pt-2">
          <form onSubmit={handleSubmit}>
            <div
              className={`
                glass-strong rounded-2xl p-2 transition-all duration-500
                ${isFocused
                  ? 'shadow-[0_0_60px_rgba(99,102,241,0.14)] ring-1 ring-indigo-500/20'
                  : 'shadow-[0_0_32px_rgba(99,102,241,0.05)]'
                }
              `}
            >
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={PLACEHOLDER_TOPICS[placeholderIndex]}
                className="w-full bg-transparent text-lg md:text-xl text-slate-100 placeholder:text-slate-600 px-6 py-5 outline-none"
              />
              <div className="flex items-center justify-between px-4 pb-3 gap-3">
                <p className="text-xs text-slate-500">输入一个问题，进入你的第一层世界。</p>
                <button
                  type="submit"
                  disabled={!topic.trim()}
                  className={`
                    flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm transition-all duration-300 shrink-0
                    ${topic.trim()
                      ? 'bg-white/10 text-slate-100 border border-white/10 hover:bg-white/15 hover:border-white/20'
                      : 'bg-white/3 text-slate-600 cursor-not-allowed border border-transparent'
                    }
                  `}
                >
                  开始探索
                </button>
              </div>
            </div>
          </form>
        </RevealSection>
      </div>

      <div className="relative z-10 py-8 text-center">
        <p className="text-xs text-slate-600 tracking-[0.22em]">
          AI 未来互联网实验 · WorldFlow
        </p>
      </div>
    </div>
  )
}

function CompareLine({ left, right }: { left: string; right: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/6 pb-3">
      <span className="text-slate-500 text-sm">{left}</span>
      <span className="text-slate-200">{right}</span>
    </div>
  )
}
