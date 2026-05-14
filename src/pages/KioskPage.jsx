import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const fadeUp  = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }
const stagger = { visible: { transition: { staggerChildren: 0.08 } } }

/* ── Member entry form ── */
function MemberForm({ onSuccess, onBack }) {
  const [phone, setPhone]     = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const formatPhone = (v) => {
    const digits = v.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 3)  return digits
    if (digits.length <= 7)  return `${digits.slice(0,3)}-${digits.slice(3)}`
    return `${digits.slice(0,3)}-${digits.slice(3,7)}-${digits.slice(7)}`
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10) {
      setError('올바른 전화번호를 입력해주세요.')
      return
    }
    setError('')
    setLoading(true)
    setTimeout(() => onSuccess('member'), 700)
  }

  return (
    <motion.div
      className="kiosk-form-wrap glass"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35 }}
    >
      <button onClick={onBack} className="kiosk-back-btn">← 뒤로</button>
      <div className="kiosk-form-icon">📱</div>
      <h2 className="kiosk-form-title">회원 입장</h2>
      <p className="kiosk-form-sub">등록된 전화번호로 입장합니다</p>
      <form onSubmit={handleSubmit} className="kiosk-form" noValidate>
        <input
          className="admin-input kiosk-input"
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={e => setPhone(formatPhone(e.target.value))}
          placeholder="010-0000-0000"
          autoFocus
        />
        {error && (
          <motion.div
            className="admin-login-error"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}
        <button
          type="submit"
          className="btn btn-primary kiosk-submit-btn"
          disabled={loading}
        >
          {loading ? '확인 중...' : '입장하기'}
        </button>
      </form>
    </motion.div>
  )
}

/* ── Non-member entry form ── */
function NonMemberForm({ onSuccess, onBack }) {
  const [name, setName]       = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => onSuccess('nonmember'), 700)
  }

  return (
    <motion.div
      className="kiosk-form-wrap glass"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35 }}
    >
      <button onClick={onBack} className="kiosk-back-btn">← 뒤로</button>
      <div className="kiosk-form-icon">🎫</div>
      <h2 className="kiosk-form-title">비회원 입장</h2>
      <p className="kiosk-form-sub">회원 가입 없이 바로 입장합니다</p>
      <form onSubmit={handleSubmit} className="kiosk-form" noValidate>
        <input
          className="admin-input kiosk-input"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="이름 (선택 사항)"
          maxLength={20}
          autoFocus
        />
        <button
          type="submit"
          className="btn btn-primary kiosk-submit-btn"
          disabled={loading}
        >
          {loading ? '처리 중...' : '입장하기'}
        </button>
      </form>
    </motion.div>
  )
}

/* ── Success screen ── */
function SuccessScreen({ type, onReset }) {
  const [count, setCount] = useState(4)

  useEffect(() => {
    const t = setInterval(() => {
      setCount(c => {
        if (c <= 1) { clearInterval(t); onReset(); return 0 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [onReset])

  return (
    <motion.div
      className="kiosk-success glass"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
    >
      <div className="kiosk-success-emoji">🎉</div>
      <h2 className="kiosk-success-title">입장을 환영합니다!</h2>
      <p className="kiosk-success-sub">
        {type === 'member' ? '회원으로 입장하셨습니다.' : '비회원으로 입장하셨습니다.'}
        <br />즐거운 시간 되세요 😊
      </p>
      <div className="kiosk-success-timer">{count}초 후 처음으로 돌아갑니다</div>
    </motion.div>
  )
}

/* ── Main page ── */
export default function KioskPage() {
  const [screen, setScreen] = useState('home')   // home | member | nonmember | success
  const [entryType, setEntryType] = useState(null)

  const handleSuccess = (type) => {
    setEntryType(type)
    setScreen('success')
  }

  const handleReset = () => {
    setScreen('home')
    setEntryType(null)
  }

  return (
    <>
      <div className="mesh-bg" aria-hidden="true">
        <div className="mesh-blob blob-1" />
        <div className="mesh-blob blob-2" />
        <div className="mesh-blob blob-3" />
      </div>

      <div className="kiosk-page">
        <AnimatePresence mode="wait">

          {screen === 'home' && (
            <motion.div
              key="home"
              className="kiosk-inner"
              variants={stagger}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -16 }}
            >
              <motion.div variants={fadeUp} className="kiosk-header">
                <img
                  src="/media/logo.png"
                  className="kiosk-logo"
                  alt="Kids-Friends"
                  onError={e => { e.target.style.display = 'none' }}
                />
                <h1 className="kiosk-title">키즈카페에 오신 것을<br />환영합니다!</h1>
                <p className="kiosk-sub">입장 방식을 선택해주세요</p>
              </motion.div>

              <motion.div variants={fadeUp} className="kiosk-cards">
                <button
                  className="kiosk-card glass kiosk-card-member"
                  onClick={() => setScreen('member')}
                >
                  <div className="kiosk-card-emoji">🏷️</div>
                  <div className="kiosk-card-label">회원 입장</div>
                  <div className="kiosk-card-desc">
                    등록된 전화번호로<br />빠르게 입장합니다
                  </div>
                </button>

                <button
                  className="kiosk-card glass kiosk-card-nonmember"
                  onClick={() => setScreen('nonmember')}
                >
                  <div className="kiosk-card-emoji">🎫</div>
                  <div className="kiosk-card-label">비회원 입장</div>
                  <div className="kiosk-card-desc">
                    가입 없이<br />바로 입장합니다
                  </div>
                </button>
              </motion.div>

              <motion.div variants={fadeUp}>
                <Link to="/" className="kiosk-home-link">← 처음으로</Link>
              </motion.div>
            </motion.div>
          )}

          {screen === 'member' && (
            <MemberForm
              key="member"
              onSuccess={handleSuccess}
              onBack={() => setScreen('home')}
            />
          )}

          {screen === 'nonmember' && (
            <NonMemberForm
              key="nonmember"
              onSuccess={handleSuccess}
              onBack={() => setScreen('home')}
            />
          )}

          {screen === 'success' && (
            <SuccessScreen
              key="success"
              type={entryType}
              onReset={handleReset}
            />
          )}

        </AnimatePresence>
      </div>
    </>
  )
}
