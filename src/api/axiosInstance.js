import axios from 'axios'

/* ── Base URL priority:
   1. localStorage  "API_BASE_URL"
   2. import.meta.env.VITE_API_BASE_URL
   3. Fallback "http://localhost:8080"
   ─────────────────────────────────── */
function resolveBaseUrl() {
  return (
    localStorage.getItem('API_BASE_URL') ||
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:8080'
  )
}

let axiosInstance = createInstance()

function createInstance() {
  const instance = axios.create({
    baseURL: resolveBaseUrl(),
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
  })

  // Response interceptor — unwrap { message, data } envelope
  instance.interceptors.response.use(
    (response) => response.data?.data ?? null,
    (error) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        '알 수 없는 오류가 발생했습니다.'
      console.error('[axiosInstance]', error)
      return Promise.reject(new Error(msg))
    }
  )

  return instance
}

/** Call this after saving a new IP in SettingsPage to pick up the new base URL. */
export function rebuildInstance() {
  axiosInstance = createInstance()
}

export default axiosInstance
