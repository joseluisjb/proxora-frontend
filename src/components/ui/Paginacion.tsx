import '../../styles/admin-ui.css';

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

  return (
    <div className="paginacion-wrap">
      <span className="paginacion-info">
        Mostrando {inicio}–{fin} de {totalRegistros} {labelEntidad}
      </span>
      <div className="paginacion">
        <button
          className="pag-btn"
          disabled={paginaActual === 1}
          onClick={() => onCambiarPagina(paginaActual - 1)}
          aria-label="Página anterior"
        >
          ‹
        </button>
        {paginas.map((p) => (
          <button
            key={p}
            className={`pag-btn ${p === paginaActual ? 'activo' : ''}`}
            onClick={() => onCambiarPagina(p)}
            aria-label={`Página ${p}`}
            aria-current={p === paginaActual ? 'page' : undefined}
          >
            {p}
          </button>
        ))}
        <button
          className="pag-btn"
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
