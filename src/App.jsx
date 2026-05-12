import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Bell, ShieldAlert, MapPin, Bot, BellRing, BarChart2 } from 'lucide-react'
import HeroParticleBackground from './HeroParticleBackground'

/* ── DATA ─────────────────────────────────────────────────── */
const problems = [
  {
    icon: MessageCircle,
    label: '반복 질문 응대',
    body: '하루 수십 회 반복되는 위치·요금·규칙 문의가 직원의 집중력을 지속적으로 분산시킵니다.',
    evidence: '현장 관찰 기반 — 일 평균 50회 이상 직접 응대',
    accent: 'var(--pink)',
    dim: 'var(--pink-dim)',
  },
  {
    icon: Bell,
    label: '잦은 직원 호출',
    body: '모든 요청에 직원이 직접 이동해야 하는 구조로 동선 낭비와 피로도가 누적됩니다.',
    evidence: '호출당 평균 3분 이상 이동 동선 소모',
    accent: 'var(--yellow)',
    dim: 'var(--yellow-dim)',
  },
  {
    icon: ShieldAlert,
    label: '안전관리 집중도 저하',
    body: '반복 응대로 인해 안전 모니터링이 끊기고, 돌발 상황 대응 능력이 저하됩니다.',
    evidence: '안전 공백 — 반복 응대 중 발생하는 관리 사각지대',
    accent: 'var(--blue)',
    dim: 'var(--blue-dim)',
  },
]

const storyboard = [
  {
    act: '01',
    title: '방문 · 질문',
    icon: '👧',
    desc: '아이 또는 보호자가 Temi에게 말을 걸거나 화면을 터치합니다.',
    tags: ['음성 질문', '화면 터치', '호출 버튼'],
    color: 'var(--pink)',
    dim: 'var(--pink-dim)',
  },
  {
    act: '02',
    title: 'Temi 응대',
    icon: '🤖',
    desc: 'Temi가 즉시 음성으로 답하고, 필요시 해당 장소까지 직접 이동하여 안내합니다.',
    tags: ['AI 답변', '자율 이동', '호출 중계'],
    color: 'var(--blue)',
    dim: 'var(--blue-dim)',
  },
  {
    act: '03',
    title: '데이터 축적',
    icon: '📊',
    desc: '모든 상호작용이 실시간으로 관리자 대시보드에 자동 기록됩니다.',
    tags: ['이벤트 로깅', '통계 집계', '알림 발송'],
    color: 'var(--green)',
    dim: 'var(--green-dim)',
  },
]

const coreFeatures = [
  { icon: MapPin,    label: '이동형 위치 안내',  body: '목적지까지 직접 이동하며 음성으로 안내합니다',       accent: 'var(--blue)',   dim: 'var(--blue-dim)' },
  { icon: Bot,       label: 'AI 자유 대화',       body: 'LLM 기반으로 자연스러운 질문에 즉시 응답합니다',    accent: 'var(--green)',  dim: 'var(--green-dim)' },
  { icon: BellRing,  label: '직원 호출 중계',     body: '버튼·화면 터치로 즉시 담당자에게 알림을 전송합니다', accent: 'var(--yellow)', dim: 'var(--yellow-dim)' },
  { icon: BarChart2, label: '운영 대시보드 연동', body: '질문·호출·혼잡도를 실시간으로 모니터링합니다',       accent: 'var(--purple)', dim: 'var(--purple-dim)' },
]

const modules = [
  { color: 'var(--blue)',   name: 'Temi Robot',  tech: 'Android Java · Temi SDK' },
  { color: 'var(--purple)', name: 'AI / LLM',    tech: 'LLM API · Prompt Engineering' },
  { color: 'var(--green)',  name: 'Sensor',       tech: 'Arduino · ESP32 · Raspberry Pi' },
  { color: 'var(--yellow)', name: 'Backend',      tech: 'Spring Boot · MySQL' },
  { color: 'var(--pink)',   name: 'Realtime',     tech: 'WebSocket · MQTT' },
  { color: '#2dd4bf',       name: 'Admin Web',    tech: 'React · Next.js' },
]

