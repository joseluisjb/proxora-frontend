import '../../styles/admin-ui.css';

interface AvatarInicialesProps {
  nombre: string;
  apellido: string;
  tamaño?: 'sm' | 'md' | 'lg';
  imagenUrl?: string;
}

const COLORES_PASTEL = [
  { bg: '#DBEAFE', text: '#1E40AF' },
  { bg: '#D1FAE5', text: '#065F46' },
  { bg: '#FEF3C7', text: '#92400E' },
  { bg: '#EDE9FE', text: '#4C1D95' },
  { bg: '#FCE7F3', text: '#9D174D' },
  { bg: '#CFFAFE', text: '#164E63' },
  { bg: '#DCFCE7', text: '#14532D' },
  { bg: '#FFE4E6', text: '#9F1239' },
];

function elegirColor(nombre: string, apellido: string) {
  let hash = 0;
  const str = nombre + apellido;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORES_PASTEL[Math.abs(hash) % COLORES_PASTEL.length];
}

export default function AvatarIniciales({ nombre, apellido, tamaño = 'md', imagenUrl }: AvatarInicialesProps) {
  const color = elegirColor(nombre, apellido);
  const iniciales = `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();

  return (
    <div
      className={`avatar-iniciales avatar-iniciales--${tamaño}`}
      style={{ backgroundColor: color.bg, color: color.text }}
    >
      {imagenUrl ? (
        <img src={imagenUrl} alt={`${nombre} ${apellido}`} />
      ) : (
        iniciales
      )}
    </div>
  );
}
