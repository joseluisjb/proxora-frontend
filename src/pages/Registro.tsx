import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { usuariosService } from '../services/usuarios.service';

interface RegistroFormState {
  nombre: string
  apellido: string
  correo: string
  contrasena: string
  confirmarContrasena: string
  mostrarContrasena: boolean
  mostrarConfirmar: boolean
  registrando: boolean
  errores: {
    nombre?: string
    apellido?: string
    correo?: string
    contrasena?: string
    confirmarContrasena?: string
    general?: string
  }
  exito: boolean
}

function esEmailValido(correo: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

export default function Registro() {
  const navigate = useNavigate();

  const [estado, setEstado] = useState<RegistroFormState>({
    nombre: '',
    apellido: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
    mostrarContrasena: false,
    mostrarConfirmar: false,
    registrando: false,
    errores: {},
    exito: false,
  });

  const set = (campo: Partial<RegistroFormState>) =>
    setEstado((prev) => ({ ...prev, ...campo }));

  const limpiarError = (campo: keyof RegistroFormState['errores']) =>
    setEstado((prev) => ({ ...prev, errores: { ...prev.errores, [campo]: undefined } }));

  const handleContrasenaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setEstado((prev) => ({
      ...prev,
      contrasena: valor,
      errores: {
        ...prev.errores,
        contrasena: valor && valor.length < 8 ? 'La contraseña debe tener al menos 8 caracteres' : undefined,
        confirmarContrasena: prev.confirmarContrasena
          ? (prev.confirmarContrasena !== valor ? 'Las contraseñas no coinciden' : undefined)
          : prev.errores.confirmarContrasena,
      },
    }));
  };

  const handleConfirmarContrasenaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setEstado((prev) => ({
      ...prev,
      confirmarContrasena: valor,
      errores: {
        ...prev.errores,
        confirmarContrasena: valor && valor !== prev.contrasena ? 'Las contraseñas no coinciden' : undefined,
      },
    }));
  };

  const validar = (): boolean => {
    const errores: RegistroFormState['errores'] = {};
    if (!estado.nombre.trim()) errores.nombre = 'El nombre es obligatorio';
    else if (estado.nombre.trim().length < 2) errores.nombre = 'El nombre debe tener al menos 2 caracteres';
    if (!estado.apellido.trim()) errores.apellido = 'El apellido es obligatorio';
    else if (estado.apellido.trim().length < 2) errores.apellido = 'El apellido debe tener al menos 2 caracteres';
    if (!estado.correo.trim()) errores.correo = 'El correo institucional es obligatorio';
    else if (!esEmailValido(estado.correo)) errores.correo = 'Ingresa un correo electrónico válido';
    if (!estado.contrasena) errores.contrasena = 'La contraseña es obligatoria';
    else if (estado.contrasena.length < 8) errores.contrasena = 'La contraseña debe tener al menos 8 caracteres';
    if (!estado.confirmarContrasena) errores.confirmarContrasena = 'Debes confirmar tu contraseña';
    else if (estado.confirmarContrasena !== estado.contrasena) errores.confirmarContrasena = 'Las contraseñas no coinciden';
    if (Object.keys(errores).length > 0) { set({ errores }); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validar()) return;
    set({ registrando: true, errores: {} });

    try {
      await usuariosService.crear({
        nombre: estado.nombre.trim(),
        apellido: estado.apellido.trim(),
        correo: estado.correo.trim(),
        contrasena: estado.contrasena,
      });
      set({ registrando: false, exito: true });
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      let mensaje = 'No se pudo conectar con el servidor. Intenta de nuevo.';
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 409) {
          mensaje = 'Ya existe una cuenta registrada con ese correo';
        } else if (err.response.status === 400) {
          mensaje = 'Por favor verifica los datos ingresados';
        } else {
          mensaje = 'Ocurrió un error al crear la cuenta. Intenta de nuevo.';
        }
      }
      set({ registrando: false, errores: { general: mensaje } });
    }
  };

  const inputCls = (hasError: boolean) =>
    `w-full py-2.5 px-3.5 bg-white border rounded-lg font-sans text-sm text-[#111827] outline-none transition-colors box-border placeholder:text-[#9CA3AF] focus:border-[#B91C1C] ${hasError ? 'border-[#EF4444]' : 'border-[#D1D5DB]'}`;

  const iconoDerBtn = "absolute right-3 flex items-center text-[#9CA3AF] bg-none border-none cursor-pointer p-0.5 rounded transition-colors hover:text-[#6B7280] z-[1]";
  const iconoIzqSpan = "absolute left-3 flex items-center text-[#9CA3AF] pointer-events-none z-[1]";

  const EyeOpen = () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
  const EyeClosed = () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );

  return (
    <div className="min-h-screen w-screen bg-[#F3F4F6] flex flex-col items-center pb-12">
      <div className="flex items-center gap-2.5 pt-12 mb-6">
        <svg className="w-7 h-7 text-[#B91C1C] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
        <span className="text-[22px] font-bold text-[#111827] tracking-[0.15em] font-sans">PROXORA</span>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-xl w-[460px] p-10 max-sm:w-[92%] max-sm:p-6 animate-scale-in">
        {estado.exito ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div aria-hidden="true">
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="#16A34A" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#111827] m-0 font-sans">¡Cuenta creada exitosamente!</h2>
            <p className="text-sm text-[#6B7280] m-0 leading-relaxed font-sans">
              Tu cuenta ha sido registrada. Serás redirigido al inicio de sesión en unos segundos.
            </p>
            <a href="/login" className="text-[#B91C1C] text-sm underline font-sans mt-1 hover:text-[#991B1B]" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
              Ir al inicio de sesión ahora →
            </a>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#111827] m-0 mb-2 font-sans">Crea tu cuenta de estudiante</h1>
              <p className="text-sm text-[#6B7280] m-0 leading-relaxed font-sans">
                Regístrate para acceder a proyectos académicos, líneas de investigación y recursos institucionales.
              </p>
            </div>

            {estado.errores.general && (
              <div className="bg-[#FEF2F2] border-l-[3px] border-[#EF4444] rounded-md px-4 py-3 text-[#B91C1C] text-sm mb-4 font-sans" role="alert">
                {estado.errores.general}
              </div>
            )}

            <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
              <div className="flex gap-4 max-sm:flex-col max-sm:gap-5">
                <div className="flex flex-col gap-1.5 flex-1">
                  <label htmlFor="nombre" className="text-[13px] font-medium text-[#374151] font-sans">Nombre(s)</label>
                  <input id="nombre" type="text" autoComplete="given-name" className={inputCls(!!estado.errores.nombre)} placeholder="Ej. Juan Andrés" value={estado.nombre} onChange={(e) => { set({ nombre: e.target.value }); limpiarError('nombre'); }} aria-invalid={!!estado.errores.nombre} />
                  {estado.errores.nombre && <p id="error-nombre" className="text-xs text-[#EF4444] m-0 font-sans" role="alert">{estado.errores.nombre}</p>}
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <label htmlFor="apellido" className="text-[13px] font-medium text-[#374151] font-sans">Apellido(s)</label>
                  <input id="apellido" type="text" autoComplete="family-name" className={inputCls(!!estado.errores.apellido)} placeholder="Ej. Pérez García" value={estado.apellido} onChange={(e) => { set({ apellido: e.target.value }); limpiarError('apellido'); }} aria-invalid={!!estado.errores.apellido} />
                  {estado.errores.apellido && <p id="error-apellido" className="text-xs text-[#EF4444] m-0 font-sans" role="alert">{estado.errores.apellido}</p>}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="correo" className="text-[13px] font-medium text-[#374151] font-sans">Correo Institucional</label>
                <div className="relative flex items-center">
                  <span className={iconoIzqSpan} aria-hidden="true">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input id="correo" type="email" autoComplete="email" className={`${inputCls(!!estado.errores.correo)} pl-10`} placeholder="student@ufps.edu.co" value={estado.correo} onChange={(e) => { set({ correo: e.target.value }); limpiarError('correo'); }} aria-invalid={!!estado.errores.correo} />
                </div>
                {estado.errores.correo && <p id="error-correo" className="text-xs text-[#EF4444] m-0 font-sans" role="alert">{estado.errores.correo}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="contrasena" className="text-[13px] font-medium text-[#374151] font-sans">Contraseña</label>
                <div className="relative flex items-center">
                  <span className={iconoIzqSpan} aria-hidden="true">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input id="contrasena" type={estado.mostrarContrasena ? 'text' : 'password'} autoComplete="new-password" className={`${inputCls(!!estado.errores.contrasena)} pl-10 pr-10`} placeholder="••••••••" value={estado.contrasena} onChange={handleContrasenaChange} aria-invalid={!!estado.errores.contrasena} />
                  <button type="button" className={iconoDerBtn} onClick={() => set({ mostrarContrasena: !estado.mostrarContrasena })} aria-label={estado.mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                    {estado.mostrarContrasena ? <EyeClosed /> : <EyeOpen />}
                  </button>
                </div>
                {estado.errores.contrasena && <p id="error-contrasena" className="text-xs text-[#EF4444] m-0 font-sans" role="alert">{estado.errores.contrasena}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirmarContrasena" className="text-[13px] font-medium text-[#374151] font-sans">Confirmar Contraseña</label>
                <div className="relative flex items-center">
                  <span className={iconoIzqSpan} aria-hidden="true">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </span>
                  <input id="confirmarContrasena" type={estado.mostrarConfirmar ? 'text' : 'password'} autoComplete="new-password" className={`${inputCls(!!estado.errores.confirmarContrasena)} pl-10 pr-10`} placeholder="••••••••" value={estado.confirmarContrasena} onChange={handleConfirmarContrasenaChange} aria-invalid={!!estado.errores.confirmarContrasena} />
                  <button type="button" className={iconoDerBtn} onClick={() => set({ mostrarConfirmar: !estado.mostrarConfirmar })} aria-label={estado.mostrarConfirmar ? 'Ocultar confirmación' : 'Mostrar confirmación'}>
                    {estado.mostrarConfirmar ? <EyeClosed /> : <EyeOpen />}
                  </button>
                </div>
                {estado.errores.confirmarContrasena && <p id="error-confirmar" className="text-xs text-[#EF4444] m-0 font-sans" role="alert">{estado.errores.confirmarContrasena}</p>}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#B91C1C] text-white border-none rounded-lg font-sans text-base font-bold cursor-pointer transition-all hover:bg-[#991B1B] hover:-translate-y-px active:translate-y-0 flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-80 disabled:translate-y-0"
                disabled={estado.registrando}
              >
                {estado.registrando ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                    <span>Creando cuenta...</span>
                  </>
                ) : (
                  <>
                    <span>Crear cuenta</span>
                    <span aria-hidden="true">→</span>
                  </>
                )}
              </button>

              <p className="text-center text-sm text-[#6B7280] m-0 font-sans">
                <span>¿Ya tienes cuenta? </span>
                <a href="/login" className="text-[#B91C1C] underline cursor-pointer font-sans text-sm hover:text-[#991B1B]" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
                  Iniciar sesión
                </a>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
