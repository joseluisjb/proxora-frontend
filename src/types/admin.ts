export interface Semestre {
  id: string;
  nombre: string;
  activo: boolean;
  creadoEn: string;
}

export interface Materia {
  id: string;
  nombre: string;
  codigo?: string;
  creadoEn: string;
}

export interface LineaInvestigacion {
  id: string;
  nombre: string;
  descripcion?: string;
  creadoEn: string;
}

export type RolUsuario = 'administrador' | 'docente' | 'estudiante';
export type EstadoCuenta = 'activo' | 'suspendido';

export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  rol: RolUsuario;
  estado: EstadoCuenta;
  imagenUrl?: string;
}

export type NivelVisibilidad = 'solo_metadatos' | 'lectura' | 'lectura_descarga';
export type EstadoProyecto = 'en_desarrollo' | 'finalizado' | 'bajo_revision' | 'retrasado';

export interface ProyectoResumen {
  id: string;
  codigoDisplay: string;
  titulo: string;
  visibilidad: NivelVisibilidad;
  autorPrincipal: string;
  director: string;
  materia: string;
  estado: EstadoProyecto;
}
