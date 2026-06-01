export type NivelVisibilidad = 'solo_metadatos' | 'lectura' | 'lectura_descarga'

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface UsuarioResponse {
  id: string
  nombre: string
  apellido: string
  correo: string
  activo: boolean
  nombreRol: 'administrador' | 'docente' | 'estudiante' | 'invitado'
}

export interface SemestreResponse {
  id: string
  nombre: string
  activo: boolean
  creadoEn: string
}

export interface MateriaResponse {
  id: string
  nombre: string
  codigo: string | null
  activa: boolean
  creadoPorId: string | null
  creadoEn: string
}

export interface LineaInvestigacionResponse {
  id: string
  nombre: string
  descripcion: string | null
  activa: boolean
  creadoPor: string | null
  creadoEn: string
}

export interface UsuarioResumen {
  id: string
  nombre: string
  apellido: string
  correo: string
}

export interface LineaResumen {
  id: string
  nombre: string
  descripcion: string | null
  activa: boolean
  creadoPor: string | null
  creadoEn: string
}

export interface ProyectoResponse {
  id: string
  titulo: string
  resumen: string
  semestre: string | null
  materia: string | null
  estado: 'en_desarrollo' | 'finalizado' | 'bajo_revision' | 'retrasado'
  visibilidad: 'solo_metadatos' | 'lectura' | 'lectura_descarga'
  registradoPor: UsuarioResumen
  integrantes: UsuarioResumen[]
  directores: UsuarioResumen[]
  evaluadores: UsuarioResumen[]
  lineas: LineaResumen[]
  creadoEn: string
  actualizadoEn: string
}

export interface LoginRequest {
  correo: string
  password: string
}

export interface RegistroRequest {
  nombre: string
  apellido: string
  correo: string
  password: string
}

export interface LoginResponse {
  id: string
  token: string
  rol: 'administrador' | 'docente' | 'estudiante' | 'invitado'
  nombreCompleto: string
}

export interface ProyectoCreateRequest {
  titulo: string
  resumen: string
  idSemestre: string | null
  idMateria: string | null
  idEstado: number
  idVisibilidad: number
  idRegistradoPor: string
  integrantesIds: string[]
  directoresIds: string[]
  lineasIds: string[]
  evaluadoresIds: string[]
}

export interface VersionDocumentoCreateRequest {
  idTipo: number | string
  etiquetaVersion: string
  rutaS3: string
  nombreArchivo: string
  tamanoBytes: number
  mimeType: string
  idSubidoPor: string
}


export interface UsuarioCreateRequest {
  nombre: string
  apellido: string
  correo: string
  contrasena: string
}

export interface SemestreRequest {
  nombre: string
  activo?: boolean
}

export interface MateriaRequest {
  nombre: string
  codigo?: string
  activa?: boolean
  creadoPor?: string
}

export interface LineaInvestigacionRequest {
  nombre: string
  descripcion?: string
  activa?: boolean
  creadoPor?: string
}

export interface VersionDocumentoResponse {
  id: string
  idProyecto: string
  tipoDocumento: string | null
  etiquetaVersion: string
  rutaS3: string
  nombreArchivo: string
  tamanoBytes: number | null
  mimeType: string | null
  subidoPor: UsuarioResumen
  creadoEn: string
}
