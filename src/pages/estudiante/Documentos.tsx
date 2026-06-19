import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { documentosService } from '../../services/estudiante/documentos.service';
import type { ProyectoResponse } from '../../types/api.types';
import Paginacion from '../../components/ui/Paginacion';
import { useAlertaContext } from '../../context/AlertaContext';

const PAGINA_SIZE = 8;

const PALETA = [
  { color: '#16A34A', bg: '#DCFCE7' },
  { color: '#1D4ED8', bg: '#DBEAFE' },
  { color: '#D97706', bg: '#FEF3C7' },
  { color: '#9333EA', bg: '#F3E8FF' },
  { color: '#B91C1C', bg: '#FEE2E2' },
  { color: '#0891B2', bg: '#E0F2FE' },
];

const OPCIONES_ESTADO = [
  { value: '', label: 'Todos los estados' },
  { value: 'en_desarrollo', label: 'En Desarrollo' },
  { value: 'bajo_revision', label: 'Bajo Revisión' },
  { value: 'retrasado',     label: 'Retrasado' },
  { value: 'finalizado',    label: 'Finalizado' },
];

export default function Documentos() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { mostrarAlerta } = useAlertaContext();

  const [proyectos, setProyectos] = useState<ProyectoResponse[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);

  const cargar = useCallback(async () => {
    if (!usuario?.id) return;
    setCargando(true);
    setError(null);
    try {
      const result = await documentosService.listarMisProyectos(usuario.id, { size: 100 });
      setProyectos(result.content);
    } catch {
      setError('Error al cargar tus proyectos. Intenta de nuevo.');
      mostrarAlerta({ mensaje: 'Error al cargar tus proyectos. Intenta de nuevo.', variante: 'error' });
    } finally {
      setCargando(false);
    }
  }, [usuario]);

  useEffect(() => { cargar(); }, [cargar]);

  useEffect(() => { setPaginaActual(1); }, [busqueda, filtroEstado]);

  const t = busqueda.toLowerCase().trim();
  const proyectosFiltrados = proyectos.filter((p) => {
    if (filtroEstado && p.estado !== filtroEstado) return false;
    if (!t) return true;
    return (
      p.titulo.toLowerCase().includes(t) ||
      (p.semestre ?? '').toLowerCase().includes(t) ||
      (p.materia ?? '').toLowerCase().includes(t) ||
      p.lineas.some((l) => l.nombre.toLowerCase().includes(t))
    );
  });

  const totalPaginas = Math.max(1, Math.ceil(proyectosFiltrados.length / PAGINA_SIZE));
  const proyectosPaginados = proyectosFiltrados.slice(
    (paginaActual - 1) * PAGINA_SIZE,
    paginaActual * PAGINA_SIZE,
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-6 animate-slide-up">
        <h1 className="text-2xl font-bold text-[#111827] mb-1">Documentos</h1>
        <p className="text-[13px] text-[#6B7280] max-w-[480px]">
          Sube y gestiona las últimas versiones de los documentos de tus proyectos.
        </p>
      </div>

      {!cargando && !error && proyectos.length > 0 && (
        <div className="flex gap-3 mb-5">
          <div className="relative flex-1">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por título, semestre, materia o línea de investigación..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-[#E5E7EB] rounded-lg text-[13px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#B91C1C] transition-colors bg-white"
            />
          </div>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-[13px] text-[#374151] focus:outline-none focus:border-[#B91C1C] transition-colors bg-white cursor-pointer shrink-0"
          >
            {OPCIONES_ESTADO.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      )}

      {cargando && (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-[#B91C1C] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && !cargando && (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <p className="text-[14px] text-[#6B7280]">{error}</p>
          <button
            type="button"
            onClick={cargar}
            className="px-4 py-2 text-[13px] font-semibold text-white bg-[#B91C1C] rounded-lg hover:bg-[#991B1B] transition-colors duration-150"
          >
            Reintentar
          </button>
        </div>
      )}

      {!cargando && !error && proyectos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-12 h-12 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-1">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth={1.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-[14px] text-[#6B7280]">No tienes proyectos con documentos aún.</p>
          <button
            type="button"
            onClick={() => navigate('/estudiante/registrar')}
            className="px-4 py-2 text-[13px] font-semibold text-white bg-[#B91C1C] rounded-lg hover:bg-[#991B1B] transition-colors duration-150"
          >
            Registrar proyecto
          </button>
        </div>
      )}

      {!cargando && !error && proyectos.length > 0 && proyectosFiltrados.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-[14px] text-[#6B7280]">No se encontraron proyectos con esos filtros.</p>
        </div>
      )}

      {!cargando && !error && proyectosPaginados.length > 0 && (
        <>
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#F3F4F6]">
              <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-[0.08em]">
                Detalles del Proyecto
              </span>
              <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-[0.08em]">
                Acciones
              </span>
            </div>

            {proyectosPaginados.map((p, i) => {
              const { color, bg } = PALETA[i % PALETA.length];
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-5 py-4 border-b border-[#F9FAFB] last:border-none hover:bg-[#FAFAFA] transition-colors duration-100"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: bg }}
                    >
                      <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.8} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-[#111827] truncate">{p.titulo}</p>
                      {(p.materia || p.semestre) && (
                        <p className="text-[12px] text-[#9CA3AF] mt-0.5 flex items-center gap-1.5 flex-wrap">
                          {p.materia && <span>{p.materia}</span>}
                          {p.materia && p.semestre && <span className="inline-block w-1 h-1 rounded-full bg-[#D1D5DB]" aria-hidden="true" />}
                          {p.semestre && <span>{p.semestre}</span>}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/estudiante/documentos/${p.id}`)}
                    className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium text-[#374151] border border-[#E5E7EB] rounded-lg bg-white hover:border-[#B91C1C] hover:text-[#B91C1C] transition-colors duration-150 ml-6"
                  >
                    Subir nueva versión
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>

          {proyectosFiltrados.length > PAGINA_SIZE && (
            <div className="mt-5 flex justify-center">
              <Paginacion
                paginaActual={paginaActual}
                totalPaginas={totalPaginas}
                totalRegistros={proyectosFiltrados.length}
                registrosPorPagina={PAGINA_SIZE}
                labelEntidad="proyectos"
                onCambiarPagina={setPaginaActual}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
