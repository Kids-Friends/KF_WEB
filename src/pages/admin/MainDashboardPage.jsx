import { useEffect, useState, useMemo } from 'react'
import { clientApi, robotApi, callsApi, chatApi } from '../../services/api.js'
import { ErrorMessage, PageHeader } from './AdminUi.jsx'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts'

export default function MainDashboardPage() {
  const [metrics, setMetrics] = useState({
    totalMembers: 0,
    robotsTotal: 0,
    robotsActive: 0,
    robotsError: 0,
    callsWaiting: 0,
    callsDone: 0,
  })
  const [callsData, setCallsData] = useState([])
  const [chatsData, setChatsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true)
      setError('')
      try {
        const [members, robots, calls, chats] = await Promise.all([
          clientApi.list().catch(() => []),
          robotApi.list().catch(() => []),
          callsApi.list().catch(() => []),
          chatApi.listByClient().catch(() => [])
        ])

        const activeRobots = robots?.filter(r => r.status === 'ACTIVE').length || 0
        const errorRobots = robots?.filter(r => r.status === 'ERROR').length || 0
        
        const waitingCalls = calls?.filter(c => c.status === 'WAITING').length || 0
        const doneCalls = calls?.filter(c => c.status === 'DONE').length || 0

        setMetrics({
          totalMembers: members?.length || 0,
          robotsTotal: robots?.length || 0,
          robotsActive: activeRobots,
          robotsError: errorRobots,
          callsWaiting: waitingCalls,
          callsDone: doneCalls,
        })
        setCallsData(calls || [])
        setChatsData(chats || [])
      } catch (err) {
        setError('대시보드 데이터를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // 호출 사유 통계 데이터 가공
  const reasonStats = useMemo(() => {
    if (!callsData || callsData.length === 0) return []
    
    const countMap = {}
    callsData.forEach(call => {
      const reason = call.reason?.trim() || '기타/미지정'
      countMap[reason] = (countMap[reason] || 0) + 1
    })

    return Object.entries(countMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5) // 상위 5개만
  }, [callsData])

  // 채팅 타입 통계 데이터 가공
  const chatTypeStats = useMemo(() => {
    if (!chatsData || chatsData.length === 0) return []
    
    const TYPE_LABELS = {
      CHAT: '일반 대화',
      IMAGE: '사진 전송',
      RULE: '규칙 문의',
      LOCATION: '위치 안내',
      CALL: '직원 호출'
    }

    const countMap = {}
    chatsData.forEach(chat => {
      const type = chat.chatType || '기타'
      const label = TYPE_LABELS[type] || type
      countMap[label] = (countMap[label] || 0) + 1
    })

    return Object.entries(countMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [chatsData])

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#64748b', '#ec4899']

  return (
    <>
      <PageHeader 
        title="통합 대시보드" 
        description="전체 시스템 현황과 주요 지표를 실시간으로 모니터링합니다." 
      />
      <ErrorMessage message={error} />

      {loading ? (
        <div className="admin-mvp-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-3)' }}>
          데이터를 분석 중입니다...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* ── ERP 스타일 KPI 카드 섹션 ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            
            {/* 회원 KPI */}
            <section className="admin-mvp-card" style={{ padding: '24px', borderLeft: '4px solid var(--blue)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    총 가입 회원
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>
                      {metrics.totalMembers.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '14px', color: 'var(--text-3)', fontWeight: 600 }}>명</span>
                  </div>
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                  👥
                </div>
              </div>
            </section>

            {/* 로봇 가동 현황 KPI */}
            <section className="admin-mvp-card" style={{ padding: '24px', borderLeft: '4px solid var(--green)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: '100%' }}>
                  <h3 style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    운영 로봇 현황
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 700, marginBottom: '2px' }}>전체</div>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)' }}>{metrics.robotsTotal}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 700, marginBottom: '2px' }}>가동 중 (ACTIVE)</div>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--green)' }}>{metrics.robotsActive}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 700, marginBottom: '2px' }}>오류 (ERROR)</div>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: '#dc2626' }}>{metrics.robotsError}</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 호출 KPI */}
            <section className="admin-mvp-card" style={{ padding: '24px', borderLeft: '4px solid var(--yellow)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: '100%' }}>
                  <h3 style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    실시간 호출 처리
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 700, marginBottom: '2px' }}>대기 중</div>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--yellow)' }}>{metrics.callsWaiting}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 700, marginBottom: '2px' }}>처리 완료</div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-2)' }}>{metrics.callsDone}</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

          </div>

          {/* ── 시각화 차트 섹션 ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
            
            <section className="admin-mvp-card" style={{ padding: '24px', minHeight: '360px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '16px', color: 'var(--text)', marginBottom: '24px', fontWeight: 700 }}>
                상위 호출 사유 분석 (Top 5)
              </h3>
              
              <div style={{ flex: 1, width: '100%', minHeight: '260px' }}>
                {reasonStats.length === 0 ? (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>
                    호출 데이터가 없습니다.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reasonStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: 'var(--text-2)' }} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: 'var(--text-3)' }} 
                        allowDecimals={false}
                      />
                      <RechartsTooltip 
                        cursor={{ fill: 'rgba(37,99,235,0.05)' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40} name="건수">
                        {reasonStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </section>
            
            <section className="admin-mvp-card" style={{ padding: '24px', minHeight: '360px', display: 'flex', flexDirection: 'column' }}>
               <h3 style={{ fontSize: '16px', color: 'var(--text)', marginBottom: '24px', fontWeight: 700 }}>
                챗봇 대화 유형 (채팅 로그)
              </h3>
              <div style={{ flex: 1, width: '100%', minHeight: '260px' }}>
                {chatTypeStats.length === 0 ? (
                   <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>
                     채팅 데이터가 없습니다.
                   </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chatTypeStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {chatTypeStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        formatter={(value) => [`${value}건`, '이용 횟수']}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </section>
          </div>

        </div>
      )}
    </>
  )
}
