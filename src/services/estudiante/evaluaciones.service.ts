import api from '../api'
import type {
  PaginatedResponse,
  ProyectoResponse,
  EvaluacionResponse,
} from '../../types/api.types'

type ParamsPaginacion = { page?: number; size?: number; sort?: string }

export const evaluacionesService = {
  listarMisProyectos: (idUsuario: string, params: Omit<ParamsPaginacion, 'sort'>) =>
    api
      .get<PaginatedResponse<ProyectoResponse>>(`/proyectos/integrante/${idUsuario}`, {
        params: { ...params, sort: 'id,desc' },
      })
      .then((r) => r.data),

  obtenerProyecto: (idProyecto: string) =>
    api
      .get<ProyectoResponse>(`/proyectos/${idProyecto}`)
      .then((r) => r.data),

  listarEvaluaciones: (idProyecto: string) =>
    api
      .get<EvaluacionResponse[]>(`/proyectos/${idProyecto}/evaluaciones`)
      .then((r) => r.data),
}
