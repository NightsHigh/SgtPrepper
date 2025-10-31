// src/stores/auth.js
import { reactive } from 'vue'

const state = reactive({
  accessToken: localStorage.getItem('accessToken') || '',
  refreshToken: localStorage.getItem('refreshToken') || '',
  user: JSON.parse(localStorage.getItem('authUser') || 'null'),
})

export function useAuth() {
  function setAuth({ accessToken, refreshToken, user }) {
    state.accessToken = accessToken || ''
    state.refreshToken = refreshToken || ''
    state.user = user || null

    if (accessToken) localStorage.setItem('accessToken', accessToken)
    else localStorage.removeItem('accessToken')

    if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
    else localStorage.removeItem('refreshToken')

    if (user) localStorage.setItem('authUser', JSON.stringify(user))
    else localStorage.removeItem('authUser')
  }

  function logout() {
    setAuth({ accessToken: '', refreshToken: '', user: null })
  }

  function authHeader() {
    return state.accessToken ? { Authorization: `Bearer ${state.accessToken}` } : {}
  }

  return { state, setAuth, logout, authHeader }
}
