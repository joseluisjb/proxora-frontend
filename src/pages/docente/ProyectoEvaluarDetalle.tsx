import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { evaluacionesDocenteService } from '../../services/docente/evaluaciones.service'
import { proyectosService } from '../../services/proyectos.service'
import type { ProyectoDetalleResponse, EvaluacionResponse } from '../../types/api.types'
import { useAlertaContext } from '../../context/AlertaContext'
import ModalConfirmacion from '../../components/ui/ModalConfirmacion'
import { useModalConfirmacion } from '../../hooks/useModalConfirmacion'

/* ───────── helpers ───────── */

function formatearFecha(iso: string): string {
  const d = new Date(iso)
  return (
    d.toLocaleDateString('es-CO', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  )
}

function formatearTamano(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${Math.round(bytes / 1024)} KB`
}

const ESTADO_CFG: Record<string, { label: string; className: string }> = {
  en_desarrollo: { label: 'En Desarrollo',  className: 'bg-[#FEF9C3] text-[#854D0E]' },
  bajo_revision: { label: 'Bajo Revisión',  className: 'bg-[#DBEAFE] text-[#1E40AF]' },
  retrasado:     { label: 'Retrasado',      className: 'bg-[#FEE2E2] text-[#B91C1C]' },
  finalizado:    { label: 'Finalizado',     className: 'bg-[#DCFCE7] text-[#166534]' },
}

/* ───────── sub-components ───────── */

const AVATAR_COLORS = [
  'bg-[#DBEAFE] text-[#1D4ED8]',
  'bg-[#DCFCE7] text-[#16A34A]',
  'bg-[#FEE2E2] text-[#B91C1C]',
  'bg-[#FEF3C7] text-[#D97706]',
  'bg-[#EDE9FE] text-[#7C3AED]',
  'bg-[#E0F2FE] text-[#0891B2]',
]

function FilaPersona({
  nombre, apellido, correo, badge,
}: {
  nombre: string
  apellido: string
  correo: string
  badge: { label: string; color: string }
}) {
  const idx = ((nombre.charCodeAt(0) ?? 0) + (apellido.charCodeAt(0) ?? 0)) % AVATAR_COLORS.length
  const iniciales = ((nombre[0] ?? '') + (apellido[0] ?? '')).toUpperCase()
  return (
    <div className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 ${AVATAR_COLORS[idx]}`}>
        {iniciales}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#111827] truncate">{nombre} {apellido}</p>
        <p className="text-[11px] text-[#9CA3AF] truncate">{correo}</p>
      </div>
      <span className={`shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-md ${badge.color}`}>
        {badge.label}
      </span>
    </div>
  )
}

