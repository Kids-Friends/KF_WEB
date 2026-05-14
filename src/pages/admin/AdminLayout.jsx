import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: '통합 대시보드' },
  { to: '/admin/members', label: '회원 관리' },
  { to: '/admin/robots', label: '로봇 관리' },
  { to: '/admin/calls', label: '호출 로그' },
  { to: '/admin/chats', label: '채팅 로그' },
  { to: '/admin/photos', label: '사진 관리' },
  { to: '/admin/settings', label: '설정' },
]

const FALLBACK_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function getActiveUrl() {
  return localStorage.getItem('API_BASE_URL') || FALLBACK_URL
}

export default function AdminLayout() {
  const location = useLocation()

  if (location.pathname === '/admin') {
    return <Navigate to="/admin/dashboard" replace />
  }

  return (
    <div className="admin-mvp-page">
      <aside className="admin-mvp-sidebar">
        <div>
          <div className="admin-mvp-brand">Kids-Friends Admin</div>
          <div className="admin-mvp-base">API: {getActiveUrl()}</div>
        </div>
        <nav className="admin-mvp-nav" aria-label="관리자 메뉴">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `admin-mvp-nav-link${isActive ? ' active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="admin-mvp-main">
        <Outlet />
      </main>
    </div>
  )
}
