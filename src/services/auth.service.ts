import api from './api'
import type { LoginRequest, LoginResponse, RegistroRequest } from '../types/api.types'

export const authService = {
  login: (data: LoginRequest) =>
    api.post<LoginResponse>('/auth/login', data).then((r) => r.data),

  registro: (data: RegistroRequest) =>
    api.post<void>('/auth/registro', data).then((r) => r.data),
}
