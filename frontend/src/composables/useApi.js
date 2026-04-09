import { token, clearAuth } from './useAuth.js'

/**
 * Wrapper de fetch autenticado para a API do backend.
 * Redireciona para /login automaticamente em caso de 401.
 */
export async function apiCall (path, opts = {}) {
  try {
    const res = await fetch(`/api${path}`, {
      ...opts,
      headers: {
        Authorization: `Bearer ${token.value}`,
        ...(opts.headers || {})
      }
    })
    if (res.status === 401) {
      clearAuth()
      window.location.href = '/login'
      return null
    }
    return res
  } catch (err) {
    console.error('API error:', err)
    return null
  }
}
