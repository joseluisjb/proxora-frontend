import type { NivelVisibilidad } from '../types/api.types';

export interface VisibilidadBadge {
  label: string;
  clases: string;
}

export const ETIQUETA_VISIBILIDAD_CATALOGO: Record<string, string> = {
  solo_metadatos:   'Solo metadatos',
  lectura_descarga: 'Lectura y descarga',
};

export const VISIBILIDAD_ADMIN_LABEL: Record<NivelVisibilidad, string> = {
  solo_metadatos:   'Privado',
  lectura_descarga: 'Público',
};

export const VISIBILIDAD_PUBLICA_CONFIG: Record<NivelVisibilidad, VisibilidadBadge> = {
  solo_metadatos:   { label: 'No disponible para ver', clases: 'bg-[#FEE2E2] text-[#991B1B]' },
  lectura_descarga: { label: 'Lectura y descarga',     clases: 'bg-[#DCFCE7] text-[#166534]' },
};

export const VISIBILIDAD_INTERNA_CONFIG: Record<NivelVisibilidad, VisibilidadBadge> = {
  solo_metadatos:   { label: 'No visible públicamente', clases: 'bg-[#FEE2E2] text-[#991B1B]' },
  lectura_descarga: { label: 'Visible públicamente',    clases: 'bg-[#DCFCE7] text-[#166534]' },
};
