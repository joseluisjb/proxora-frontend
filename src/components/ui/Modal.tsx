import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const MAX_WIDTHS = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

const CLOSE_DURATION = 200;

export default function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  const [rendered, setRendered] = useState(open);
  const [closing, setClosing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Freeze title and children when open so they don't disappear during close animation
  const frozenTitle = useRef(title);
  const frozenChildren = useRef(children);
  if (open) {
    frozenTitle.current = title;
    frozenChildren.current = children;
  }

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (open) {
      setRendered(true);
      setClosing(false);
    } else {
      setClosing(true);
      timerRef.current = setTimeout(() => {
        setRendered(false);
        setClosing(false);
      }, CLOSE_DURATION);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [open]);

  useEffect(() => {
    if (!rendered) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [rendered]);

  useEffect(() => {
    if (!rendered) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [rendered, onClose]);

  if (!rendered) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40 ${
        closing ? 'animate-backdrop-out' : 'animate-backdrop-in'
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-xl shadow-xl w-full ${MAX_WIDTHS[size]} p-6 ${
          closing ? 'animate-modal-out' : 'animate-modal-in'
        }`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 id="modal-title" className="text-[15px] font-semibold text-[#111111]">
            {frozenTitle.current}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-[#6B6B6B] hover:bg-[#F2F2F2] cursor-pointer transition-colors"
            aria-label="Cerrar"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {frozenChildren.current}
      </div>
    </div>,
    document.body
  );
}
