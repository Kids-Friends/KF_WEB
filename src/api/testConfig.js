export const TEST_CLIENT_ID_KEY = 'TEST_CLIENT_ID'

export function getTestClientId() {
  return localStorage.getItem(TEST_CLIENT_ID_KEY) || ''
}

export function setTestClientId(id) {
  if (id) {
    localStorage.setItem(TEST_CLIENT_ID_KEY, id)
  } else {
    localStorage.removeItem(TEST_CLIENT_ID_KEY)
  }
}
