import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';
import axios from 'axios';
import './Login.css';

interface LoginFormState {
  correo: string;
  contrasena: string;
  mostrarContrasena: boolean;
  iniciandoSesion: boolean;
  errores: {
    correo?: string;
    contrasena?: string;
    general?: string;
  };
}

// MOCK DATA - reemplazado por la llamada real a authService.login arriba
// const USUARIOS_MOCK = [
//   { correo: 'admin@ufps.edu.co',      contrasena: 'Admin2026*',      rol: 'administrador' as const },
//   { correo: 'docente@ufps.edu.co',    contrasena: 'Docente2026*',    rol: 'docente'       as const },
//   { correo: 'estudiante@ufps.edu.co', contrasena: 'Estudiante2026*', rol: 'estudiante'    as const },
// ];

const DESTINO_POR_ROL: Record<string, string> = {
  administrador: '/admin/usuarios',
  docente:       '/docente/dashboard',
  estudiante:    '/estudiante/dashboard',
};

function esEmailValido(correo: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

export default function Login() {
  const navigate   = useNavigate();
  const { iniciarSesion } = useAuth();

  const [estado, setEstado] = useState<LoginFormState>({
    correo: '',
    contrasena: '',
    mostrarContrasena: false,
    iniciandoSesion: false,
    errores: {},
  });

  const set = (campo: Partial<LoginFormState>) =>
    setEstado((prev) => ({ ...prev, ...campo }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errores: LoginFormState['errores'] = {};
    if (!estado.correo.trim()) {
      errores.correo = 'El correo institucional es obligatorio';
    } else if (!esEmailValido(estado.correo)) {
      errores.correo = 'Ingresa un correo electrónico válido';
    }
    if (!estado.contrasena) {
      errores.contrasena = 'La contraseña es obligatoria';
    }

    if (Object.keys(errores).length > 0) {
      set({ errores });
      return;
    }

    set({ iniciandoSesion: true, errores: {} });

    try {
      const respuesta = await authService.login({
        correo: estado.correo,
        password: estado.contrasena,
      });

      iniciarSesion({
        id: respuesta.id,
        correo: estado.correo,
        rol: respuesta.rol,
        token: respuesta.token,
        nombre: respuesta.nombre,
      });

      navigate(DESTINO_POR_ROL[respuesta.rol] ?? '/admin/usuarios', { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          set({ errores: { general: 'Correo o contraseña incorrectos' } });
        } else if (err.response?.status === 400) {
          set({ errores: { general: 'Por favor verifica los datos ingresados' } });
        } else if (!err.response) {
          set({ errores: { general: 'No se pudo conectar con el servidor. Intenta de nuevo.' } });
        } else {
          set({ errores: { general: 'Correo o contraseña incorrectos' } });
        }
      } else {
        set({ errores: { general: 'No se pudo conectar con el servidor. Intenta de nuevo.' } });
      }
    } finally {
      set({ iniciandoSesion: false });
    }
  };

  const handleInvitado = () => {
    iniciarSesion({ correo: '', rol: 'invitado' });
    // TODO: redirigir a /inicio cuando exista
    navigate('/inicio');
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Logo */}
        <div className="login-logo">
          <svg
            className="login-logo__icono"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
          <span className="login-logo__texto">PROXORA</span>
        </div>

        {/* Formulario */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>

          {/* Correo */}
          <div className="login-campo">
            <label htmlFor="correo" className="login-label">
              Correo Institucional
            </label>
            <div className="login-input-wrap">
              <input
                id="correo"
                type="email"
                autoComplete="email"
                className={`login-input ${estado.errores.correo ? 'login-input--error' : ''}`}
                placeholder="ejemplo@ufps.edu.co"
                value={estado.correo}
                onChange={(e) => set({ correo: e.target.value, errores: { ...estado.errores, correo: undefined } })}
                aria-invalid={!!estado.errores.correo}
                aria-describedby={estado.errores.correo ? 'error-correo' : undefined}
              />
              <span className="login-input__icono" aria-hidden="true">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </span>
            </div>
            {estado.errores.correo && (
              <p id="error-correo" className="login-error-campo" role="alert">
                {estado.errores.correo}
              </p>
            )}
          </div>

          {/* Contraseña */}
          <div className="login-campo">
            <div className="login-label-fila">
              <label htmlFor="contrasena" className="login-label">
                Contraseña
              </label>
              <a href="/recuperar-contrasena" className="login-link-olvide">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <div className="login-input-wrap">
              <input
                id="contrasena"
                type={estado.mostrarContrasena ? 'text' : 'password'}
                autoComplete="current-password"
                className={`login-input ${estado.errores.contrasena ? 'login-input--error' : ''}`}
                placeholder="••••••••"
                value={estado.contrasena}
                onChange={(e) => set({ contrasena: e.target.value, errores: { ...estado.errores, contrasena: undefined } })}
                aria-invalid={!!estado.errores.contrasena}
                aria-describedby={estado.errores.contrasena ? 'error-contrasena' : undefined}
              />
              <button
                type="button"
                className="login-input__icono login-input__icono--btn"
                onClick={() => set({ mostrarContrasena: !estado.mostrarContrasena })}
                aria-label={estado.mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {estado.mostrarContrasena ? (
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {estado.errores.contrasena && (
              <p id="error-contrasena" className="login-error-campo" role="alert">
                {estado.errores.contrasena}
              </p>
            )}
          </div>

          {/* Botón iniciar sesión */}
          <button
            type="submit"
            className="login-btn-primario"
            disabled={estado.iniciandoSesion}
            style={estado.iniciandoSesion ? { cursor: 'not-allowed', opacity: 0.8 } : {}}
          >
            {estado.iniciandoSesion ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>

          {/* Error general */}
          {estado.errores.general && (
            <div className="login-error-general" role="alert">
              {estado.errores.general}
            </div>
          )}

          {/* Divisor */}
          <div className="login-divisor">
            <span className="login-divisor__linea" />
            <span className="login-divisor__texto">¿No tienes cuenta?</span>
            <span className="login-divisor__linea" />
          </div>

          {/* Botón registro */}
          <button
            type="button"
            className="login-btn-secundario"
            onClick={() => navigate('/registro')}
          >
            Registrarse como estudiante
          </button>
        </form>

        {/* Invitado */}
        <button
          type="button"
          className="login-link-invitado"
          onClick={handleInvitado}
        >
          Continuar como invitado
        </button>

      </div>
    </div>
  );
}
