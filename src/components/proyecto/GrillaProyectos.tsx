import type { ProyectoResponse } from '../../types/api.types';
import { TarjetaProyecto } from './TarjetaProyecto';
import './GrillaProyectos.css';

export interface GrillaProyectosProps {
  proyectos: ProyectoResponse[]
  cargando: boolean
  error: string | null
  vistaActual: 'grilla' | 'lista'
  onReintentar?: () => void
  mostrarVisibilidad?: boolean
  mostrarDirector?: boolean
  mostrarIntegrantes?: boolean
}

function SkeletonCard() {
  return <div className="gp-skeleton" aria-hidden="true" />;
}

export function GrillaProyectos({
  proyectos,
  cargando,
  error,
  vistaActual,
  onReintentar,
  mostrarVisibilidad = true,
  mostrarDirector = true,
  mostrarIntegrantes = true,
}: GrillaProyectosProps) {
  if (cargando) {
    return (
      <div className={vistaActual === 'grilla' ? 'gp-grilla' : 'gp-lista'} aria-label="Cargando proyectos">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="gp-estado-central">
        <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#EF4444" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <p className="gp-estado-texto">{error}</p>
        {onReintentar && (
          <button type="button" className="gp-btn-reintentar" onClick={onReintentar}>
            Reintentar
          </button>
        )}
      </div>
    );
  }

  if (proyectos.length === 0) {
    return (
      <div className="gp-estado-central">
        <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
        </svg>
        <p className="gp-estado-texto">No se encontraron proyectos</p>
        <p className="gp-estado-subtexto">Intenta con otros filtros de búsqueda</p>
      </div>
    );
  }

  return (
    <div className={vistaActual === 'grilla' ? 'gp-grilla' : 'gp-lista'}>
      {proyectos.map((proyecto) => (
        <TarjetaProyecto
          key={proyecto.id}
          proyecto={proyecto}
          mostrarVisibilidad={mostrarVisibilidad}
          mostrarDirector={mostrarDirector}
          mostrarIntegrantes={mostrarIntegrantes}
          modo={vistaActual}
        />
      ))}
    </div>
  );
}

export default GrillaProyectos;
