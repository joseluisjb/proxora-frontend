import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { ProyectoResponse, VersionDocumentoResponse } from '../types/api.types';
import { proyectosService } from '../services/proyectos.service';
import NavbarPublica from '../components/layout/NavbarPublica';
import AvatarIniciales from '../components/ui/AvatarIniciales';
import Alerta from '../components/ui/Alerta';
import { useAlerta } from '../hooks/useAlerta';

type EstadoProyecto = ProyectoResponse['estado'];
type NivelVisibilidad = ProyectoResponse['visibilidad'];

const ESTADO_CONFIG: Record<EstadoProyecto, { label: string; clases: string }> = {
  en_desarrollo: { label: 'En desarrollo', clases: 'bg-[#FEF9C3] text-[#854D0E]' },
  finalizado:    { label: 'Finalizado',    clases: 'bg-[#DCFCE7] text-[#166534]' },
  bajo_revision: { label: 'Bajo revisión', clases: 'bg-[#DBEAFE] text-[#1E40AF]' },
  retrasado:     { label: 'Retrasado',     clases: 'bg-[#FEE2E2] text-[#991B1B]' },
};

const VISIBILIDAD_LABEL: Record<NivelVisibilidad, string> = {
  solo_metadatos:   'Solo metadatos',
  lectura:          'Solo lectura',
  lectura_descarga: 'Lectura y descarga',
};

function formatearFecha(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
}

