import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Bell, ShieldAlert, MapPin, Volume2, Bot, Gamepad2, BellRing, Database, BarChart2 } from 'lucide-react'
import HeroParticleBackground from './HeroParticleBackground'

/* ── DATA ─────────────────────────────────────────────────── */
const problems = [
  { icon: MessageCircle, label: '반복 질문 응대', body: '하루 수십 회 반복되는 위치·요금·규칙 문의가 직원의 집중력을 지속적으로 분산시킵니다.', accent: 'var(--pink)', dim: 'var(--pink-dim)' },
  { icon: Bell,          label: '잦은 직원 호출', body: '모든 요청에 직원이 직접 이동해야 하는 구조로 동선 낭비와 피로도가 누적됩니다.',       accent: 'var(--yellow)', dim: 'var(--yellow-dim)' },
  { icon: ShieldAlert,   label: '안전관리 집중도 저하', body: '반복 응대로 인해 안전 모니터링이 끊기고, 돌발 상황 대응 능력이 저하됩니다.', accent: 'var(--blue)', dim: 'var(--blue-dim)' },
]

const reasons = [
  { emoji: '💬', title: '반복 질문 최다 현장', body: '아이·보호자의 반복 질문이 가장 많이 발생하는 공간', accent: 'var(--pink)', dim: 'var(--pink-dim)' },
  { emoji: '🚶', title: '직접 이동 안내 필요', body: '직원이 직접 이동하며 안내해야 하는 구조적 문제',     accent: 'var(--blue)', dim: 'var(--blue-dim)' },
  { emoji: '⚠️', title: '안전 집중 필요',      body: '반복 응대로 안전관리 집중이 어려운 현실',           accent: 'var(--yellow)', dim: 'var(--yellow-dim)' },
  { emoji: '🤖', title: 'Temi 최적 적합',      body: 'Temi의 이동·화면·음성·자율주행과 최고 궁합',        accent: 'var(--green)', dim: 'var(--green-dim)' },
  { emoji: '📊', title: '데이터 확장 가능',    body: '질문/호출 로그를 운영 데이터로 확장 가능',           accent: 'var(--purple)', dim: 'var(--purple-dim)' },
]

const features = [
  { icon: MapPin,    label: '놀이존 위치 안내',     body: '목적지까지 직접 이동하며 음성으로 안내합니다',          accent: 'var(--blue)', dim: 'var(--blue-dim)' },
  { icon: Volume2,   label: '음성·화면 규칙 설명', body: '이용 규칙을 음성과 화면으로 즉시 전달합니다',         accent: 'var(--pink)', dim: 'var(--pink-dim)' },
  { icon: Bot,       label: 'AI 자유 질문 응답',   body: 'LLM 기반으로 자연스럽고 정확하게 대화합니다',            accent: 'var(--green)', dim: 'var(--green-dim)' },
  { icon: Gamepad2,  label: '퀴즈·미션 인터랙션', body: '아이와 놀이형 대화로 즐거운 경험을 제공합니다',                  accent: 'var(--purple)', dim: 'var(--purple-dim)' },
  { icon: BellRing,  label: '직원 호출 접수',      body: '버튼 또는 화면 터치로 즉시 직원을 호출합니다',            accent: 'var(--yellow)', dim: 'var(--yellow-dim)' },
  { icon: Database,  label: '로그 자동 저장',      body: '모든 질문과 호출 이력이 DB에 자동 기록됩니다',         accent: 'var(--blue)', dim: 'var(--blue-dim)' },
  { icon: BarChart2, label: '관리자 통계 대시보드', body: '운영 현황과 트렌드를 실시간으로 확인합니다',                  accent: 'var(--pink)', dim: 'var(--pink-dim)' },
]

