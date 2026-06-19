import api from '../api'
import type {
  PaginatedResponse,
  ProyectoResponse,
  VersionDocumentoResponse,
} from '../../types/api.types'

type ParamsPaginacion = { page?: number; size?: number; sort?: string }

export const documentosService = {
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

  listarVersiones: (idProyecto: string) =>
    api
      .get<VersionDocumentoResponse[]>(`/proyectos/${idProyecto}/versiones`)
      .then((r) => r.data),

  subirVersion: async (
    idProyecto: string,
    params: { etiquetaVersion: string; idTipo: number; idSubidoPor: string },
    archivo: File,
  ): Promise<VersionDocumentoResponse> => {
    const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';
    const raw = localStorage.getItem('proxora_usuario');
    const token: string | null = raw ? JSON.parse(raw)?.token : null;

    const qs = new URLSearchParams({
      etiquetaVersion: params.etiquetaVersion,
      idTipo: String(params.idTipo),
      idSubidoPor: params.idSubidoPor,
    }).toString();

    const form = new FormData();
    form.append('archivo', archivo);

    const res = await fetch(
      `${baseURL}/proyectos/${idProyecto}/versiones/upload?${qs}`,
      {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      },
    );

    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json() as Promise<VersionDocumentoResponse>;
  },
}
