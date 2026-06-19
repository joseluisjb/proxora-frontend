import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('proxora_usuario')
  if (raw) {
    const usuario = JSON.parse(raw)
    if (usuario?.token) {
      config.headers.Authorization = `Bearer ${usuario.token}`
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const esRutaAuth = error.config?.url?.includes('/auth/')
      if (esRutaAuth) {
        return Promise.reject(error)
      }
      console.error('[401] Sesión rechazada en:', error.config?.url, error.response?.data)
      localStorage.removeItem('proxora_usuario')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
