import { useCallback, useEffect, useState } from 'react'
import { clientApi } from '../../services/api.js'
import { EmptyRow, ErrorMessage, LoadingRow, Modal, PageHeader } from './AdminUi.jsx'

const initialForm = { childName: '', parentName: '', parentPhone: '' }

export default function MembersPage() {
  const [clients, setClients]   = useState([])
  const [form, setForm]         = useState(initialForm)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  // ── 클라이언트 필터 ────────────────────────────
  const [search, setSearch]     = useState('')   // 이름/연락처 통합 검색
  const [sortByPoint, setSortByPoint] = useState('') // '' | 'asc' | 'desc'

  const loadClients = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setClients(await clientApi.list() ?? [])
    } catch (err) {
      setError(err.message || '회원 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadClients() }, [loadClients])

  /* 회원 등록 */
  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.childName.trim()) { setError('아이 이름은 필수입니다.'); return }
    setSaving(true)
    setError('')
    try {
      await clientApi.create({
        childName:   form.childName.trim(),
        parentName:  form.parentName.trim(),
        parentPhone: form.parentPhone.trim(),
      })
      setForm(initialForm)
      setShowModal(false)
      await loadClients()
    } catch (err) {
      setError(err.message || '회원 등록에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  /* 포인트 +1 */
  const handleAddPoint = async (clientId) => {
    setError('')
    try {
      await clientApi.addPoint(clientId, 1)
      await loadClients()
    } catch (err) {
      setError(err.message || '포인트 적립에 실패했습니다.')
    }
  }

  /* 삭제 */
  const handleDelete = async (clientId) => {
    if (!window.confirm('회원을 삭제할까요?')) return
    setError('')
    try {
      await clientApi.remove(clientId)
      await loadClients()
    } catch (err) {
      setError(err.message || '회원 삭제에 실패했습니다.')
    }
  }

  /* 필터 초기화 */
  const handleReset = () => { setSearch(''); setSortByPoint('') }

  /* 클라이언트 사이드 필터 + 정렬 */
  const q = search.trim().toLowerCase()
  let filtered = clients.filter((c) =>
    !q
    || c.childName?.toLowerCase().includes(q)
    || c.parentName?.toLowerCase().includes(q)
    || c.parentPhone?.includes(q)
  )
  if (sortByPoint === 'desc') filtered = [...filtered].sort((a, b) => (b.clientPoint ?? 0) - (a.clientPoint ?? 0))
  if (sortByPoint === 'asc')  filtered = [...filtered].sort((a, b) => (a.clientPoint ?? 0) - (b.clientPoint ?? 0))

  return (
    <>
      <PageHeader
        title="회원 관리"
        description="이름·연락처로 즉시 검색하고 포인트 순으로 정렬할 수 있습니다."
        action={<button className="admin-mvp-primary" onClick={() => setShowModal(true)}>회원 등록</button>}
      />
      <ErrorMessage message={error} />

      {/* ── 필터 바 ── */}
      <section className="admin-mvp-card admin-mvp-filter">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="아이 이름 · 보호자 이름 · 연락처 검색"
          style={{ flex: 3 }}
        />
        <select value={sortByPoint} onChange={(e) => setSortByPoint(e.target.value)}>
          <option value="">포인트 정렬 없음</option>
          <option value="desc">포인트 높은 순 ↓</option>
          <option value="asc">포인트 낮은 순 ↑</option>
        </select>
        <button className="admin-mvp-filter-reset" onClick={handleReset}>초기화</button>
      </section>

      {!loading && (
        <div className="admin-mvp-result-label">
          {q || sortByPoint
            ? `검색 결과 ${filtered.length} / 전체 ${clients.length}명`
            : `전체 ${clients.length}명`}
        </div>
      )}

      {/* ── 테이블 ── */}
      <section className="admin-mvp-card">
        <table className="admin-mvp-table">
          <thead>
            <tr>
              <th>아이 이름</th>
              <th>보호자</th>
              <th>보호자 연락처</th>
              <th>포인트</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {loading && <LoadingRow colSpan={5} />}
            {!loading && filtered.length === 0 && <EmptyRow colSpan={5} />}
            {!loading && filtered.map((client) => (
              <tr key={client.clientId}>
                <td>{client.childName}</td>
                <td>{client.parentName || '-'}</td>
                <td>{client.parentPhone || '-'}</td>
                <td>
                  <span className="admin-mvp-point-badge">{client.clientPoint ?? 0}</span>
                </td>
                <td>
                  <div className="admin-mvp-actions">
                    <button onClick={() => handleAddPoint(client.clientId)}>+1 포인트</button>
                    <button className="danger" onClick={() => handleDelete(client.clientId)}>삭제</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {showModal && (
        <Modal title="회원 등록" onClose={() => setShowModal(false)}>
          <form className="admin-mvp-form" onSubmit={handleCreate}>
            <label>
              아이 이름
              <input value={form.childName} onChange={(e) => setForm({ ...form, childName: e.target.value })} />
            </label>
            <label>
              보호자 이름
              <input value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} />
            </label>
            <label>
              보호자 연락처
              <input value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} />
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
