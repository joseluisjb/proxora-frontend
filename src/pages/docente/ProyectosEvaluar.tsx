import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { evaluacionesDocenteService } from '../../services/docente/evaluaciones.service'
import { proyectosService } from '../../services/proyectos.service'
import type { ProyectoResponse, EstadoProyectoResponse } from '../../types/api.types'
import { VISIBILIDAD_INTERNA_CONFIG as VISIBILIDAD_CONFIG } from '../../constants/visibilidad'
import Paginacion from '../../components/ui/Paginacion'
import Desplegable from '../../components/ui/Desplegable'
import { useAlertaContext } from '../../context/AlertaContext'
import { extraerMensajeError } from '../../utils/errores'

const PAGINA_SIZE = 8

const PALETA = [
  { color: '#16A34A', bg: '#DCFCE7' },
  { color: '#1D4ED8', bg: '#DBEAFE' },
  { color: '#D97706', bg: '#FEF3C7' },
  { color: '#9333EA', bg: '#F3E8FF' },
  { color: '#B91C1C', bg: '#FEE2E2' },
  { color: '#0891B2', bg: '#E0F2FE' },
]

const ETIQUETA_ESTADO: Record<string, string> = {
  en_desarrollo: 'En Desarrollo',
  finalizado:    'Finalizado',
  bajo_revision: 'Bajo Revisión',
  retrasado:     'Retrasado',
}

export default function ProyectosEvaluar() {
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const { mostrarAlerta } = useAlertaContext()

  const [proyectos, setProyectos] = useState<ProyectoResponse[]>([])
  const [idsPendientes, setIdsPendientes] = useState<Set<string>>(new Set())
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [estadosDisponibles, setEstadosDisponibles] = useState<EstadoProyectoResponse[]>([])

  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroEvaluacion, setFiltroEvaluacion] = useState<'' | 'pendiente' | 'evaluado'>('')
  const [paginaActual, setPaginaActual] = useState(1)

  useEffect(() => {
    proyectosService.listarEstados().then(setEstadosDisponibles).catch(() => {})
  }, [])

  const cargar = useCallback(async () => {
    if (!usuario?.id) return
    setCargando(true)
    setError(null)
    try {
      const idDocente = String(usuario.id)
      const [todos, pendientes] = await Promise.all([
        evaluacionesDocenteService.listarProyectosAEvaluar(idDocente, { size: 100 }),
        evaluacionesDocenteService.listarProyectosPendientes(idDocente, { size: 100 }),
      ])
      const pendientesSet = new Set(pendientes.content.map((p) => p.id))
      setIdsPendientes(pendientesSet)
      const ordenados = [
        ...todos.content.filter((p) => pendientesSet.has(p.id)),
        ...todos.content.filter((p) => !pendientesSet.has(p.id)),
      ]
      setProyectos(ordenados)
    } catch (err) {
      setError('Error al cargar los proyectos asignados. Intenta de nuevo.')
      mostrarAlerta({ mensaje: extraerMensajeError(err, 'Error al cargar los proyectos asignados.'), variante: 'error' })
    } finally {
      setCargando(false)
    }
  }, [usuario])

  useEffect(() => { cargar() }, [cargar])
  useEffect(() => { setPaginaActual(1) }, [busqueda, filtroEstado, filtroEvaluacion])

  const t = busqueda.toLowerCase().trim()
  const proyectosFiltrados = proyectos.filter((p) => {
    if (filtroEstado && p.estado !== filtroEstado) return false
    if (filtroEvaluacion === 'pendiente' && !idsPendientes.has(p.id)) return false
    if (filtroEvaluacion === 'evaluado' && idsPendientes.has(p.id)) return false
    if (!t) return true
    return (
      p.titulo.toLowerCase().includes(t) ||
      (p.semestre ?? '').toLowerCase().includes(t) ||
      (p.materia ?? '').toLowerCase().includes(t) ||
      p.lineas.some((l) => l.nombre.toLowerCase().includes(t))
    )
  })

  const totalPaginas = Math.max(1, Math.ceil(proyectosFiltrados.length / PAGINA_SIZE))
  const proyectosPaginados = proyectosFiltrados.slice(
    (paginaActual - 1) * PAGINA_SIZE,
    paginaActual * PAGINA_SIZE,
  )

  return (
    <div className="animate-fade-in">
      <div className="mb-6 animate-slide-up">
        <h1 className="text-2xl font-bold text-[#111827] mb-1">Evaluaciones</h1>
        <p className="text-[13px] text-[#6B7280] max-w-[480px]">
          Califica los proyectos académicos que te han sido asignados como evaluador.
        </p>
      </div>

      {!cargando && !error && proyectos.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-5 animate-slide-up">
          <div className="relative flex-1 min-w-[200px]">
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
          <Desplegable
            valor={filtroEvaluacion}
            onChange={(v) => setFiltroEvaluacion(v as '' | 'pendiente' | 'evaluado')}
            opciones={[
              { valor: '', etiqueta: 'Pendientes y evaluados' },
              { valor: 'pendiente', etiqueta: 'Solo pendientes' },
              { valor: 'evaluado', etiqueta: 'Solo evaluados' },
            ]}
            ariaLabel="Filtrar por estado de evaluación"
            className="shrink-0"
          />
          <Desplegable
            valor={filtroEstado}
            onChange={setFiltroEstado}
            opciones={[
              { valor: '', etiqueta: 'Todos los estados' },
              ...estadosDisponibles.map((e) => ({ valor: e.nombre, etiqueta: ETIQUETA_ESTADO[e.nombre] ?? e.nombre })),
            ]}
            ariaLabel="Filtrar por estado del proyecto"
            className="shrink-0"
          />
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <p className="text-[14px] text-[#6B7280]">No tienes proyectos asignados para evaluar.</p>
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
              const { color, bg } = PALETA[i % PALETA.length]
              const pendiente = idsPendientes.has(p.id)
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
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-[14px] font-semibold text-[#111827] truncate">{p.titulo}</p>
                        {pendiente ? (
                          <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded-md bg-[#FEF3C7] text-[#B45309]">
                            Pendiente
                          </span>
                        ) : (
                          <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded-md bg-[#DCFCE7] text-[#15803D]">
                            Evaluado
                          </span>
                        )}
                        <span className={`shrink-0 text-[10px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded-md ${VISIBILIDAD_CONFIG[p.visibilidad].clases}`}>
                          {VISIBILIDAD_CONFIG[p.visibilidad].label}
                        </span>
                      </div>
                      {(p.materia || p.semestre) && (
                        <p className="text-[12px] text-[#9CA3AF] flex items-center gap-1.5 flex-wrap">
                          {p.materia && <span>{p.materia}</span>}
                          {p.materia && p.semestre && <span className="inline-block w-1 h-1 rounded-full bg-[#D1D5DB]" aria-hidden="true" />}
                          {p.semestre && <span>{p.semestre}</span>}
                        </p>
                      )}
                      {p.lineas.length > 0 && (
                        <div className="flex items-center gap-1 mt-1.5 flex-wrap">
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

                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/docente/evaluaciones/${p.id}`)}
                    className="shrink-0 flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-white bg-[#B91C1C] rounded-lg hover:bg-[#991B1B] active:scale-95 transition-all duration-150 ml-6"
                  >
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    Evaluar
                  </button>
                </div>
              )
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
  )
}
