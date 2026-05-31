import '../../styles/admin-ui.css';

type RolFiltro = 'todos' | 'docente' | 'estudiante';

interface FiltroRolesProps {
  rolActivo: RolFiltro;
  onChange: (rol: RolFiltro) => void;
}

const OPCIONES: Array<{ id: RolFiltro; label: string }> = [
  { id: 'todos',      label: 'Todos los Usuarios' },
  { id: 'docente',    label: 'Docente' },
  { id: 'estudiante', label: 'Estudiante' },
];

export default function FiltroRoles({ rolActivo, onChange }: FiltroRolesProps) {
  return (
    <div className="filtro-roles">
      {OPCIONES.map((op) => (
        <button
          key={op.id}
          className={`filtro-roles__btn ${rolActivo === op.id ? 'filtro-roles__btn--activo' : ''}`}
          onClick={() => onChange(op.id)}
          aria-pressed={rolActivo === op.id}
        >
          {op.label}
        </button>
      ))}
    </div>
  );
}
