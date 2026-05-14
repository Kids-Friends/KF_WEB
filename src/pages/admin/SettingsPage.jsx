import { useState } from 'react'
import { rebuildInstance } from '../../api/axiosInstance.js'
import { PageHeader } from './AdminUi.jsx'

const STORAGE_KEY = 'API_BASE_URL'
const FALLBACK = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

/** URL에서 IP만 추출 (예: http://192.168.1.100:8080 -> 192.168.1.100) */
function parseIp(url) {
  try {
    const u = new URL(url)
    return u.hostname
  } catch (e) {
    // URL 형식이 아닐 경우 (예: localhost)
    const match = url.match(/:\/\/([^:/]+)/)
    return match ? match[1] : 'localhost'
  }
}

/** URL에서 포트 추출 */
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
  
  const [ip, setIp] = useState(() => parseIp(currentUrl))
  const [port, setPort] = useState(() => parsePort(currentUrl))
  const [protocol, setProtocol] = useState(() => currentUrl.startsWith('https') ? 'https' : 'http')
  
  const [activeUrl, setActiveUrl] = useState(currentUrl)
  const [toast, setToast] = useState('')

  const handleSave = (e) => {
    e.preventDefault()
    
    const targetIp = ip.trim() || 'localhost'
    const targetPort = port.trim() || '8080'
    const nextUrl = `${protocol}://${targetIp}:${targetPort}`

    localStorage.setItem(STORAGE_KEY, nextUrl)
    rebuildInstance()
    setActiveUrl(nextUrl)
    setToast(`✅ 저장 완료! 서버 주소: ${nextUrl}`)
    setTimeout(() => setToast(''), 4000)
  }

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY)
    rebuildInstance()
    const next = getCurrentBaseUrl()
    
    setIp(parseIp(next))
    setPort(parsePort(next))
    setProtocol(next.startsWith('https') ? 'https' : 'http')
    setActiveUrl(next)
    
    setToast(`↩️ 초기화 완료! 기본 설정 적용`)
    setTimeout(() => setToast(''), 4000)
  }

  return (
    <>
      <PageHeader
        title="설정"
        description="백엔드 서버 IP 주소를 변경합니다. 와이파이 환경에서 유동 IP를 사용할 때 편리합니다."
      />

      <section className="admin-mvp-card" style={{ padding: '28px 28px 32px' }}>
        <div className="admin-mvp-settings-section">
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
                  placeholder="예: 192.168.1.100"
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
              <button type="submit" className="admin-mvp-primary">
                저장 및 적용
              </button>
              <button
                type="button"
                className="admin-mvp-text"
                onClick={handleReset}
                style={{ padding: '9px 14px' }}
              >
                기본값으로 초기화
              </button>
            </div>
          </form>

          {toast && <div className="admin-mvp-toast">{toast}</div>}

          <div style={{ marginTop: 28, padding: '16px 18px', background: 'rgba(37,99,235,0.05)', borderRadius: 'var(--r-sm)', border: '1px solid rgba(37,99,235,0.15)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--blue)', marginBottom: 10 }}>
              도움말
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>
              로봇과 서버가 같은 와이파이에 연결되어 있어야 합니다.<br/>
              서버 컴퓨터의 IP 주소를 확인한 뒤 위 칸에 입력해주세요.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
