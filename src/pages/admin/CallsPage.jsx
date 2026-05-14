import { useCallback, useEffect, useState } from 'react'
import { callsApi } from '../../services/api.js'
import { EmptyRow, ErrorMessage, LoadingRow, PageHeader, StatusBadge } from './AdminUi.jsx'

const STATUS_LABELS = {
  WAITING: '대기',
  DONE: '완료',
  CANCELED: '취소',
}

export default function CallsPage() {
  // ── API 조회 조건 (하나만 사용) ────────────────
  const [clientIdInput, setClientIdInput] = useState('')
  const [robotIdInput,  setRobotIdInput]  = useState('')

  // ── 클라이언트 필터 ────────────────────────────
  const [statusFilter, setStatusFilter] = useState('')   // WAITING / DONE / CANCELED
  const [reasonKeyword, setReasonKeyword] = useState('') // 사유 텍스트 검색

  // ── 데이터 ────────────────────────────────────
  const [calls, setCalls]     = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const loadCalls = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      // clientId 우선, 없으면 robotId, 둘 다 없으면 전체
      const params = {}
      if (clientIdInput.trim()) params.clientId = clientIdInput.trim()
      else if (robotIdInput.trim()) params.robotId = robotIdInput.trim()
      setCalls(await callsApi.list(params) ?? [])
    } catch (err) {
      setError(err.message || '호출 로그를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [clientIdInput, robotIdInput])

  useEffect(() => { loadCalls() }, [loadCalls])

  /* 상태 변경 */
  const handleStatus = async (callsId, status) => {
    setError('')
    try {
      await callsApi.updateStatus(callsId, status)
      await loadCalls()
    } catch (err) {
      setError(err.message || '호출 상태 변경에 실패했습니다.')
    }
  }

  /* 필터 초기화 */
  const handleReset = () => {
    setClientIdInput('')
    setRobotIdInput('')
    setStatusFilter('')
    setReasonKeyword('')
  }

  /* 클라이언트 사이드 필터링 */
  const rk = reasonKeyword.trim().toLowerCase()
  const filtered = calls.filter((call) => {
    // robotId는 API가 clientId로 가져온 경우에도 추가로 매칭
    const matchRobot  = !robotIdInput.trim() || call.robotId?.includes(robotIdInput.trim())
    const matchStatus = !statusFilter || call.status === statusFilter
    const matchReason = !rk || call.reason?.toLowerCase().includes(rk)
    return matchRobot && matchStatus && matchReason
  })

  const resultLabel = !loading ? `${filtered.length} / ${calls.length}건` : null

  return (
    <>
      <PageHeader
        title="호출 로그"
        description="회원 ID·로봇 ID·사유·상태로 호출 기록을 검색하고 상태를 변경합니다."
      />
      <ErrorMessage message={error} />

      {/* ── 필터 바 ── */}
      <section className="admin-mvp-card admin-mvp-filter">
        <input
          value={clientIdInput}
          onChange={(e) => setClientIdInput(e.target.value)}
          placeholder="회원 ID (UUID, 선택)"
        />
        <input
          value={robotIdInput}
          onChange={(e) => setRobotIdInput(e.target.value)}
          placeholder="로봇 ID (UUID, 선택)"
        />
        <input
          value={reasonKeyword}
          onChange={(e) => setReasonKeyword(e.target.value)}
          placeholder="사유 내용 검색"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">전체 상태</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button onClick={loadCalls}>조회</button>
        <button className="admin-mvp-filter-reset" onClick={handleReset}>초기화</button>
      </section>

      {resultLabel && (
        <div className="admin-mvp-result-label">검색 결과 {resultLabel}</div>
      )}

      {/* ── 테이블 ── */}
      <section className="admin-mvp-card">
        <table className="admin-mvp-table">
          <thead>
            <tr>
              <th>회원 ID</th>
              <th>로봇 ID</th>
              <th>사유</th>
              <th>상태</th>
              <th>상태 변경</th>
            </tr>
          </thead>
          <tbody>
            {loading && <LoadingRow colSpan={5} />}
            {!loading && filtered.length === 0 && <EmptyRow colSpan={5} />}
            {!loading && filtered.map((call) => (
              <tr key={call.callsId}>
                <td className="admin-mvp-mono">{call.clientId}</td>
                <td className="admin-mvp-mono">{call.robotId}</td>
                <td>{call.reason || '-'}</td>
                <td><StatusBadge status={call.status} /></td>
                <td>
                  <select
                    value={call.status || 'WAITING'}
                    onChange={(e) => handleStatus(call.callsId, e.target.value)}
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  )
}
