interface Segmento {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  segmentos: Segmento[];
}

export default function Breadcrumb({ segmentos }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-[#6B6B6B] mb-2.5 animate-fade-in" aria-label="Ruta de navegación">
      {segmentos.map((seg, i) => {
        const esUltimo = i === segmentos.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-[#BBBBBB]">›</span>}
            {esUltimo ? (
              <span className="text-[#C0392B] font-medium">{seg.label}</span>
            ) : seg.href ? (
              <a href={seg.href} className="text-[#6B6B6B] no-underline hover:text-[#111111]">{seg.label}</a>
            ) : (
              <span className="text-[#6B6B6B]">{seg.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
