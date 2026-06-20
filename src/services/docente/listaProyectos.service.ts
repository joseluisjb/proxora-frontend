import api from '../api'
import type {
  PaginatedResponse,
  ProyectoResponse,
  SemestreResponse,
  MateriaResponse,
  LineaInvestigacionResponse,
} from '../../types/api.types'

type ParamsPaginacion = { page?: number; size?: number; sort?: string }

export const listaProyectosDocenteService = {
  listarProyectos: (params: ParamsPaginacion) =>
    api
      .get<PaginatedResponse<ProyectoResponse>>('/proyectos', { params })
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
