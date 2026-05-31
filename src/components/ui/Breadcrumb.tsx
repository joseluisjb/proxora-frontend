import '../../styles/admin-ui.css';

interface Segmento {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  segmentos: Segmento[];
}

export default function Breadcrumb({ segmentos }: BreadcrumbProps) {
  return (
    <nav className="breadcrumb" aria-label="Ruta de navegación">
      {segmentos.map((seg, i) => {
        const esUltimo = i === segmentos.length - 1;
        return (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {i > 0 && <span className="breadcrumb__sep">›</span>}
            {esUltimo ? (
              <span className="breadcrumb__activo">{seg.label}</span>
            ) : seg.href ? (
              <a href={seg.href} className="breadcrumb__link">{seg.label}</a>
            ) : (
              <span className="breadcrumb__link">{seg.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
