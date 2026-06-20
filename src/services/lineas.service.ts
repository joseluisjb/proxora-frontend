import api from './api'
import type {
  PaginatedResponse,
  LineaInvestigacionResponse,
  LineaInvestigacionRequest,
} from '../types/api.types'

export const lineasService = {
  listar: (params: { page?: number; size?: number; sort?: string }) =>
    api
      .get<PaginatedResponse<LineaInvestigacionResponse>>('/lineas-investigacion', { params })
      .then((r) => r.data),

  obtenerPorId: (id: string) =>
    api.get<LineaInvestigacionResponse>(`/lineas-investigacion/${id}`).then((r) => r.data),

  crear: (data: LineaInvestigacionRequest) =>
    api.post<LineaInvestigacionResponse>('/lineas-investigacion', data).then((r) => r.data),

  actualizar: (id: string, data: LineaInvestigacionRequest) =>
    api.put<LineaInvestigacionResponse>(`/lineas-investigacion/${id}`, data).then((r) => r.data),

  eliminar: (id: string) =>
    api.delete(`/lineas-investigacion/${id}`).then(() => undefined),
}
