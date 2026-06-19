import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export type VarianteAlerta = 'exito' | 'error' | 'info' | 'advertencia';

export interface AlertaProps {
  abierto: boolean;
  mensaje: string;
  variante?: VarianteAlerta;
  onCerrar: () => void;
}

const CONFIG: Record<VarianteAlerta, { clases: string; icono: React.ReactNode }> = {
  exito: {
    clases: 'bg-[#F0FDF4] border-[#86EFAC] text-[#15803D]',
    icono: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  error: {
    clases: 'bg-[#FEF2F2] border-[#FCA5A5] text-[#B91C1C]',
    icono: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    ),
  },
  info: {
    clases: 'bg-[#EFF6FF] border-[#93C5FD] text-[#1D4ED8]',
    icono: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
    ),
  },
  advertencia: {
    clases: 'bg-[#FFFBEB] border-[#FCD34D] text-[#B45309]',
    icono: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
};

export default function Alerta({ abierto, mensaje, variante = 'info', onCerrar }: AlertaProps) {
  const [visible, setVisible] = useState(false);
  const [cerrando, setCerrando] = useState(false);

  useEffect(() => {
    if (abierto) { setVisible(true); setCerrando(false); }
  }, [abierto]);

  useEffect(() => {
    if (!abierto && visible) setCerrando(true);
  }, [abierto, visible]);

  if (!visible) return null;

  const { clases, icono } = CONFIG[variante];

  return createPortal(
    <div
      role="alert"
      aria-live="polite"
      onAnimationEnd={() => { if (cerrando) { setVisible(false); setCerrando(false); } }}
      className={`fixed top-5 left-1/2 z-[9999] min-w-[300px] max-w-[480px] w-max ${cerrando ? 'animate-alert-out' : 'animate-alert-in'}`}
    >
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${clases}`}>
        <span className="shrink-0">{icono}</span>
        <p className="text-[13px] font-semibold leading-snug flex-1">{mensaje}</p>
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar alerta"
          className="shrink-0 ml-1 p-0.5 rounded-md opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>,
    document.body,
  );
}
