import { useState } from 'react'
import { photoApi } from '../../services/api.js'
import { ErrorMessage, PageHeader } from './AdminUi.jsx'

export default function PhotosPage() {
  const [clientId, setClientId] = useState('')
  const [photos, setPhotos]     = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [searched, setSearched] = useState(false)

  // ── 클라이언트 필터 ────────────────────────────
  const [nameSearch, setNameSearch] = useState('')

  /* 조회 */
  const loadPhotos = async () => {
    if (!clientId.trim()) { setError('회원 ID를 입력하세요.'); setPhotos([]); return }
    setLoading(true)
    setError('')
    setSearched(true)
    try {
      setPhotos(await photoApi.listByClient(clientId.trim()) ?? [])
    } catch (err) {
      setError(err.message || '사진 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = (e) => { if (e.key === 'Enter') loadPhotos() }

  /* 삭제 */
  const handleDelete = async (photoId) => {
    if (!window.confirm('사진 기록을 삭제할까요?')) return
    setError('')
    try {
      await photoApi.remove(photoId)
      await loadPhotos()
    } catch (err) {
      setError(err.message || '사진 삭제에 실패했습니다.')
    }
  }

  /* 초기화 */
  const handleReset = () => {
    setClientId('')
    setNameSearch('')
    setPhotos([])
    setSearched(false)
    setError('')
  }

  /* 클라이언트 사이드 필터 */
  const nq = nameSearch.trim().toLowerCase()
  const filtered = photos.filter((p) =>
    !nq || p.photoName?.toLowerCase().includes(nq)
  )

  return (
    <>
      <PageHeader
        title="사진 관리"
        description="회원 ID로 불러온 뒤 파일명으로 추가 검색할 수 있습니다."
      />
      <ErrorMessage message={error} />

      {/* ── 필터 바 ── */}
      <section className="admin-mvp-card admin-mvp-filter">
        <input
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="회원 ID (UUID, 필수)"
          style={{ flex: 2 }}
        />
        <input
          value={nameSearch}
          onChange={(e) => setNameSearch(e.target.value)}
          placeholder="파일명 검색"
          disabled={photos.length === 0}
        />
        <button onClick={loadPhotos}>조회</button>
        <button className="admin-mvp-filter-reset" onClick={handleReset}>초기화</button>
      </section>

      {searched && !loading && (
        <div className="admin-mvp-result-label">
          {nq
            ? `검색 결과 ${filtered.length} / 전체 ${photos.length}장`
            : `전체 ${photos.length}장`}
        </div>
      )}

      {/* ── 결과 ── */}
      <section className="admin-mvp-card">
        {loading && <div className="admin-mvp-empty">불러오는 중...</div>}
        {!loading && !searched && (
          <div className="admin-mvp-empty">회원 ID를 입력하고 조회하세요.</div>
        )}
        {!loading && searched && filtered.length === 0 && (
          <div className="admin-mvp-empty">
            {nq ? '파일명 검색 결과가 없습니다.' : '사진 데이터가 없습니다.'}
          </div>
        )}
        {!loading && filtered.length > 0 && (
          <div className="admin-mvp-photo-grid">
            {filtered.map((photo) => (
              <article key={photo.photoId} className="admin-mvp-photo">
                <a href={photo.photoUrl} target="_blank" rel="noreferrer">
                  <img src={photo.photoUrl} alt={photo.photoName || '회원 사진'} />
                </a>
                <div className="admin-mvp-photo-meta">
                  <strong>{photo.photoName || '이름 없음'}</strong>
                  <button
                    className="admin-mvp-text danger"
                    onClick={() => handleDelete(photo.photoId)}
                  >
                    삭제
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
