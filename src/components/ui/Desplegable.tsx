import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface OpcionDesplegable {
  valor: string;
  etiqueta: string;
}

interface DesplegableProps {
  valor: string;
  onChange: (valor: string) => void;
  opciones: OpcionDesplegable[];
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
  error?: boolean;
}

interface Coordenadas {
  top: number;
  left: number;
  width: number;
  origen: 'top' | 'bottom';
}

const MARGEN_PANTALLA = 8;

export default function Desplegable({
  valor,
  onChange,
  opciones,
  ariaLabel,
  disabled = false,
  className = '',
  error = false,
}: DesplegableProps) {
  const [abierto, setAbierto] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const [resaltado, setResaltado] = useState(0);
  const [coords, setCoords] = useState<Coordenadas | null>(null);
  const botonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const indiceActual = Math.max(0, opciones.findIndex((o) => o.valor === valor));
  const etiquetaActual = opciones[indiceActual]?.etiqueta ?? '';

  // Posición inicial "ingenua" (debajo, alineado a la izquierda) solo para que el panel
  // tenga un tamaño real que medir. useLayoutEffect la corrige antes de pintar.
  const posicionInicial = () => {
    const r = botonRef.current?.getBoundingClientRect();
    if (!r) return;
    setCoords({ top: r.bottom + 4, left: r.left, width: r.width, origen: 'top' });
  };

  const ajustarAPantalla = () => {
    const boton = botonRef.current?.getBoundingClientRect();
    const panel = panelRef.current?.getBoundingClientRect();
    if (!boton || !panel) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Horizontal: que no se salga por la derecha ni por la izquierda.
    let left = boton.left;
    if (left + panel.width > vw - MARGEN_PANTALLA) {
      left = vw - MARGEN_PANTALLA - panel.width;
    }
    if (left < MARGEN_PANTALLA) left = MARGEN_PANTALLA;

    // Vertical: si no entra abajo pero sí arriba, se voltea hacia arriba del botón.
    const espacioAbajo = vh - boton.bottom;
    const espacioArriba = boton.top;
    const entraAbajo = espacioAbajo >= panel.height + MARGEN_PANTALLA;
    const abrirArriba = !entraAbajo && espacioArriba > espacioAbajo;

    const top = abrirArriba ? boton.top - panel.height - 4 : boton.bottom + 4;

    setCoords({ top, left, width: boton.width, origen: abrirArriba ? 'bottom' : 'top' });
  };

  useLayoutEffect(() => {
    if (abierto) ajustarAPantalla();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, opciones.length]);

  const cerrar = () => {
    if (!abierto || cerrando) return;
    setCerrando(true);
  };

  const abrir = () => {
    if (disabled) return;
    setResaltado(indiceActual);
    posicionInicial();
    setAbierto(true);
  };

  useEffect(() => {
    if (!abierto) return;
    function handlerClick(e: MouseEvent) {
      const target = e.target as Node;
      if (botonRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      cerrar();
    }
    function handlerReposicionar() {
      ajustarAPantalla();
    }
    document.addEventListener('mousedown', handlerClick);
    window.addEventListener('scroll', handlerReposicionar, true);
    window.addEventListener('resize', handlerReposicionar);
    return () => {
      document.removeEventListener('mousedown', handlerClick);
      window.removeEventListener('scroll', handlerReposicionar, true);
      window.removeEventListener('resize', handlerReposicionar);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, cerrando]);

  const seleccionar = (op: OpcionDesplegable) => {
    onChange(op.valor);
    cerrar();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!abierto) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        abrir();
      }
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      cerrar();
      botonRef.current?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setResaltado((i) => Math.min(opciones.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setResaltado((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const op = opciones[resaltado];
      if (op) seleccionar(op);
    }
  };

  return (
    <>
      <button
        ref={botonRef}
        type="button"
        disabled={disabled}
        onClick={() => (abierto ? cerrar() : abrir())}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-label={ariaLabel}
        className={`flex items-center justify-between gap-2 px-3 py-2 border-[1.5px] rounded-lg font-sans text-[13px] text-[#111111] bg-white cursor-pointer transition-colors min-w-[140px] focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed ${
          error ? 'border-[#EF4444]' : abierto ? 'border-[#C0392B]' : 'border-[#E0E0E0] hover:border-[#C5C5C5]'
        } ${className}`}
      >
        <span className="truncate">{etiquetaActual}</span>
        <svg
          width="12"
          height="12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          className={`shrink-0 text-[#9CA3AF] transition-transform duration-200 ${abierto ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {abierto && coords &&
        createPortal(
          // Contenedor de medición/posición: SIN transform propio, para que getBoundingClientRect
          // refleje el tamaño final real y no el tamaño a mitad de la animación de escala.
          <div
            ref={panelRef}
            className="fixed z-[300]"
            style={{ top: coords.top, left: coords.left, minWidth: coords.width }}
          >
            <div
              role="listbox"
              className={`min-w-[140px] w-max max-w-[calc(100vw-16px)] sm:max-w-[280px] max-h-60 overflow-y-auto bg-white rounded-xl border border-[#E5E7EB] shadow-lg py-1 ${
                coords.origen === 'bottom' ? 'origin-bottom' : 'origin-top'
              } ${cerrando ? 'animate-scale-out' : 'animate-scale-in'}`}
              onAnimationEnd={() => {
                if (cerrando) {
                  setAbierto(false);
                  setCerrando(false);
                }
              }}
            >
              {opciones.map((op, i) => {
                const seleccionado = op.valor === valor;
                return (
                  <button
                    key={op.valor}
                    type="button"
                    role="option"
                    aria-selected={seleccionado}
                    onMouseEnter={() => setResaltado(i)}
                    onClick={() => seleccionar(op)}
                    className={`flex items-center justify-between gap-2 w-full px-3.5 py-2 text-[13px] text-left transition-colors duration-100 ${
                      seleccionado
                        ? 'text-[#C0392B] bg-[#FDECEA] font-semibold'
                        : i === resaltado
                        ? 'bg-[#F9FAFB] text-[#111111]'
                        : 'text-[#374151]'
                    }`}
                  >
                    <span className="truncate min-w-0 flex-1">{op.etiqueta}</span>
                    {seleccionado && (
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="shrink-0" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
