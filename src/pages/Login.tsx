import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';
import axios from 'axios';

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
    navigate('/');
  };

  const inputCls = (hasError: boolean) =>
    `w-full py-3 px-4 pr-11 bg-[#F9FAFB] border rounded-lg font-sans text-sm text-[#111827] outline-none transition-colors placeholder:text-[#D1D5DB] ${hasError ? 'border-[#EF4444] focus:border-[#EF4444]' : 'border-[#E5E7EB] focus:border-[#B91C1C]'}`;

  return (
    <div className="min-h-screen w-screen bg-[#F3F4F6] flex items-center justify-center px-4 py-6">
      <div className="bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] w-full max-w-[400px] px-10 py-10 flex flex-col max-sm:px-6 animate-scale-in">

        <div className="flex items-center justify-center gap-2.5 mb-8">
          <svg className="w-7 h-7 text-[#B91C1C] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
          <span className="text-[22px] font-bold text-[#111827] tracking-[0.15em] font-sans">PROXORA</span>
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="correo" className="text-[11px] font-medium text-[#6B7280] uppercase tracking-[0.08em]">
              Correo Institucional
            </label>
            <div className="relative flex items-center">
              <input
                id="correo"
                type="email"
                autoComplete="email"
                className={inputCls(!!estado.errores.correo)}
                placeholder="ejemplo@ufps.edu.co"
                value={estado.correo}
                onChange={(e) => set({ correo: e.target.value, errores: { ...estado.errores, correo: undefined } })}
                aria-invalid={!!estado.errores.correo}
                aria-describedby={estado.errores.correo ? 'error-correo' : undefined}
              />
              <span className="absolute right-3.5 flex items-center text-[#9CA3AF] pointer-events-none" aria-hidden="true">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </span>
            </div>
            {estado.errores.correo && (
              <p id="error-correo" className="text-xs text-[#EF4444] m-0" role="alert">{estado.errores.correo}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="contrasena" className="text-[11px] font-medium text-[#6B7280] uppercase tracking-[0.08em]">
                Contraseña
              </label>
              <button
                type="button"
                className="text-xs text-[#B91C1C] bg-none border-none cursor-pointer p-0 font-sans hover:underline"
                onClick={() => navigate('/recuperar-contrasena')}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <div className="relative flex items-center">
              <input
                id="contrasena"
                type={estado.mostrarContrasena ? 'text' : 'password'}
                autoComplete="current-password"
                className={inputCls(!!estado.errores.contrasena)}
                placeholder="••••••••"
                value={estado.contrasena}
                onChange={(e) => set({ contrasena: e.target.value, errores: { ...estado.errores, contrasena: undefined } })}
                aria-invalid={!!estado.errores.contrasena}
                aria-describedby={estado.errores.contrasena ? 'error-contrasena' : undefined}
              />
              <button
                type="button"
                className="absolute right-3.5 flex items-center text-[#9CA3AF] bg-none border-none cursor-pointer p-0.5 rounded hover:text-[#6B7280] transition-colors"
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
              <p id="error-contrasena" className="text-xs text-[#EF4444] m-0" role="alert">{estado.errores.contrasena}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#B91C1C] text-white border-none rounded-lg font-sans text-base font-bold cursor-pointer transition-all hover:bg-[#991B1B] hover:-translate-y-px active:translate-y-0 mt-1 disabled:cursor-not-allowed disabled:opacity-80 disabled:translate-y-0"
            disabled={estado.iniciandoSesion}
          >
            {estado.iniciandoSesion && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />}
            {estado.iniciandoSesion ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>

          {estado.errores.general && (
            <div className="bg-[#FEF2F2] border-l-[3px] border-[#EF4444] rounded-md px-4 py-3 text-[#B91C1C] text-sm -mt-1" role="alert">
              {estado.errores.general}
            </div>
          )}

          <div className="flex items-center mt-1">
            <span className="flex-1 h-px bg-[#E5E7EB]" />
            <span className="px-3 text-sm text-[#9CA3AF] whitespace-nowrap font-sans">¿No tienes cuenta?</span>
            <span className="flex-1 h-px bg-[#E5E7EB]" />
          </div>

          <button
            type="button"
            className="w-full py-3.5 bg-white text-[#111827] border border-[#E5E7EB] rounded-lg font-sans text-base font-bold cursor-pointer transition-colors hover:bg-[#F9FAFB] hover:border-[#D1D5DB]"
            onClick={() => navigate('/registro')}
          >
            Registrarse como estudiante
          </button>
        </form>

        <button
          type="button"
          className="mt-4 block w-full bg-none border-none font-sans text-sm text-[#9CA3AF] underline cursor-pointer text-center py-1 transition-colors hover:text-[#6B7280]"
          onClick={handleInvitado}
        >
          Continuar como invitado
        </button>
      </div>
    </div>
  );
}
