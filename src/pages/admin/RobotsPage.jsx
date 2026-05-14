import { useCallback, useEffect, useState } from 'react'
import { robotApi } from '../../services/api.js'
import { EmptyRow, ErrorMessage, LoadingRow, Modal, PageHeader, StatusBadge } from './AdminUi.jsx'

const STATUS_LABELS = {
  ACTIVE: '활성',
  INACTIVE: '비활성',
  ERROR: '오류',
}

export default function RobotsPage() {
  const [robots, setRobots]       = useState([])
  const [name, setName]           = useState('')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')

  // ── 클라이언트 필터 ────────────────────────────
  const [nameSearch, setNameSearch]     = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const loadRobots = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setRobots(await robotApi.list() ?? [])
    } catch (err) {
      setError(err.message || '로봇 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadRobots() }, [loadRobots])

  /* 등록 */
  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name.trim()) { setError('로봇 이름은 필수입니다.'); return }
    setSaving(true)
    setError('')
    try {
      await robotApi.create({ name: name.trim() })
      setName('')
      setShowModal(false)
      await loadRobots()
    } catch (err) {
      setError(err.message || '로봇 등록에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  /* 상태 변경 */
  const handleStatus = async (robotId, status) => {
    setError('')
    try {
      await robotApi.updateStatus(robotId, status)
      await loadRobots()
    } catch (err) {
      setError(err.message || '상태 변경에 실패했습니다.')
    }
  }

  /* 삭제 */
  const handleDelete = async (robotId) => {
    if (!window.confirm('로봇을 삭제할까요?')) return
    setError('')
    try {
      await robotApi.remove(robotId)
      await loadRobots()
    } catch (err) {
      setError(err.message || '로봇 삭제에 실패했습니다.')
    }
  }

  /* 초기화 */
  const handleReset = () => { setNameSearch(''); setStatusFilter('') }

  /* 클라이언트 사이드 필터 */
  const filtered = robots.filter((r) => {
    const matchName   = !nameSearch.trim() || r.name?.toLowerCase().includes(nameSearch.toLowerCase())
    const matchStatus = !statusFilter || r.status === statusFilter
    return matchName && matchStatus
  })

  return (
    <>
      <PageHeader
        title="로봇 관리"
        description="이름·상태로 필터링하고 Temi 로봇을 등록·관리합니다."
        action={<button className="admin-mvp-primary" onClick={() => setShowModal(true)}>로봇 등록</button>}
      />
      <ErrorMessage message={error} />

      {/* ── 필터 바 ── */}
      <section className="admin-mvp-card admin-mvp-filter">
        <input
          value={nameSearch}
          onChange={(e) => setNameSearch(e.target.value)}
          placeholder="로봇 이름 검색"
          style={{ flex: 2 }}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">전체 상태</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button className="admin-mvp-filter-reset" onClick={handleReset}>초기화</button>
      </section>

      {!loading && (
        <div className="admin-mvp-result-label">
          {nameSearch || statusFilter
            ? `검색 결과 ${filtered.length} / 전체 ${robots.length}대`
            : `전체 ${robots.length}대`}
        </div>
      )}

      {/* ── 테이블 ── */}
      <section className="admin-mvp-card">
        <table className="admin-mvp-table">
          <thead>
            <tr>
              <th>이름</th>
              <th>상태</th>
              <th>상태 변경</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {loading && <LoadingRow colSpan={4} />}
            {!loading && filtered.length === 0 && <EmptyRow colSpan={4} />}
            {!loading && filtered.map((robot) => (
              <tr key={robot.robotId}>
                <td>{robot.name}</td>
                <td><StatusBadge status={robot.status} /></td>
                <td>
                  <select
                    value={robot.status || 'INACTIVE'}
                    onChange={(e) => handleStatus(robot.robotId, e.target.value)}
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <button
                    className="admin-mvp-text danger"
                    onClick={() => handleDelete(robot.robotId)}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {showModal && (
        <Modal title="로봇 등록" onClose={() => setShowModal(false)}>
          <form className="admin-mvp-form" onSubmit={handleCreate}>
            <label>
              로봇 이름
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <button className="admin-mvp-primary" disabled={saving}>
              {saving ? '저장 중...' : '등록'}
            </button>
          </form>
        </Modal>
      )}
    </>
  )
}
