import type { ReactNode } from 'react';
import Breadcrumb from './Breadcrumb';

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
    <div className="max-w-[680px] animate-slide-up">
      <Breadcrumb segmentos={breadcrumb} />

      <div className="mt-2.5 mb-6">
        <h1 className="text-[28px] font-bold text-[#111111] tracking-[-0.02em] leading-tight mb-1.5">{titulo}</h1>
        {subtitulo && <p className="text-sm text-[#6B6B6B]">{subtitulo}</p>}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-[#EBEBEB] p-7">
        <div className="flex flex-col gap-6">
          {children}
        </div>

        <div className="flex justify-end items-center gap-3 mt-8 pt-5 border-t border-[#F0F0F0]">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-[18px] py-[9px] rounded-lg font-sans text-[13px] font-semibold cursor-pointer bg-white text-[#111111] border border-[#E0E0E0] transition-all hover:bg-[#F2F2F2] hover:-translate-y-px active:translate-y-0 disabled:opacity-60 disabled:translate-y-0"
            onClick={onCancelar}
            disabled={guardando}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-[18px] py-[9px] rounded-lg font-sans text-[13px] font-semibold cursor-pointer bg-[#C0392B] text-white border-none transition-all hover:bg-[#96281B] hover:-translate-y-px active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0"
            onClick={onGuardar}
            disabled={guardando}
          >
            {guardando && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />}
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
  const inputCls = `w-full px-3.5 py-2.5 border-[1.5px] rounded-lg font-sans text-sm text-[#111111] bg-white transition-colors outline-none placeholder:text-[#BBBBBB] focus:border-[#C0392B] ${error ? 'border-[#EF4444]' : 'border-[#D1D5DB]'}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-semibold text-[#111111] block">
        {label}
        {requerido && <span className="text-[#EF4444]"> *</span>}
      </label>
      <input
        type="text"
        className={inputCls}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${label}-error` : undefined}
      />
      {error && (
        <p className="text-xs text-[#EF4444] m-0" id={`${label}-error`} role="alert">
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
  const inputCls = `w-full px-3.5 py-2.5 border-[1.5px] rounded-lg font-sans text-sm text-[#111111] bg-white transition-colors outline-none placeholder:text-[#BBBBBB] focus:border-[#C0392B] resize-y min-h-[96px] leading-relaxed ${error ? 'border-[#EF4444]' : 'border-[#D1D5DB]'}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-semibold text-[#111111] block">
        {label}
        {requerido && <span className="text-[#EF4444]"> *</span>}
      </label>
      <textarea
        className={inputCls}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={filas}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${label}-error` : undefined}
      />
      {error && (
        <p className="text-xs text-[#EF4444] m-0" id={`${label}-error`} role="alert">
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
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-4">
        <span className="text-[13px] font-semibold text-[#111111]">{label}</span>
        <button
          type="button"
          role="switch"
          aria-checked={valor}
          className={`relative w-11 h-6 rounded-full border-none cursor-pointer transition-colors duration-200 shrink-0 p-0 ${valor ? 'bg-[#B91C1C]' : 'bg-[#D1D5DB]'}`}
          onClick={() => !disabled && onChange(!valor)}
          disabled={disabled}
        >
          <span
            className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white block shadow-sm transition-all duration-200 ${valor ? 'left-[23px]' : 'left-[3px]'}`}
          />
        </button>
      </div>
      <p className="text-xs text-[#6B6B6B] m-0">
        {valor ? textoActivo : textoInactivo}
      </p>
    </div>
  );
}
