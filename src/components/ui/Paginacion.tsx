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

  const items: (number | 'dots')[] = [];
  if (totalPaginas <= 7) {
    for (let i = 1; i <= totalPaginas; i++) items.push(i);
  } else {
    items.push(1);
    if (paginaActual > 3) items.push('dots');
    const desde = Math.max(2, paginaActual - 1);
    const hasta = Math.min(totalPaginas - 1, paginaActual + 1);
    for (let i = desde; i <= hasta; i++) items.push(i);
    if (paginaActual < totalPaginas - 2) items.push('dots');
    items.push(totalPaginas);
  }

  const btnBase = "w-8 h-8 rounded-lg border text-[13px] font-medium cursor-pointer flex items-center justify-center transition-all duration-150 select-none";
  const btnInactivo = `${btnBase} border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-[#E5E7EB]`;
  const btnActivo = `${btnBase} border-[#B91C1C] bg-[#B91C1C] text-white`;

  return (
    <div className="flex flex-col items-center gap-2.5 py-1">
      <div className="flex items-center gap-1">
        <button
          type="button"
          className={btnInactivo}
          disabled={paginaActual === 1}
          onClick={() => onCambiarPagina(paginaActual - 1)}
          aria-label="Página anterior"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {items.map((item, idx) =>
          item === 'dots' ? (
            <span key={`dots-${idx}`} className="w-8 h-8 flex items-center justify-center text-[13px] text-[#9CA3AF] select-none">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className={item === paginaActual ? btnActivo : btnInactivo}
              onClick={() => onCambiarPagina(item as number)}
              aria-label={`Página ${item}`}
              aria-current={item === paginaActual ? 'page' : undefined}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          className={btnInactivo}
          disabled={paginaActual === totalPaginas}
          onClick={() => onCambiarPagina(paginaActual + 1)}
          aria-label="Página siguiente"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <span className="text-[12px] text-[#9CA3AF]">
        Mostrando {inicio}–{fin} de {totalRegistros} {labelEntidad}
      </span>
    </div>
  );
}
