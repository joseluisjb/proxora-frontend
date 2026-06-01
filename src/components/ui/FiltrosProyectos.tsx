import BarraBusqueda from './BarraBusqueda';
import BotonPrimario from './BotonPrimario';

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
}

const ESTADOS = [
  { value: '', label: 'Todos' },
  { value: 'en_desarrollo', label: 'En desarrollo' },
  { value: 'finalizado',    label: 'Finalizado' },
  { value: 'bajo_revision', label: 'Bajo revisión' },
  { value: 'retrasado',     label: 'Retrasado' },
];

const VISIBILIDADES = [
  { value: '',               label: 'Todos' },
  { value: 'solo_metadatos', label: 'Solo metadatos' },
  { value: 'lectura',        label: 'Lectura' },
  { value: 'lectura_descarga', label: 'Lectura y descarga' },
];

const selectCls = "px-3 py-2 border-[1.5px] border-[#E0E0E0] rounded-lg font-sans text-[13px] text-[#111111] bg-white cursor-pointer min-w-[140px] focus:outline-none focus:border-[#C0392B]";
const labelCls = "text-[11px] font-semibold text-[#6B6B6B] tracking-[0.05em] uppercase";

export default function FiltrosProyectos({
  valores,
  onChange,
  onFiltrar,
  semestres,
  materias,
  lineas,
}: FiltrosProyectosProps) {
  return (
    <div className="flex flex-wrap gap-2.5 items-end p-4 bg-white rounded-lg border border-[#EBEBEB] mb-5">
      <div className="flex flex-col gap-1" style={{ flex: 1, minWidth: 180 }}>
        <BarraBusqueda
          placeholder="Título o descripción..."
          valor={valores.busqueda}
          onChange={(v) => onChange('busqueda', v)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelCls}>Semestre</label>
        <select className={selectCls} value={valores.semestre} onChange={(e) => onChange('semestre', e.target.value)} aria-label="Filtrar por semestre">
          <option value="">Todos los semestres</option>
          {semestres.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelCls}>Materia</label>
        <select className={selectCls} value={valores.materia} onChange={(e) => onChange('materia', e.target.value)} aria-label="Filtrar por materia">
          <option value="">Todas las materias</option>
          {materias.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelCls}>Línea de investigación</label>
        <select className={selectCls} value={valores.lineaInvestigacion} onChange={(e) => onChange('lineaInvestigacion', e.target.value)} aria-label="Filtrar por línea de investigación">
          <option value="">Todas</option>
          {lineas.map((l) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelCls}>Estado</label>
        <select className={selectCls} value={valores.estado} onChange={(e) => onChange('estado', e.target.value)} aria-label="Filtrar por estado">
          {ESTADOS.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelCls}>Visibilidad</label>
        <select className={selectCls} value={valores.visibilidad} onChange={(e) => onChange('visibilidad', e.target.value)} aria-label="Filtrar por visibilidad">
          {VISIBILIDADES.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
        </select>
      </div>

      <BotonPrimario label="Filtrar" icono="filtrar" onClick={onFiltrar} />
    </div>
  );
}
