const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

function resolveUrl(path) {
  if (!path) return API_BASE
  if (path.startsWith('http')) return path
  const trimmed = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE}${trimmed}`
}

export async function apiFetch(path, options = {}) {
  const url = resolveUrl(path)
  const baseHeaders = options.headers || {}
  const accessToken = typeof window !== 'undefined' ? window.localStorage.getItem('accessToken') : null

  async function doRequest(token) {
    const headers = { ...baseHeaders }
    if (!(options.body instanceof FormData)) {
      if (!headers.Accept) {
        headers.Accept = 'application/json'
      }
      if (options.body && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json'
      }
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    const init = { ...options, headers }
    return fetch(url, init)
  }

  let response = await doRequest(accessToken)
  if (response.status !== 401) return response

  if (typeof window === 'undefined') return response
  const refreshToken = window.localStorage.getItem('refreshToken')
  if (!refreshToken) return response

  const refreshResponse = await fetch(resolveUrl('/auth/refresh'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ refreshToken })
  })

  if (!refreshResponse.ok) return response

  let refreshData = null
  try {
    refreshData = await refreshResponse.json()
  } catch {
    refreshData = null
  }
  const newAccessToken = refreshData && refreshData.accessToken ? refreshData.accessToken : null
  if (!newAccessToken) return response

  window.localStorage.setItem('accessToken', newAccessToken)

  response = await doRequest(newAccessToken)
  return response
}
