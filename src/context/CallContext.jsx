import { createContext, useContext, useState, useCallback } from 'react'

const CallContext = createContext(null)

export function CallProvider({ children }) {
  const [calls, setCalls] = useState([])

  const addCall = useCallback((call) => {
    const receivedAt = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    setCalls(prev => [{ ...call, receivedAt }, ...prev])
  }, [])

  const clearCalls = useCallback(() => setCalls([]), [])

  return (
    <CallContext.Provider value={{ calls, addCall, clearCalls }}>
      {children}
    </CallContext.Provider>
  )
}

export function useCallContext() {
  const ctx = useContext(CallContext)
  if (!ctx) throw new Error('useCallContext must be used within CallProvider')
  return ctx
}
