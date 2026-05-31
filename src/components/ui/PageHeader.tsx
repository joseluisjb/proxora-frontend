import '../../styles/admin-ui.css';
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
    <div>
      {breadcrumb && <Breadcrumb segmentos={breadcrumb} />}
      <div className="page-header-admin">
        <div className="page-header-admin__texto">
          <h1>{titulo}</h1>
          {subtitulo && <p>{subtitulo}</p>}
        </div>
        {accionLabel && (
          <BotonPrimario label={accionLabel} icono="mas" onClick={onAccion} />
        )}
      </div>
    </div>
  );
}
