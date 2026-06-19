import api from '../api'
import type {
  PaginatedResponse,
  ProyectoResponse,
  VersionDocumentoResponse,
  SemestreResponse,
  MateriaResponse,
  LineaInvestigacionResponse,
  UsuarioResponse,
  ProyectoCreateRequest,
  VersionDocumentoCreateRequest,
  EvaluadorAsignacionRequest,
} from '../../types/api.types'

export const registrarService = {
  crearProyecto: (data: ProyectoCreateRequest) =>
    api
      .post<ProyectoResponse>('/proyectos', data)
      .then((r) => r.data),

  crearVersion: (idProyecto: string, data: VersionDocumentoCreateRequest) =>
    api
      .post<VersionDocumentoResponse>(`/proyectos/${idProyecto}/versiones`, data)
      .then((r) => r.data),

  asignarEvaluador: (idProyecto: string, data: EvaluadorAsignacionRequest) =>
    api
      .post(`/proyectos/${idProyecto}/evaluaciones/evaluadores`, data)
      .then((r) => r.data),

  listarSemestresActivos: (params: { size?: number }) =>
    api
      .get<PaginatedResponse<SemestreResponse>>('/semestres/activos', { params })
      .then((r) => r.data),

  listarSemestres: (params: { size?: number }) =>
    api
      .get<PaginatedResponse<SemestreResponse>>('/semestres', { params })
      .then((r) => r.data),

  listarMateriasActivas: (params: { size?: number }) =>
    api
      .get<PaginatedResponse<MateriaResponse>>('/materias/activas', { params })
      .then((r) => r.data),

  listarMaterias: (params: { size?: number }) =>
    api
      .get<PaginatedResponse<MateriaResponse>>('/materias', { params })
      .then((r) => r.data),

  listarLineasActivas: (params: { size?: number }) =>
    api
      .get<PaginatedResponse<LineaInvestigacionResponse>>('/lineas-investigacion/activas', { params })
      .then((r) => r.data),

  listarLineas: (params: { size?: number }) =>
    api
      .get<PaginatedResponse<LineaInvestigacionResponse>>('/lineas-investigacion', { params })
      .then((r) => r.data),

  listarDocentes: (params: { page?: number; size?: number }) =>
    api
      .get<PaginatedResponse<UsuarioResponse>>('/usuarios/rol/docente', { params })
      .then((r) => r.data),

  listarEstudiantes: (params: { page?: number; size?: number }) =>
    api
      .get<PaginatedResponse<UsuarioResponse>>('/usuarios/rol/estudiante', { params })
      .then((r) => r.data),
}
