import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCallContext } from '../context/CallContext.jsx'
import { getAdminStatistics } from '../services/api.js'

const ZONE_LABELS = {
  BALL_POOL:  '볼풀 구역',
  SLIDE_ZONE: '미끄럼틀 구역',
  MAIN_ZONE:  '메인 구역',
  FOOD_ZONE:  '식사 구역',
  REST_ZONE:  '휴식 구역',
}

const MOCK_STATS = {
  totalCalls: 12,
  waitingCalls: 3,
  totalQuestions: 28,
  quizParticipationCount: 15,
  topQuestions: ['미끄럼틀 어디 있어?', '화장실 어디 있어요?', '직원 불러줘'],
  topZones: ['BALL_POOL', 'SLIDE_ZONE', 'MAIN_ZONE'],
}

const HOURLY_DATA = [8, 12, 5, 6, 9, 18, 24, 31, 28, 22, 16, 14]
const HOUR_LABELS = ['9시','10시','11시','12시','13시','14시','15시','16시','17시','18시','19시','20시']
const MOCK_TOP5   = [
  { rank: 1, q: '화장실이 어디 있어요?',    count: 34, color: 'var(--blue)'   },
  { rank: 2, q: '미끄럼틀 어디 있어요?',    count: 28, color: 'var(--pink)'   },
  { rank: 3, q: '이용 요금이 얼마예요?',    count: 21, color: 'var(--purple)' },
  { rank: 4, q: '밥은 어디서 먹어요?',       count: 17, color: 'var(--green)'  },
  { rank: 5, q: '보호자 대기 공간 있나요?', count: 12, color: 'var(--yellow)' },
]
const MOCK_PEAK = [
  { time: '15시–16시', load: 95, label: '최고 혼잡' },
  { time: '16시–17시', load: 88, label: '매우 혼잡' },
  { time: '14시–15시', load: 72, label: '혼잡' },
  { time: '11시–12시', load: 55, label: '보통' },
  { time: '10시–11시', load: 38, label: '여유' },
]
const MOCK_ALERTS = [
  { time: '17:51', level: 'warn',   icon: '⚠️', text: '혼잡 감지 — 볼풀 영역 입장 인원 초과' },
  { time: '17:44', level: 'call',   icon: '🔔', text: '보호자 호출 — 미끄럼틀 구역 3번 테이블' },
  { time: '17:38', level: 'info',   icon: '✅', text: '직원 호출 완료 — 응대 시간 42초' },
  { time: '17:31', level: 'danger', icon: '🚨', text: '근접 감지 이벤트 — 안전 알림 발송됨' },
  { time: '17:22', level: 'call',   icon: '🔔', text: '직원 호출 접수 — 입구 안내 데스크' },
]

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const { calls } = useCallContext()
  const [stats, setStats] = useState(null)
  const [statsError, setStatsError] = useState(false)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    if (!sessionStorage.getItem('admin_auth')) {
      navigate('/admin/login', { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(t)
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const data = await getAdminStatistics()
      setStats(data)
      setStatsError(false)
    } catch {
      setStatsError(true)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    const t = setInterval(fetchStats, 5000)
    return () => clearInterval(t)
  }, [fetchStats])

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth')
    navigate('/admin/login', { replace: true })
  }

  const display = stats ?? MOCK_STATS
  const maxV    = Math.max(...HOURLY_DATA)
  const maxQ    = MOCK_TOP5[0].count
  const timeStr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  const dateStr = now.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })

  const alertLog = [
    ...calls.map(c => ({
      time:  c.receivedAt ?? '--:--',
      level: 'call',
      icon:  '🔔',
      text:  `직원 호출 — ${ZONE_LABELS[c.zoneId] ?? c.zoneId} · ${c.reason ?? '도움 요청'}`,
    })),
    ...MOCK_ALERTS,
  ].slice(0, 8)

  return (
    <>
      <div className="mesh-bg" aria-hidden="true">
        <div className="mesh-blob blob-1" />
        <div className="mesh-blob blob-2" />
        <div className="mesh-blob blob-3" />
      </div>

      <div className="admin-fullscreen">
        <motion.div
          className="db-shell glass admin-db-fullshell"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="db-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img
                src="/media/logo.png"
                alt=""
                style={{ height: 22 }}
                onError={e => { e.target.style.display = 'none' }}
              />
              <span className="db-dot green" />
              <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>
                Kids-Friends 운영 현황
              </span>
              {statsError && <span className="admin-api-badge">API 미연결</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{dateStr} · {timeStr}</span>
              <span className="db-live">● LIVE</span>
              <button
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: '1px solid rgba(220,38,38,0.25)',
                  borderRadius: 999,
                  fontSize: 12,
                  color: '#dc2626',
                  padding: '3px 12px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 600,
                }}
              >
                로그아웃
              </button>
            </div>
          </div>

          {/* KPIs */}
          <div className="db-kpis">
            {[
              { n: String(display.totalQuestions ?? 128), u: '회', l: '오늘 상호작용',    d: '↑ 전일 대비 +12%', c: 'var(--blue)'   },
              { n: '42',                                  u: '%',  l: '직원 호출 감소율', d: '↑ 목표 대비 +7%p', c: 'var(--green)'  },
              { n: String(display.totalCalls ?? 74),      u: '건', l: '자동 처리 질문',  d: '↑ 전일 대비 +5건', c: 'var(--purple)' },
              { n: '1.8',                                 u: '초', l: '평균 응답 시간',  d: '✓ 목표치 이하',     c: 'var(--yellow)' },
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

          {/* Row 1: bar chart + alert log */}
          <div className="db-charts">
            <div className="db-panel">
              <div className="db-panel-title">시간대별 상호작용 수</div>
              <div className="db-bars-wrap">
                <div className="db-bars">
                  {HOURLY_DATA.map((v, i) => (
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
                      <div className="db-bar-x">{HOUR_LABELS[i]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="db-panel">
              <div className="db-panel-title">
                🚨 안전·호출 알림
                {calls.length > 0 && (
                  <span style={{
                    marginLeft: 6, fontSize: 10, fontWeight: 700,
                    padding: '1px 6px', background: '#ef4444',
                    color: '#fff', borderRadius: 999,
                  }}>
                    신규 {calls.length}
                  </span>
                )}
              </div>
              <div className="db-log">
                {alertLog.map(({ time, level, icon, text }, i) => (
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

          {/* Row 2: TOP5 + peak hours + robot status */}
          <div className="db-charts db-charts-3">
            <div className="db-panel">
              <div className="db-panel-title">💬 자주 묻는 질문 TOP 5</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {MOCK_TOP5.map(({ rank, q, count, color }) => (
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
                {MOCK_PEAK.map(({ time, load, label }) => (
                  <div key={time} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-2)', width: 72, flexShrink: 0 }}>{time}</span>
                    <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(0,0,0,0.07)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${load}%`, borderRadius: 3,
                        background: load > 85 ? '#ef4444' : load > 65 ? '#f97316' : load > 45 ? '#eab308' : '#22c55e',
                      }} />
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 600,
                      color: load > 85 ? '#ef4444' : load > 65 ? '#f97316' : '#16a34a',
                      width: 48, textAlign: 'right', flexShrink: 0,
                    }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="db-panel">
              <div className="db-panel-title">🤖 로봇 현황</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: '오늘 처리 안내',  value: `${display.totalCalls ?? 74}건`,  c: 'var(--blue)'   },
                  { label: '현재 상태',        value: '순찰 중',                         c: 'var(--green)'  },
                  { label: '배터리',           value: '82%',                             c: 'var(--green)'  },
                  { label: '대기 중 호출',     value: `${display.waitingCalls ?? 3}건`, c: 'var(--yellow)' },
                  { label: '네트워크',         value: 'Wi-Fi 연결',                      c: 'var(--blue)'   },
                ].map(({ label, value, c }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: c }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
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
            {statsError && (
              <span className="db-footer-note">* API 미연결 — 예시 데이터로 표시 중</span>
            )}
          </div>
        </motion.div>
      </div>
    </>
  )
}
