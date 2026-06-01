interface BarraBusquedaProps {
  placeholder?: string;
  valor: string;
  onChange: (valor: string) => void;
}

export default function BarraBusqueda({ placeholder = 'Buscar...', valor, onChange }: BarraBusquedaProps) {
  return (
    <div className="relative flex items-center">
      <span className="absolute left-3 text-[#BBBBBB] pointer-events-none flex">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </span>
      <input
        type="text"
        className="pl-9 pr-3.5 py-[9px] border-[1.5px] border-[#E0E0E0] rounded-lg font-sans text-[13px] text-[#111111] bg-white transition-colors w-full min-w-[220px] focus:outline-none focus:border-[#C0392B] placeholder:text-[#BBBBBB]"
        placeholder={placeholder}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        aria-label={placeholder}
      />
    </div>
  );
}
