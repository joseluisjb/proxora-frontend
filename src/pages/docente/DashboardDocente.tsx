import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useAlertaContext } from '../../context/AlertaContext'
import { extraerMensajeError } from '../../utils/errores'
import { dashboardDocenteService, type ResumenDashboardDocente } from '../../services/docente/dashboard.service'
import { evaluacionesDocenteService } from '../../services/docente/evaluaciones.service'
import type { ProyectoResponse } from '../../types/api.types'

const ESTADO_CFG: Record<string, { label: string; className: string }> = {
  en_desarrollo: { label: 'En Desarrollo',  className: 'bg-[#FEF9C3] text-[#854D0E]' },
  bajo_revision: { label: 'Bajo Revisión',  className: 'bg-[#DBEAFE] text-[#1E40AF]' },
  retrasado:     { label: 'Retrasado',      className: 'bg-[#FEE2E2] text-[#B91C1C]' },
  finalizado:    { label: 'Finalizado',     className: 'bg-[#DCFCE7] text-[#166534]' },
}

function AvatarIntegrante({ nombre, apellido }: { nombre: string; apellido: string }) {
  const colores = [
    'bg-[#DBEAFE] text-[#1D4ED8]',
    'bg-[#DCFCE7] text-[#16A34A]',
    'bg-[#FEE2E2] text-[#B91C1C]',
    'bg-[#FEF3C7] text-[#D97706]',
    'bg-[#EDE9FE] text-[#7C3AED]',
  ]
  const idx = ((nombre.charCodeAt(0) ?? 0) + (apellido.charCodeAt(0) ?? 0)) % colores.length
  const iniciales = ((nombre[0] ?? '') + (apellido[0] ?? '')).toUpperCase()
  return (
    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white shrink-0 ${colores[idx]}`}>
      {iniciales}
    </span>
  )
}

function SkeletonFila() {
  return (
    <tr className="border-b border-[#F9FAFB]">
      {[1, 2, 3, 4].map((i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-4 bg-[#F3F4F6] rounded animate-pulse" />
        </td>
      ))}
    </tr>
  )
}

export default function DashboardDocente() {
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const { mostrarAlerta } = useAlertaContext()

  const [resumen, setResumen]         = useState<ResumenDashboardDocente | null>(null)
  const [proyectos, setProyectos]     = useState<ProyectoResponse[]>([])
  const [cargando, setCargando]       = useState(true)

  const idDocente     = String(usuario?.id ?? '')
  const nombreDocente = [usuario?.nombre, usuario?.apellido].filter(Boolean).join(' ') || 'Docente'

  useEffect(() => {
    if (!idDocente) return
    setCargando(true)
    Promise.all([
      dashboardDocenteService.obtenerResumen(idDocente),
      evaluacionesDocenteService.listarProyectosPendientes(idDocente, { size: 10 }),
    ])
      .then(([res, paginado]) => {
        setResumen(res)
        setProyectos(paginado.content)
      })
      .catch((err) => {
        mostrarAlerta({ mensaje: extraerMensajeError(err, 'Error al cargar el dashboard. Intenta de nuevo.'), variante: 'error' })
      })
      .finally(() => setCargando(false))
  }, [idDocente]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="animate-fade-in">
      {/* Encabezado */}
      <div className="mb-6 animate-slide-up">
        <h1 className="text-[28px] font-bold text-[#111827] mb-1">
          Bienvenido/a, {nombreDocente}
        </h1>
        <p className="text-[14px] text-[#6B7280]">
          Gestiona tus proyectos dirigidos y evaluaciones académicas.
        </p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div
        className="grid grid-cols-2 gap-4 mb-6 animate-slide-up"
        style={{ animationDelay: '0.05s' }}
      >
        {/* Total proyectos como evaluador */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm">
          <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-[0.1em] mb-3">
            Total proyectos asignados
          </p>
          {cargando ? (
            <div className="h-10 w-16 bg-[#F3F4F6] rounded-lg animate-pulse mb-2" />
          ) : (
            <p className="text-[42px] font-bold text-[#111827] leading-none mb-2">
              {resumen?.totalProyectos ?? 0}
            </p>
          )}
          <p className="text-[12px] text-[#9CA3AF]">Proyectos como evaluador</p>
        </div>

        {/* Evaluaciones pendientes */}
        <div className="bg-[#B91C1C] rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute right-3 bottom-2 opacity-[0.08] pointer-events-none">
            <svg width="80" height="80" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <p className="text-[11px] font-semibold text-[#FCA5A5] uppercase tracking-[0.1em] mb-3">
            Evaluaciones pendientes
          </p>
          {cargando ? (
            <div className="h-10 w-16 bg-[#991B1B] rounded-lg animate-pulse mb-2" />
          ) : (
            <p className="text-[42px] font-bold text-white leading-none mb-2">
              {resumen?.evaluacionesPendientes ?? 0}
            </p>
          )}
          <div className="flex items-center gap-1.5">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#FCA5A5" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[12px] text-[#FCA5A5]">Requiere atención inmediata</span>
          </div>
        </div>
      </div>

      {/* Tabla de proyectos pendientes de evaluación */}
      <div
        className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden animate-slide-up"
        style={{ animationDelay: '0.1s' }}
      >
        <div className="px-5 py-4 border-b border-[#F3F4F6] flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-[#111827]">Proyectos Pendientes de Evaluación</h2>
          <button
            onClick={() => navigate('/docente/evaluaciones')}
            className="text-[11px] font-bold text-[#B91C1C] hover:text-[#991B1B] hover:underline uppercase tracking-[0.08em] transition-colors duration-150 cursor-pointer"
          >
            Ver todo
          </button>
        </div>

        {cargando ? (
          <table className="w-full">
            <tbody>
              {[1, 2, 3, 4].map((i) => <SkeletonFila key={i} />)}
            </tbody>
          </table>
        ) : proyectos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#D1D5DB" strokeWidth={1.5} className="mb-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p className="text-[13px] text-[#6B7280]">No hay proyectos pendientes de evaluación</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F3F4F6]">
                  <th className="text-left text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-[0.08em] px-5 py-3 whitespace-nowrap">
                    Proyecto
                  </th>
                  <th className="text-left text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-[0.08em] px-3 py-3 whitespace-nowrap">
                    Integrantes
                  </th>
                  <th className="text-left text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-[0.08em] px-3 py-3 whitespace-nowrap">
                    Estado
                  </th>
                  <th className="text-left text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-[0.08em] px-3 py-3 whitespace-nowrap">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {proyectos.map((p) => {
                  const estadoCfg = ESTADO_CFG[p.estado] ?? { label: p.estado, className: 'bg-[#F3F4F6] text-[#6B7280]' }
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-[#F9FAFB] hover:bg-[#FAFAFA] transition-colors duration-100"
                    >
                      <td className="px-5 py-3.5 max-w-[260px]">
                        <p className="text-[13px] font-semibold text-[#111827] mb-0.5 truncate">
                          {p.titulo}
                        </p>
                        {(p.materia || p.semestre) && (
                          <p className="text-[11px] text-[#9CA3AF] flex items-center gap-1 flex-wrap">
                            {p.materia && <span>{p.materia}</span>}
                            {p.materia && p.semestre && <span className="inline-block w-1 h-1 rounded-full bg-[#D1D5DB]" />}
                            {p.semestre && <span>{p.semestre}</span>}
                          </p>
                        )}
                        {p.lineas.length > 0 && (
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            {p.lineas.slice(0, 2).map((l) => (
                              <span key={l.id} className="text-[10px] px-1.5 py-0.5 rounded bg-[#F3F4F6] text-[#6B7280] font-medium">
                                {l.nombre}
                              </span>
                            ))}
                            {p.lineas.length > 2 && (
                              <span className="text-[10px] text-[#9CA3AF]">+{p.lineas.length - 2}</span>
                            )}
                          </div>
                        )}
                        {p.directores.length > 0 && (
                          <p className="text-[11px] text-[#9CA3AF] mt-1 truncate">
                            <span className="font-medium">Director: </span>
                            {`${p.directores[0].nombre} ${p.directores[0].apellido}`}
                          </p>
                        )}
                        {p.directores.length > 1 && (
                          <p className="text-[11px] text-[#9CA3AF] truncate">
                            <span className="font-medium">Co-Directores: </span>
                            {p.directores.slice(1).map((d) => `${d.nombre} ${d.apellido}`).join(', ')}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-3.5">
                        {p.integrantes.length > 0 ? (
                          <>
                            <div className="flex items-center">
                              {p.integrantes.slice(0, 3).map((m, i) => (
                                <div
                                  key={m.id}
                                  className={i > 0 ? '-ml-2' : ''}
                                  style={{ position: 'relative', zIndex: p.integrantes.length - i }}
                                >
                                  <AvatarIntegrante nombre={m.nombre} apellido={m.apellido} />
                                </div>
                              ))}
                              {p.integrantes.length > 3 && (
                                <span className="ml-1 text-[11px] text-[#9CA3AF]">
                                  +{p.integrantes.length - 3}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#6B7280] mt-1 whitespace-nowrap">
                              {p.integrantes.slice(0, 2).map((m) => `${m.nombre} ${m.apellido}`).join(', ')}
                              {p.integrantes.length > 2 && ` y ${p.integrantes.length - 2} más`}
                            </p>
                          </>
                        ) : (
                          <span className="text-[12px] text-[#9CA3AF]">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${estadoCfg.className}`}>
                          {estadoCfg.label}
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        <button
                          onClick={() => navigate(`/docente/evaluaciones/${p.id}`)}
                          className="px-4 py-1.5 bg-[#B91C1C] text-white text-[12px] font-semibold rounded-lg hover:bg-[#991B1B] active:scale-95 transition-all duration-150"
                        >
                          Evaluar
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
