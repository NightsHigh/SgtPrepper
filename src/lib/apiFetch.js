// src/lib/apiFetch.js
const API_BASE = 'http://localhost:4000/api'

export async function apiFetch(input, init = {}) {
  const url = input.startsWith('http') ? input : `${API_BASE}${input.startsWith('/') ? '' : '/'}${input}`

  const withAuth = async () => {
    const token = localStorage.getItem('accessToken')
    const headers = { ...(init.headers || {}) }
    if (token) headers.Authorization = `Bearer ${token}`
    return fetch(url, { ...init, headers })
  }

  // First attempt with current token (if any)
  let res = await withAuth()
  if (res.status !== 401) return res

  // Try 1x refresh
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) return res

  const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!refreshRes.ok) return res

  const { accessToken } = await refreshRes.json().catch(() => ({}))
  if (!accessToken) return res

  localStorage.setItem('accessToken', accessToken)

  // Retry original request with new token
  res = await withAuth()
  return res
}
