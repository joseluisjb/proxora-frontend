import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface NavbarPublicaProps {}

const DESTINO_POR_ROL: Record<string, string> = {
  administrador: '/admin/usuarios',
  docente:       '/docente/dashboard',
  estudiante:    '/estudiante/dashboard',
};

export default function NavbarPublica(_props: NavbarPublicaProps) {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const sesionActiva = usuario && usuario.rol !== 'invitado';
  const destino = sesionActiva ? (DESTINO_POR_ROL[usuario.rol] ?? '/admin/usuarios') : null;

  return (
    <nav className="w-full h-14 bg-white border-b border-[#E5E7EB] sticky top-0 z-[100] animate-fade-in" role="navigation" aria-label="Navegación principal">
      <div className="max-w-[1200px] mx-auto h-full px-12 flex items-center justify-between max-sm:px-4">
        <button
          type="button"
          className="text-xl font-bold text-[#B91C1C] bg-none border-none cursor-pointer tracking-[0.1em] font-sans p-0 transition-colors hover:text-[#991B1B]"
          onClick={() => navigate('/')}
          aria-label="Ir al inicio"
        >
          PROXORA
        </button>

        <div className="flex items-center gap-3">
          {sesionActiva ? (
            <>
              <span className="text-sm text-[#6B7280] font-sans max-sm:hidden">
                Hola, {usuario.nombre ?? usuario.correo}
              </span>
              <button
                type="button"
                className="bg-[#F3F4F6] text-[#111827] border border-[#E5E7EB] rounded-lg px-5 py-2 text-sm font-semibold cursor-pointer font-sans transition-colors hover:bg-[#E5E7EB]"
                onClick={() => navigate(destino!)}
              >
                Mi panel
              </button>
            </>
          ) : (
            <button
              type="button"
              className="bg-[#B91C1C] text-white border-none rounded-lg px-5 py-2 text-sm font-semibold cursor-pointer font-sans transition-colors hover:bg-[#991B1B]"
              onClick={() => navigate('/login')}
            >
              Iniciar sesión
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
