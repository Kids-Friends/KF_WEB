import { useState } from 'react'
import { chatApi } from '../../services/api.js'
import { EmptyRow, ErrorMessage, LoadingRow, PageHeader, StatusBadge } from './AdminUi.jsx'

const CHAT_TYPE_LABELS = {
  CHAT: '일반 대화',
  IMAGE: '사진 전송',
  RULE: '규칙 문의',
  LOCATION: '위치 안내',
  CALL: '직원 호출',
}

export default function ChatsPage() {
  // ── API 조회 조건 ──────────────────────────────
  const [clientId, setClientId]   = useState('')

  // ── 클라이언트 필터 ────────────────────────────
  const [keyword, setKeyword]     = useState('')   // 질문/답변 텍스트
  const [typeFilter, setTypeFilter] = useState('') // chatType

  // ── 데이터 ────────────────────────────────────
  const [chats, setChats]     = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [searched, setSearched] = useState(false)

  /* 조회 */
  const handleSearch = async () => {
    setLoading(true)
    setError('')
    setSearched(true)
    try {
      // clientId가 비어 있으면 쿼리 파라미터 없이 전체 조회
      const data = await chatApi.listByClient(clientId.trim() || undefined) ?? []
      setChats(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || '채팅 로그를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  /* Enter 키 지원 */
  const onKeyDown = (e) => { if (e.key === 'Enter') handleSearch() }

  /* 초기화 */
  const handleReset = () => {
    setClientId('')
    setKeyword('')
    setTypeFilter('')
    setChats([])
    setSearched(false)
    setError('')
  }

  /* 클라이언트 사이드 필터링 */
  const kw = keyword.trim().toLowerCase()
  const filtered = chats.filter((chat) => {
    const matchText = !kw
      || chat.question?.toLowerCase().includes(kw)
      || chat.answer?.toLowerCase().includes(kw)
    const matchType = !typeFilter || chat.chatType === typeFilter
    return matchText && matchType
  })

  const resultLabel = searched && !loading
    ? `${filtered.length} / ${chats.length}건`
    : null

  return (
    <>
      <PageHeader
        title="채팅 로그"
        description="채팅 내용·타입으로 대화 기록을 검색합니다. 회원 ID는 선택 사항입니다."
      />
      <ErrorMessage message={error} />

      {/* ── 필터 바 ── */}
      <section className="admin-mvp-card admin-mvp-filter">
        <input
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="회원 ID (선택 — 비우면 전체)"
        />
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="질문 / 답변 내용 검색"
          style={{ flex: 2 }}
        />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">전체 타입</option>
          {Object.entries(CHAT_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button onClick={handleSearch}>조회</button>
        <button className="admin-mvp-filter-reset" onClick={handleReset}>초기화</button>
      </section>

      {/* ── 결과 카운트 ── */}
      {resultLabel && (
        <div className="admin-mvp-result-label">검색 결과 {resultLabel}</div>
      )}

      {/* ── 테이블 ── */}
      <section className="admin-mvp-card">
        <table className="admin-mvp-table">
          <thead>
            <tr>
              <th style={{ width: '38%' }}>질문</th>
              <th style={{ width: '46%' }}>답변</th>
              <th>타입</th>
            </tr>
          </thead>
          <tbody>
            {loading && <LoadingRow colSpan={3} />}
            {!loading && !searched && (
              <EmptyRow colSpan={3} message="위 검색창에서 내용을 입력한 뒤 조회하세요." />
            )}
            {!loading && searched && filtered.length === 0 && (
              <EmptyRow colSpan={3} message="검색 결과가 없습니다." />
            )}
            {!loading && filtered.map((chat) => (
              <tr key={chat.chatId}>
                <td style={{ wordBreak: 'keep-all' }}>{chat.question || '-'}</td>
                <td style={{ wordBreak: 'keep-all' }}>{chat.answer || '-'}</td>
                <td><StatusBadge status={chat.chatType} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  )
}
