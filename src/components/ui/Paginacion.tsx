interface PaginacionProps {
  paginaActual: number;
  totalPaginas: number;
  totalRegistros: number;
  registrosPorPagina: number;
  labelEntidad: string;
  onCambiarPagina: (pagina: number) => void;
}

export default function Paginacion({
  paginaActual,
  totalPaginas,
  totalRegistros,
  registrosPorPagina,
  labelEntidad,
  onCambiarPagina,
}: PaginacionProps) {
  const inicio = (paginaActual - 1) * registrosPorPagina + 1;
  const fin = Math.min(paginaActual * registrosPorPagina, totalRegistros);
  const paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1);

  const btnBase = "w-8 h-8 rounded-md border border-[#E0E0E0] bg-white font-sans text-[13px] cursor-pointer flex items-center justify-center text-[#3D3D3D] transition-all hover:bg-[#F2F2F2] hover:-translate-y-px active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0";

  return (
    <div className="flex items-center justify-between px-4 py-3.5 border-t border-[#F0F0F0]">
      <span className="text-xs text-[#6B6B6B]">
        Mostrando {inicio}–{fin} de {totalRegistros} {labelEntidad}
      </span>
      <div className="flex items-center gap-1">
        <button
          className={btnBase}
          disabled={paginaActual === 1}
          onClick={() => onCambiarPagina(paginaActual - 1)}
          aria-label="Página anterior"
        >
          ‹
        </button>
        {paginas.map((p) => (
          <button
            key={p}
            className={`${btnBase} ${p === paginaActual ? 'bg-[#C0392B] text-white border-[#C0392B] hover:bg-[#C0392B]' : ''}`}
            onClick={() => onCambiarPagina(p)}
            aria-label={`Página ${p}`}
            aria-current={p === paginaActual ? 'page' : undefined}
          >
            {p}
          </button>
        ))}
        <button
          className={btnBase}
          disabled={paginaActual === totalPaginas}
          onClick={() => onCambiarPagina(paginaActual + 1)}
          aria-label="Página siguiente"
        >
          ›
        </button>
      </div>
    </div>
  );
}