function BarraPorcentaje({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(pct, 100)}%`, background: color }}
      />
    </div>
  )
}

function TarjetaEvaluacionHistorial({ ev }: { ev: EvaluacionResponse }) {
  const pct = (ev.calificacion / 5) * 100
  const color = pct >= 80 ? '#0D9488' : pct >= 60 ? '#D97706' : '#B91C1C'
  return (
    <div className="bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#16A34A" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#111827]">
              {ev.docente.nombre} {ev.docente.apellido}
            </p>
            <p className="text-[11px] text-[#9CA3AF]">{formatearFecha(ev.creadoEn)}</p>
          </div>
        </div>
        <span className="text-[22px] font-bold text-[#111827] shrink-0" style={{ color }}>
          {ev.calificacion.toFixed(1)}
        </span>
      </div>
      <BarraPorcentaje pct={pct} color={color} />
      {ev.comentario && (
        <p className="text-[12px] text-[#374151] leading-relaxed italic">
          "{ev.comentario}"
        </p>
      )}
    </div>
  )
}

/* ───────── skeleton ───────── */
function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-5 w-24 bg-[#E5E7EB] rounded-md" />
      <div className="h-8 w-3/4 bg-[#E5E7EB] rounded-md" />
      <div className="h-4 w-full bg-[#E5E7EB] rounded-md" />
      <div className="h-4 w-5/6 bg-[#E5E7EB] rounded-md" />
    </div>
  )
}

/* ───────── main component ───────── */

export default function ProyectoEvaluarDetalle() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const { mostrarAlerta } = useAlertaContext()

  const [proyecto, setProyecto] = useState<ProyectoDetalleResponse | null>(null)
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionResponse[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [calificacion, setCalificacion] = useState('')
  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [errorCalif, setErrorCalif] = useState<string | null>(null)
  const [errorComentario, setErrorComentario] = useState<string | null>(null)
  const [descargando, setDescargando] = useState<string | null>(null)
  const [historialAbierto, setHistorialAbierto] = useState(false)
  const { modalProps, abrirModal } = useModalConfirmacion()

  const cargar = useCallback(async () => {
    if (!id) return
    setCargando(true)
    setError(null)
    try {
      const det = await evaluacionesDocenteService.obtenerDetalle(id)
      setProyecto(det)
      try {
        const evs = await evaluacionesDocenteService.listarEvaluaciones(id)
        setEvaluaciones(evs)
      } catch {
        setEvaluaciones([])
      }
    } catch {
      setError('No se pudo cargar la información del proyecto.')
      mostrarAlerta({ mensaje: 'No se pudo cargar el proyecto.', variante: 'error' })
    } finally {
      setCargando(false)
    }
  }, [id, mostrarAlerta])

  useEffect(() => { cargar() }, [cargar])

  const validarCalificacion = (val: string): boolean => {
    const n = parseFloat(val)
    return !isNaN(n) && n >= 0 && n <= 5
  }

  const handleSubmit = async () => {
    if (!id) return
    setEnviando(true)
    try {
      await evaluacionesDocenteService.crearEvaluacion(id, {
        idDocente: String(usuario?.id ?? ''),
        calificacion: parseFloat(calificacion),
        comentario: comentario.trim(),
      })
      mostrarAlerta({ mensaje: 'Calificación enviada exitosamente.', variante: 'exito' })
      setCalificacion('')
      setComentario('')
      const evs = await evaluacionesDocenteService.listarEvaluaciones(id)
      setEvaluaciones(evs)
    } catch {
      mostrarAlerta({ mensaje: 'Error al enviar la calificación. Intenta de nuevo.', variante: 'error' })
    } finally {
      setEnviando(false)
    }
  }

  const handleClickEnviar = () => {
    setErrorCalif(null)
    setErrorComentario(null)
    let hayError = false
    if (!validarCalificacion(calificacion)) {
      setErrorCalif('La calificación debe estar entre 0.0 y 5.0.')
      hayError = true
    }
    if (!comentario.trim()) {
      setErrorComentario('El comentario es obligatorio.')
      hayError = true
    }
    if (hayError) return
    abrirModal({
      titulo: 'Confirmar calificación',
      mensaje: `¿Estás seguro de enviar la calificación ${parseFloat(calificacion).toFixed(1)} para este proyecto? Esta acción quedará registrada en el expediente académico.`,
      labelConfirmar: 'Enviar calificación',
      variante: 'advertencia',
      onConfirmar: handleSubmit,
    })
  }

  /* ── estados de carga / error ── */
  if (cargando) {
    return (
      <div className="animate-fade-in">
        <button
          type="button"
          onClick={() => navigate('/docente/evaluaciones')}
          className="flex items-center gap-1.5 text-[13px] text-[#9CA3AF] hover:text-[#B91C1C] transition-colors duration-150 mb-5 group"
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="group-hover:-translate-x-0.5 transition-transform duration-150">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Evaluaciones
        </button>
        <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 320px' }}>
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
            <Skeleton />
          </div>
          <div className="h-[340px] bg-[#E5E7EB] rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (error || !proyecto) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 animate-fade-in">
        <p className="text-[14px] text-[#6B7280]">{error ?? 'Proyecto no encontrado.'}</p>
        <button
          type="button"
          onClick={() => navigate('/docente/evaluaciones')}
          className="px-4 py-2 text-[13px] font-semibold text-white bg-[#B91C1C] rounded-lg hover:bg-[#991B1B] transition-colors duration-150"
        >
          Volver
        </button>
      </div>
    )
  }

  const handleDescargar = async (idVersion: string) => {
    if (!id || descargando) return
    setDescargando(idVersion)
    try {
      await proyectosService.descargarVersion(id, idVersion)
    } catch {
      mostrarAlerta({ mensaje: 'No se pudo descargar el documento. Intenta de nuevo.', variante: 'error' })
    } finally {
      setDescargando(null)
    }
  }

  const versionesOrdenadas = [...(proyecto.versiones ?? [])].sort(
    (a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime()
  )

  const estadoCfg = ESTADO_CFG[proyecto.estado] ?? { label: proyecto.estado, className: 'bg-[#F3F4F6] text-[#6B7280]' }

  return (
    <div className="animate-fade-in">
      <ModalConfirmacion {...modalProps} />
      {/* Breadcrumb */}
      <button
        type="button"
        onClick={() => navigate('/docente/evaluaciones')}
        className="flex items-center gap-1.5 text-[13px] text-[#9CA3AF] hover:text-[#B91C1C] transition-colors duration-150 mb-5 group"
      >
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" className="group-hover:-translate-x-0.5 transition-transform duration-150">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Evaluaciones
      </button>

      {/* Dos columnas */}
      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 320px', alignItems: 'start' }}>

        {/* ── Columna izquierda ── */}
        <div className="flex flex-col gap-5">

          {/* Tarjeta de información del proyecto */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-6 animate-slide-up">
            {/* Estado */}
            <span className={`inline-block text-[10px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-md mb-4 ${estadoCfg.className}`}>
              {estadoCfg.label}
            </span>

            {/* Título */}
            <h1 className="text-[22px] font-bold text-[#111827] leading-snug mb-2">
              {proyecto.titulo}
            </h1>

            {/* Resumen */}
            {proyecto.resumen && (
              <div className="mb-5">
                <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-[0.1em] mb-1.5">
                  Resumen
                </p>
                <p className="text-[13px] text-[#6B7280] leading-relaxed">
                  {proyecto.resumen}
                </p>
              </div>
            )}

            {/* Metadata */}
            {(proyecto.semestre || proyecto.materia) && (
              <div className="flex flex-wrap gap-x-8 gap-y-3 pb-5 border-b border-[#F3F4F6]">
                {proyecto.semestre && (
                  <div>
                    <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-[0.1em] mb-0.5">Semestre</p>
                    <p className="text-[13px] font-medium text-[#374151]">{proyecto.semestre}</p>
                  </div>
                )}
                {proyecto.materia && (
                  <div>
                    <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-[0.1em] mb-0.5">Materia</p>
                    <p className="text-[13px] font-medium text-[#374151]">{proyecto.materia}</p>
                  </div>
                )}
              </div>
            )}

            {/* Líneas de investigación */}
            {proyecto.lineas && proyecto.lineas.length > 0 && (
              <div className="pt-5 pb-5 border-t border-[#F3F4F6]">
                <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-[0.1em] mb-2.5">
                  Líneas de Investigación
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {proyecto.lineas.map((l) => (
                    <span key={l.id} className="inline-flex items-center bg-[#F3F4F6] text-[#374151] px-2.5 py-1 rounded-full text-[11px] font-medium">
                      {l.nombre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Equipo académico */}
            {(proyecto.directores.length > 0 || proyecto.evaluadores?.length > 0 || proyecto.integrantes.length > 0) && (
              <div className="pt-5 border-t border-[#F3F4F6] flex flex-col gap-4">

                {proyecto.integrantes.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-[0.1em] mb-2">
                      {proyecto.integrantes.length === 1 ? 'Integrante' : 'Integrantes'}
                    </p>
                    <div className="flex flex-col divide-y divide-[#F9FAFB]">
                      {proyecto.integrantes.map((m) => (
                        <FilaPersona
                          key={m.id}
                          nombre={m.nombre}
                          apellido={m.apellido}
                          correo={m.correo}
                          badge={{ label: 'ESTUDIANTE', color: 'text-[#0891B2] bg-[#E0F2FE]' }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {proyecto.directores.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-[0.1em] mb-2">
                      {proyecto.directores.length === 1 ? 'Director' : 'Directores'}
                    </p>
                    <div className="flex flex-col divide-y divide-[#F9FAFB]">
                      {proyecto.directores.map((d, i) => (
                        <FilaPersona
                          key={d.id}
                          nombre={d.nombre}
                          apellido={d.apellido}
                          correo={d.correo}
                          badge={i === 0
                            ? { label: 'DIRECTOR', color: 'text-[#B91C1C] bg-[#FEE2E2]' }
                            : { label: 'CO-DIRECTOR', color: 'text-[#1D4ED8] bg-[#DBEAFE]' }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {proyecto.evaluadores && proyecto.evaluadores.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-[0.1em] mb-2">
                      {proyecto.evaluadores.length === 1 ? 'Evaluador' : 'Evaluadores'}
                    </p>
                    <div className="flex flex-col divide-y divide-[#F9FAFB]">
                      {proyecto.evaluadores.map((e) => (
                        <FilaPersona
                          key={e.id}
                          nombre={e.nombre}
                          apellido={e.apellido}
                          correo={e.correo}
                          badge={{ label: 'EVALUADOR', color: 'text-[#7C3AED] bg-[#EDE9FE]' }}
                        />
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* Versiones de documentos */}
          {versionesOrdenadas.length > 0 && (
            <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden animate-slide-up" style={{ animationDelay: '0.05s' }}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#F3F4F6]">
                <h2 className="text-[14px] font-bold text-[#111827]">Versiones de Documentos</h2>
                <span className="text-[11px] text-[#9CA3AF] font-medium">
                  {versionesOrdenadas.length} {versionesOrdenadas.length === 1 ? 'versión subida' : 'versiones subidas'}
                </span>
              </div>
              <div className="divide-y divide-[#F9FAFB]">
                {(() => {
                  const primera = versionesOrdenadas[0]
                  const resto = versionesOrdenadas.slice(1)
                  const renderFila = (v: typeof primera, esMasActual: boolean) => {
                    const esPdf = v.mimeType?.includes('pdf') || v.nombreArchivo.toLowerCase().endsWith('.pdf')
                    const enDescarga = descargando === v.id
                    return (
                      <div key={v.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#FAFAFA] transition-colors duration-100">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${esPdf ? 'bg-[#FEE2E2]' : 'bg-[#F3F4F6]'}`}>
                          {esPdf ? (
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#B91C1C" strokeWidth={1.8}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          ) : (
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#6B7280" strokeWidth={1.8}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-[13px] font-semibold text-[#111827] truncate">{v.nombreArchivo}</p>
                            {esMasActual && (
                              <span className="shrink-0 text-[9px] font-bold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded bg-[#DCFCE7] text-[#15803D]">
                                Más reciente
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#9CA3AF]">
                            Subido el {formatearFecha(v.creadoEn)}
                            {v.subidoPor && ` • por ${v.subidoPor.nombre} ${v.subidoPor.apellido}`}
                            {v.tamanoBytes ? ` • ${formatearTamano(v.tamanoBytes)}` : ''}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDescargar(v.id)}
                          disabled={!!descargando}
                          className="shrink-0 flex items-center gap-1 px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-[12px] font-medium text-[#374151] hover:border-[#B91C1C] hover:text-[#B91C1C] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {enDescarga ? (
                            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          )}
                          Descargar
                        </button>
                      </div>
                    )
                  }
                  return (
                    <>
                      {renderFila(primera, true)}
                      {resto.length > 0 && (
                        <div className="border-t border-[#F3F4F6]">
                          <button
                            type="button"
                            onClick={() => setHistorialAbierto((v) => !v)}
                            className="flex items-center gap-1.5 px-5 py-3 text-[11px] font-semibold text-[#6B7280] hover:text-[#B91C1C] transition-colors duration-150 w-full"
                          >
                            <svg
                              width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                              className={`transition-transform duration-300 ${historialAbierto ? 'rotate-180' : ''}`}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                            Historial de versiones ({resto.length})
                          </button>
                          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${historialAbierto ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="divide-y divide-[#F9FAFB]">
                              {resto.map((v) => renderFila(v, false))}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            </div>
          )}

          {/* Historial de evaluaciones */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="px-5 py-4 border-b border-[#F3F4F6]">
              <h2 className="text-[14px] font-bold text-[#111827]">Historial de Evaluaciones</h2>
            </div>
            {evaluaciones.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#D1D5DB" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <p className="text-[13px] text-[#9CA3AF]">Sin evaluaciones registradas aún</p>
              </div>
            ) : (
              <div className="p-5 flex flex-col gap-3">
                {evaluaciones.map((ev) => (
                  <TarjetaEvaluacionHistorial key={ev.id} ev={ev} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Columna derecha (sticky) ── */}
        <div className="flex flex-col gap-4 sticky top-6">

          {/* Formulario de calificación */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#F3F4F6] flex items-center gap-2">
              <svg width="16" height="16" fill="#B91C1C" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <h2 className="text-[14px] font-bold text-[#111827]">Calificar Proyecto</h2>
            </div>

            <div className="p-5 flex flex-col gap-4">
              {/* Calificación */}
              <div>
                <label className={`block text-[10px] font-semibold uppercase tracking-[0.1em] mb-2 ${errorCalif ? 'text-[#B91C1C]' : 'text-[#9CA3AF]'}`}>
                  Calificación final (0.0 – 5.0)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  placeholder="0.0"
                  value={calificacion}
                  onChange={(e) => {
                    const raw = e.target.value
                    if (raw === '' || raw === '-') { setCalificacion(''); return }
                    const num = parseFloat(raw)
                    if (isNaN(num)) return
                    const clamped = Math.min(5, Math.max(0, num))
                    const redondeado = Math.round(clamped * 10) / 10
                    setCalificacion(String(redondeado))
                    setErrorCalif(null)
                  }}
                  className={`w-full px-4 py-3 border rounded-lg text-[22px] font-bold text-[#111827] text-center focus:outline-none transition-colors bg-white placeholder:text-[#D1D5DB] placeholder:font-normal placeholder:text-[16px] ${errorCalif ? 'border-[#B91C1C] bg-[#FEF2F2] focus:border-[#B91C1C]' : 'border-[#E5E7EB] focus:border-[#B91C1C]'}`}
                />
                {errorCalif ? (
                  <p className="text-[11px] text-[#B91C1C] mt-1.5 flex items-center gap-1">
                    <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {errorCalif}
                  </p>
                ) : (
                  <p className="text-[11px] text-[#9CA3AF] mt-1.5">Use puntos decimales (ej: 4.5)</p>
                )}
              </div>

              {/* Comentario */}
              <div>
                <label className={`block text-[10px] font-semibold uppercase tracking-[0.1em] mb-2 ${errorComentario ? 'text-[#B91C1C]' : 'text-[#9CA3AF]'}`}>
                  Retroalimentación Académica
                </label>
                <textarea
                  rows={5}
                  placeholder="Proporcione retroalimentación académica detallada sobre la implementación, documentación técnica y presentación..."
                  value={comentario}
                  onChange={(e) => { setComentario(e.target.value); setErrorComentario(null) }}
                  className={`w-full px-3 py-2.5 border rounded-lg text-[13px] text-[#374151] placeholder:text-[#9CA3AF] focus:outline-none transition-colors bg-white resize-none leading-relaxed ${errorComentario ? 'border-[#B91C1C] bg-[#FEF2F2] focus:border-[#B91C1C]' : 'border-[#E5E7EB] focus:border-[#B91C1C]'}`}
                />
                {errorComentario ? (
                  <p className="text-[11px] text-[#B91C1C] mt-1 flex items-center gap-1">
                    <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {errorComentario}
                  </p>
                ) : (
                  <p className="text-[11px] text-[#9CA3AF] mt-1 flex items-center gap-1">
                    <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    La retroalimentación es obligatoria por transparencia y trazabilidad.
                  </p>
                )}
              </div>

              {/* Aviso de finalización */}
              <div className="flex items-start gap-2 bg-[#FEF3C7] border border-[#FDE68A] rounded-lg px-3 py-2.5">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#D97706" strokeWidth={2} className="mt-0.5 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <p className="text-[12px] text-[#92400E] leading-snug">
                  Al enviar la calificación, quedará registrada en el expediente académico y el equipo será notificado.
                </p>
              </div>

              {/* Botón enviar */}
              <button
                type="button"
                onClick={handleClickEnviar}
                disabled={enviando}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#B91C1C] text-white text-[14px] font-bold rounded-lg hover:bg-[#991B1B] active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {enviando ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Enviar Calificación
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