function formatearTamano(bytes: number | null): string {
  if (!bytes) return 'Tamaño desconocido';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extensionDeMime(mimeType: string | null, nombreArchivo: string): string {
  if (mimeType?.includes('pdf')) return 'PDF';
  if (mimeType?.includes('word') || mimeType?.includes('openxmlformats')) return 'DOCX';
  const partes = nombreArchivo.split('.');
  return partes.length > 1 ? partes[partes.length - 1].toUpperCase() : 'Archivo';
}

function IconoArchivo({ mimeType }: { mimeType: string | null }) {
  const stroke = mimeType?.includes('pdf') ? '#B91C1C' : mimeType?.includes('word') || mimeType?.includes('openxmlformats') ? '#1E40AF' : '#6B7280';
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function SkeletonDetalle() {
  return (
    <div className="grid grid-cols-[65fr_35fr] gap-6 items-start max-md:grid-cols-1">
      <div className="flex flex-col gap-4">
        <div className="bg-[#E5E7EB] rounded-xl h-[320px] animate-pulse" />
        <div className="bg-[#E5E7EB] rounded-xl h-[200px] animate-pulse" />
      </div>
      <div>
        <div className="bg-[#E5E7EB] rounded-xl h-[200px] animate-pulse" />
      </div>
    </div>
  );
}

const cardCls = "bg-white rounded-xl p-8";
const infoLabelCls = "text-[11px] font-semibold text-[#9CA3AF] tracking-[0.06em] m-0 mb-1.5 uppercase";
const infoValorCls = "text-[15px] text-[#111827] m-0 font-medium";

export default function DetalleProyecto() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { alertaProps, mostrarAlerta } = useAlerta();

  const [proyecto, setProyecto] = useState<ProyectoResponse | null>(null);
  const [versiones, setVersiones] = useState<VersionDocumentoResponse[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorProyecto, setErrorProyecto] = useState<string | null>(null);
  const [errorVersiones, setErrorVersiones] = useState<string | null>(null);
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [descargando, setDescargando] = useState<Set<string>>(new Set());

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

  useEffect(() => {
    if (!id) return;
    setCargando(true);
    setErrorProyecto(null);
    Promise.allSettled([proyectosService.obtenerPorId(id), proyectosService.obtenerVersiones(id)]).then(([resProyecto, resVersiones]) => {
      if (resProyecto.status === 'fulfilled') {
        setProyecto(resProyecto.value);
      } else {
        const err = resProyecto.reason as { response?: { status?: number } };
        if (err.response?.status === 404) {
          setNoEncontrado(true);
        } else {
          setErrorProyecto('No se pudo cargar el proyecto. Intenta de nuevo.');
          mostrarAlerta({ mensaje: 'No se pudo cargar el proyecto. Intenta de nuevo.', variante: 'error' });
        }
      }
      if (resVersiones.status === 'fulfilled') {
        setVersiones(resVersiones.value);
      } else {
        setErrorVersiones('No se pudieron cargar los documentos.');
        mostrarAlerta({ mensaje: 'No se pudieron cargar los documentos del proyecto.', variante: 'advertencia' });
      }
      setCargando(false);
    });
  }, [id]);

  const btnVolverCls = "mt-2 px-6 py-2.5 bg-[#B91C1C] text-white border-none rounded-lg font-sans text-sm font-semibold cursor-pointer transition-colors hover:bg-[#991B1B]";

  if (noEncontrado) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] font-sans">
        <Alerta {...alertaProps} />
        <NavbarPublica />
        <div className="max-w-[1100px] mx-auto px-12 py-6">
          <div className="flex flex-col items-center gap-3 pt-20 text-center">
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold text-[#111827] m-0">Proyecto no encontrado</h2>
            <p className="text-sm text-[#6B7280] m-0">El proyecto que buscas no existe o fue eliminado.</p>
            <button type="button" className={btnVolverCls} onClick={() => navigate('/')}>Volver al inicio</button>
          </div>
        </div>
      </div>
    );
  }

  if (errorProyecto) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] font-sans">
        <Alerta {...alertaProps} />
        <NavbarPublica />
        <div className="max-w-[1100px] mx-auto px-12 py-6">
          <div className="flex flex-col items-center gap-3 pt-20 text-center">
            <p className="text-base text-[#374151]">{errorProyecto}</p>
            <button type="button" className={btnVolverCls} onClick={() => window.location.reload()}>Reintentar</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans">
      <Alerta {...alertaProps} />
      <NavbarPublica />

      <div className="max-w-[1100px] mx-auto px-12 pt-6 pb-12 max-md:px-4">
        <button type="button" className="inline-flex items-center gap-1 text-sm text-[#B91C1C] bg-none border-none cursor-pointer p-0 mb-5 font-sans transition-all hover:text-[#991B1B] hover:underline hover:-translate-x-1" onClick={() => navigate(-1)}>
          ← Volver a la búsqueda
        </button>

        {cargando || !proyecto ? (
          <SkeletonDetalle />
        ) : (
          <div className="grid grid-cols-[65fr_35fr] gap-6 items-start max-md:grid-cols-1 animate-slide-up">
            <div className="flex flex-col gap-4 min-w-0">
              <div className={cardCls}>
                <span className={`inline-block text-xs font-semibold px-2.5 py-[3px] rounded-full mb-4 ${ESTADO_CONFIG[proyecto.estado].clases}`}>
                  {ESTADO_CONFIG[proyecto.estado].label}
                </span>
                <h1 className="text-[32px] font-bold text-[#111827] m-0 mb-4 leading-tight max-md:text-2xl">{proyecto.titulo}</h1>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs bg-[#F3F4F6] text-[#374151] px-2.5 py-1 rounded-md font-medium">{VISIBILIDAD_LABEL[proyecto.visibilidad]}</span>
                  <span className="text-[13px] text-[#6B7280]">Registrado el {formatearFecha(proyecto.creadoEn)}</span>
                  {proyecto.semestre && <span className="text-[13px] text-[#6B7280]">Semestre {proyecto.semestre}</span>}
                </div>
              </div>

              <div className={cardCls}>
                <div className="flex items-center gap-2 mb-4">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#B91C1C" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h2 className="text-lg font-bold text-[#111827] m-0">Resumen del Proyecto</h2>
                </div>
                <p className="text-[15px] text-[#374151] leading-[1.7] m-0 break-words">{proyecto.resumen}</p>
              </div>

              {proyecto.visibilidad === 'solo_metadatos' ? (
                <div className={`${cardCls} flex flex-col items-center gap-3 text-center py-10`}>
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  <p className="text-base font-bold text-[#374151] m-0">Documentos no disponibles públicamente</p>
                  <p className="text-sm text-[#6B7280] m-0 leading-relaxed">Los autores de este proyecto han restringido el acceso a los documentos.</p>
                </div>
              ) : (
                <div className={cardCls}>
                  <div className="flex items-center gap-2 mb-4">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#B91C1C" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <h2 className="text-lg font-bold text-[#111827] m-0">Documento</h2>
                  </div>
                  {errorVersiones ? (
                    <p className="text-[13px] text-[#6B7280]">{errorVersiones}</p>
                  ) : versiones.length === 0 ? (
                    <p className="text-sm text-[#9CA3AF] text-center py-6 m-0">Sin documentos disponibles para este proyecto</p>
                  ) : (() => {
                    const ver = versiones[0];
                    return (
                      <div className="flex items-center justify-between gap-4 py-1">
                        <div className="flex items-center gap-3">
                          <IconoArchivo mimeType={ver.mimeType} />
                          <div>
                            <p className="text-sm font-bold text-[#111827] m-0 mb-0.5">{ver.etiquetaVersion}</p>
                            <p className="text-xs text-[#6B7280] m-0">
                              {extensionDeMime(ver.mimeType, ver.nombreArchivo)} • {formatearTamano(ver.tamanoBytes)} • Actualizado {formatearFecha(ver.creadoEn)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#B91C1C] text-white border-none rounded-md text-[13px] font-medium cursor-pointer font-sans hover:bg-[#991B1B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                          onClick={() => handleDescargar(ver.idProyecto, ver.id)}
                          disabled={descargando.has(ver.id)}
                          aria-label={`Descargar ${ver.etiquetaVersion}`}
                        >
                          {descargando.has(ver.id) ? (
                            <div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          )}
                          Descargar
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4 max-md:order-first">
              <div className={cardCls}>
                <div className="py-3 first:pt-0 last:pb-0">
                  <p className={infoLabelCls}>MATERIA</p>
                  <p className={infoValorCls}>{proyecto.materia ?? '—'}</p>
                </div>
                <hr className="border-none border-t border-[#F3F4F6] my-1" />
                <div className="py-3">
                  <p className={infoLabelCls}>LÍNEAS DE INVESTIGACIÓN</p>
                  {proyecto.lineas.length === 0 ? (
                    <p className={infoValorCls}>—</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {proyecto.lineas.map((linea) => (
                        <span key={linea.id} className="bg-[#F3F4F6] text-[#374151] rounded px-2.5 py-1 text-xs font-sans">{linea.nombre}</span>
                      ))}
                    </div>
                  )}
                </div>
                <hr className="border-none border-t border-[#F3F4F6] my-1" />
                <div className="py-3 last:pb-0">
                  <p className={infoLabelCls}>FECHA DE REGISTRO</p>
                  <p className={infoValorCls}>{formatearFecha(proyecto.creadoEn)}</p>
                  {proyecto.semestre && <p className="text-[13px] text-[#6B7280] mt-1 m-0">{proyecto.semestre}</p>}
                </div>
              </div>

              <div className={cardCls}>
                <p className={`${infoLabelCls} mb-4`}>EQUIPO DEL PROYECTO</p>

                {proyecto.integrantes.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-[#6B7280] m-0 mb-2.5">Integrantes</p>
                    {proyecto.integrantes.map((int) => (
                      <div key={int.id} className="flex items-start gap-2.5 mb-3 last:mb-0">
                        <AvatarIniciales nombre={int.nombre} apellido={int.apellido} tamaño="sm" />
                        <div>
                          <p className="text-sm font-bold text-[#111827] m-0 mb-0.5">{int.nombre} {int.apellido}</p>
                          <p className="text-xs text-[#6B7280] m-0">{int.correo}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {proyecto.integrantes.length > 0 && proyecto.directores.length > 0 && (
                  <hr className="border-none border-t border-[#F3F4F6] my-3" />
                )}

                {proyecto.directores.length > 0 && (
                  <div>
                    <p className="text-xs text-[#6B7280] m-0 mb-2.5">{proyecto.directores.length === 1 ? 'Director' : 'Directores'}</p>
                    {proyecto.directores.map((dir, i) => (
                      <div key={dir.id} className="flex items-start gap-2.5 mb-3 last:mb-0">
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#B91C1C" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                        </svg>
                        <div>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <p className="text-sm font-bold text-[#111827] m-0">{dir.nombre} {dir.apellido}</p>
                            {i > 0 && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#DBEAFE] text-[#1E40AF]">CO-DIRECTOR</span>
                            )}
                          </div>
                          <p className="text-xs text-[#6B7280] m-0">{dir.correo}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
