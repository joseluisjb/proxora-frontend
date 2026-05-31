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
    <div className="flex gap-1.5">
      {OPCIONES.map((op) => (
        <button
          key={op.id}
          className={`px-3.5 py-2 rounded-full font-sans text-[13px] font-medium cursor-pointer transition-all border-[1.5px] hover:-translate-y-px active:translate-y-0 ${
            rolActivo === op.id
              ? 'bg-[#C0392B] text-white border-[#C0392B]'
              : 'border-[#E0E0E0] bg-white text-[#6B6B6B] hover:border-[#C0392B] hover:text-[#C0392B]'
          }`}
          onClick={() => onChange(op.id)}
          aria-pressed={rolActivo === op.id}
        >
          {op.label}
        </button>
      ))}
    </div>
  );
}
