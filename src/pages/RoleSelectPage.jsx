import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }
const stagger = { visible: { transition: { staggerChildren: 0.1 } } }

export default function RoleSelectPage() {
  return (
    <>
      <div className="mesh-bg" aria-hidden="true">
        <div className="mesh-blob blob-1" />
        <div className="mesh-blob blob-2" />
        <div className="mesh-blob blob-3" />
      </div>

      <div className="role-select-page">
        <motion.div
          className="role-select-inner"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeUp}>
            <img
              src="/media/logo.png"
              className="role-select-logo"
              alt="Kids-Friends Robot"
              onError={e => { e.target.style.display = 'none' }}
            />
          </motion.div>

          <motion.div variants={fadeUp}>
            <div className="role-select-badge">
              <span className="hero-badge-dot" />
              Kids-Friends Robot
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <h1 className="role-select-title">
              어떤 페이지로<br />이동하시겠어요?
            </h1>
            <p className="role-select-sub">역할에 맞는 페이지를 선택해주세요</p>
          </motion.div>

          <motion.div variants={fadeUp} className="role-select-cards role-select-cards-3">
            <Link to="/kiosk" className="role-card glass role-card-kiosk">
              <div className="role-card-icon">🖥️</div>
              <div className="role-card-label">키오스크</div>
              <div className="role-card-desc">
                입장 시 사용하는 키오스크입니다.<br />
                회원 / 비회원으로 입장하세요.
              </div>
              <span className="role-card-btn btn btn-ghost">키오스크로 이동 →</span>
            </Link>

            <Link to="/visitor" className="role-card glass">
              <div className="role-card-icon">👨‍👩‍👧‍👦</div>
              <div className="role-card-label">방문자</div>
              <div className="role-card-desc">
                키즈카페 방문객을 위한 페이지입니다.<br />
                서비스 안내 및 직원 호출을 이용하세요.
              </div>
              <span className="role-card-btn btn btn-ghost">방문자 페이지로 이동 →</span>
            </Link>

            <Link to="/admin/login" className="role-card glass role-card-admin">
              <div className="role-card-icon">👨‍💼</div>
              <div className="role-card-label">관리자</div>
              <div className="role-card-desc">
                운영 담당자를 위한 대시보드입니다.<br />
                호출 현황 및 통계를 실시간으로 확인하세요.
              </div>
              <span className="role-card-btn btn btn-primary">관리자 페이지로 이동 →</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}
