import { useNavigate } from 'react-router-dom';
import type { ProyectoResponse } from '../../types/api.types';

export interface TarjetaProyectoProps {
  proyecto: ProyectoResponse
  mostrarVisibilidad?: boolean
  mostrarDirector?: boolean
  mostrarIntegrantes?: boolean
  onVerProyecto?: (id: string) => void
  modo?: 'grilla' | 'lista'
}

type EstadoProyecto = ProyectoResponse['estado'];
type NivelVisibilidad = ProyectoResponse['visibilidad'];

const ESTADO_CONFIG: Record<EstadoProyecto, { label: string; clases: string }> = {
  en_desarrollo: { label: 'En desarrollo', clases: 'bg-[#FEF9C3] text-[#854D0E]' },
  finalizado:    { label: 'Finalizado',    clases: 'bg-[#DCFCE7] text-[#166534]' },
  bajo_revision: { label: 'Bajo revisión', clases: 'bg-[#DBEAFE] text-[#1E40AF]' },
  retrasado:     { label: 'Retrasado',     clases: 'bg-[#FEE2E2] text-[#991B1B]' },
};

const VISIBILIDAD_CONFIG: Record<NivelVisibilidad, { label: string; clases: string }> = {
  solo_metadatos:   { label: 'No disponible para ver',  clases: 'bg-[#FEE2E2] text-[#991B1B]' },
  lectura:          { label: 'Solo lectura',            clases: 'bg-[#DBEAFE] text-[#1E40AF]' },
  lectura_descarga: { label: 'Lectura y descarga',      clases: 'bg-[#DCFCE7] text-[#166534]' },
};

function formatearFechaCorta(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', { month: 'short', year: 'numeric' }).format(new Date(iso));
}

function formatearIntegrantes(integrantes: ProyectoResponse['integrantes']): string {
  if (integrantes.length === 0) return '—';
  if (integrantes.length === 1) return `${integrantes[0].nombre} ${integrantes[0].apellido}`;
  if (integrantes.length === 2)
    return `${integrantes[0].nombre} ${integrantes[0].apellido}, ${integrantes[1].nombre} ${integrantes[1].apellido}`;
  return `${integrantes[0].nombre} ${integrantes[0].apellido} y ${integrantes.length - 1} más`;
}

function formatearDirectores(directores: ProyectoResponse['directores']): string {
  if (directores.length === 0) return '—';
  const primero = `${directores[0].nombre} ${directores[0].apellido}`;
  return directores.length > 1 ? `${primero} y ${directores.length - 1} más` : primero;
}

export function TarjetaProyecto({
  proyecto,
  mostrarVisibilidad = true,
  mostrarDirector = true,
  mostrarIntegrantes = true,
  onVerProyecto,
  modo = 'grilla',
}: TarjetaProyectoProps) {
  const navigate = useNavigate();
  const estadoCfg = ESTADO_CONFIG[proyecto.estado];
  const primeraLinea = proyecto.lineas[0]?.nombre ?? '';

  const handleVer = () => {
    if (onVerProyecto) {
      onVerProyecto(proyecto.id);
    } else {
      navigate(`/proyectos/${proyecto.id}`);
    }
  };

  return (
    <article className="bg-white border border-[#E5E7EB] rounded-xl p-5 flex flex-col font-sans transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-[#D1D5DB]">
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-semibold px-2.5 py-[3px] rounded-full ${estadoCfg.clases}`}>{estadoCfg.label}</span>
        <span className="text-xs text-[#9CA3AF]">{formatearFechaCorta(proyecto.creadoEn)}</span>
      </div>

      <h3 className="text-lg font-bold text-[#111827] m-0 mb-2 line-clamp-2 leading-[1.4]">{proyecto.titulo}</h3>

      <p className="text-[13px] text-[#6B7280] m-0 mb-3.5 line-clamp-2 leading-relaxed">{proyecto.resumen}</p>

      <div className={`flex mb-3 ${modo === 'lista' ? 'flex-row flex-wrap gap-3' : 'flex-col gap-1.5'}`}>
        <div className="flex items-center gap-1.5 text-[13px] text-[#374151]">
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-[#9CA3AF] shrink-0" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
          {proyecto.materia
            ? <span className="font-semibold">{proyecto.materia}</span>
            : <span className="text-[#9CA3AF]">Sin materia</span>}
        </div>

        {mostrarIntegrantes && (
          <div className="flex items-center gap-1.5 text-[13px] text-[#374151]">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-[#9CA3AF] shrink-0" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{formatearIntegrantes(proyecto.integrantes)}</span>
          </div>
        )}

        {mostrarDirector && proyecto.directores.length > 0 && (
          <>
            <div className="flex items-center gap-1.5 text-[13px] text-[#374151]">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-[#9CA3AF] shrink-0" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="truncate">
                <span className="text-[#9CA3AF]">Director: </span>
                {`${proyecto.directores[0].nombre} ${proyecto.directores[0].apellido}`}
              </span>
            </div>
            {proyecto.directores.length > 1 && (
              <div className="flex items-center gap-1.5 text-[13px] text-[#374151]">
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="transparent" strokeWidth={2} className="shrink-0" aria-hidden="true" />
                <span className="truncate">
                  <span className="text-[#9CA3AF]">Co-Directores: </span>
                  {proyecto.directores.slice(1).map((d) => `${d.nombre} ${d.apellido}`).join(', ')}
                </span>
              </div>
            )}
          </>
        )}

        {mostrarVisibilidad && (
          <div className="flex items-center gap-1.5 text-[13px]">
            {proyecto.visibilidad === 'solo_metadatos' ? (
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-[#9CA3AF] shrink-0" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            ) : (
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-[#9CA3AF] shrink-0" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
            <span className={`text-[11px] font-semibold px-2 py-[2px] rounded-full ${VISIBILIDAD_CONFIG[proyecto.visibilidad].clases}`}>
              {VISIBILIDAD_CONFIG[proyecto.visibilidad].label}
            </span>
          </div>
        )}
      </div>

      <hr className="border-none border-t border-[#F3F4F6] my-3" />

      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-[#9CA3AF] tracking-[0.05em] overflow-hidden text-ellipsis whitespace-nowrap">{primeraLinea.toUpperCase()}</span>
        <button
          type="button"
          className="text-[13px] font-bold text-[#B91C1C] bg-none border-none cursor-pointer p-0 whitespace-nowrap font-sans transition-all duration-150 hover:underline hover:translate-x-1"
          onClick={handleVer}
        >
          Ver Proyecto →
        </button>
      </div>
    </article>
  );
}

export default TarjetaProyecto;
