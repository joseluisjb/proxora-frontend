import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { evaluacionesService } from '../../services/estudiante/evaluaciones.service';
import type { ProyectoResponse, EvaluacionResponse } from '../../types/api.types';
import { useAlertaContext } from '../../context/AlertaContext';
import { extraerMensajeError } from '../../utils/errores';

function Iniciales({ nombre, apellido }: { nombre: string; apellido: string }) {
  return (
    <div className="w-7 h-7 rounded-full bg-[#B91C1C] flex items-center justify-center text-white text-[10px] font-bold shrink-0 select-none">
      {nombre[0]?.toUpperCase()}{apellido[0]?.toUpperCase()}
    </div>
  );
}

function formatearFechaHora(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('es-CO', { month: 'long', day: 'numeric', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  );
}

function BarraPuntaje({ puntuacion, max = 5 }: { puntuacion: number; max?: number }) {
  const pct = Math.min((puntuacion / max) * 100, 100);
  return (
    <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{
          width: `${pct}%`,
          background: pct >= 80 ? '#0D9488' : pct >= 60 ? '#D97706' : '#B91C1C',
        }}
      />
    </div>
  );
}

function TarjetaEvaluacion({ ev }: { ev: EvaluacionResponse }) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm px-4 py-3.5 flex flex-col gap-2.5 animate-slide-up">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-[#9CA3AF]">
            {formatearFechaHora(ev.creadoEn)} ·{' '}
            <span className="font-medium text-[#6B7280]">
              {ev.docente.nombre} {ev.docente.apellido}
            </span>
          </p>
        </div>
        <div className="flex items-baseline gap-1 shrink-0">
          <span className="text-[22px] font-bold text-[#111827] leading-none">{ev.calificacion.toFixed(1)}</span>
          <span className="text-[11px] text-[#9CA3AF]">/ 5.0</span>
        </div>
      </div>

      <BarraPuntaje puntuacion={ev.calificacion} />

      {ev.comentario && (
        <div className="pt-1">
          <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-[0.08em] mb-1.5">Retroalimentación</p>
          <div className="flex gap-2.5 bg-[#F9FAFB] border border-[#F3F4F6] rounded-lg px-3 py-2.5">
            <Iniciales nombre={ev.docente.nombre} apellido={ev.docente.apellido} />
            <div className="flex-1 min-w-0 self-center">
              <p className="text-[12px] text-[#374151] leading-relaxed">{ev.comentario}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EvaluacionDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { mostrarAlerta } = useAlertaContext();

  const [proyecto, setProyecto] = useState<ProyectoResponse | null>(null);
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionResponse[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!id) return;
    setCargando(true);
    setError(null);
    try {
      const proy = await evaluacionesService.obtenerProyecto(id);
      setProyecto(proy);
      try {
        const evs = await evaluacionesService.listarEvaluaciones(id);
        setEvaluaciones(evs);
      } catch {
        setEvaluaciones([]);
      }
    } catch (err) {
      setError('No se pudo cargar la información del proyecto.');
      mostrarAlerta({ mensaje: extraerMensajeError(err, 'No se pudo cargar la información del proyecto.'), variante: 'error' });
    } finally {
      setCargando(false);
    }
  }, [id, mostrarAlerta]);

  useEffect(() => { cargar(); }, [cargar]);

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-[#B91C1C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !proyecto) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-[14px] text-[#6B7280]">{error ?? 'Proyecto no encontrado.'}</p>
        <button
          type="button"
          onClick={() => navigate('/estudiante/evaluaciones')}
          className="px-4 py-2 text-[13px] font-semibold text-white bg-[#B91C1C] rounded-lg hover:bg-[#991B1B] transition-colors duration-150"
        >
          Volver
        </button>
      </div>
    );
  }

  const ultimaNota = evaluaciones.length > 0 ? evaluaciones[0].calificacion : null;

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <button
        type="button"
        onClick={() => navigate('/estudiante/evaluaciones')}
        className="flex items-center gap-1.5 text-[13px] text-[#9CA3AF] hover:text-[#B91C1C] transition-colors duration-150 mb-5 group"
      >
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" className="group-hover:-translate-x-0.5 transition-transform duration-150">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Evaluaciones
      </button>

      {/* Header */}
      <div className="mb-6 animate-slide-up">
        <h1 className="text-2xl font-bold text-[#111827] mb-1">Evaluaciones y Retroalimentación</h1>
        <p className="text-[13px] text-[#6B7280] flex items-center gap-2 flex-wrap">
          <span className="truncate max-w-[320px]">{proyecto.titulo}</span>
          {proyecto.semestre && (
            <>
              <span className="inline-block w-1 h-1 rounded-full bg-[#D1D5DB]" aria-hidden="true" />
              <span>{proyecto.semestre}</span>
            </>
          )}
        </p>
      </div>

      {/* Nota final */}
      {ultimaNota !== null && (
        <div className="flex items-center gap-4 bg-white rounded-xl border border-[#E5E7EB] shadow-sm px-5 py-4 mb-5 animate-slide-up">
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-[0.08em]">
              Nota Final
            </span>
            <span className="text-[28px] font-bold text-[#111827] leading-tight">
              {ultimaNota.toFixed(2)}
            </span>
          </div>
          <div className="flex-1">
            <BarraPuntaje puntuacion={ultimaNota} />
          </div>
          <div className="text-[13px] text-[#6B7280]">
            {evaluaciones.length} {evaluaciones.length === 1 ? 'evaluación' : 'evaluaciones'}
          </div>
        </div>
      )}

      {/* Historial */}
      {evaluaciones.length > 0 && (
        <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-[0.08em] mb-3">
          Historial
        </p>
      )}

      {/* Lista de evaluaciones */}
      {evaluaciones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-xl border border-[#E5E7EB] shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-1">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth={1.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <p className="text-[14px] font-medium text-[#374151]">Sin evaluaciones aún</p>
          <p className="text-[13px] text-[#9CA3AF] text-center max-w-[280px]">
            Las evaluaciones de este proyecto aparecerán aquí una vez que sean registradas.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {evaluaciones.map((ev) => (
            <TarjetaEvaluacion key={ev.id} ev={ev} />
          ))}
        </div>
      )}
    </div>
  );
}
