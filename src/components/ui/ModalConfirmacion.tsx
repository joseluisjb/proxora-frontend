import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export type VarianteModal = 'peligro' | 'advertencia';

export interface ModalConfirmacionProps {
  abierto: boolean;
  titulo: string;
  mensaje: string;
  labelConfirmar?: string;
  variante?: VarianteModal;
  cargando?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

const ICONO_PELIGRO = (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#C0392B" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

const ICONO_ADVERTENCIA = (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#D97706" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>
);

export default function ModalConfirmacion({
  abierto,
  titulo,
  mensaje,
  labelConfirmar = 'Confirmar',
  variante = 'peligro',
  cargando = false,
  onConfirmar,
  onCancelar,
}: ModalConfirmacionProps) {
  const [visible, setVisible] = useState(false);
  const [cerrando, setCerrando] = useState(false);

  useEffect(() => {
    if (abierto) {
      setVisible(true);
      setCerrando(false);
    }
  }, [abierto]);

  useEffect(() => {
    if (!abierto && visible) {
      setCerrando(true);
    }
  }, [abierto, visible]);

  useEffect(() => {
    if (!abierto) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && !cargando) onCancelar(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [abierto, cargando, onCancelar]);

  if (!visible) return null;

  const esPeligro = variante === 'peligro';

  const handleCardAnimationEnd = () => {
    if (cerrando) {
      setVisible(false);
      setCerrando(false);
    }
  };

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center ${cerrando ? 'animate-fade-out' : 'animate-fade-in'}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-confirmacion-titulo"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={!cargando ? onCancelar : undefined}
      />
      <div
        className={`relative bg-white rounded-xl shadow-2xl w-full max-w-[400px] mx-4 p-6 ${cerrando ? 'animate-scale-out' : 'animate-scale-in'}`}
        onAnimationEnd={handleCardAnimationEnd}
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${esPeligro ? 'bg-[#FEE2E2]' : 'bg-[#FEF3C7]'}`}>
          {esPeligro ? ICONO_PELIGRO : ICONO_ADVERTENCIA}
        </div>

        <h2 id="modal-confirmacion-titulo" className="text-center text-[15px] font-bold text-[#111111] mb-2">
          {titulo}
        </h2>
        <p className="text-center text-[13px] text-[#6B6B6B] leading-relaxed mb-6">
          {mensaje}
        </p>

        <div className="flex gap-3">
          <button
            className="flex-1 px-4 py-2.5 rounded-lg border-[1.5px] border-[#E0E0E0] bg-white text-[#3D3D3D] font-semibold text-[13px] cursor-pointer hover:bg-[#F8F8F8] transition-all disabled:opacity-60"
            onClick={onCancelar}
            disabled={cargando}
          >
            Cancelar
          </button>
          <button
            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-[13px] cursor-pointer transition-all text-white disabled:opacity-60 disabled:cursor-not-allowed ${
              esPeligro
                ? 'bg-[#C0392B] hover:bg-[#A93226]'
                : 'bg-[#D97706] hover:bg-[#B45309]'
            }`}
            onClick={onConfirmar}
            disabled={cargando}
          >
            {cargando && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />}
            {cargando ? 'Procesando...' : labelConfirmar}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
