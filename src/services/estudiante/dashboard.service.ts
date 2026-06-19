import api from '../api'
import type {
  PaginatedResponse,
  ProyectoResponse,
  SemestreResponse,
  MateriaResponse,
  LineaInvestigacionResponse,
} from '../../types/api.types'

type ParamsPaginacion = { page?: number; size?: number; sort?: string }

export const dashboardService = {
  listarProyectos: (params: ParamsPaginacion) =>
    api
      .get<PaginatedResponse<ProyectoResponse>>('/proyectos', { params })
      .then((r) => r.data),

  buscarProyectos: (titulo: string, params: ParamsPaginacion) =>
    api
      .get<PaginatedResponse<ProyectoResponse>>('/proyectos/buscar', {
        params: { titulo, ...params },
      })
      .then((r) => r.data),

  listarPorSemestre: (idSemestre: string, params: ParamsPaginacion) =>
    api
      .get<PaginatedResponse<ProyectoResponse>>(`/proyectos/semestre/${idSemestre}`, { params })
      .then((r) => r.data),

  listarPorMateria: (idMateria: string, params: ParamsPaginacion) =>
    api
      .get<PaginatedResponse<ProyectoResponse>>(`/proyectos/materia/${idMateria}`, { params })
      .then((r) => r.data),

  listarPorEstado: (idEstado: number, params: ParamsPaginacion) =>
    api
      .get<PaginatedResponse<ProyectoResponse>>(`/proyectos/estado/${idEstado}`, { params })
      .then((r) => r.data),

  listarSemestres: (params: { size?: number }) =>
    api
      .get<PaginatedResponse<SemestreResponse>>('/semestres', { params })
      .then((r) => r.data),

  listarMaterias: (params: { size?: number }) =>
    api
      .get<PaginatedResponse<MateriaResponse>>('/materias', { params })
      .then((r) => r.data),

  listarLineas: (params: { size?: number }) =>
    api
      .get<PaginatedResponse<LineaInvestigacionResponse>>('/lineas-investigacion', { params })
      .then((r) => r.data),
}
