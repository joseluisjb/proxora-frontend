import api from './api'
import type {
  PaginatedResponse,
  ProyectoResponse,
  VersionDocumentoResponse,
  ProyectoCreateRequest,
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

  listarPorIntegrante: (idIntegrante: string, params: { page?: number; size?: number; sort?: string }) =>
    api
      .get<PaginatedResponse<ProyectoResponse>>(`/proyectos/integrante/${idIntegrante}`, { params })
      .then((r) => r.data),

  obtenerPorId: (id: string) =>
    api.get<ProyectoResponse>(`/proyectos/${id}`).then((r) => r.data),

  obtenerVersiones: (id: string) =>
    api.get<VersionDocumentoResponse[]>(`/proyectos/${id}/versiones`).then((r) => r.data),

  eliminar: (id: string) =>
    api.delete(`/proyectos/${id}`).then(() => undefined),

  crear: (data: ProyectoCreateRequest) =>
    api.post<ProyectoResponse>('/proyectos', data).then((r) => r.data),

  subirVersion: (
    idProyecto: string,
    archivo: File,
    params: { etiquetaVersion: string; idTipo: number; idSubidoPor: string }
  ) => {
    const formData = new FormData()
    formData.append('archivo', archivo)
    return api
      .post<VersionDocumentoResponse>(`/proyectos/${idProyecto}/versiones/upload`, formData, {
        params: { idProyecto, ...params },
      })
      .then((r) => r.data)
  },
}
