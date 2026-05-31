import '../../styles/admin-ui.css';
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

export default function FiltrosProyectos({
  valores,
  onChange,
  onFiltrar,
  semestres,
  materias,
  lineas,
}: FiltrosProyectosProps) {
  return (
    <div className="filtros-proyectos">
      <div className="filtros-proyectos__select-wrap" style={{ flex: 1, minWidth: 180 }}>
        <BarraBusqueda
          placeholder="Título o descripción..."
          valor={valores.busqueda}
          onChange={(v) => onChange('busqueda', v)}
        />
      </div>

      <div className="filtros-proyectos__select-wrap">
        <label className="filtros-proyectos__label">Semestre</label>
        <select
          className="filtros-proyectos__select"
          value={valores.semestre}
          onChange={(e) => onChange('semestre', e.target.value)}
          aria-label="Filtrar por semestre"
        >
          <option value="">Todos los semestres</option>
          {semestres.map((s) => (
            <option key={s.id} value={s.id}>{s.nombre}</option>
          ))}
        </select>
      </div>

      <div className="filtros-proyectos__select-wrap">
        <label className="filtros-proyectos__label">Materia</label>
        <select
          className="filtros-proyectos__select"
          value={valores.materia}
          onChange={(e) => onChange('materia', e.target.value)}
          aria-label="Filtrar por materia"
        >
          <option value="">Todas las materias</option>
          {materias.map((m) => (
            <option key={m.id} value={m.id}>{m.nombre}</option>
          ))}
        </select>
      </div>

      <div className="filtros-proyectos__select-wrap">
        <label className="filtros-proyectos__label">Línea de investigación</label>
        <select
          className="filtros-proyectos__select"
          value={valores.lineaInvestigacion}
          onChange={(e) => onChange('lineaInvestigacion', e.target.value)}
          aria-label="Filtrar por línea de investigación"
        >
          <option value="">Todas</option>
          {lineas.map((l) => (
            <option key={l.id} value={l.id}>{l.nombre}</option>
          ))}
        </select>
      </div>

      <div className="filtros-proyectos__select-wrap">
        <label className="filtros-proyectos__label">Estado</label>
        <select
          className="filtros-proyectos__select"
          value={valores.estado}
          onChange={(e) => onChange('estado', e.target.value)}
          aria-label="Filtrar por estado"
        >
          {ESTADOS.map((e) => (
            <option key={e.value} value={e.value}>{e.label}</option>
          ))}
        </select>
      </div>

      <div className="filtros-proyectos__select-wrap">
        <label className="filtros-proyectos__label">Visibilidad</label>
        <select
          className="filtros-proyectos__select"
          value={valores.visibilidad}
          onChange={(e) => onChange('visibilidad', e.target.value)}
          aria-label="Filtrar por visibilidad"
        >
          {VISIBILIDADES.map((v) => (
            <option key={v.value} value={v.value}>{v.label}</option>
          ))}
        </select>
      </div>

      <BotonPrimario label="Filtrar" icono="filtrar" onClick={onFiltrar} />
    </div>
  );
}