const modules = [
  { bar: 'var(--blue)',   name: 'Temi Robot Module',      tech: 'Temi SDK · Android Java',         items: ['이동 안내', '음성 응답', '화면 표시'] },
  { bar: 'var(--purple)', name: 'AI Conversation Module', tech: 'LLM API · Prompt Engineering',    items: ['의도 분류', '자연어 답변', 'JSON 응답'] },
  { bar: 'var(--green)',  name: 'Sensor Module',          tech: 'Arduino · ESP32 · Raspberry Pi',  items: ['호출 버튼', '접근 감지', '이벤트 수신'] },
  { bar: 'var(--yellow)', name: 'Backend Module',         tech: 'Spring Boot · MySQL',             items: ['REST API', '이벤트 저장', '명령 관리'] },
  { bar: 'var(--pink)',   name: 'Realtime Module',        tech: 'WebSocket · MQTT',                items: ['관리자 알림', '로봇 상태 push'] },
  { bar: '#2dd4bf',       name: 'Admin Web Module',       tech: 'React · Next.js',                 items: ['이벤트 로그', '호출 내역', '통계 확인'] },
]

const steps = [
  { text: '아이가 "미끄럼틀 어디 있어?" 질문', color: 'var(--pink)' },
  { text: 'Temi가 음성으로 즉시 답변',          color: 'var(--blue)' },
  { text: 'Temi가 해당 놀이존까지 직접 이동 안내', color: 'var(--green)' },
  { text: '아이가 "퀴즈 해줘" 요청 → LLM 인터랙션', color: 'var(--yellow)' },
  { text: '버튼 또는 화면으로 직원 호출',        color: 'var(--purple)' },
  { text: '관리자 페이지에 호출 이벤트 실시간 표시', color: 'var(--blue)' },
  { text: '질문/호출 로그가 DB에 자동 저장',     color: 'var(--green)' },
]

const demoItems = [
  { emoji: '🗺️', label: '놀이존 이동 안내' },
  { emoji: '🤖', label: 'AI 대화 응답' },
  { emoji: '🔔', label: '직원 호출' },
  { emoji: '📊', label: '관리자 대시보드' },
]

const team = [
  { emoji: '🧭', role: 'SW Lead',            desc: '총괄 기획·설계' },
  { emoji: '🗄️', role: 'Backend Developer',  desc: 'API·DB·이벤트 흐름' },
  { emoji: '⚡', role: 'Sensor Engineer',    desc: 'Arduino·ESP32 제어' },
  { emoji: '🤖', role: 'Temi Developer',     desc: 'SDK·Android 제어' },
  { emoji: '🖥️', role: 'Frontend Developer', desc: 'Admin Web·UI' },
]

/* ── Dashboard mock data ──────────────────────────────────── */
const dbLogs = [
  { time: '17:42', icon: '💬', text: '"화장실 어디예요?" → 음성 안내 완료' },
  { time: '17:38', icon: '🗺️', text: '"미끄럼틀 어디예요?" → 이동 안내 시작' },
  { time: '17:31', icon: '🔔', text: '직원 호출 접수 → 담당자 알림 전송' },
  { time: '17:22', icon: '🤖', text: '"요금이 얼마예요?" → AI 자동 답변' },
  { time: '17:15', icon: '⚠️', text: '근접 감지 이벤트 → 안전 알림 발송' },
]

const hourlyData = [8, 12, 5, 6, 9, 18, 24, 31, 28, 22, 16, 14]
const hourLabels = ['9시','10시','11시','12시','13시','14시','15시','16시','17시','18시','19시','20시']

const top5Questions = [
  { rank: 1, q: '화장실이 어디 있어요?', count: 34, color: 'var(--blue)' },
  { rank: 2, q: '미끄럼틀 어디 있어요?', count: 28, color: 'var(--pink)' },
  { rank: 3, q: '이용 요금이 얼마예요?', count: 21, color: 'var(--purple)' },
  { rank: 4, q: '밥은 어디서 먹어요?',   count: 17, color: 'var(--green)' },
  { rank: 5, q: '보호자 대기 공간 있나요?', count: 12, color: 'var(--yellow)' },
]

const alertLogs = [
  { time: '17:51', level: 'warn',  icon: '⚠️', text: '혼잡 감지 — 볼풀 영역 입장 인원 초과' },
  { time: '17:44', level: 'call',  icon: '🔔', text: '보호자 호출 — 미끄럼틀 구역 3번 테이블' },
  { time: '17:38', level: 'info',  icon: '✅', text: '직원 호출 완료 — 응대 시간 42초' },
  { time: '17:31', level: 'danger',icon: '🚨', text: '근접 감지 이벤트 — 안전 알림 발송됨' },
  { time: '17:22', level: 'call',  icon: '🔔', text: '직원 호출 접수 — 입구 안내 데스크' },
]

