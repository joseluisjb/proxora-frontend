import '../../styles/admin-ui.css';

interface BarraBusquedaProps {
  placeholder?: string;
  valor: string;
  onChange: (valor: string) => void;
}

export default function BarraBusqueda({ placeholder = 'Buscar...', valor, onChange }: BarraBusquedaProps) {
  return (
    <div className="barra-busqueda">
      <span className="barra-busqueda__icono">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </span>
      <input
        type="text"
        className="barra-busqueda__input"
        placeholder={placeholder}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        aria-label={placeholder}
      />
    </div>
  );
}
