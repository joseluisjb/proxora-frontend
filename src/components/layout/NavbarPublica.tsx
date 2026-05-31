import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './NavbarPublica.css';

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
    <nav className="navbar-publica" role="navigation" aria-label="Navegación principal">
      <div className="navbar-publica__contenido">
        {/* Logo */}
        <button
          type="button"
          className="navbar-publica__logo"
          onClick={() => navigate('/')}
          aria-label="Ir al inicio"
        >
          PROXORA
        </button>

        {/* Acciones */}
        <div className="navbar-publica__acciones">
          {sesionActiva ? (
            <>
              <span className="navbar-publica__saludo">
                Hola, {usuario.nombre ?? usuario.correo}
              </span>
              <button
                type="button"
                className="navbar-publica__btn-panel"
                onClick={() => navigate(destino!)}
              >
                Mi panel
              </button>
            </>
          ) : (
            <button
              type="button"
              className="navbar-publica__btn-login"
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