const peakHours = [
  { time: '15시–16시', load: 95, label: '최고 혼잡' },
  { time: '16시–17시', load: 88, label: '매우 혼잡' },
  { time: '14시–15시', load: 72, label: '혼잡' },
  { time: '11시–12시', load: 55, label: '보통' },
  { time: '10시–11시', load: 38, label: '여유' },
]

/* ── Impact data ─────────────────────────────────────────── */
const impactRows = [
  { icon: '💬', cat: '반복 질문 응대',   before: '직원이 일 평균 50회 직접 응대 → 집중력 분산', after: '로봇 100% 1차 안내 → 직원 응대 부담 제거', color: 'var(--pink)' },
  { icon: '🛡️', cat: '안전 모니터링',   before: '안내 업무와 안전 관리를 동시에 수행',         after: '안전 관리 전담 가용 시간 약 40% 확보',   color: 'var(--blue)' },
  { icon: '⏱️', cat: '호출 대응 속도',  before: '직원 위치에 따라 응대 지연 발생(평균 3분↑)', after: '관리자 대시보드 실시간 알림 → 즉시 대응', color: 'var(--yellow)' },
  { icon: '🗺️', cat: '이동 안내',       before: '직원이 직접 동행하여 안내 — 동선 낭비',       after: 'Temi 자율주행으로 완전 대체',             color: 'var(--green)' },
  { icon: '📊', cat: '운영 데이터',     before: '현장 경험과 직관에만 의존',                   after: '질문·호출·혼잡 데이터 자동 축적 및 분석', color: 'var(--purple)' },
  { icon: '😊', cat: '고객 만족도',     before: '대기·지연으로 인한 불만 발생',               after: '즉각 응대로 방문 경험 품질 향상',         color: '#0891b2' },
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
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav className="nav" style={{ boxShadow: scrolled ? '0 4px 24px rgba(100,120,200,0.15)' : 'none' }}>
      <div className="nav-logo">
        <img src="/media/logo.png" alt="Kids-Friends Robot" onError={e => e.target.style.display='none'} />
        <span className="nav-logo-name">Kids-Friends Robot</span>
      </div>
      <div className="nav-links">
        {[
          ['#problem','Problem'],['#solution','Solution'],['#dashboard','Dashboard'],
          ['#impact','Impact'],['#flow','System'],['#team','Team'],
        ].map(([h,l]) => (
          <a key={h} href={h} style={{ color: 'var(--text-2)' }}>{l}</a>
        ))}
      </div>
      <div className="nav-actions">
        <a href="/arch.html" className="btn btn-ghost btn-sm" style={{ color: 'var(--green)', borderColor: 'rgba(21,168,105,0.3)' }}>Architecture ↗</a>
        <a href="#" className="btn btn-ghost btn-sm">GitHub ↗</a>
      </div>
    </nav>
  )
}

