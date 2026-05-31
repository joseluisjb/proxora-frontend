import type { ReactNode } from 'react';
import Breadcrumb from './Breadcrumb';
import './FormularioAdmin.css';

/* ─── FormularioAdmin ─────────────────────────────── */

interface FormularioAdminProps {
  titulo: string;
  subtitulo?: string;
  breadcrumb: Array<{ label: string; href?: string }>;
  onCancelar: () => void;
  onGuardar: () => void;
  guardando?: boolean;
  children: ReactNode;
}

export default function FormularioAdmin({
  titulo,
  subtitulo,
  breadcrumb,
  onCancelar,
  onGuardar,
  guardando = false,
  children,
}: FormularioAdminProps) {
  return (
    <div className="form-admin">
      <Breadcrumb segmentos={breadcrumb} />

      <div className="form-admin__encabezado">
        <h1 className="form-admin__titulo">{titulo}</h1>
        {subtitulo && <p className="form-admin__subtitulo">{subtitulo}</p>}
      </div>

      <div className="card form-admin__card">
        <div className="form-admin__campos">
          {children}
        </div>

        <div className="form-admin__footer">
          <button
            type="button"
            className="btn btn-secundario"
            onClick={onCancelar}
            disabled={guardando}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-primario"
            onClick={onGuardar}
            disabled={guardando}
            style={guardando ? { cursor: 'not-allowed', opacity: 0.7 } : {}}
          >
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── CampoTexto ──────────────────────────────────── */

interface CampoTextoProps {
  label: string;
  valor: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  error?: string;
  requerido?: boolean;
  disabled?: boolean;
}

export function CampoTexto({
  label,
  valor,
  onChange,
  placeholder,
  error,
  requerido = false,
  disabled = false,
}: CampoTextoProps) {
  return (
    <div className="campo">
      <label className="campo__label">
        {label}
        {requerido && <span className="campo__requerido"> *</span>}
      </label>
      <input
        type="text"
        className={`campo__input ${error ? 'campo__input--error' : ''}`}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${label}-error` : undefined}
      />
      {error && (
        <p className="campo__error" id={`${label}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/* ─── CampoTextarea ───────────────────────────────── */

interface CampoTextareaProps {
  label: string;
  valor: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  error?: string;
  requerido?: boolean;
  filas?: number;
  disabled?: boolean;
}

export function CampoTextarea({
  label,
  valor,
  onChange,
  placeholder,
  error,
  requerido = false,
  filas = 4,
  disabled = false,
}: CampoTextareaProps) {
  return (
    <div className="campo">
      <label className="campo__label">
        {label}
        {requerido && <span className="campo__requerido"> *</span>}
      </label>
      <textarea
        className={`campo__input campo__textarea ${error ? 'campo__input--error' : ''}`}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={filas}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${label}-error` : undefined}
      />
      {error && (
        <p className="campo__error" id={`${label}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/* ─── CampoToggle ─────────────────────────────────── */

interface CampoToggleProps {
  label: string;
  valor: boolean;
  onChange: (valor: boolean) => void;
  textoActivo?: string;
  textoInactivo?: string;
  disabled?: boolean;
}

export function CampoToggle({
  label,
  valor,
  onChange,
  textoActivo = 'Activo – visible para los usuarios',
  textoInactivo = 'Inactivo – no aparecerá en las opciones disponibles',
  disabled = false,
}: CampoToggleProps) {
  return (
    <div className="campo">
      <div className="campo-toggle__fila">
        <span className="campo__label" style={{ marginBottom: 0 }}>{label}</span>
        <button
          type="button"
          role="switch"
          aria-checked={valor}
          className={`campo-toggle__pill ${valor ? 'campo-toggle__pill--on' : ''}`}
          onClick={() => !disabled && onChange(!valor)}
          disabled={disabled}
        >
          <span className="campo-toggle__circulo" />
        </button>
      </div>
      <p className="campo-toggle__desc">
        {valor ? textoActivo : textoInactivo}
      </p>
    </div>
  );
}
