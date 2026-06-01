export type VarianteBadge =
  | 'activo'
  | 'inactivo'
  | 'suspendido'
  | 'docente'
  | 'estudiante'
  | 'admin'
  | 'materia';

interface BadgeEstadoProps {
  variante: VarianteBadge;
  label?: string;
}

const CONFIG: Record<VarianteBadge, { clases: string; labelDefault: string; icono?: string }> = {
  activo:     { clases: 'bg-[#DCFCE7] text-[#166534]',     labelDefault: 'Activo' },
  inactivo:   { clases: 'bg-[#F2F2F2] text-[#3D3D3D]',     labelDefault: 'Inactivo' },
  suspendido: { clases: 'bg-[#FEE2E2] text-[#991B1B]',     labelDefault: 'Suspendido' },
  docente:    { clases: 'bg-[#EBF4FF] text-[#2563EB]',     labelDefault: 'Docente',    icono: '🎓' },
  estudiante: { clases: 'bg-[#F2F2F2] text-[#3D3D3D]',     labelDefault: 'Estudiante', icono: '👤' },
  admin:      { clases: 'bg-[#EDE9FE] text-[#5B21B6]',     labelDefault: 'Admin',      icono: '🛡️' },
  materia:    { clases: 'bg-[#EFF6FF] text-[#1D4ED8]',     labelDefault: 'Materia' },
};

export default function BadgeEstado({ variante, label }: BadgeEstadoProps) {
  const cfg = CONFIG[variante];
  const texto = label ?? cfg.labelDefault;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium animate-scale-in ${cfg.clases}`}>
      {cfg.icono && <span>{cfg.icono}</span>}
      {texto}
    </span>
  );
}