/* ── 팀원 정보: name, github 필드를 실제 값으로 교체하세요 ─── */
const team = [
  { emoji: '🧭', name: '팀원 이름', role: 'SW Lead',            desc: '총괄 기획·설계',  tech: 'System Design · Project Management', github: '#' },
  { emoji: '🗄️', name: '팀원 이름', role: 'Backend Developer',  desc: 'API·DB·이벤트 흐름', tech: 'Spring Boot · MySQL · REST API',  github: '#' },
  { emoji: '⚡', name: '팀원 이름', role: 'Sensor Engineer',    desc: 'Arduino·ESP32 제어', tech: 'Arduino · ESP32 · Raspberry Pi',  github: '#' },
  { emoji: '🤖', name: '팀원 이름', role: 'Temi Developer',     desc: 'SDK·Android 제어',   tech: 'Android Java · Temi SDK',          github: '#' },
  { emoji: '🖥️', name: '팀원 이름', role: 'Frontend Developer', desc: 'Admin Web·UI',        tech: 'React · Next.js · CSS',            github: '#' },
]

/* ── Dashboard mock data ──────────────────────────────────── */
const hourlyData = [8, 12, 5, 6, 9, 18, 24, 31, 28, 22, 16, 14]
const hourLabels = ['9시','10시','11시','12시','13시','14시','15시','16시','17시','18시','19시','20시']

const top5Questions = [
  { rank: 1, q: '화장실이 어디 있어요?',    count: 34, color: 'var(--blue)' },
  { rank: 2, q: '미끄럼틀 어디 있어요?',    count: 28, color: 'var(--pink)' },
  { rank: 3, q: '이용 요금이 얼마예요?',    count: 21, color: 'var(--purple)' },
  { rank: 4, q: '밥은 어디서 먹어요?',       count: 17, color: 'var(--green)' },
  { rank: 5, q: '보호자 대기 공간 있나요?', count: 12, color: 'var(--yellow)' },
]

const alertLogs = [
  { time: '17:51', level: 'warn',   icon: '⚠️', text: '혼잡 감지 — 볼풀 영역 입장 인원 초과' },
  { time: '17:44', level: 'call',   icon: '🔔', text: '보호자 호출 — 미끄럼틀 구역 3번 테이블' },
  { time: '17:38', level: 'info',   icon: '✅', text: '직원 호출 완료 — 응대 시간 42초' },
  { time: '17:31', level: 'danger', icon: '🚨', text: '근접 감지 이벤트 — 안전 알림 발송됨' },
  { time: '17:22', level: 'call',   icon: '🔔', text: '직원 호출 접수 — 입구 안내 데스크' },
]

const peakHours = [
  { time: '15시–16시', load: 95, label: '최고 혼잡' },
  { time: '16시–17시', load: 88, label: '매우 혼잡' },
  { time: '14시–15시', load: 72, label: '혼잡' },
  { time: '11시–12시', load: 55, label: '보통' },
  { time: '10시–11시', load: 38, label: '여유' },
]

/* ── HELPERS ──────────────────────────────────────────────── */
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }
const stagger = { visible: { transition: { staggerChildren: 0.08 } } }

function useInView(ref) {
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setSeen(true) }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [ref])
  return seen
}

function Section({ id, children, style }) {
  const ref = useRef(null)
  const seen = useInView(ref)
  return (
    <section id={id} className="section" ref={ref} style={style}>
      <motion.div variants={stagger} initial="hidden" animate={seen ? 'visible' : 'hidden'}>
        {children}
      </motion.div>
    </section>
  )
}

function FadeUp({ children, delay = 0, style }) {
  return (
    <motion.div variants={fadeUp} transition={{ duration: 0.55, delay }} style={style}>
      {children}
    </motion.div>
  )
}