/* ── HERO ────────────────────────────────────────────────── */
function Hero() {
  const ref = useRef(null)
  const seen = useInView(ref)
  return (
    <section className="hero" ref={ref} id="hero">
      <HeroParticleBackground />
      <motion.div className="hero-inner" variants={stagger} initial="hidden" animate={seen ? 'visible' : 'hidden'}>
        <FadeUp>
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Temi Robot × Kids Cafe 운영 보조 시스템
          </div>
        </FadeUp>
        <FadeUp delay={0.05}>
          <img src="/media/logo.png" alt="Kids-Friends" className="hero-logo" onError={e => { e.target.style.display='none' }} />
        </FadeUp>
        <FadeUp delay={0.1}>
          <h1 className="hero-title">
            <span style={{ background: 'linear-gradient(135deg, #1a2a6c 0%, #3b7ef4 50%, #7c5de8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>아이들의 친구,</span><br />
            스마트 운영 솔루션
          </h1>
        </FadeUp>
        <FadeUp delay={0.15}>
          <p className="hero-sub">
            반복 응대를 로봇이 대신 처리하고, 직원은 안전과 서비스 품질에 집중합니다.<br />
            모든 상호작용은 운영 데이터로 자동 축적됩니다.
          </p>
        </FadeUp>
        <FadeUp delay={0.2}>
          <div className="hero-cta">
            <a href="#dashboard" className="btn btn-primary hero-cta-main">
              <span style={{fontSize:16}}>📊</span> 관리자 대시보드 미리보기
            </a>
            <a href="#flow" className="btn btn-ghost hero-cta-sub">서비스 흐름 살펴보기 →</a>
          </div>
          <div className="hero-cta-hint">실제 운영 화면 목업을 지금 바로 확인하세요</div>
        </FadeUp>
        <FadeUp delay={0.28}>
          <div className="hero-stats">
            {[['42%','직원 호출 감소'],['1.8초','AI 응답 시간'],['100%','자동 응대']].map(([v,l]) => (
              <div key={l}>
                <div className="hero-stat-val">{v}</div>
                <div className="hero-stat-label">{l}</div>
              </div>
            ))}
          </div>
          <p className="hero-stats-note">* 시나리오 기반 예상 수치</p>
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
        <FadeUp><div className="section-header center">
          <div className="label pink">Problem</div>
          <h2 className="section-title">키즈카페 운영의 3가지 핵심 과제</h2>
          <p className="section-sub center">반복되는 비효율이 직원의 안전 집중도와 서비스 품질을 낮춥니다</p>
        </div></FadeUp>
        <div className="grid-3">
          {problems.map(({ icon: Icon, label, body, accent, dim }) => (
            <GlassCard key={label} accentColor={accent}>
              <div className="card-icon" style={{ background: dim }}><Icon size={20} color={accent} /></div>
              <div className="card-title">{label}</div>
              <div className="card-body">{body}</div>
            </GlassCard>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* ── IDEA ────────────────────────────────────────────────── */
function Idea() {
  return (
    <Section id="idea">
      <div className="container">
        <FadeUp><div className="section-header center">
          <div className="label" style={{ color: 'var(--purple)' }}>Idea Story</div>
          <h2 className="section-title">왜 키즈카페인가?</h2>
          <p className="section-sub center">여러 시나리오 중 키즈카페를 선택한 이유</p>
        </div></FadeUp>
        <div className="grid-3" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
          {reasons.map(({ emoji, title, body, accent, dim }) => (
            <GlassCard key={title} accentColor={accent}>
              <div className="card-icon" style={{ background: dim, fontSize: 20 }}>{emoji}</div>
              <div className="card-title">{title}</div>
              <div className="card-body">{body}</div>
            </GlassCard>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* ── SOLUTION ────────────────────────────────────────────── */
function Solution() {
  return (
    <Section id="solution">
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
          <FadeUp>
            <div className="label blue">Solution</div>
            <h2 className="section-title" style={{ marginTop: 8 }}>Kids-Friends Robot</h2>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--text-2)', marginTop: 16 }}>
              로봇 상호작용 데이터를 실시간 어드민 대시보드와 연결해,
              직원이 <strong style={{ color: 'var(--text)' }}>안내·호출·운영 현황</strong>을 한눈에 파악하고
              더 효율적으로 현장을 관리할 수 있는 키즈카페 운영 보조 서비스입니다.
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--text-2)', marginTop: 12 }}>
              반복 질문은 <strong style={{ color: 'var(--pink)' }}>로봇이 즉시 처리</strong>하고,
              직원은 안전관리와 고품질 서비스에 집중할 수 있습니다.
            </p>
          </FadeUp>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { t: '이동형 친구 UX',  b: '고정 키오스크가 아닌 아이 곁으로 직접 다가가는 경험', c: 'var(--pink)' },
              { t: '운영 데이터 축적', b: '모든 질문·호출이 대시보드 분석 데이터로 자동 전환', c: 'var(--blue)' },
              { t: '통합 시스템',     b: '센서 + AI + 로봇 + 백엔드가 하나의 흐름으로 연결',   c: 'var(--green)' },
            ].map(({ t, b, c }) => (
              <GlassCard key={t} style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ width: 3, height: 40, background: c, borderRadius: 3, flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div className="card-title" style={{ marginBottom: 4 }}>{t}</div>
                    <div className="card-body">{b}</div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
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
        <FadeUp><div className="section-header center">
          <div className="label blue">Admin Dashboard</div>
          <h2 className="section-title">실시간 관리자 대시보드</h2>
          <p className="section-sub center">
            로봇 상호작용·안전 이벤트·혼잡도를 한 화면에서 모니터링합니다.
          </p>
        </div></FadeUp>

        <FadeUp>
          <div className="db-shell glass">
            {/* ── Header ── */}
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

            {/* ── KPIs ── */}
            <div className="db-kpis">
              {[
                { n: '128',  u: '회',  l: '오늘 상호작용',    d: '↑ 전일 대비 +12%',  c: 'var(--blue)' },
                { n: '42',   u: '%',  l: '직원 호출 감소율',  d: '↑ 목표 대비 +7%p',  c: 'var(--green)' },
                { n: '74',   u: '건',  l: '자동 처리 질문',   d: '↑ 전일 대비 +5건',  c: 'var(--purple)' },
                { n: '1.8',  u: '초',  l: '평균 응답 시간',   d: '✓ 목표치 이하',      c: 'var(--yellow)' },
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

            {/* ── Row 1: chart + alert ── */}
            <div className="db-charts">
              {/* Bar chart */}
              <div className="db-panel">
                <div className="db-panel-title">시간대별 상호작용 수</div>
                <div className="db-bars">
                  {hourlyData.map((v, i) => (
                    <div key={i} className="db-bar-col">
                      <div className="db-bar-bg">
                        <div className="db-bar-fill" style={{ height: `${(v / maxV) * 100}%`, background: v === maxV ? 'var(--blue)' : 'rgba(37,99,235,0.28)' }} />
                      </div>
                      <div className="db-bar-x">{hourLabels[i]}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alert log */}
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

            {/* ── Row 2: TOP5 + Peak + Robot status ── */}
            <div className="db-charts db-charts-3">
              {/* TOP5 questions */}
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

              {/* Peak hours */}
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

              {/* Robot status */}
              <div className="db-panel">
                <div className="db-panel-title">🤖 로봇 현황</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { label: '오늘 처리 안내',    value: '74건',    c: 'var(--blue)' },
                    { label: '현재 상태',         value: '순찰 중', c: 'var(--green)' },
                    { label: '배터리',            value: '82%',    c: 'var(--green)' },
                    { label: '마지막 호출 응대',   value: '3분 전', c: 'var(--yellow)' },
                    { label: '네트워크',          value: 'Wi-Fi 연결', c: 'var(--blue)' },
                  ].map(({ label, value, c }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{label}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: c }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Status footer ── */}
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
              <span className="db-footer-note">* 시나리오 기반 예시 데이터</span>
            </div>
          </div>
        </FadeUp>
      </div>
    </Section>
  )
}

/* ── IMPACT ──────────────────────────────────────────────── */
function Impact() {
  return (
    <Section id="impact">
      <div className="container-wide">
        <FadeUp><div className="section-header center">
          <div className="label" style={{ color: 'var(--green)' }}>Expected Impact</div>
          <h2 className="section-title">도입 전 · 후 운영 변화</h2>
          <p className="section-sub center">시나리오 기반 예상 효과입니다</p>
        </div></FadeUp>

        {/* KPI highlights */}
        <FadeUp>
          <div className="impact-kpis">
            {[
              { v: '42%',   l: '직원 호출 감소 (예상)',  c: 'var(--blue)' },
              { v: '1.8초', l: '평균 AI 응답 시간',      c: 'var(--green)' },
              { v: '74건',  l: '일 평균 자동 처리 질문', c: 'var(--purple)' },
              { v: '40%↑',  l: '직원 안전 집중 가용 시간', c: 'var(--pink)' },
            ].map(({ v, l, c }) => (
              <GlassCard key={l} style={{ textAlign: 'center', padding: '28px 16px' }}>
                <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.04em', color: c, marginBottom: 8 }}>{v}</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)', wordBreak: 'keep-all' }}>{l}</div>
              </GlassCard>
            ))}
          </div>
        </FadeUp>

        {/* Before / After cards */}
        <div className="impact-grid">
          {impactRows.map(({ icon, cat, before, after, color }) => (
            <GlassCard key={cat} style={{ padding: 0, overflow: 'hidden' }}>
              <div className="impact-card-top" style={{ borderBottom: `2px solid ${color}`, background: color + '12' }}>
                <span style={{ fontSize: 18 }}>{icon}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{cat}</span>
              </div>
              <div className="impact-card-body">
                <div className="impact-side">
                  <span className="impact-tag before">Before</span>
                  <span className="impact-side-text">{before}</span>
                </div>
                <div className="impact-arr">→</div>
                <div className="impact-side">
                  <span className="impact-tag after">After</span>
                  <span className="impact-side-text after">{after}</span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        <FadeUp>
          <p className="impact-note">* 위 수치는 서비스 시나리오 기반 예상치이며, 실제 운영 결과와 다를 수 있습니다.</p>
        </FadeUp>
      </div>
    </Section>
  )
}

/* ── FEATURES ────────────────────────────────────────────── */
function Features() {
  return (
    <Section id="features">
      <div className="container-wide">
        <FadeUp><div className="section-header center">
          <div className="label green">Core Features</div>
          <h2 className="section-title">핵심 기능</h2>
          <p className="section-sub center">방문객 경험부터 운영 분석까지, 하나의 시스템으로</p>
        </div></FadeUp>
        <div className="grid-4">
          {features.map(({ icon: Icon, label, body, accent, dim }) => (
            <GlassCard key={label} accentColor={accent}>
              <div className="card-icon" style={{ background: dim }}><Icon size={20} color={accent} /></div>
              <div className="card-title">{label}</div>
              <div className="card-body">{body}</div>
            </GlassCard>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* ── MODULES ─────────────────────────────────────────────── */
function Modules() {
  return (
    <Section id="modules">
      <div className="container-wide">
        <FadeUp><div className="section-header center">
          <div className="label" style={{ color: 'var(--yellow)' }}>System Modules</div>
          <h2 className="section-title">시스템 모듈</h2>
        </div></FadeUp>
        <div className="grid-3">
          {modules.map(m => (
            <GlassCard key={m.name}>
              <div className="module-bar" style={{ background: m.bar }} />
              <div className="module-name">{m.name}</div>
              <div className="module-tech">{m.tech}</div>
              <ul className="module-items">
                {m.items.map(it => <li key={it}>{it}</li>)}
              </ul>
            </GlassCard>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* ── SYSTEM FLOW ─────────────────────────────────────────── */
function SystemFlow() {
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
    <Section id="flow">
      <div className="container-wide">
        <FadeUp><div className="section-header center">
          <div className="label blue">System Flow</div>
          <h2 className="section-title">서비스 데이터 흐름</h2>
          <p className="section-sub center">방문객의 한 마디가 운영 데이터가 되는 과정</p>
        </div></FadeUp>

        <FadeUp>
          <div className="flow-diagram">

            {/* ── Stage 1: 입력 ── */}
            <div className="flow-stage">
              <div className="flow-stage-label">입력 · 인터랙션</div>
              <div className="flow-stage-nodes">
                <Node icon="👧" title="방문객"    sub="음성 · 터치"    color="#fbbf24" />
                <HArr />
                <Node icon="🤖" title="Temi 로봇" sub="Android SDK"   color="#4f8ef7" />
                <div className="flow-h-plus">+</div>
                <Node icon="⚡" title="센서 모듈"  sub="버튼 · 감지"  color="#f97316" />
              </div>
            </div>

            <VConn label="REST API / WebSocket" />

            {/* ── Stage 2: 처리 ── */}
            <div className="flow-stage">
              <div className="flow-stage-label">처리 · 분석</div>
              <div className="flow-stage-nodes">
                <Node icon="🧠" title="AI / LLM"         sub="의도 분류 · 답변 생성"  color="#a78bfa" />
                <HBiArr />
                <Node icon="🔌" title="Spring Boot API"  sub="이벤트 처리 · 라우팅"   color="#34d399" />
              </div>
            </div>

            <VConn label="DB 저장 · 실시간 전송" />

            {/* ── Stage 3: 출력 ── */}
            <div className="flow-stage">
              <div className="flow-stage-label">저장 · 출력</div>
              <div className="flow-stage-nodes">
                <Node icon="🗄️" title="MySQL DB"          sub="이벤트 · 통계 저장" color="#fb923c" />
                <HArr />
                <Node icon="📊" title="React 대시보드"     sub="실시간 모니터링"    color="#2dd4bf" />
                <HArr />
                <Node icon="👨‍💼" title="운영 담당자"        sub="알림 · 현장 대응"  color="#e879a0" />
              </div>
            </div>

          </div>
        </FadeUp>
      </div>
    </Section>
  )
}

/* ── SCENARIO ────────────────────────────────────────────── */
function Scenario() {
  return (
    <Section id="scenario">
      <div className="container">
        <FadeUp><div className="section-header center">
          <div className="label green">User Scenario</div>
          <h2 className="section-title">실제 사용 시나리오</h2>
          <p className="section-sub center">키즈카페 현장에서 Kids-Friends Robot이 작동하는 한 장면</p>
        </div></FadeUp>
        <div className="steps">
          {steps.map(({ text, color }, i) => (
            <FadeUp key={i} delay={i * 0.06}>
              <div className="step">
                <div className="step-num" style={{ background: color }}>{i + 1}</div>
                <div className="step-content">
                  <div className="step-text">{text}</div>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* ── DEMO ────────────────────────────────────────────────── */
function Demo() {
  return (
    <Section id="demo">
      <div className="container-wide">
        <FadeUp><div className="section-header center">
          <div className="label blue">Demo</div>
          <h2 className="section-title">시연 영상</h2>
        </div></FadeUp>
        <FadeUp>
          <div className="glass demo-main">
            <div className="demo-play-btn">▶</div>
            <p style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)' }}>🎬 Demo Coming Soon</p>
            <p style={{ fontSize: 14, color: 'var(--text-2)' }}>시연 영상이 곧 업로드됩니다</p>
          </div>
        </FadeUp>
        <div className="demo-grid">
          {demoItems.map(({ emoji, label }) => (
            <GlassCard key={label} className="demo-card" style={{ padding: 0 }}>
              <div className="demo-thumb">{emoji}</div>
              <div className="demo-label">{label}</div>
            </GlassCard>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* ── TEAM ────────────────────────────────────────────────── */
function Team() {
  return (
    <Section id="team">
      <div className="container">
        <FadeUp><div className="section-header center">
          <div className="label" style={{ color: 'var(--purple)' }}>Team</div>
          <h2 className="section-title">팀 소개</h2>
        </div></FadeUp>
        <div className="team-grid">
          {team.map(({ emoji, role, desc }) => (
            <GlassCard key={role} className="team-card" style={{ padding: '28px 16px', width: 156 }}>
              <div className="team-emoji">{emoji}</div>
              <div className="team-role">{role}</div>
              <div className="team-desc">{desc}</div>
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
            <a href="#scenario"  className="btn btn-ghost"   style={{ padding: '14px 28px', fontSize: 15 }}>서비스 시나리오 보기</a>
            <a href="#"          className="btn btn-ghost"   style={{ padding: '14px 28px', fontSize: 15 }}>GitHub ↗</a>
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
          <div className="footer-col">
            <h4>서비스</h4>
            <a href="#problem">문제 정의</a>
            <a href="#solution">솔루션</a>
            <a href="#features">핵심 기능</a>
          </div>
          <div className="footer-col">
            <h4>운영</h4>
            <a href="#dashboard">어드민 대시보드</a>
            <a href="#impact">도입 효과</a>
            <a href="#scenario">사용 시나리오</a>
          </div>
          <div className="footer-col">
            <h4>시스템</h4>
            <a href="#modules">모듈 구조</a>
            <a href="#flow">서비스 플로우</a>
            <a href="/arch.html">시스템 아키텍처 ↗</a>
          </div>
          <div className="footer-col">
            <h4>리소스</h4>
            <a href="#">GitHub ↗</a>
            <a href="#">API Docs ↗</a>
            <a href="#">발표자료 ↗</a>
          </div>
        </div>
        <div className="footer-divider" />
        <div className="footer-bottom">
          <span className="footer-copy">© 2025 Kids-Friends Robot Team. All rights reserved.</span>
          <span className="footer-copy">Temi 로봇을 활용한 키즈카페 운영 보조 시스템</span>
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
        <Idea />
        <Solution />
        <AdminDashboard />
        <Impact />
        <Features />
        <Modules />
        <SystemFlow />
        <Scenario />
        <Demo />
        <Team />
        <FinalCTA />
      </main>
      <Footer />
    </>
  )
}
