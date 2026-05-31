interface BotonPrimarioProps {
  label: string;
  onClick?: () => void;
  icono?: 'mas' | 'filtrar' | 'exportar';
  disabled?: boolean;
  type?: 'button' | 'submit';
}

const ICONOS = {
  mas: (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  ),
  filtrar: (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  ),
  exportar: (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
};

export default function BotonPrimario({ label, onClick, icono, disabled = false, type = 'button' }: BotonPrimarioProps) {
  return (
    <button
      type={type}
      className="inline-flex items-center gap-1.5 px-[18px] py-[9px] rounded-lg font-sans text-[13px] font-semibold cursor-pointer border-none bg-[#C0392B] text-white transition-all hover:-translate-y-px hover:bg-[#96281B] hover:shadow-md tracking-[0.02em] disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      {icono && ICONOS[icono]}
      {label}
    </button>
  );
}
