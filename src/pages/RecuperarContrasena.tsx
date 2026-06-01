import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Fase = 'formulario' | 'enviado';

function esEmailValido(correo: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

export default function RecuperarContrasena() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [fase, setFase] = useState<Fase>('formulario');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correo.trim()) { setError('El correo institucional es obligatorio'); return; }
    if (!esEmailValido(correo)) { setError('Ingresa un correo electrónico válido'); return; }
    setError('');
    setEnviando(true);
    await new Promise((r) => setTimeout(r, 1000));
    setEnviando(false);
    setFase('enviado');
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

        {fase === 'enviado' ? (
          <div className="flex flex-col items-center gap-3 text-center py-2">
            <div className="w-12 h-12 rounded-full bg-[#DCFCE7] flex items-center justify-center mb-1">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#16A34A" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#111827] m-0">Revisa tu correo</h2>
            <p className="text-sm text-[#6B7280] m-0 leading-relaxed">
              Si existe una cuenta con <span className="font-semibold text-[#374151]">{correo}</span>, recibirás un enlace para restablecer tu contraseña.
            </p>
            <button
              type="button"
              className="mt-4 w-full py-3 bg-[#B91C1C] text-white border-none rounded-lg font-sans text-sm font-bold cursor-pointer transition-all hover:bg-[#991B1B] hover:-translate-y-px active:translate-y-0"
              onClick={() => navigate('/login')}
            >
              Volver al inicio de sesión
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-[22px] font-bold text-[#111827] m-0 mb-2">Recuperar contraseña</h1>
              <p className="text-sm text-[#6B7280] m-0 leading-relaxed">
                Ingresa tu correo institucional y te enviaremos un enlace para restablecer tu contraseña.
              </p>
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
                    className={`w-full py-3 px-4 pr-11 bg-[#F9FAFB] border rounded-lg font-sans text-sm text-[#111827] outline-none transition-colors placeholder:text-[#D1D5DB] ${error ? 'border-[#EF4444] focus:border-[#EF4444]' : 'border-[#E5E7EB] focus:border-[#B91C1C]'}`}
                    placeholder="ejemplo@ufps.edu.co"
                    value={correo}
                    onChange={(e) => { setCorreo(e.target.value); setError(''); }}
                    aria-invalid={!!error}
                  />
                  <span className="absolute right-3.5 flex items-center text-[#9CA3AF] pointer-events-none" aria-hidden="true">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                </div>
                {error && <p className="text-xs text-[#EF4444] m-0" role="alert">{error}</p>}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#B91C1C] text-white border-none rounded-lg font-sans text-base font-bold cursor-pointer transition-all hover:bg-[#991B1B] hover:-translate-y-px active:translate-y-0 mt-1 disabled:cursor-not-allowed disabled:opacity-80 disabled:translate-y-0"
                disabled={enviando}
              >
                {enviando ? 'Enviando...' : 'Enviar enlace de recuperación'}
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
