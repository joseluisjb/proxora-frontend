import '../../styles/admin-ui.css';

type VarianteAccionUsuario = 'hacer-docente' | 'revocar-docente';

interface BotonAccionUsuarioProps {
  variante: VarianteAccionUsuario;
  onClick: () => void;
}

const LABELS: Record<VarianteAccionUsuario, string> = {
  'hacer-docente':   'Hacer Docente',
  'revocar-docente': 'Revocar Docente',
};

export default function BotonAccionUsuario({ variante, onClick }: BotonAccionUsuarioProps) {
  return (
    <button className="btn-accion-usuario" onClick={onClick}>
      {LABELS[variante]}
    </button>
  );
}
