const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

export async function apiFetch(input, init = {}) {
  const url = input.startsWith('http') ? input : `${API_BASE}${input.startsWith('/') ? '' : '/'}${input}`

  const withAuth = async () => {
    const token = localStorage.getItem('accessToken')
    const headers = { ...(init.headers || {}) }
    if (token) headers.Authorization = `Bearer ${token}`
    return fetch(url, { ...init, headers })
  }

  let res = await withAuth()
  if (res.status !== 401) return res

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

  res = await withAuth()
  return res
}
