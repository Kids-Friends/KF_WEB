import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function AdminLoginPage() {
  const [id, setId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    setTimeout(() => {
      const trimmedId = id.trim()

      if (!trimmedId) {
        setError('아이디를 입력하세요.')
        setLoading(false)
        return
      }

      sessionStorage.setItem('admin_auth', '1')
      sessionStorage.setItem('admin_id', trimmedId)
      navigate('/admin/dashboard', { replace: true })
    }, 300)
  }

  return (
    <>
      <div className="mesh-bg" aria-hidden="true">
        <div className="mesh-blob blob-1" />
        <div className="mesh-blob blob-2" />
        <div className="mesh-blob blob-3" />
      </div>

      <div className="admin-login-page">
        <motion.div
          className="admin-login-box glass"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <Link to="/" className="admin-login-back">처음으로</Link>

          <div className="admin-login-header">
            <div style={{ fontSize: 40, marginBottom: 10 }}>🤖</div>
            <h1 className="admin-login-title">관리자 로그인</h1>
            <p className="admin-login-sub">Kids-Friends Robot 운영 대시보드</p>
          </div>

          <form onSubmit={handleSubmit} className="admin-login-form" noValidate>
            <div className="admin-input-group">
              <label className="admin-input-label" htmlFor="admin-id">아이디</label>
              <input
                id="admin-id"
                className="admin-input"
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="아이디를 입력하세요"
                autoComplete="username"
                autoFocus
              />
            </div>

            {error && (
              <motion.div
                className="admin-login-error"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              className="btn btn-primary admin-login-btn"
              disabled={loading}
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        </motion.div>
      </div>
    </>
  )
}
