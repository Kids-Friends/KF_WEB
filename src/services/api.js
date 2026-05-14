import axiosInstance from '../api/axiosInstance.js'

// Use the shared axiosInstance (localStorage → env → fallback base URL)
export const apiClient = axiosInstance

// NOTE: axiosInstance interceptor already unwraps response.data.data,
// so the .then(unwrap) calls below receive the unwrapped value directly.
// We keep the unwrap no-op so no existing call-sites need to change.
const unwrap = (v) => v ?? null

const toQueryString = (params = {}) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      query.set(key, value)
    }
  })
  const str = query.toString()
  return str ? `?${str}` : ''
}

export const clientApi = {
  create: (payload) => apiClient.post('/api/clients', payload).then(unwrap),
  list: () => apiClient.get('/api/clients').then(unwrap),
  detail: (id) => apiClient.get(`/api/clients/${id}`).then(unwrap),
  addPoint: (id, amount = 1) =>
    apiClient.patch(`/api/clients/${id}/point`, { amount }).then(unwrap),
  remove: (id) => apiClient.delete(`/api/clients/${id}`).then(unwrap),
}

export const robotApi = {
  create: (payload) => apiClient.post('/api/robots', payload).then(unwrap),
  list: () => apiClient.get('/api/robots').then(unwrap),
  detail: (id) => apiClient.get(`/api/robots/${id}`).then(unwrap),
  updateStatus: (id, status) =>
    apiClient.patch(`/api/robots/${id}/status`, { status }).then(unwrap),
  remove: (id) => apiClient.delete(`/api/robots/${id}`).then(unwrap),
}

export const callsApi = {
  create: (payload) => apiClient.post('/api/calls', payload).then(unwrap),
  list: (params = {}) => apiClient.get(`/api/calls${toQueryString(params)}`).then(unwrap),
  updateStatus: (id, status) =>
    apiClient.patch(`/api/calls/${id}/status`, { status }).then(unwrap),
}

export const chatApi = {
  create: (payload) => apiClient.post('/api/chat', payload).then(unwrap),
  listByClient: (clientId) => apiClient.get(`/api/chat${toQueryString({ clientId })}`).then(unwrap),
  detail: (id) => apiClient.get(`/api/chat/${id}`).then(unwrap),
  sendAiMessage: (message) => apiClient.post('/api/chat/ai', { message }).then(unwrap),
}

export const photoApi = {
  create: (payload) => apiClient.post('/api/photos', payload).then(unwrap),
  listByClient: (clientId) => apiClient.get(`/api/photos${toQueryString({ clientId })}`).then(unwrap),
  remove: (id) => apiClient.delete(`/api/photos/${id}`).then(unwrap),
}

export const createCall = (payload) => callsApi.create(payload)

export const getAdminStatistics = () =>
  apiClient.get('/api/admin/statistics').then(unwrap)

export const getCallStatistics = (startDate, endDate) =>
  apiClient.get(`/api/admin/statistics/calls${toQueryString({ startDate, endDate })}`).then(unwrap)

export const getQuestionStatistics = () =>
  apiClient.get('/api/admin/statistics/questions').then(unwrap)

export const getQuizStatistics = () =>
  apiClient.get('/api/admin/statistics/quizzes').then(unwrap)

export const getZoneStatistics = () =>
  apiClient.get('/api/admin/statistics/zones').then(unwrap)
