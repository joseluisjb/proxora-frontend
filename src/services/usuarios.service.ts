import api from './api'
import type { PaginatedResponse, UsuarioCreateRequest, UsuarioResponse } from '../types/api.types'

export const usuariosService = {
  listar: (params: { page?: number; size?: number; sort?: string }) =>
    api.get<PaginatedResponse<UsuarioResponse>>('/usuarios', { params }).then((r) => r.data),

  listarPorRol: (nombreRol: string, params: { page?: number; size?: number }) =>
    api
      .get<PaginatedResponse<UsuarioResponse>>(`/usuarios/rol/${nombreRol}`, { params })
      .then((r) => r.data),

  buscar: (nombre: string, params: { page?: number; size?: number }) =>
    api
      .get<PaginatedResponse<UsuarioResponse>>('/usuarios/buscar', { params: { nombre, ...params } })
      .then((r) => r.data),

  convertirDocente: (id: string) =>
    api.patch(`/usuarios/${id}/convertir-docente`).then(() => undefined),

  convertirEstudiante: (id: string) =>
    api.patch(`/usuarios/${id}/convertir-estudiante`).then(() => undefined),

  desactivar: (id: string) =>
    api.patch(`/usuarios/${id}/desactivar`).then(() => undefined),

  activar: (id: string) =>
    api.patch(`/usuarios/${id}/activar`).then(() => undefined),

  crear: (data: UsuarioCreateRequest) =>
    api.post<UsuarioResponse>('/usuarios', data).then((r) => r.data),
}