function GlassCard({ children, className = '', style = {}, accentColor }) {
  return (
    <motion.div
      variants={fadeUp}
      className={`glass card ${className}`}
      style={style}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      {accentColor && <div className="card-accent-dot" style={{ background: accentColor }} />}
      {children}
    </motion.div>
  )
}

/* ── NAV ─────────────────────────────────────────────────── */
function NavBar() {
  const [scrolled, setScrolled] = useState(false)
  const [progress, setProgress] = useState(0)
  const [active, setActive] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10)
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? window.scrollY / max : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const ids = ['problem', 'solution', 'dashboard', 'architecture', 'team']
    const obs = new IntersectionObserver(
      entries => { entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id) }) },
      { rootMargin: '-40% 0px -55% 0px' }
    )
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [])

  return (
    <nav className="nav" style={{ boxShadow: scrolled ? '0 4px 24px rgba(100,120,200,0.15)' : 'none' }}>
      <div className="nav-progress" style={{ width: `${progress * 100}%` }} />
      <div className="nav-logo">
        <img src="/media/logo.png" alt="Kids-Friends Robot" onError={e => e.target.style.display = 'none'} />
        <span className="nav-logo-name">Kids-Friends Robot</span>
      </div>
      <div className="nav-links">
        {[
          ['#problem',      'Problem'],
          ['#solution',     'Solution'],
          ['#dashboard',    'Dashboard'],
          ['#architecture', 'Architecture'],
          ['#team',         'Team'],
        ].map(([h, l]) => (
          <a
            key={h}
            href={h}
            className={`nav-link${active === h.slice(1) ? ' nav-link-active' : ''}`}
          >
            {l}
          </a>
        ))}
      </div>
      <div className="nav-actions">
        <a href="/arch.html" className="btn btn-ghost btn-sm nav-arch-btn" style={{ color: 'var(--green)', borderColor: 'rgba(5,150,105,0.3)' }}>
          Architecture ↗
        </a>
        <a href="#" className="btn btn-ghost btn-sm nav-github-btn">GitHub ↗</a>
        <button
          className="nav-menu-btn"
          onClick={() => setMenuOpen(v => !v)}
          aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
      {menuOpen && (
        <div className="nav-mobile-menu">
          {[
            ['#problem',      'Problem'],
            ['#solution',     'Solution'],
            ['#dashboard',    'Dashboard'],
            ['#architecture', 'Architecture'],
            ['#team',         'Team'],
          ].map(([h, l]) => (
            <a
              key={h}
              href={h}
              className={`nav-mobile-link${active === h.slice(1) ? ' nav-link-active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {l}
            </a>
          ))}
          <div className="nav-mobile-footer">
            <a href="/arch.html" className="btn btn-ghost btn-sm" style={{ color: 'var(--green)', borderColor: 'rgba(5,150,105,0.3)' }}>Architecture ↗</a>
            <a href="#" className="btn btn-ghost btn-sm">GitHub ↗</a>
          </div>
        </div>
      )}
    </nav>
  )
}

/* ── HERO ────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="hero" id="hero">
      <HeroParticleBackground />
      <motion.div
        className="hero-inner"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        <FadeUp>
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Temi Robot × Kids Cafe 운영 보조 시스템
          </div>
        </FadeUp>
        <FadeUp delay={0.05}>
          <img src="/media/logo.png" alt="Kids-Friends" className="hero-logo" onError={e => { e.target.style.display = 'none' }} />
        </FadeUp>
        <FadeUp delay={0.1}>
          <h1 className="hero-title">
            <span style={{ background: 'linear-gradient(135deg, #1a2a6c 0%, #3b7ef4 50%, #7c5de8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              아이들의 친구,
            </span><br />
            스마트 운영 솔루션
          </h1>
        </FadeUp>
        <FadeUp delay={0.15}>
          <p className="hero-sub">
            Temi 로봇이 키즈카페 방문객의 안내·호출을 1차 응대하고, 모든 상호작용을 운영 대시보드에 자동으로 기록합니다.
          </p>
        </FadeUp>
        <FadeUp delay={0.2}>
          <div className="hero-cta">
            <a href="#dashboard" className="btn btn-primary hero-cta-main">
              <span style={{ fontSize: 16 }}>📊</span> 관리자 대시보드 보기
            </a>
            <a href="#solution" className="btn btn-ghost hero-cta-sub">서비스 흐름 살펴보기 →</a>
          </div>
          <div className="hero-cta-hint">시나리오 기반 운영 화면 목업을 확인하세요</div>
        </FadeUp>
      </motion.div>
    </section>
  )
}

/* ── PROBLEM ─────────────────────────────────────────────── */
function Problem() {
  return (
    <Section id="problem">
      <div className="container">
        <FadeUp>
          <div className="section-header center">
            <div className="label pink">Problem</div>
            <h2 className="section-title">키즈카페 운영의 3가지 핵심 과제</h2>
            <p className="section-sub center">반복되는 비효율이 직원의 안전 집중도와 서비스 품질을 낮춥니다</p>
          </div>
        </FadeUp>
        <div className="grid-3">
          {problems.map(({ icon: Icon, label, body, evidence, accent, dim }) => (
            <GlassCard key={label} accentColor={accent}>
              <div className="card-icon" style={{ background: dim }}><Icon size={20} color={accent} /></div>
              <div className="card-title">{label}</div>
              <div className="card-body">{body}</div>
              <div className="card-evidence" style={{ borderColor: accent + '30', color: accent }}>
                → {evidence}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* ── HOW IT WORKS (Solution + Features + Scenario 통합) ───── */
function HowItWorks() {
  return (
    <Section id="solution">
      <div className="container-wide">
        <FadeUp>
          <div className="section-header center">
            <div className="label blue">How It Works</div>
            <h2 className="section-title">어떻게 작동하나요?</h2>
            <p className="section-sub center">방문객의 한 마디가 운영 데이터가 되는 과정</p>
          </div>
        </FadeUp>

        {/* 3-act storyboard */}
        <FadeUp>
          <div className="storyboard">
            {storyboard.map((act, i) => (
              <div key={act.act} className="storyboard-item">
                <div className="storyboard-card glass" style={{ borderTop: `3px solid ${act.color}` }}>
                  <div className="storyboard-act-num" style={{ color: act.color }}>Act {act.act}</div>
                  <div className="storyboard-icon">{act.icon}</div>
                  <div className="storyboard-title">{act.title}</div>
                  <div className="storyboard-desc">{act.desc}</div>
                  <div className="storyboard-tags">
                    {act.tags.map(t => (
                      <span
                        key={t}
                        className="storyboard-tag"
                        style={{ color: act.color, background: act.dim, border: `1px solid ${act.color}30` }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                {i < storyboard.length - 1 && (
                  <div className="storyboard-arrow" aria-hidden="true">→</div>
                )}
              </div>
            ))}
          </div>
        </FadeUp>

        {/* 4 core features */}
        <FadeUp>
          <div className="section-header center" style={{ marginTop: 64 }}>
            <div className="label green">Core Features</div>
            <h3 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text)', marginBottom: 10 }}>
              4가지 핵심 기능
            </h3>
          </div>
        </FadeUp>
        <div className="grid-4">
          {coreFeatures.map(({ icon: Icon, label, body, accent, dim }) => (
            <GlassCard key={label} accentColor={accent}>
              <div className="card-icon" style={{ background: dim }}><Icon size={20} color={accent} /></div>
              <div className="card-title">{label}</div>
              <div className="card-body">{body}</div>
            </GlassCard>
          ))}
        </div>

        {/* Temi callout + compact impact table */}
        <div className="solution-bottom">
          <FadeUp>
            <div className="temi-callout glass">
              <div className="temi-callout-icon">🤖</div>
              <div>
                <div className="temi-callout-title">왜 Temi 로봇인가?</div>
                <div className="temi-callout-body">
                  Temi는 자율주행·음성 인터랙션·화면 표시를 하나의 기기에서 지원하는 이동형 소셜 로봇입니다.
                  고정 키오스크와 달리 아이 곁으로 직접 다가가는 경험을 제공합니다.
                </div>
              </div>
            </div>
          </FadeUp>

          <FadeUp>
            <div className="impact-table-wrap glass">
              <div className="impact-table-header">
                <div className="label" style={{ color: 'var(--green)', marginBottom: 4 }}>Expected Impact</div>
                <p style={{ fontSize: 12, color: 'var(--text-3)' }}>* 시나리오 기반 목표 수치 — 실제 운영 결과와 다를 수 있습니다</p>
              </div>
              <table className="impact-table">
                <thead>
                  <tr>
                    <th>항목</th>
                    <th>도입 전 (현재)</th>
                    <th>목표 (시나리오)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { cat: '직원 호출 횟수',    before: '일 평균 50회 직접 응대',   after: '목표 42% 감소 — 로봇 1차 응대로 대체' },
                    { cat: 'AI 응답 속도',      before: '직원 이동 후 응대 (3분↑)', after: '목표 1.8초 이내 즉시 응답' },
                    { cat: '안전 집중 가용 시간', before: '응대 업무로 인해 분산',    after: '목표 약 40% 확보' },
                  ].map(({ cat, before, after }) => (
                    <tr key={cat}>
                      <td className="impact-cat">{cat}</td>
                      <td className="impact-before">{before}</td>
                      <td className="impact-after">{after}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeUp>
        </div>
      </div>
    </Section>
  )
}

/* ── ADMIN DASHBOARD ─────────────────────────────────────── */
function AdminDashboard() {
  const maxV = Math.max(...hourlyData)
  const maxQ = top5Questions[0].count
  return (
    <Section id="dashboard">
      <div className="container-wide">
        <FadeUp>
          <div className="section-header center">
            <div className="label blue">Admin Dashboard</div>
            <h2 className="section-title">실시간 관리자 대시보드</h2>
            <p className="section-sub center">
              로봇 상호작용·안전 이벤트·혼잡도를 한 화면에서 모니터링합니다.
            </p>
          </div>
        </FadeUp>

        <FadeUp>
          <div className="db-shell glass">
            {/* Header */}
            <div className="db-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="db-dot green" />
                <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>Kids-Friends 운영 현황</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>2025.05.03 · 오후 5:51</span>
                <span className="db-live">● LIVE</span>
              </div>
            </div>

            {/* KPIs */}
            <div className="db-kpis">
              {[
                { n: '128', u: '회', l: '오늘 상호작용',   d: '↑ 전일 대비 +12%', c: 'var(--blue)' },
                { n: '42',  u: '%',  l: '직원 호출 감소율', d: '↑ 목표 대비 +7%p', c: 'var(--green)' },
                { n: '74',  u: '건', l: '자동 처리 질문',  d: '↑ 전일 대비 +5건', c: 'var(--purple)' },
                { n: '1.8', u: '초', l: '평균 응답 시간',  d: '✓ 목표치 이하',     c: 'var(--yellow)' },
              ].map(({ n, u, l, d, c }) => (
                <div key={l} className="db-kpi">
                  <div className="db-kpi-label">{l}</div>
                  <div className="db-kpi-num">
                    <span style={{ color: c }}>{n}</span>
                    <span className="db-kpi-unit">{u}</span>
                  </div>
                  <div className="db-kpi-delta">{d}</div>
                </div>
              ))}
            </div>

            {/* Row 1: chart + alert */}
            <div className="db-charts">
              <div className="db-panel">
                <div className="db-panel-title">시간대별 상호작용 수</div>
                <div className="db-bars-wrap">
                  <div className="db-bars">
                    {hourlyData.map((v, i) => (
                      <div key={i} className="db-bar-col">
                        <div className="db-bar-bg">
                          <div
                            className="db-bar-fill"
                            style={{
                              height: `${(v / maxV) * 100}%`,
                              background: v === maxV ? 'var(--blue)' : 'rgba(37,99,235,0.28)',
                            }}
                          />
                        </div>
                        <div className="db-bar-x">{hourLabels[i]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="db-panel">
                <div className="db-panel-title">🚨 안전·호출 알림</div>
                <div className="db-log">
                  {alertLogs.map(({ time, level, icon, text }, i) => (
                    <div key={i} className={`db-log-row db-alert-${level}`}>
                      <span className="db-log-icon">{icon}</span>
                      <div style={{ flex: 1 }}>
                        <div className="db-log-time">{time}</div>
                        <div className="db-log-text">{text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 2: TOP5 + Peak + Robot status */}
            <div className="db-charts db-charts-3">
              <div className="db-panel">
                <div className="db-panel-title">💬 자주 묻는 질문 TOP 5</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {top5Questions.map(({ rank, q, count, color }) => (
                    <div key={rank} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color, width: 16, textAlign: 'center' }}>{rank}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500, marginBottom: 3, wordBreak: 'keep-all' }}>{q}</div>
                        <div style={{ height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.07)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${(count / maxQ) * 100}%`, background: color, borderRadius: 2 }} />
                        </div>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-3)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{count}회</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="db-panel">
                <div className="db-panel-title">⏰ 혼잡 시간대 분석</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {peakHours.map(({ time, load, label }) => (
                    <div key={time} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-2)', width: 72, flexShrink: 0 }}>{time}</span>
                      <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(0,0,0,0.07)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${load}%`, borderRadius: 3, background: load > 85 ? '#ef4444' : load > 65 ? '#f97316' : load > 45 ? '#eab308' : '#22c55e' }} />
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 600, color: load > 85 ? '#ef4444' : load > 65 ? '#f97316' : '#16a34a', width: 48, textAlign: 'right', flexShrink: 0 }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="db-panel">
                <div className="db-panel-title">🤖 로봇 현황</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { label: '오늘 처리 안내',  value: '74건',      c: 'var(--blue)' },
                    { label: '현재 상태',        value: '순찰 중',  c: 'var(--green)' },
                    { label: '배터리',           value: '82%',      c: 'var(--green)' },
                    { label: '마지막 호출 응대', value: '3분 전',   c: 'var(--yellow)' },
                    { label: '네트워크',         value: 'Wi-Fi 연결', c: 'var(--blue)' },
                  ].map(({ label, value, c }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{label}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: c }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Status footer */}
            <div className="db-footer">
              {[
                { dot: 'green',  text: '로봇: 활성' },
                { dot: 'blue',   text: 'API: 정상' },
                { dot: 'green',  text: 'WebSocket: 연결' },
                { dot: 'yellow', text: 'DB: 동기화 중' },
              ].map(({ dot, text }) => (
                <div key={text} className="db-status">
                  <span className={`db-dot ${dot}`} />
                  <span>{text}</span>
                </div>
              ))}
              <span className="db-footer-note">* 시나리오 기반 예시 데이터 — 실제 운영 결과와 다를 수 있습니다</span>
            </div>
          </div>
        </FadeUp>
      </div>
    </Section>
  )
}

/* ── SYSTEM ARCHITECTURE (Modules + Flow 통합) ────────────── */
function SystemArchitecture() {
  const Node = ({ icon, title, sub, color }) => (
    <div className="flow-node" style={{ borderColor: color, background: color + '14' }}>
      <div className="flow-node-icon">{icon}</div>
      <div className="flow-node-title">{title}</div>
      {sub && <div className="flow-node-sub">{sub}</div>}
    </div>
  )
  const HArr = ({ label }) => (
    <div className="flow-h-arr-wrap">
      <div className="flow-h-arr">→</div>
      {label && <div className="flow-h-arr-label">{label}</div>}
    </div>
  )
  const HBiArr = () => <div className="flow-h-arr-wrap"><div className="flow-h-arr">↔</div></div>
  const VConn = ({ label }) => (
    <div className="flow-v-conn">
      <div className="flow-v-line" />
      <div className="flow-v-badge">{label}</div>
      <div className="flow-v-line" />
    </div>
  )

  return (
    <Section id="architecture">
      <div className="container-wide">
        <FadeUp>
          <div className="section-header center">
            <div className="label" style={{ color: 'var(--yellow)' }}>System Architecture</div>
            <h2 className="section-title">시스템 구조</h2>
            <p className="section-sub center">방문객의 한 마디가 운영 데이터가 되는 기술 흐름</p>
          </div>
        </FadeUp>

        {/* Module chips */}
        <FadeUp>
          <div className="module-chips">
            {modules.map(m => (
              <div key={m.name} className="module-chip glass">
                <div className="module-chip-dot" style={{ background: m.color }} />
                <div>
                  <div className="module-chip-name">{m.name}</div>
                  <div className="module-chip-tech">{m.tech}</div>
                </div>
              </div>
            ))}
          </div>
        </FadeUp>

        {/* Data flow diagram */}
        <FadeUp>
          <div className="flow-diagram">
            <div className="flow-stage">
              <div className="flow-stage-label">입력 · 인터랙션</div>
              <div className="flow-stage-nodes">
                <Node icon="👧" title="방문객"    sub="음성 · 터치"   color="#fbbf24" />
                <HArr />
                <Node icon="🤖" title="Temi 로봇" sub="Android SDK"  color="#4f8ef7" />
                <div className="flow-h-plus">+</div>
                <Node icon="⚡" title="센서 모듈"  sub="버튼 · 감지" color="#f97316" />
              </div>
            </div>

            <VConn label="REST API / WebSocket" />

            <div className="flow-stage">
              <div className="flow-stage-label">처리 · 분석</div>
              <div className="flow-stage-nodes">
                <Node icon="🧠" title="AI / LLM"        sub="의도 분류 · 답변 생성" color="#a78bfa" />
                <HBiArr />
                <Node icon="🔌" title="Spring Boot API" sub="이벤트 처리 · 라우팅"  color="#34d399" />
              </div>
            </div>

            <VConn label="DB 저장 · 실시간 전송" />

            <div className="flow-stage">
              <div className="flow-stage-label">저장 · 출력</div>
              <div className="flow-stage-nodes">
                <Node icon="🗄️" title="MySQL DB"       sub="이벤트 · 통계 저장" color="#fb923c" />
                <HArr />
                <Node icon="📊" title="React 대시보드"  sub="실시간 모니터링"    color="#2dd4bf" />
                <HArr />
                <Node icon="👨‍💼" title="운영 담당자"    sub="알림 · 현장 대응"  color="#e879a0" />
              </div>
            </div>
          </div>
        </FadeUp>

        {/* Link to full arch page */}
        <FadeUp>
          <div className="arch-deep-link glass">
            <div>
              <div className="arch-deep-link-title">전체 아키텍처 상세 문서</div>
              <div className="arch-deep-link-body">
                Edge Computing 구조, 통신 프로토콜 결정, MVP 추천 설계까지 포함한 기술 문서입니다.
              </div>
            </div>
            <a
              href="/arch.html"
              className="btn btn-ghost"
              style={{ color: 'var(--green)', borderColor: 'rgba(5,150,105,0.3)', flexShrink: 0 }}
            >
              아키텍처 문서 보기 ↗
            </a>
          </div>
        </FadeUp>
      </div>
    </Section>
  )
}

/* ── TEAM ────────────────────────────────────────────────── */
function Team() {
  return (
    <Section id="team">
      <div className="container">
        <FadeUp>
          <div className="section-header center">
            <div className="label" style={{ color: 'var(--purple)' }}>Team</div>
            <h2 className="section-title">팀 소개</h2>
            <p className="section-sub center">Kids-Friends Robot을 함께 만든 5인 팀</p>
          </div>
        </FadeUp>
        <div className="team-grid-new">
          {team.map(({ emoji, name, role, desc, tech, github }) => (
            <GlassCard key={role} style={{ padding: '28px 24px' }}>
              <div className="team-card-top">
                <div className="team-emoji-lg">{emoji}</div>
                <div style={{ minWidth: 0 }}>
                  <div className="team-member-name">{name}</div>
                  <div className="team-role-pill">{role}</div>
                </div>
              </div>
              <div className="team-member-desc">{desc}</div>
              <div className="team-member-tech">{tech}</div>
              <a
                href={github}
                className="team-github-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub →
              </a>
            </GlassCard>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* ── FINAL CTA ───────────────────────────────────────────── */
function FinalCTA() {
  const ref = useRef(null)
  const seen = useInView(ref)
  return (
    <section className="final-cta-section" id="cta" ref={ref}>
      <motion.div
        className="final-cta-box"
        variants={stagger}
        initial="hidden"
        animate={seen ? 'visible' : 'hidden'}
      >
        <FadeUp>
          <div className="label" style={{ color: 'var(--purple)', textAlign: 'center', display: 'block' }}>Get Started</div>
          <h2 className="final-cta-heading">키즈카페 운영의 새로운 기준</h2>
          <p className="final-cta-desc">
            Kids-Friends Robot이 반복 응대를 대신 처리하고,<br />
            직원은 안전과 서비스 품질에 더 집중할 수 있습니다.
          </p>
        </FadeUp>
        <FadeUp delay={0.1}>
          <div className="final-cta-btns">
            <a href="#dashboard" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: 15 }}>어드민 대시보드 보기</a>
            <a href="#solution"  className="btn btn-ghost"   style={{ padding: '14px 28px', fontSize: 15 }}>서비스 흐름 보기</a>
            <a href="/arch.html" className="btn btn-ghost"   style={{ padding: '14px 28px', fontSize: 15 }}>아키텍처 문서 ↗</a>
          </div>
        </FadeUp>
      </motion.div>
    </section>
  )
}

/* ── FOOTER ──────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand-col">
            <div className="footer-brand-logo">
              <img src="/media/logo.png" alt="" style={{ height: 28, width: 'auto' }} onError={e => e.target.style.display = 'none'} />
              <span className="footer-brand-name">Kids-Friends Robot</span>
            </div>
            <p className="footer-brand-desc">
              Temi 로봇 기반 키즈카페 운영 보조 시스템.<br />
              반복 응대는 로봇이, 안전은 직원이.
            </p>
          </div>
          <div className="footer-col">
            <h4>페이지</h4>
            <a href="#problem">Problem</a>
            <a href="#solution">Solution</a>
            <a href="#dashboard">Dashboard</a>
            <a href="#architecture">Architecture</a>
            <a href="#team">Team</a>
          </div>
          <div className="footer-col">
            <h4>외부 링크</h4>
            <a href="/arch.html">시스템 아키텍처 ↗</a>
          </div>
        </div>
        <div className="footer-divider" />
        <div className="footer-bottom">
          <span className="footer-copy">© 2025 Kids-Friends Robot Team. All rights reserved.</span>
          <span className="footer-copy">v0.1 · 시나리오 기반 프로토타입</span>
        </div>
      </div>
    </footer>
  )
}

/* ── APP ─────────────────────────────────────────────────── */
export default function App() {
  return (
    <>
      <div className="mesh-bg" aria-hidden="true">
        <div className="mesh-blob blob-1" />
        <div className="mesh-blob blob-2" />
        <div className="mesh-blob blob-3" />
      </div>
      <NavBar />
      <main className="page">
        <Hero />
        <Problem />
        <HowItWorks />
        <AdminDashboard />
        <SystemArchitecture />
        <Team />
        <FinalCTA />
      </main>
      <Footer />
    </>
  )
}
