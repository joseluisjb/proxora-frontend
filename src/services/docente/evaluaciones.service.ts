import api from '../api'
import type {
  PaginatedResponse,
  ProyectoResponse,
  ProyectoDetalleResponse,
  EvaluacionResponse,
} from '../../types/api.types'

type ParamsPaginacion = { page?: number; size?: number; sort?: string }

export interface CrearEvaluacionRequest {
  idDocente: string
  calificacion: number
  comentario: string
}

export const evaluacionesDocenteService = {
  // Solo proyectos pendientes de calificación — usado en el dashboard
  listarProyectosPendientes: (idDocente: string, params: Omit<ParamsPaginacion, 'sort'>) =>
    api
      .get<PaginatedResponse<ProyectoResponse>>(`/proyectos/evaluador/${idDocente}/pendientes`, {
        params: { ...params, sort: 'id,desc' },
      })
      .then((r) => r.data),

  // Todos los proyectos asignados como evaluador (ya evaluados + pendientes) — usado en ProyectosEvaluar
  listarProyectosAEvaluar: (idDocente: string, params: Omit<ParamsPaginacion, 'sort'>) =>
    api
      .get<PaginatedResponse<ProyectoResponse>>(`/proyectos/evaluador/${idDocente}`, {
        params: { ...params, sort: 'id,desc' },
      })
      .then((r) => r.data),

  obtenerDetalle: (idProyecto: string) =>
    api
      .get<ProyectoDetalleResponse>(`/proyectos/${idProyecto}/detalle`)
      .then((r) => r.data),

  listarEvaluaciones: (idProyecto: string) =>
    api
      .get<EvaluacionResponse[]>(`/proyectos/${idProyecto}/evaluaciones`)
      .then((r) => r.data),

  crearEvaluacion: (idProyecto: string, data: CrearEvaluacionRequest) =>
    api
      .post<EvaluacionResponse>(`/proyectos/${idProyecto}/evaluaciones`, data)
      .then((r) => r.data),
}
