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
    <button
      className="px-3 py-1.5 rounded-lg font-sans text-xs font-medium cursor-pointer border-[1.5px] border-[#E0E0E0] bg-white text-[#3D3D3D] transition-all hover:bg-[#F2F2F2] hover:-translate-y-px active:translate-y-0 whitespace-nowrap"
      onClick={onClick}
    >
      {LABELS[variante]}
    </button>
  );
}
