import api from './api'
import type { PaginatedResponse, MateriaResponse, MateriaRequest } from '../types/api.types'

export const materiasService = {
  listar: (params: { page?: number; size?: number; sort?: string }) =>
    api.get<PaginatedResponse<MateriaResponse>>('/materias', { params }).then((r) => r.data),

  obtenerPorId: (id: string) =>
    api.get<MateriaResponse>(`/materias/${id}`).then((r) => r.data),

  crear: (data: MateriaRequest) =>
    api.post<MateriaResponse>('/materias', data).then((r) => r.data),

  actualizar: (id: string, data: MateriaRequest) =>
    api.put<MateriaResponse>(`/materias/${id}`, data).then((r) => r.data),

  eliminar: (id: string) =>
    api.delete(`/materias/${id}`).then(() => undefined),

  listarActivas: (params: { size?: number }) =>
    api.get<PaginatedResponse<MateriaResponse>>('/materias/activas', { params }).then((r) => r.data),
}
