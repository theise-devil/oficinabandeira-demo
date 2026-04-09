import { ref } from 'vue'

// Estado global de autenticação (singleton entre componentes)
export const token   = ref(localStorage.getItem('ob_token'))
export const usuario = ref(JSON.parse(localStorage.getItem('ob_usuario') || 'null'))

export function setAuth (data) {
  token.value   = data.token
  usuario.value = data.usuario
  localStorage.setItem('ob_token',   data.token)
  localStorage.setItem('ob_usuario', JSON.stringify(data.usuario))
}

export function clearAuth () {
  token.value   = null
  usuario.value = null
  localStorage.removeItem('ob_token')
  localStorage.removeItem('ob_usuario')
}
