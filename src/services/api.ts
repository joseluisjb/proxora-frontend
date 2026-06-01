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
  (error) => Promise.reject(error)
)

export default api
