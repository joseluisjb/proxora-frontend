import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import axios from 'axios';

type Fase = 'formulario' | 'exito' | 'error';

export default function RestablecerContrasena() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [errores, setErrores] = useState<{ nuevaContrasena?: string; confirmar?: string }>({});
  const [enviando, setEnviando] = useState(false);
  const [fase, setFase] = useState<Fase>(() => (token ? 'formulario' : 'error'));

  const inputCls = (hasError: boolean) =>
    `w-full py-3 px-4 pr-11 bg-[#F9FAFB] border rounded-lg font-sans text-sm text-[#111827] outline-none transition-colors placeholder:text-[#D1D5DB] ${hasError ? 'border-[#EF4444] focus:border-[#EF4444]' : 'border-[#E5E7EB] focus:border-[#B91C1C]'}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errores = {};
    if (!nuevaContrasena) {
      errs.nuevaContrasena = 'La nueva contraseña es obligatoria';
    } else if (nuevaContrasena.length < 8) {
      errs.nuevaContrasena = 'La contraseña debe tener al menos 8 caracteres';
    }
    if (!confirmar) {
      errs.confirmar = 'Debes confirmar la contraseña';
    } else if (nuevaContrasena && confirmar !== nuevaContrasena) {
      errs.confirmar = 'Las contraseñas no coinciden';
    }
    if (Object.keys(errs).length > 0) {
      setErrores(errs);
      return;
    }

    setEnviando(true);
    try {
      await authService.restablecerContrasena(token, nuevaContrasena);
      setFase('exito');
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (err) {
      if (axios.isAxiosError(err) && (err.response?.status === 400 || err.response?.status === 500)) {
        setFase('error');
      } else {
        setFase('error');
      }
    } finally {
      setEnviando(false);
    }
  };

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

        {fase === 'exito' && (
          <div className="flex flex-col items-center gap-3 text-center py-2">
            <div className="w-12 h-12 rounded-full bg-[#DCFCE7] flex items-center justify-center mb-1">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#16A34A" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#111827] m-0">¡Contraseña actualizada!</h2>
            <p className="text-sm text-[#6B7280] m-0 leading-relaxed">
              Tu contraseña ha sido restablecida correctamente. Serás redirigido al inicio de sesión en unos segundos.
            </p>
            <button
              type="button"
              className="mt-4 w-full py-3 bg-[#B91C1C] text-white border-none rounded-lg font-sans text-sm font-bold cursor-pointer transition-all hover:bg-[#991B1B] hover:-translate-y-px active:translate-y-0"
              onClick={() => navigate('/login', { replace: true })}
            >
              Ir al inicio de sesión
            </button>
          </div>
        )}

        {fase === 'error' && (
          <div className="flex flex-col items-center gap-3 text-center py-2">
            <div className="w-12 h-12 rounded-full bg-[#FEF2F2] flex items-center justify-center mb-1">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#B91C1C" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#111827] m-0">Enlace inválido o expirado</h2>
            <p className="text-sm text-[#6B7280] m-0 leading-relaxed">
              El enlace es inválido o ha expirado. Los enlaces de recuperación son válidos por 30 minutos.
            </p>
            <Link
              to="/recuperar-contrasena"
              className="mt-4 w-full py-3 bg-[#B91C1C] text-white border-none rounded-lg font-sans text-sm font-bold cursor-pointer transition-all hover:bg-[#991B1B] hover:-translate-y-px active:translate-y-0 text-center block no-underline"
            >
              Solicitar un nuevo enlace
            </Link>
            <button
              type="button"
              className="w-full bg-none border-none font-sans text-sm text-[#9CA3AF] cursor-pointer text-center py-1 transition-colors hover:text-[#6B7280]"
              onClick={() => navigate('/login')}
            >
              ← Volver al inicio de sesión
            </button>
          </div>
        )}

        {fase === 'formulario' && (
          <>
            <div className="mb-6">
              <h1 className="text-[22px] font-bold text-[#111827] m-0 mb-2">Nueva contraseña</h1>
              <p className="text-sm text-[#6B7280] m-0 leading-relaxed">
                Ingresa y confirma tu nueva contraseña. Debe tener al menos 8 caracteres.
              </p>
            </div>

            <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="nuevaContrasena" className="text-[11px] font-medium text-[#6B7280] uppercase tracking-[0.08em]">
                  Nueva contraseña
                </label>
                <div className="relative flex items-center">
                  <input
                    id="nuevaContrasena"
                    type={mostrarNueva ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={inputCls(!!errores.nuevaContrasena)}
                    placeholder="Mínimo 8 caracteres"
                    value={nuevaContrasena}
                    onChange={(e) => { setNuevaContrasena(e.target.value); setErrores((p) => ({ ...p, nuevaContrasena: undefined })); }}
                    aria-invalid={!!errores.nuevaContrasena}
                  />
                  <button
                    type="button"
                    className="absolute right-3.5 flex items-center text-[#9CA3AF] bg-none border-none cursor-pointer p-0.5 rounded hover:text-[#6B7280] transition-colors"
                    onClick={() => setMostrarNueva((v) => !v)}
                    aria-label={mostrarNueva ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {mostrarNueva ? (
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
                {errores.nuevaContrasena && (
                  <p className="text-xs text-[#EF4444] m-0" role="alert">{errores.nuevaContrasena}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirmar" className="text-[11px] font-medium text-[#6B7280] uppercase tracking-[0.08em]">
                  Confirmar contraseña
                </label>
                <div className="relative flex items-center">
                  <input
                    id="confirmar"
                    type={mostrarConfirmar ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={inputCls(!!errores.confirmar)}
                    placeholder="Repite la contraseña"
                    value={confirmar}
                    onChange={(e) => { setConfirmar(e.target.value); setErrores((p) => ({ ...p, confirmar: undefined })); }}
                    aria-invalid={!!errores.confirmar}
                  />
                  <button
                    type="button"
                    className="absolute right-3.5 flex items-center text-[#9CA3AF] bg-none border-none cursor-pointer p-0.5 rounded hover:text-[#6B7280] transition-colors"
                    onClick={() => setMostrarConfirmar((v) => !v)}
                    aria-label={mostrarConfirmar ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {mostrarConfirmar ? (
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
                {errores.confirmar && (
                  <p className="text-xs text-[#EF4444] m-0" role="alert">{errores.confirmar}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#B91C1C] text-white border-none rounded-lg font-sans text-base font-bold cursor-pointer transition-all hover:bg-[#991B1B] hover:-translate-y-px active:translate-y-0 mt-1 disabled:cursor-not-allowed disabled:opacity-80 disabled:translate-y-0"
                disabled={enviando}
              >
                {enviando && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />}
                {enviando ? 'Restableciendo...' : 'Restablecer contraseña'}
              </button>
            </form>

            <button
              type="button"
              className="mt-5 block w-full bg-none border-none font-sans text-sm text-[#9CA3AF] cursor-pointer text-center py-1 transition-colors hover:text-[#6B7280]"
              onClick={() => navigate('/login')}
            >
              ← Volver al inicio de sesión
            </button>
          </>
        )}
      </div>
    </div>
  );
}
