import Breadcrumb from './Breadcrumb';
import BotonPrimario from './BotonPrimario';

interface Segmento {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  titulo: string;
  subtitulo?: string;
  breadcrumb?: Segmento[];
  accionLabel?: string;
  onAccion?: () => void;
}

export default function PageHeader({ titulo, subtitulo, breadcrumb, accionLabel, onAccion }: PageHeaderProps) {
  return (
    <div className="animate-slide-up">
      {breadcrumb && <Breadcrumb segmentos={breadcrumb} />}
      <div className="flex items-start justify-between gap-4 mb-7">
        <div>
          <h1 className="text-[28px] font-bold text-[#111111] tracking-[-0.02em] leading-tight mb-1.5">{titulo}</h1>
          {subtitulo && <p className="text-sm text-[#6B6B6B] max-w-[540px]">{subtitulo}</p>}
        </div>
        {accionLabel && (
          <BotonPrimario label={accionLabel} icono="mas" onClick={onAccion} />
        )}
      </div>
    </div>
  );
}
