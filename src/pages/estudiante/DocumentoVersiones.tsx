import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { documentosService } from '../../services/estudiante/documentos.service';
import { proyectosService } from '../../services/proyectos.service';
import ModalConfirmacion from '../../components/ui/ModalConfirmacion';
import { useModalConfirmacion } from '../../hooks/useModalConfirmacion';
import Desplegable from '../../components/ui/Desplegable';
import type { ProyectoResponse, VersionDocumentoResponse } from '../../types/api.types';
import { useAlertaContext } from '../../context/AlertaContext';

const TIPOS_DOCUMENTO = [
  { id: 1, nombre: 'Propuesta' },
  { id: 2, nombre: 'Avance' },
  { id: 3, nombre: 'Especificación Técnica' },
  { id: 4, nombre: 'Informe Final' },
] as const;

function formatearFecha(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('es-CO', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  );
}

function formatearTamano(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validarArchivo(file: File): string | null {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!['pdf', 'doc', 'docx'].includes(ext)) return 'Solo se permiten archivos PDF, DOC y DOCX';
  if (file.size > 25 * 1024 * 1024) return 'El archivo no puede superar 25 MB';
  return null;
}

export default function DocumentoVersiones() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [proyecto, setProyecto] = useState<ProyectoResponse | null>(null);
  const [versiones, setVersiones] = useState<VersionDocumentoResponse[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [idTipo, setIdTipo] = useState<number | ''>('');
  const [etiqueta, setEtiqueta] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [errorArchivo, setErrorArchivo] = useState('');
  const [erroresForm, setErroresForm] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [descargando, setDescargando] = useState<Set<string>>(new Set());
  const { modalProps, abrirModal } = useModalConfirmacion();
  const { mostrarAlerta } = useAlertaContext();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const cargar = useCallback(async () => {
    if (!id) return;
    setCargando(true);
    setError(null);
    try {
      const [proy, vers] = await Promise.all([
        documentosService.obtenerProyecto(id),
        documentosService.listarVersiones(id),
      ]);
      setProyecto(proy);
      setVersiones(vers);
    } catch {
      setError('No se pudo cargar la información del proyecto.');
      mostrarAlerta({ mensaje: 'No se pudo cargar la información del proyecto.', variante: 'error' });
    } finally {
      setCargando(false);
    }
  }, [id, mostrarAlerta]);

  useEffect(() => { cargar(); }, [cargar]);

  const handleArchivoChange = (file: File) => {
    const err = validarArchivo(file);
    if (err) { setErrorArchivo(err); return; }
    setErrorArchivo('');
    setArchivo(file);
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

  const handleClickEnviar = () => {
    const errs: Record<string, string> = {};
    if (!idTipo) errs.tipo = 'Selecciona el tipo de documento';
    if (!etiqueta.trim()) errs.etiqueta = 'Ingresa una etiqueta de versión';
    if (!archivo) errs.archivo = 'Selecciona un archivo';
    if (Object.keys(errs).length > 0) {
      setErroresForm(errs);
      mostrarAlerta({ mensaje: 'Completa todos los campos antes de enviar el documento.', variante: 'advertencia' });
      return;
    }
    setErroresForm({});
    abrirModal({
      titulo: 'Confirmar envío',
      mensaje: `¿Deseas subir "${archivo!.name}" como nueva versión del documento?`,
      labelConfirmar: 'Sí, subir',
      variante: 'advertencia',
      onConfirmar: handleSubmit,
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleArchivoChange(file);
  };

  const handleSubmit = async () => {
    setEnviando(true);
    try {
      const nueva = await documentosService.subirVersion(
        id!,
        { etiquetaVersion: etiqueta.trim(), idTipo: idTipo as number, idSubidoPor: usuario?.id ?? '' },
        archivo!,
      );
      setVersiones((prev) => [nueva, ...prev]);
      setIdTipo('');
      setEtiqueta('');
      setArchivo(null);
      mostrarAlerta({ mensaje: '¡Versión subida exitosamente!', variante: 'exito' });
    } catch {
      mostrarAlerta({ mensaje: 'Error al subir la versión. Intenta de nuevo.', variante: 'error' });
    } finally {
      setEnviando(false);
    }
  };

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
          onClick={() => navigate('/estudiante/documentos')}
          className="px-4 py-2 text-[13px] font-semibold text-white bg-[#B91C1C] rounded-lg hover:bg-[#991B1B] transition-colors duration-150"
        >
          Volver
        </button>
      </div>
    );
  }

  const director = proyecto.directores[0];
  const codirectores = proyecto.directores.slice(1);
  const versionActual = versiones[0];

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <button
        type="button"
        onClick={() => navigate('/estudiante/documentos')}
        className="flex items-center gap-1.5 text-[13px] text-[#9CA3AF] hover:text-[#B91C1C] transition-colors duration-150 mb-5 group"
      >
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" className="group-hover:-translate-x-0.5 transition-transform duration-150">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Documentos
      </button>

      <div className="mb-6 animate-slide-up">
        <h1 className="text-2xl font-bold text-[#111827] mb-1">Documentos y Versiones</h1>
        <p className="text-[13px] text-[#6B7280] max-w-[520px]">
          Gestiona las especificaciones técnicas y la documentación iterativa del proyecto.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-5 items-start">
        {/* Panel izquierdo */}
        <div className="flex flex-col gap-4 w-full md:w-[340px] md:shrink-0">
          {/* Formulario subir versión */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5">
            <h2 className="text-[15px] font-bold text-[#111827] mb-4">Subir Nueva Versión</h2>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-[0.08em]">
                  Tipo de Documento
                </label>
                <Desplegable
                  valor={idTipo === '' ? '' : String(idTipo)}
                  onChange={(v) => { setIdTipo(v === '' ? '' : Number(v)); setErroresForm((p) => ({ ...p, tipo: '' })); }}
                  opciones={[
                    { valor: '', etiqueta: 'Seleccionar tipo...' },
                    ...TIPOS_DOCUMENTO.map((t) => ({ valor: String(t.id), etiqueta: t.nombre })),
                  ]}
                  ariaLabel="Tipo de documento"
                  error={!!erroresForm.tipo}
                  className="w-full"
                />
                {erroresForm.tipo && <p className="text-xs text-[#EF4444]">{erroresForm.tipo}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-[0.08em]">
                  Etiqueta de Versión
                </label>
                <input
                  type="text"
                  value={etiqueta}
                  onChange={(e) => { setEtiqueta(e.target.value); setErroresForm((p) => ({ ...p, etiqueta: '' })); }}
                  placeholder="p.ej., Borrador Final para Revisión"
                  className={`w-full py-2.5 px-3 bg-[#F9FAFB] border rounded-lg text-[13px] text-[#111827] outline-none transition-colors placeholder:text-[#D1D5DB] font-sans ${erroresForm.etiqueta ? 'border-[#EF4444]' : 'border-[#E5E7EB] focus:border-[#B91C1C]'}`}
                />
                {erroresForm.etiqueta && <p className="text-xs text-[#EF4444]">{erroresForm.etiqueta}</p>}
              </div>

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl px-4 py-6 flex flex-col items-center gap-2 cursor-pointer transition-colors duration-150 ${
                  dragOver
                    ? 'border-[#B91C1C] bg-[#FEF2F2]'
                    : archivo
                    ? 'border-[#16A34A] bg-[#F0FDF4]'
                    : erroresForm.archivo
                    ? 'border-[#EF4444] bg-[#FEF2F2]'
                    : 'border-[#D1D5DB] bg-[#F9FAFB] hover:border-[#B91C1C] hover:bg-[#FEF2F2]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleArchivoChange(f); }}
                />
                {archivo ? (
                  <>
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#16A34A" strokeWidth={1.5} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-[13px] font-semibold text-[#16A34A] text-center">{archivo.name}</p>
                    <p className="text-[11px] text-[#9CA3AF]">{formatearTamano(archivo.size)}</p>
                  </>
                ) : (
                  <>
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth={1.5} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <p className="text-[13px] font-medium text-[#374151] text-center">Arrastra los archivos aquí</p>
                    <p className="text-[12px] text-[#9CA3AF] text-center">o haz clic para buscar archivos<br />(PDF, DOC, DOCX)</p>
                  </>
                )}
              </div>
              {(errorArchivo || erroresForm.archivo) && (
                <p className="text-xs text-[#EF4444] -mt-2">{errorArchivo || erroresForm.archivo}</p>
              )}

              <button
                type="button"
                onClick={handleClickEnviar}
                disabled={enviando}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#B91C1C] text-white text-[13px] font-bold rounded-lg hover:bg-[#991B1B] active:translate-y-px transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {enviando ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                )}
                {enviando ? 'Enviando...' : 'Enviar Documento'}
              </button>
            </div>
          </div>

          {/* Metadatos del proyecto */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5">
            <h2 className="text-[15px] font-bold text-[#111827] mb-4">Metadatos del Proyecto</h2>
            <div className="flex flex-col gap-3.5">
              {director && (
                <div className="flex items-start justify-between gap-4">
                  <span className="text-[13px] text-[#9CA3AF] shrink-0">Director</span>
                  <span className="text-[13px] font-semibold text-[#111827] text-right">
                    {director.nombre} {director.apellido}
                  </span>
                </div>
              )}
              {codirectores.length > 0 && (
                <div className="flex items-start justify-between gap-4">
                  <span className="text-[13px] text-[#9CA3AF] shrink-0">Co-Directores</span>
                  <span className="text-[13px] font-semibold text-[#111827] text-right">
                    {codirectores.map((d) => `${d.nombre} ${d.apellido}`).join(', ')}
                  </span>
                </div>
              )}
              <div className="flex items-start justify-between gap-4">
                <span className="text-[13px] text-[#9CA3AF] shrink-0">Última Modificación</span>
                <span className="text-[13px] font-semibold text-[#111827] text-right">
                  {new Date(proyecto.actualizadoEn).toLocaleDateString('es-CO', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </span>
              </div>
              {proyecto.semestre && (
                <div className="flex items-start justify-between gap-4">
                  <span className="text-[13px] text-[#9CA3AF] shrink-0">Semestre</span>
                  <span className="text-[13px] font-semibold text-[#111827] text-right">{proyecto.semestre}</span>
                </div>
              )}
              {proyecto.materia && (
                <div className="flex items-start justify-between gap-4">
                  <span className="text-[13px] text-[#9CA3AF] shrink-0">Materia</span>
                  <span className="text-[13px] font-semibold text-[#111827] text-right">{proyecto.materia}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Panel derecho — historial de versiones */}
        <div className="w-full min-w-0 md:flex-1">
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#F3F4F6]">
              <h2 className="text-[15px] font-bold text-[#111827]">Historial de Versiones</h2>
            </div>

            {versiones.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#D1D5DB" strokeWidth={1.2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-[13px] text-[#9CA3AF]">Aún no hay versiones subidas para este proyecto.</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-[#F9FAFB]">
                  {versiones.map((v, i) => {
                    const esActual = v.id === versionActual?.id;
                    return (
                      <div key={v.id} className="flex items-start gap-3.5 px-5 py-4 hover:bg-[#FAFAFA] transition-colors duration-100">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: esActual ? '#DCFCE7' : '#F3F4F6' }}
                        >
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={esActual ? '#16A34A' : '#9CA3AF'} strokeWidth={1.8} aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[14px] font-semibold text-[#111827] truncate min-w-0 flex-1">
                              {v.nombreArchivo}
                            </span>
                            {esActual && (
                              <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide text-[#16A34A] bg-[#DCFCE7]">
                                Actual
                              </span>
                            )}
                          </div>
                          <p className="text-[12px] text-[#6B7280] mt-0.5 line-clamp-2">{v.etiquetaVersion}</p>
                          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            <span className="flex items-center gap-1 text-[11px] text-[#9CA3AF]">
                              <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {v.subidoPor.nombre} {v.subidoPor.apellido}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] text-[#9CA3AF]">
                              <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {formatearFecha(v.creadoEn)}
                            </span>
                            {v.tamanoBytes && (
                              <span className="flex items-center gap-1 text-[11px] text-[#9CA3AF]">
                                <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                </svg>
                                {formatearTamano(v.tamanoBytes)}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          className={`w-8 h-8 flex items-center justify-center rounded-lg shrink-0 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
                            esActual
                              ? 'text-[#B91C1C] bg-[#FEE2E2] hover:bg-[#FECACA]'
                              : 'text-[#9CA3AF] bg-[#F3F4F6] hover:bg-[#E5E7EB]'
                          }`}
                          onClick={() => handleDescargar(id!, v.id)}
                          disabled={descargando.has(v.id)}
                          aria-label="Descargar versión"
                          title={v.nombreArchivo}
                        >
                          {descargando.has(v.id) ? (
                            <div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {versiones.length > 3 && (
                  <div className="flex justify-center px-5 py-3.5 border-t border-[#F3F4F6]">
                    <button
                      type="button"
                      className="flex items-center gap-1.5 text-[13px] font-semibold text-[#B91C1C] hover:text-[#991B1B] transition-colors duration-150"
                    >
                      Ver archivo completo
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <ModalConfirmacion {...modalProps} />
    </div>
  );
}
