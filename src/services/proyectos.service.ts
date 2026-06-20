import api from './api'
import type {
  PaginatedResponse,
  ProyectoResponse,
  VersionDocumentoResponse,
  EvaluacionResponse,
  ProyectoCreateRequest,
  VersionDocumentoCreateRequest,
  EvaluadorAsignacionRequest,
  EstadoProyectoResponse,
  NivelVisibilidadResponse,
} from '../types/api.types'

export const proyectosService = {
  listar: (params: { page?: number; size?: number; sort?: string }) =>
    api.get<PaginatedResponse<ProyectoResponse>>('/proyectos', { params }).then((r) => r.data),

  buscar: (titulo: string, params: { page?: number; size?: number }) =>
    api
      .get<PaginatedResponse<ProyectoResponse>>('/proyectos/buscar', {
        params: { titulo, ...params },
      })
      .then((r) => r.data),

  listarPorSemestre: (idSemestre: string, params: { page?: number; size?: number }) =>
    api
      .get<PaginatedResponse<ProyectoResponse>>(`/proyectos/semestre/${idSemestre}`, { params })
      .then((r) => r.data),

  listarPorMateria: (idMateria: string, params: { page?: number; size?: number }) =>
    api
      .get<PaginatedResponse<ProyectoResponse>>(`/proyectos/materia/${idMateria}`, { params })
      .then((r) => r.data),

  listarPorEstado: (idEstado: number, params: { page?: number; size?: number }) =>
    api
      .get<PaginatedResponse<ProyectoResponse>>(`/proyectos/estado/${idEstado}`, { params })
      .then((r) => r.data),

  obtenerPorId: (id: string) =>
    api.get<ProyectoResponse>(`/proyectos/${id}`).then((r) => r.data),

  obtenerVersiones: (id: string) =>
    api.get<VersionDocumentoResponse[]>(`/proyectos/${id}/versiones`).then((r) => r.data),

  descargarVersion: async (idProyecto: string, idVersion: string) => {
    const response = await api.get(`/proyectos/${idProyecto}/versiones/${idVersion}/download`, {
      responseType: 'blob',
    });
    const mimeType = String(response.headers['content-type'] ?? 'application/octet-stream');
    const blob = new Blob([response.data], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => window.URL.revokeObjectURL(url), 10000);
  },

  eliminar: (id: string) =>
    api.delete(`/proyectos/${id}`).then(() => undefined),

  crear: (data: ProyectoCreateRequest) =>
    api.post<ProyectoResponse>('/proyectos', data).then((r) => r.data),

  crearVersion: (idProyecto: string, data: VersionDocumentoCreateRequest) =>
    api.post<VersionDocumentoResponse>(`/proyectos/${idProyecto}/versiones`, data).then((r) => r.data),

  asignarEvaluador: (idProyecto: string, data: EvaluadorAsignacionRequest) =>
    api.post(`/proyectos/${idProyecto}/evaluaciones/evaluadores`, data).then((r) => r.data),

  listarPorIntegrante: (idUsuario: string, params: { page?: number; size?: number; sort?: string }) =>
    api.get<PaginatedResponse<ProyectoResponse>>(`/proyectos/integrante/${idUsuario}`, { params }).then((r) => r.data),

  obtenerEvaluaciones: (idProyecto: string) =>
    api.get<EvaluacionResponse[]>(`/proyectos/${idProyecto}/evaluaciones`).then((r) => r.data),

  listarEstados: () =>
    api.get<EstadoProyectoResponse[]>('/catalogos/estados-proyecto').then((r) => r.data),

  listarNivelesVisibilidad: () =>
    api.get<NivelVisibilidadResponse[]>('/catalogos/niveles-visibilidad').then((r) => r.data),
}
