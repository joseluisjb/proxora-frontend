import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('proxora_usuario')
    if (raw) {
      const usuario = JSON.parse(raw)
      const token = usuario?.token
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
      } else {
        console.warn('[api] proxora_usuario existe en localStorage pero no tiene campo "token":', Object.keys(usuario ?? {}))
      }
    }
  } catch (e) {
    console.error('[api] Error leyendo token de localStorage:', e)
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('proxora_usuario')
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
