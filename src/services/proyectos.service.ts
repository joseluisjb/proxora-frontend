import api from './api'
import type {
  PaginatedResponse,
  ProyectoResponse,
  VersionDocumentoResponse,
  EstadoProyectoResponse,
  NivelVisibilidadResponse,
} from '../types/api.types'

export const proyectosService = {
  listar: (params: { page?: number; size?: number; sort?: string }) =>
    api.get<PaginatedResponse<ProyectoResponse>>('/proyectos', { params }).then((r) => r.data),

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

  listarEstados: () =>
    api.get<EstadoProyectoResponse[]>('/catalogos/estados-proyecto').then((r) => r.data),

  listarNivelesVisibilidad: () =>
    api.get<NivelVisibilidadResponse[]>('/catalogos/niveles-visibilidad').then((r) => r.data),
}
