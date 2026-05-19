import { useState } from 'react'
import { rebuildInstance } from '../../api/axiosInstance.js'
import { clientApi } from '../../services/api.js'
import { getTestClientId, setTestClientId } from '../../api/testConfig.js'
import { PageHeader } from './AdminUi.jsx'

const STORAGE_KEY = 'API_BASE_URL'
const FALLBACK = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function parseIp(url) {
  try {
    const u = new URL(url)
    return u.hostname
  } catch (e) {
    const match = url.match(/:\/\/([^:/]+)/)
    return match ? match[1] : 'localhost'
  }
}

function parsePort(url) {
  try {
    const u = new URL(url)
    return u.port || '8080'
  } catch (e) {
    const match = url.match(/:(\d+)/)
    return match ? match[1] : '8080'
  }
}

function getCurrentBaseUrl() {
  return localStorage.getItem(STORAGE_KEY) || FALLBACK
}

export default function SettingsPage() {
  const currentUrl = getCurrentBaseUrl()

  // ── 서버 URL 섹션 ──────────────────────────────────
  const [ip, setIp] = useState(() => parseIp(currentUrl))
  const [port, setPort] = useState(() => parsePort(currentUrl))
  const [protocol, setProtocol] = useState(() => currentUrl.startsWith('https') ? 'https' : 'http')
  const [activeUrl, setActiveUrl] = useState(currentUrl)
  const [urlToast, setUrlToast] = useState('')

  const handleSave = (e) => {
    e.preventDefault()
    const rawIp = ip.trim() || 'localhost'
    let nextUrl
    if (rawIp.startsWith('http://') || rawIp.startsWith('https://')) {
      nextUrl = rawIp.replace(/\/+$/, '')
    } else {
      const targetPort = port.trim() || '8080'
      nextUrl = `${protocol}://${rawIp}:${targetPort}`
    }
    localStorage.setItem(STORAGE_KEY, nextUrl)
    rebuildInstance()
    setActiveUrl(nextUrl)
    setUrlToast(`✅ 저장 완료! 서버 주소: ${nextUrl}`)
    setTimeout(() => setUrlToast(''), 4000)
  }

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY)
    rebuildInstance()
    const next = getCurrentBaseUrl()
    setIp(parseIp(next))
    setPort(parsePort(next))
    setProtocol(next.startsWith('https') ? 'https' : 'http')
    setActiveUrl(next)
    setUrlToast('↩️ 초기화 완료! 기본 설정 적용')
    setTimeout(() => setUrlToast(''), 4000)
  }

  // ── 테스트 회원 ID 섹션 ────────────────────────────
  const [testId, setTestId] = useState(() => getTestClientId())
  const [clientToast, setClientToast] = useState('')
  const [registering, setRegistering] = useState(false)

  const handleSaveClientId = (e) => {
    e.preventDefault()
    setTestClientId(testId.trim())
    setClientToast('✅ 테스트 회원 ID 저장 완료')
    setTimeout(() => setClientToast(''), 3000)
  }

  const handleAutoRegister = async () => {
    setRegistering(true)
    try {
      const result = await clientApi.create({
        childName: '테스트아이',
        parentName: '테스트부모',
        parentPhone: '01000000000',
      })
      const newId = result?.clientId
      if (!newId) throw new Error('서버에서 clientId를 반환하지 않았습니다.')
      setTestId(newId)
      setTestClientId(newId)
      setClientToast(`✅ 자동 등록 완료 — ID가 저장됐습니다.`)
    } catch (err) {
      setClientToast(`❌ 등록 실패: ${err.message}`)
    } finally {
      setRegistering(false)
      setTimeout(() => setClientToast(''), 5000)
    }
  }

  const handleClearClientId = () => {
    setTestId('')
    setTestClientId('')
    setClientToast('🗑️ 테스트 회원 ID 초기화 완료')
    setTimeout(() => setClientToast(''), 3000)
  }

  return (
    <>
      <PageHeader
        title="설정"
        description="백엔드 서버 주소와 API 테스트용 회원 ID를 관리합니다."
      />

      {/* ── 서버 URL 섹션 ──────────────────────────── */}
      <section className="admin-mvp-card" style={{ padding: '28px 28px 32px', marginBottom: 24 }}>
        <div className="admin-mvp-settings-section">
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>서버 주소</div>

          <div className="admin-mvp-settings-current">
            현재 활성 서버 주소: <strong>{activeUrl}</strong>
          </div>

          <form onSubmit={handleSave} className="admin-mvp-form">
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', marginBottom: '20px' }}>
              <div style={{ flex: '0 0 100px' }}>
                <label className="admin-mvp-settings-label">프로토콜</label>
                <select
                  className="admin-mvp-settings-input"
                  value={protocol}
                  onChange={(e) => setProtocol(e.target.value)}
                  style={{ marginBottom: 0, height: '42px' }}
                >
                  <option value="http">http://</option>
                  <option value="https">https://</option>
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label className="admin-mvp-settings-label" htmlFor="ip-input">서버 IP 주소</label>
                <input
                  id="ip-input"
                  className="admin-mvp-settings-input"
                  type="text"
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                  placeholder="예: 192.168.1.100  또는  https://abc123.ngrok-free.app"
                  autoComplete="off"
                  spellCheck={false}
                  style={{ marginBottom: 0, height: '42px' }}
                />
              </div>

              <div style={{ flex: '0 0 100px' }}>
                <label className="admin-mvp-settings-label" htmlFor="port-input">포트</label>
                <input
                  id="port-input"
                  className="admin-mvp-settings-input"
                  type="text"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  placeholder="8080"
                  autoComplete="off"
                  style={{ marginBottom: 0, height: '42px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="submit" className="admin-mvp-primary">저장 및 적용</button>
              <button type="button" className="admin-mvp-text" onClick={handleReset} style={{ padding: '9px 14px' }}>
                기본값으로 초기화
              </button>
            </div>
          </form>

          {urlToast && <div className="admin-mvp-toast">{urlToast}</div>}

          <div style={{ marginTop: 28, padding: '16px 18px', background: 'rgba(37,99,235,0.05)', borderRadius: 'var(--r-sm)', border: '1px solid rgba(37,99,235,0.15)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--blue)', marginBottom: 10 }}>도움말</div>
            <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>
              [로컬] 로봇과 서버가 같은 와이파이에 연결된 경우: IP 주소 입력 (예: 192.168.1.100)<br />
              [ngrok] 외부 접속이 필요한 경우: ngrok URL 전체를 IP 칸에 붙여넣으세요 (예: https://abc123.ngrok-free.app)
            </p>
          </div>
        </div>
      </section>

      {/* ── 테스트 회원 ID 섹션 ────────────────────── */}
      <section className="admin-mvp-card" style={{ padding: '28px 28px 32px' }}>
        <div className="admin-mvp-settings-section">
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>테스트 회원 ID</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 16 }}>
            회원 ID가 필요한 API(채팅, 사진 등)를 테스트할 때 사용합니다. 브라우저에 저장됩니다.
          </div>

          {testId && (
            <div className="admin-mvp-settings-current" style={{ fontFamily: 'monospace', fontSize: 13 }}>
              현재 테스트 회원 ID: <strong>{testId}</strong>
            </div>
          )}

          <form onSubmit={handleSaveClientId} className="admin-mvp-form">
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <label className="admin-mvp-settings-label" htmlFor="client-id-input">회원 ID (UUID)</label>
                <input
                  id="client-id-input"
                  className="admin-mvp-settings-input"
                  type="text"
                  value={testId}
                  onChange={(e) => setTestId(e.target.value)}
                  placeholder="예: 550e8400-e29b-41d4-a716-446655440000"
                  autoComplete="off"
                  spellCheck={false}
                  style={{ marginBottom: 0, height: '42px', fontFamily: 'monospace' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="submit" className="admin-mvp-primary">저장</button>
              <button
                type="button"
                className="admin-mvp-primary"
                onClick={handleAutoRegister}
                disabled={registering}
                style={{ background: 'var(--green, #16a34a)' }}
              >
                {registering ? '등록 중...' : '임시 회원 자동 등록'}
              </button>
              {testId && (
                <button type="button" className="admin-mvp-text" onClick={handleClearClientId} style={{ padding: '9px 14px' }}>
                  초기화
                </button>
              )}
            </div>
          </form>

          {clientToast && <div className="admin-mvp-toast">{clientToast}</div>}

          <div style={{ marginTop: 28, padding: '16px 18px', background: 'rgba(22,163,74,0.05)', borderRadius: 'var(--r-sm)', border: '1px solid rgba(22,163,74,0.2)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--green, #16a34a)', marginBottom: 10 }}>사용 방법</div>
            <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>
              <strong>임시 회원 자동 등록</strong>: 버튼 클릭 시 테스트 계정이 DB에 등록되고 ID가 자동 저장됩니다.<br />
              <strong>직접 입력</strong>: 이미 등록된 회원 UUID를 직접 붙여넣고 저장하세요.<br />
              저장된 ID는 채팅 로그, 사진 등 회원 ID가 필요한 API 테스트에 자동으로 사용됩니다.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
