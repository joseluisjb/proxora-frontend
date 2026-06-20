import api from '../api'
import type { PaginatedResponse, ProyectoResponse, ProyectoDetalleResponse, ProyectoUpdateRequest } from '../../types/api.types'

type ParamsPaginacion = { page?: number; size?: number; sort?: string }

export const misProyectosService = {
  listarMisProyectos: (idUsuario: string, params: Omit<ParamsPaginacion, 'sort'>) =>
    api
      .get<PaginatedResponse<ProyectoResponse>>(`/proyectos/integrante/${idUsuario}`, {
        params: { ...params, sort: 'id,desc' },
      })
      .then((r) => r.data),

  obtenerDetalle: (id: string) =>
    api
      .get<ProyectoDetalleResponse>(`/proyectos/${id}/detalle`)
      .then((r) => r.data),

  actualizar: (id: string, data: ProyectoUpdateRequest) =>
    api
      .patch<ProyectoResponse>(`/proyectos/${id}`, data)
      .then((r) => r.data),

  eliminar: (id: string) =>
    api
      .delete(`/proyectos/${id}`)
      .then(() => undefined),
}
