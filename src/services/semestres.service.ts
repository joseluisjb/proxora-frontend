import api from './api'
import type { PaginatedResponse, SemestreResponse, SemestreRequest } from '../types/api.types'

export const semestresService = {
  listar: (params: { page?: number; size?: number; sort?: string }) =>
    api.get<PaginatedResponse<SemestreResponse>>('/semestres', { params }).then((r) => r.data),

  obtenerPorId: (id: string) =>
    api.get<SemestreResponse>(`/semestres/${id}`).then((r) => r.data),

  crear: (data: SemestreRequest) =>
    api.post<SemestreResponse>('/semestres', data).then((r) => r.data),

  actualizar: (id: string, data: SemestreRequest) =>
    api.put<SemestreResponse>(`/semestres/${id}`, data).then((r) => r.data),

  eliminar: (id: string) =>
    api.delete(`/semestres/${id}`).then(() => undefined),

  listarActivos: (params: { size?: number }) =>
    api.get<PaginatedResponse<SemestreResponse>>('/semestres/activos', { params }).then((r) => r.data),
}
