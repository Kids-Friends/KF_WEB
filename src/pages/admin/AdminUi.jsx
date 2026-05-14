export function PageHeader({ title, description, action }) {
  return (
    <header className="admin-mvp-header">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </header>
  )
}

export function ErrorMessage({ message }) {
  if (!message) return null
  return <div className="admin-mvp-error">{message}</div>
}

export function LoadingRow({ colSpan }) {
  return (
    <tr>
      <td colSpan={colSpan} className="admin-mvp-empty">불러오는 중...</td>
    </tr>
  )
}

export function EmptyRow({ colSpan, message = '데이터가 없습니다.' }) {
  return (
    <tr>
      <td colSpan={colSpan} className="admin-mvp-empty">{message}</td>
    </tr>
  )
}

const STATUS_LABELS = {
  // Robot
  ACTIVE: '활성',
  INACTIVE: '비활성',
  ERROR: '오류',
  // Call
  WAITING: '대기',
  DONE: '완료',
  CANCELED: '취소',
  // Chat
  CHAT: '일반 대화',
  IMAGE: '사진 전송',
  RULE: '규칙 문의',
  LOCATION: '위치 안내',
  CALL: '직원 호출',
}

export function StatusBadge({ status }) {
  const label = STATUS_LABELS[status] || status || '-'
  return <span className={`admin-mvp-badge ${String(status).toLowerCase()}`}>{label}</span>
}

export function Modal({ title, children, onClose }) {
  return (
    <div className="admin-mvp-modal-backdrop" role="dialog" aria-modal="true">
      <div className="admin-mvp-modal">
        <div className="admin-mvp-modal-head">
          <h2>{title}</h2>
          <button type="button" className="admin-mvp-icon-btn" onClick={onClose}>닫기</button>
        </div>
        {children}
      </div>
    </div>
  )
}
