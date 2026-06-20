import { useState } from 'react';
import BarraBusqueda from './BarraBusqueda';
import BotonPrimario from './BotonPrimario';
import Desplegable from './Desplegable';
import type { EstadoProyectoResponse, NivelVisibilidadResponse } from '../../types/api.types';
import { ETIQUETA_VISIBILIDAD_CATALOGO as ETIQUETA_VISIBILIDAD } from '../../constants/visibilidad';

interface OpcionSelect {
  id: string;
  nombre: string;
}

interface ValoresFiltros {
  busqueda: string;
  semestre: string;
  materia: string;
  lineaInvestigacion: string;
  estado: string;
  visibilidad: string;
}

interface FiltrosProyectosProps {
  valores: ValoresFiltros;
  onChange: (campo: string, valor: string) => void;
  onFiltrar: () => void;
  semestres: OpcionSelect[];
  materias: OpcionSelect[];
  lineas: OpcionSelect[];
  estados: EstadoProyectoResponse[];
  visibilidades?: NivelVisibilidadResponse[];
  aplicandoFiltro?: boolean;
}

const ETIQUETA_ESTADO: Record<string, string> = {
  en_desarrollo: 'En desarrollo',
  finalizado:    'Finalizado',
  bajo_revision: 'Bajo revisión',
  retrasado:     'Retrasado',
};

const labelCls = "text-[11px] font-semibold text-[#6B6B6B] tracking-[0.05em] uppercase";

export default function FiltrosProyectos({
  valores,
  onChange,
  onFiltrar,
  semestres,
  materias,
  lineas,
  estados,
  visibilidades = [],
  aplicandoFiltro = false,
}: FiltrosProyectosProps) {
  const [expandido, setExpandido] = useState(false);
  const [permitirDesborde, setPermitirDesborde] = useState(false);

  const alternarExpandido = () => {
    setExpandido((v) => {
      if (v) setPermitirDesborde(false);
      return !v;
    });
  };

  return (
    <div className="p-4 bg-white rounded-lg border border-[#EBEBEB] mb-5 animate-fade-in">
      <div className="flex flex-wrap gap-2.5 items-end">
        <div className="flex flex-col gap-1" style={{ flex: 1, minWidth: 220 }}>
          <BarraBusqueda
            placeholder="Título o descripción..."
            valor={valores.busqueda}
            onChange={(v) => onChange('busqueda', v)}
          />
        </div>

        <button
          type="button"
          onClick={alternarExpandido}
          className="md:hidden inline-flex items-center gap-1.5 px-3.5 py-[9px] border-[1.5px] border-[#E0E0E0] rounded-lg font-sans text-[13px] font-medium text-[#374151] bg-white cursor-pointer transition-colors hover:bg-[#F8F8F8]"
          aria-expanded={expandido}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtros
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className={`transition-transform duration-200 ${expandido ? 'rotate-180' : ''}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* En md+ todos estos niveles se "disuelven" (display:contents) y los selects pasan a la misma fila que la búsqueda, igual que antes. En mobile, la altura se anima con el truco grid-template-rows 0fr → 1fr. */}
        <div
          className={`grid transition-[grid-template-rows] duration-300 ease-in-out md:contents ${expandido ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
          onTransitionEnd={(e) => {
            if (e.propertyName === 'grid-template-rows' && expandido) setPermitirDesborde(true);
          }}
        >
          <div className={`${permitirDesborde ? 'overflow-visible' : 'overflow-hidden'} min-h-0 md:contents`}>
            <div className="flex flex-wrap gap-2.5 items-end w-full mt-2.5 pt-2.5 border-t border-[#F0F0F0] md:contents">
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Semestre</label>
                <Desplegable
                  valor={valores.semestre}
                  onChange={(v) => onChange('semestre', v)}
                  opciones={[{ valor: '', etiqueta: 'Todos los semestres' }, ...semestres.map((s) => ({ valor: s.nombre, etiqueta: s.nombre }))]}
                  ariaLabel="Filtrar por semestre"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className={labelCls}>Materia</label>
                <Desplegable
                  valor={valores.materia}
                  onChange={(v) => onChange('materia', v)}
                  opciones={[{ valor: '', etiqueta: 'Todas las materias' }, ...materias.map((m) => ({ valor: m.nombre, etiqueta: m.nombre }))]}
                  ariaLabel="Filtrar por materia"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className={labelCls}>Línea de investigación</label>
                <Desplegable
                  valor={valores.lineaInvestigacion}
                  onChange={(v) => onChange('lineaInvestigacion', v)}
                  opciones={[{ valor: '', etiqueta: 'Todas' }, ...lineas.map((l) => ({ valor: l.id, etiqueta: l.nombre }))]}
                  ariaLabel="Filtrar por línea de investigación"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className={labelCls}>Estado</label>
                <Desplegable
                  valor={valores.estado}
                  onChange={(v) => onChange('estado', v)}
                  opciones={[
                    { valor: '', etiqueta: 'Todos' },
                    ...estados.map((e) => ({ valor: e.nombre, etiqueta: ETIQUETA_ESTADO[e.nombre] ?? e.nombre })),
                  ]}
                  ariaLabel="Filtrar por estado"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className={labelCls}>Visibilidad</label>
                <Desplegable
                  valor={valores.visibilidad}
                  onChange={(v) => onChange('visibilidad', v)}
                  opciones={[
                    { valor: '', etiqueta: 'Todos' },
                    ...visibilidades.map((v) => ({ valor: v.nombre, etiqueta: ETIQUETA_VISIBILIDAD[v.nombre] ?? v.nombre })),
                  ]}
                  ariaLabel="Filtrar por visibilidad"
                />
              </div>
            </div>
          </div>
        </div>

        <BotonPrimario label="Filtrar" icono="filtrar" onClick={onFiltrar} cargando={aplicandoFiltro} />
      </div>
    </div>
  );
}
