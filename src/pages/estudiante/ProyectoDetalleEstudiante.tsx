import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { misProyectosService } from '../../services/estudiante/misProyectos.service';
import { proyectosService } from '../../services/proyectos.service';
import type { ProyectoDetalleResponse } from '../../types/api.types';
import AvatarIniciales from '../../components/ui/AvatarIniciales';
import ModalConfirmacion from '../../components/ui/ModalConfirmacion';
import { useModalConfirmacion } from '../../hooks/useModalConfirmacion';
import { useAlertaContext } from '../../context/AlertaContext';

type EstadoProyecto = ProyectoDetalleResponse['estado'];

const ESTADO_CONFIG: Record<EstadoProyecto, { label: string; clases: string }> = {
  en_desarrollo: { label: 'En Desarrollo', clases: 'bg-[#FEF9C3] text-[#854D0E]' },
  finalizado:    { label: 'Finalizado',    clases: 'bg-[#DCFCE7] text-[#166534]' },
  bajo_revision: { label: 'Bajo Revisión', clases: 'bg-[#DBEAFE] text-[#1E40AF]' },
  retrasado:     { label: 'Retrasado',     clases: 'bg-[#FEE2E2] text-[#B91C1C]' },
};

function formatearFecha(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
}

function formatearFechaHora(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  );
}

