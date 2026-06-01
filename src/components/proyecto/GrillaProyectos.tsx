import type { ProyectoResponse } from '../../types/api.types';
import { TarjetaProyecto } from './TarjetaProyecto';

export interface GrillaProyectosProps {
  proyectos: ProyectoResponse[]
  cargando: boolean
  error: string | null
  vistaActual: 'grilla' | 'lista'
  onReintentar?: () => void
  mostrarVisibilidad?: boolean
  mostrarDirector?: boolean
  mostrarIntegrantes?: boolean
  columnas?: 2 | 3
}

function SkeletonCard() {
  return <div className="bg-[#E5E7EB] rounded-xl min-h-[280px] animate-pulse" aria-hidden="true" />;
}

const GRILLA_COLS: Record<number, string> = {
  2: 'grid grid-cols-2 gap-6 max-lg:grid-cols-1',
  3: 'grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1',
};

export function GrillaProyectos({
  proyectos,
  cargando,
  error,
  vistaActual,
  onReintentar,
  mostrarVisibilidad = true,
  mostrarDirector = true,
  mostrarIntegrantes = true,
  columnas = 3,
}: GrillaProyectosProps) {
  const grillaCls = vistaActual === 'grilla' ? GRILLA_COLS[columnas] : 'flex flex-col gap-4';

  const estadoCentral = (
    <div className="col-span-full flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
    </div>
  );

  if (cargando) {
    return (
      <div className={grillaCls} aria-label="Cargando proyectos">
        {Array.from({ length: columnas === 2 ? 4 : 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
        <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#EF4444" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <p className="text-base text-[#374151] m-0 font-sans">{error}</p>
        {onReintentar && (
          <button
            type="button"
            className="mt-1 px-5 py-2 bg-[#B91C1C] text-white border-none rounded-lg font-sans text-sm font-semibold cursor-pointer transition-colors hover:bg-[#991B1B]"
            onClick={onReintentar}
          >
            Reintentar
          </button>
        )}
      </div>
    );
  }

  if (proyectos.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
        <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
        </svg>
        <p className="text-base text-[#374151] m-0 font-sans">No se encontraron proyectos</p>
        <p className="text-sm text-[#9CA3AF] m-0 font-sans">Intenta con otros filtros de búsqueda</p>
      </div>
    );
  }

  void estadoCentral;

  return (
    <div className={grillaCls}>
      {proyectos.map((proyecto, index) => (
        <TarjetaProyecto
          key={proyecto.id}
          proyecto={proyecto}
          mostrarVisibilidad={mostrarVisibilidad}
          mostrarDirector={mostrarDirector}
          mostrarIntegrantes={mostrarIntegrantes}
          modo={vistaActual}
          animationDelay={index * 60}
        />
      ))}
    </div>
  );
}

export default GrillaProyectos;
