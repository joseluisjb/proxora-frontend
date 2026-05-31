import '../../styles/admin-ui.css';

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

const CONFIG: Record<VarianteBadge, { clase: string; labelDefault: string; icono?: string }> = {
  activo:     { clase: 'badge-activo',     labelDefault: 'Activo' },
  inactivo:   { clase: 'badge-inactivo',   labelDefault: 'Inactivo' },
  suspendido: { clase: 'badge-suspendido', labelDefault: 'Suspendido' },
  docente:    { clase: 'badge-docente',    labelDefault: 'Docente',    icono: '🎓' },
  estudiante: { clase: 'badge-inactivo',   labelDefault: 'Estudiante', icono: '👤' },
  admin:      { clase: 'badge-admin-lila', labelDefault: 'Admin',      icono: '🛡️' },
  materia:    { clase: 'badge-materia-custom', labelDefault: 'Materia' },
};

export default function BadgeEstado({ variante, label }: BadgeEstadoProps) {
  const cfg = CONFIG[variante];
  const texto = label ?? cfg.labelDefault;

  return (
    <span className={`badge ${cfg.clase}`}>
      {cfg.icono && <span>{cfg.icono}</span>}
      {texto}
    </span>
  );
}
