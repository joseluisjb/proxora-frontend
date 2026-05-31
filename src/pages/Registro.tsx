import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Registro.css';

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
    setEstado((prev) => ({
      ...prev,
      errores: { ...prev.errores, [campo]: undefined },
    }));

  const validar = (): boolean => {
    const errores: RegistroFormState['errores'] = {};

    if (!estado.nombre.trim()) {
      errores.nombre = 'El nombre es obligatorio';
    } else if (estado.nombre.trim().length < 2) {
      errores.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!estado.apellido.trim()) {
      errores.apellido = 'El apellido es obligatorio';
    } else if (estado.apellido.trim().length < 2) {
      errores.apellido = 'El apellido debe tener al menos 2 caracteres';
    }

    if (!estado.correo.trim()) {
      errores.correo = 'El correo institucional es obligatorio';
    } else if (!esEmailValido(estado.correo)) {
      errores.correo = 'Ingresa un correo electrónico válido';
    }

    if (!estado.contrasena) {
      errores.contrasena = 'La contraseña es obligatoria';
    } else if (estado.contrasena.length < 8) {
      errores.contrasena = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (!estado.confirmarContrasena) {
      errores.confirmarContrasena = 'Debes confirmar tu contraseña';
    } else if (estado.confirmarContrasena !== estado.contrasena) {
      errores.confirmarContrasena = 'Las contraseñas no coinciden';
    }

    if (Object.keys(errores).length > 0) {
      set({ errores });
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validar()) return;

    set({ registrando: true, errores: {} });

    // TODO: conectar con API POST /api/auth/registro cuando
    // el backend implemente el endpoint de registro
    setTimeout(() => {
      set({ registrando: false, exito: true });
      setTimeout(() => navigate('/'), 2500);
    }, 1200);
  };

  return (
    <div className="reg-page">
      {/* Logo fuera de la tarjeta */}
      <div className="reg-logo">
        <svg
          className="reg-logo__icono"
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
        <span className="reg-logo__texto">PROXORA</span>
      </div>

      {/* Tarjeta */}
      <div className="reg-card">
        {estado.exito ? (
          /* Estado de éxito */
          <div className="reg-exito">
            <div className="reg-exito__icono" aria-hidden="true">
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="#16A34A" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="reg-exito__titulo">¡Cuenta creada exitosamente!</h2>
            <p className="reg-exito__subtitulo">
              Tu cuenta ha sido registrada. Serás redirigido al inicio de sesión en unos segundos.
            </p>
            <a href="/" className="reg-exito__link" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
              Ir al inicio de sesión ahora →
            </a>
          </div>
        ) : (
          /* Formulario */
          <>
            {/* Encabezado */}
            <div className="reg-encabezado">
              <h1 className="reg-titulo">Crea tu cuenta de estudiante</h1>
              <p className="reg-subtitulo">
                Regístrate para acceder a proyectos académicos, líneas de investigación y recursos institucionales.
              </p>
            </div>

            {/* Error general */}
            {estado.errores.general && (
              <div className="reg-error-general" role="alert">
                {estado.errores.general}
              </div>
            )}

            <form className="reg-form" onSubmit={handleSubmit} noValidate>

              {/* Fila: Nombre y Apellido */}
              <div className="reg-fila">
                <div className="reg-campo">
                  <label htmlFor="nombre" className="reg-label">Nombre(s)</label>
                  <input
                    id="nombre"
                    type="text"
                    autoComplete="given-name"
                    className={`reg-input ${estado.errores.nombre ? 'reg-input--error' : ''}`}
                    placeholder="Ej. Juan Andrés"
                    value={estado.nombre}
                    onChange={(e) => { set({ nombre: e.target.value }); limpiarError('nombre'); }}
                    aria-invalid={!!estado.errores.nombre}
                    aria-describedby={estado.errores.nombre ? 'error-nombre' : undefined}
                  />
                  {estado.errores.nombre && (
                    <p id="error-nombre" className="reg-error-campo" role="alert">{estado.errores.nombre}</p>
                  )}
                </div>

                <div className="reg-campo">
                  <label htmlFor="apellido" className="reg-label">Apellido(s)</label>
                  <input
                    id="apellido"
                    type="text"
                    autoComplete="family-name"
                    className={`reg-input ${estado.errores.apellido ? 'reg-input--error' : ''}`}
                    placeholder="Ej. Pérez García"
                    value={estado.apellido}
                    onChange={(e) => { set({ apellido: e.target.value }); limpiarError('apellido'); }}
                    aria-invalid={!!estado.errores.apellido}
                    aria-describedby={estado.errores.apellido ? 'error-apellido' : undefined}
                  />
                  {estado.errores.apellido && (
                    <p id="error-apellido" className="reg-error-campo" role="alert">{estado.errores.apellido}</p>
                  )}
                </div>
              </div>

              {/* Correo */}
              <div className="reg-campo">
                <label htmlFor="correo" className="reg-label">Correo Institucional</label>
                <div className="reg-input-wrap">
                  <span className="reg-input__icono-izq" aria-hidden="true">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    id="correo"
                    type="email"
                    autoComplete="email"
                    className={`reg-input reg-input--con-icono-izq ${estado.errores.correo ? 'reg-input--error' : ''}`}
                    placeholder="student@ufps.edu.co"
                    value={estado.correo}
                    onChange={(e) => { set({ correo: e.target.value }); limpiarError('correo'); }}
                    aria-invalid={!!estado.errores.correo}
                    aria-describedby={estado.errores.correo ? 'error-correo' : undefined}
                  />
                </div>
                {estado.errores.correo && (
                  <p id="error-correo" className="reg-error-campo" role="alert">{estado.errores.correo}</p>
                )}
              </div>

              {/* Contraseña */}
              <div className="reg-campo">
                <label htmlFor="contrasena" className="reg-label">Contraseña</label>
                <div className="reg-input-wrap">
                  <span className="reg-input__icono-izq" aria-hidden="true">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    id="contrasena"
                    type={estado.mostrarContrasena ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={`reg-input reg-input--con-ambos-iconos ${estado.errores.contrasena ? 'reg-input--error' : ''}`}
                    placeholder="••••••••"
                    value={estado.contrasena}
                    onChange={(e) => { set({ contrasena: e.target.value }); limpiarError('contrasena'); }}
                    aria-invalid={!!estado.errores.contrasena}
                    aria-describedby={estado.errores.contrasena ? 'error-contrasena' : undefined}
                  />
                  <button
                    type="button"
                    className="reg-input__icono-der"
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
                  <p id="error-contrasena" className="reg-error-campo" role="alert">{estado.errores.contrasena}</p>
                )}
              </div>

              {/* Confirmar Contraseña */}
              <div className="reg-campo">
                <label htmlFor="confirmarContrasena" className="reg-label">Confirmar Contraseña</label>
                <div className="reg-input-wrap">
                  <span className="reg-input__icono-izq" aria-hidden="true">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </span>
                  <input
                    id="confirmarContrasena"
                    type={estado.mostrarConfirmar ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={`reg-input reg-input--con-ambos-iconos ${estado.errores.confirmarContrasena ? 'reg-input--error' : ''}`}
                    placeholder="••••••••"
                    value={estado.confirmarContrasena}
                    onChange={(e) => { set({ confirmarContrasena: e.target.value }); limpiarError('confirmarContrasena'); }}
                    aria-invalid={!!estado.errores.confirmarContrasena}
                    aria-describedby={estado.errores.confirmarContrasena ? 'error-confirmar' : undefined}
                  />
                  <button
                    type="button"
                    className="reg-input__icono-der"
                    onClick={() => set({ mostrarConfirmar: !estado.mostrarConfirmar })}
                    aria-label={estado.mostrarConfirmar ? 'Ocultar confirmación' : 'Mostrar confirmación'}
                  >
                    {estado.mostrarConfirmar ? (
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
                {estado.errores.confirmarContrasena && (
                  <p id="error-confirmar" className="reg-error-campo" role="alert">{estado.errores.confirmarContrasena}</p>
                )}
              </div>

              {/* Botón crear cuenta */}
              <button
                type="submit"
                className="reg-btn-primario"
                disabled={estado.registrando}
                style={estado.registrando ? { cursor: 'not-allowed', opacity: 0.8 } : {}}
              >
                {estado.registrando ? 'Creando cuenta...' : (
                  <>Crear cuenta <span aria-hidden="true">→</span></>
                )}
              </button>

              {/* Enlace iniciar sesión */}
              <p className="reg-enlace-login">
                <span>¿Ya tienes cuenta? </span>
                <a
                  href="/"
                  className="reg-enlace-login__link"
                  onClick={(e) => { e.preventDefault(); navigate('/'); }}
                >
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