function formatearTamano(bytes: number | null): string {
  if (!bytes) return 'Tamaño desconocido';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function iconoMime(mimeType: string | null) {
  const stroke = mimeType?.includes('pdf') ? '#B91C1C' : mimeType?.includes('word') || mimeType?.includes('openxmlformats') ? '#1E40AF' : '#6B7280';
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function SkeletonDetalle() {
  return (
    <div className="grid grid-cols-[65fr_35fr] gap-5 items-start max-md:grid-cols-1 animate-pulse">
      <div className="flex flex-col gap-4">
        <div className="bg-[#F3F4F6] rounded-xl h-[200px]" />
        <div className="bg-[#F3F4F6] rounded-xl h-[160px]" />
        <div className="bg-[#F3F4F6] rounded-xl h-[220px]" />
      </div>
      <div className="flex flex-col gap-4">
        <div className="bg-[#F3F4F6] rounded-xl h-[180px]" />
        <div className="bg-[#F3F4F6] rounded-xl h-[200px]" />
      </div>
    </div>
  );
}

const cardCls = "bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-6";
const labelCls = "text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.07em] mb-1.5";
const valorCls = "text-[14px] text-[#111827] font-medium";

export default function ProyectoDetalleEstudiante() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { mostrarAlerta } = useAlertaContext();
  const { modalProps, abrirModal } = useModalConfirmacion();
  const [proyecto, setProyecto] = useState<ProyectoDetalleResponse | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [descargando, setDescargando] = useState<Set<string>>(new Set());
  const [historialAbierto, setHistorialAbierto] = useState(false);

  const cargar = useCallback(async () => {
    if (!id) return;
    setCargando(true);
    setError(null);
    try {
      const data = await misProyectosService.obtenerDetalle(id);
      setProyecto(data);
    } catch {
      setError('No se pudo cargar el detalle del proyecto.');
      mostrarAlerta({ mensaje: 'No se pudo cargar el detalle del proyecto.', variante: 'error' });
    } finally {
      setCargando(false);
    }
  }, [id, mostrarAlerta]);

  useEffect(() => { cargar(); }, [cargar]);

  const handleEliminar = () => {
    if (!proyecto) return;
    abrirModal({
      titulo: 'Eliminar proyecto',
      mensaje: `¿Estás seguro de que deseas eliminar "${proyecto.titulo}"? Esta acción no se puede deshacer.`,
      labelConfirmar: 'Eliminar',
      variante: 'peligro',
      onConfirmar: async () => {
        try {
          await misProyectosService.eliminar(proyecto.id);
          mostrarAlerta({ mensaje: `Proyecto eliminado correctamente.`, variante: 'exito' });
          navigate('/estudiante/mis-proyectos');
        } catch {
          mostrarAlerta({ mensaje: 'No se pudo eliminar el proyecto. Intenta de nuevo.', variante: 'error' });
        }
      },
    });
  };

  const handleDescargar = async (idProyecto: string, idVersion: string) => {
    if (descargando.has(idVersion)) return;
    setDescargando((prev) => new Set([...prev, idVersion]));
    try {
      await proyectosService.descargarVersion(idProyecto, idVersion);
    } catch {
      mostrarAlerta({ mensaje: 'No se pudo descargar el archivo. Intenta de nuevo.', variante: 'error' });
    } finally {
      setDescargando((prev) => { const s = new Set(prev); s.delete(idVersion); return s; });
    }
  };

  if (cargando) {
    return (
      <div className="animate-fade-in">
        <div className="h-8 w-24 bg-[#F3F4F6] rounded mb-5 animate-pulse" />
        <SkeletonDetalle />
      </div>
    );
  }

  if (error || !proyecto) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-[14px] text-[#6B7280]">{error ?? 'Proyecto no encontrado.'}</p>
        <button
          type="button"
          onClick={() => navigate('/estudiante/mis-proyectos')}
          className="px-4 py-2 text-[13px] font-semibold text-white bg-[#B91C1C] rounded-lg hover:bg-[#991B1B] transition-colors duration-150"
        >
          Volver a Mis Proyectos
        </button>
      </div>
    );
  }

  const estadoCfg = ESTADO_CONFIG[proyecto.estado];

  return (
    <div className="animate-fade-in">
      <ModalConfirmacion {...modalProps} />

      {/* Breadcrumb + acciones */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <button
          type="button"
          onClick={() => navigate('/estudiante/mis-proyectos')}
          className="flex items-center gap-1.5 text-[13px] text-[#9CA3AF] hover:text-[#B91C1C] transition-colors duration-150 group"
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" className="group-hover:-translate-x-0.5 transition-transform duration-150">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Mis Proyectos
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(`/estudiante/mis-proyectos/${id}/editar`)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-[#374151] border border-[#D1D5DB] rounded-lg font-sans text-[13px] font-medium cursor-pointer transition-all hover:bg-[#F9FAFB] hover:border-[#B91C1C] hover:text-[#B91C1C]"
          >
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar proyecto
          </button>
          <button
            type="button"
            onClick={handleEliminar}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-[#B91C1C] border border-[#FECACA] rounded-lg font-sans text-[13px] font-medium cursor-pointer transition-all hover:bg-[#FEF2F2] hover:border-[#B91C1C]"
          >
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Eliminar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[65fr_35fr] gap-5 items-start max-md:grid-cols-1 animate-slide-up">

        {/* Columna principal */}
        <div className="flex flex-col gap-4 min-w-0">

          {/* Encabezado */}
          <div className={cardCls}>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide mb-3 ${estadoCfg.clases}`}>
              {estadoCfg.label}
            </span>
            <h1 className="text-[24px] font-bold text-[#111827] leading-tight mb-3">
              {proyecto.titulo}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-[13px] text-[#6B7280]">
              <span>Registrado el {formatearFecha(proyecto.creadoEn)}</span>
              {proyecto.semestre && (
                <>
                  <span className="inline-block w-1 h-1 rounded-full bg-[#D1D5DB]" aria-hidden="true" />
                  <span>{proyecto.semestre}</span>
                </>
              )}
              {proyecto.materia && (
                <>
                  <span className="inline-block w-1 h-1 rounded-full bg-[#D1D5DB]" aria-hidden="true" />
                  <span>{proyecto.materia}</span>
                </>
              )}
            </div>
          </div>

          {/* Resumen */}
          <div className={cardCls}>
            <div className="flex items-center gap-2 mb-4">
              <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="#B91C1C" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-[16px] font-bold text-[#111827] m-0">Resumen</h2>
            </div>
            <p className="text-[14px] text-[#374151] leading-relaxed m-0">{proyecto.resumen}</p>
          </div>

          {/* Documento */}
          <div className={cardCls}>
            <div className="flex items-center gap-2 mb-4">
              <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="#B91C1C" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <h2 className="text-[16px] font-bold text-[#111827] m-0">Documento</h2>
            </div>

            {proyecto.versiones.length === 0 ? (
              <p className="text-[13px] text-[#9CA3AF] text-center py-6 m-0">
                No hay versiones subidas para este proyecto.
              </p>
            ) : (() => {
              const versiones = [...proyecto.versiones].sort(
                (a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime()
              );
              const [primera, ...resto] = versiones;
              return (
                <div className="flex flex-col gap-3">
                  {/* Versión más reciente */}
                  <div className="flex items-center justify-between gap-4 py-1">
                    <div className="flex items-center gap-3 min-w-0">
                      {iconoMime(primera.mimeType)}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-[13px] font-semibold text-[#111827] m-0 truncate">{primera.etiquetaVersion}</p>
                          <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#DCFCE7] text-[#166534]">MÁS RECIENTE</span>
                        </div>
                        <p className="text-[11px] text-[#9CA3AF] m-0">
                          {primera.tipoDocumento ?? 'Documento'} · {formatearTamano(primera.tamanoBytes)} · {formatearFechaHora(primera.creadoEn)}
                        </p>
                        {primera.subidoPor && (
                          <p className="text-[11px] text-[#9CA3AF] m-0 mt-0.5">
                            Subido por {primera.subidoPor.nombre} {primera.subidoPor.apellido}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#374151] border border-[#E5E7EB] rounded-lg bg-white hover:border-[#B91C1C] hover:text-[#B91C1C] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleDescargar(primera.idProyecto, primera.id)}
                      disabled={descargando.has(primera.id)}
                    >
                      {descargando.has(primera.id) ? (
                        <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      )}
                      Descargar
                    </button>
                  </div>

                  {/* Historial colapsable */}
                  {resto.length > 0 && (
                    <div className="border-t border-[#F3F4F6] pt-2">
                      <button
                        type="button"
                        onClick={() => setHistorialAbierto((v) => !v)}
                        className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6B7280] hover:text-[#B91C1C] transition-colors duration-150 w-full py-1"
                      >
                        <svg
                          width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                          className={`transition-transform duration-300 ${historialAbierto ? 'rotate-180' : ''}`}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                        Historial de versiones ({resto.length})
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${historialAbierto ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}
                      >
                        <div className="flex flex-col gap-3 pt-3">
                          {resto.map((v) => (
                            <div key={v.id} className="flex items-center justify-between gap-4 opacity-75">
                              <div className="flex items-center gap-3 min-w-0">
                                {iconoMime(v.mimeType)}
                                <div className="min-w-0">
                                  <p className="text-[13px] font-medium text-[#374151] m-0 mb-0.5 truncate">{v.etiquetaVersion}</p>
                                  <p className="text-[11px] text-[#9CA3AF] m-0">
                                    {v.tipoDocumento ?? 'Documento'} · {formatearTamano(v.tamanoBytes)} · {formatearFechaHora(v.creadoEn)}
                                  </p>
                                  {v.subidoPor && (
                                    <p className="text-[11px] text-[#9CA3AF] m-0 mt-0.5">
                                      Subido por {v.subidoPor.nombre} {v.subidoPor.apellido}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <button
                                type="button"
                                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#374151] border border-[#E5E7EB] rounded-lg bg-white hover:border-[#B91C1C] hover:text-[#B91C1C] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => handleDescargar(v.idProyecto, v.id)}
                                disabled={descargando.has(v.id)}
                              >
                                {descargando.has(v.id) ? (
                                  <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                )}
                                Descargar
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Columna lateral */}
        <div className="flex flex-col gap-4 max-md:order-first">

          {/* Meta información */}
          <div className={cardCls}>
            <h2 className="text-[13px] font-bold text-[#111827] mb-4">Información del Proyecto</h2>

            <div className="mb-3">
              <p className={labelCls}>SEMESTRE</p>
              <p className={valorCls}>{proyecto.semestre ?? '—'}</p>
            </div>
            <div className="h-px bg-[#F3F4F6] my-3" />
            <div className="mb-3">
              <p className={labelCls}>MATERIA</p>
              <p className={valorCls}>{proyecto.materia ?? '—'}</p>
            </div>

            {proyecto.lineas.length > 0 && (
              <>
                <div className="h-px bg-[#F3F4F6] my-3" />
                <div>
                  <p className={labelCls}>LÍNEAS DE INVESTIGACIÓN</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {proyecto.lineas.map((l) => (
                      <span key={l.id} className="inline-flex items-center bg-[#F3F4F6] text-[#374151] px-2.5 py-1 rounded-full text-[11px] font-medium">
                        {l.nombre}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Equipo */}
          <div className={cardCls}>
            <h2 className="text-[13px] font-bold text-[#111827] mb-4">Equipo Académico</h2>

            {proyecto.integrantes.length > 0 && (
              <div className="mb-3">
                <p className={labelCls}>INTEGRANTES</p>
                <div className="flex flex-col gap-2.5 mt-1">
                  {proyecto.integrantes.map((i) => (
                    <div key={i.id} className="flex items-center gap-2.5">
                      <AvatarIniciales nombre={i.nombre} apellido={i.apellido} tamaño="sm" />
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-[#111827] m-0 truncate">{i.nombre} {i.apellido}</p>
                        <p className="text-[11px] text-[#9CA3AF] m-0 truncate">{i.correo}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {proyecto.directores.length > 0 && (
              <>
                {proyecto.integrantes.length > 0 && <div className="h-px bg-[#F3F4F6] my-3" />}
                <div className="mb-3">
                  <p className={labelCls}>DIRECTOR{proyecto.directores.length > 1 ? 'ES' : ''}</p>
                  <div className="flex flex-col gap-2.5 mt-1">
                    {proyecto.directores.map((d, idx) => (
                      <div key={d.id} className="flex items-center gap-2.5">
                        <AvatarIniciales nombre={d.nombre} apellido={d.apellido} tamaño="sm" />
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-[#111827] m-0 truncate">
                            {d.nombre} {d.apellido}
                            <span className="ml-1.5 text-[10px] font-bold text-[#B91C1C] bg-[#FEE2E2] px-1.5 py-0.5 rounded-full">
                              {idx === 0 ? 'DIRECTOR' : 'CO-DIRECTOR'}
                            </span>
                          </p>
                          <p className="text-[11px] text-[#9CA3AF] m-0 truncate">{d.correo}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {proyecto.evaluadores.length > 0 && (
              <>
                <div className="h-px bg-[#F3F4F6] my-3" />
                <div>
                  <p className={labelCls}>EVALUADORES</p>
                  <div className="flex flex-col gap-2.5 mt-1">
                    {proyecto.evaluadores.map((e) => (
                      <div key={e.id} className="flex items-center gap-2.5">
                        <AvatarIniciales nombre={e.nombre} apellido={e.apellido} tamaño="sm" />
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-[#111827] m-0 truncate">
                            {e.nombre} {e.apellido}
                            <span className="ml-1.5 text-[10px] font-bold text-[#1D4ED8] bg-[#DBEAFE] px-1.5 py-0.5 rounded-full">
                              EVALUADOR
                            </span>
                          </p>
                          <p className="text-[11px] text-[#9CA3AF] m-0 truncate">{e.correo}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
