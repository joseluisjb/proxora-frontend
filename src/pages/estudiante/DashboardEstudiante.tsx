import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type {
  ProyectoResponse,
  SemestreResponse,
  MateriaResponse,
  LineaInvestigacionResponse,
} from '../../types/api.types';
import { dashboardService } from '../../services/estudiante/dashboard.service';
import { GrillaProyectos } from '../../components/proyecto/GrillaProyectos';
import FiltrosProyectos from '../../components/ui/FiltrosProyectos';
import Paginacion from '../../components/ui/Paginacion';
import { useAlertaContext } from '../../context/AlertaContext';

interface FiltrosValores {
  busqueda: string
  semestre: string
  materia: string
  lineaInvestigacion: string
  estado: string
  visibilidad: string
}

type ModoConsulta = 'todos' | 'busqueda' | 'semestre' | 'materia' | 'estado'

const PAGINA_SIZE = 4

function resolverModo(f: FiltrosValores): ModoConsulta {
  if (f.busqueda.trim()) return 'busqueda'
  if (f.semestre) return 'semestre'
  if (f.materia) return 'materia'
  if (f.estado) return 'estado'
  return 'todos'
}

const ESTADO_MAP: Record<string, number> = {
  en_desarrollo: 1, finalizado: 2, bajo_revision: 3, retrasado: 4,
}

export default function DashboardEstudiante() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { mostrarAlerta } = useAlertaContext();

  const [proyectos, setProyectos] = useState<ProyectoResponse[]>([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paginaActual, setPaginaActual] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalElementos, setTotalElementos] = useState(0)

  const [filtros, setFiltros] = useState<FiltrosValores>({
    busqueda: '', semestre: '', materia: '', lineaInvestigacion: '', estado: '', visibilidad: '',
  })
  const [aplicados, setAplicados] = useState<FiltrosValores>(filtros)

  const [semestres, setSemestres] = useState<SemestreResponse[]>([])
  const [materias, setMaterias] = useState<MateriaResponse[]>([])
  const [lineas, setLineas] = useState<LineaInvestigacionResponse[]>([])

  useEffect(() => {
    if (searchParams.get('registrado') === 'true') {
      setSearchParams({}, { replace: true })
      mostrarAlerta({ mensaje: '¡Proyecto registrado exitosamente!', variante: 'exito' })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    dashboardService.listarSemestres({ size: 100 }).then((r) => setSemestres(r.content)).catch(() => {})
    dashboardService.listarMaterias({ size: 100 }).then((r) => setMaterias(r.content)).catch(() => {})
    dashboardService.listarLineas({ size: 100 }).then((r) => setLineas(r.content)).catch(() => {})
  }, [])

  const cargarProyectos = useCallback(async (f: FiltrosValores, pagina: number) => {
    setCargando(true)
    setError(null)
    try {
      const params = { page: pagina, size: PAGINA_SIZE }
      const modo = resolverModo(f)
      let resultado

      if (modo === 'busqueda') resultado = await dashboardService.buscarProyectos(f.busqueda.trim(), params)
      else if (modo === 'semestre') resultado = await dashboardService.listarPorSemestre(f.semestre, params)
      else if (modo === 'materia') resultado = await dashboardService.listarPorMateria(f.materia, params)
      else if (modo === 'estado') resultado = await dashboardService.listarPorEstado(ESTADO_MAP[f.estado] ?? 1, params)
      else resultado = await dashboardService.listarProyectos({ ...params, sort: 'creadoEn,desc' })

      let contenido = resultado.content
      if (f.visibilidad) contenido = contenido.filter((p) => p.visibilidad === f.visibilidad)

      setProyectos(contenido)
      setTotalPaginas(resultado.totalPages || 1)
      setTotalElementos(resultado.totalElements)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } }
      if (axiosErr.response?.status === 401) {
        setError('Sesión expirada. Por favor inicia sesión nuevamente.')
        mostrarAlerta({ mensaje: 'Sesión expirada. Por favor inicia sesión nuevamente.', variante: 'error' })
      } else {
        setError('Error al cargar los proyectos. Intenta de nuevo.')
        mostrarAlerta({ mensaje: 'Error al cargar los proyectos. Intenta de nuevo.', variante: 'error' })
      }
    } finally {
      setCargando(false)
    }
  }, [mostrarAlerta])

  useEffect(() => { cargarProyectos(aplicados, paginaActual) }, [aplicados, paginaActual, cargarProyectos])

  return (
    <>
      <FiltrosProyectos
        valores={filtros}
        onChange={(campo, valor) => setFiltros((prev) => ({ ...prev, [campo]: valor }))}
        onFiltrar={() => { setAplicados(filtros); setPaginaActual(0) }}
        semestres={semestres.map((s) => ({ id: s.id, nombre: s.nombre }))}
        materias={materias.map((m) => ({ id: m.id, nombre: m.nombre }))}
        lineas={lineas.map((l) => ({ id: l.id, nombre: l.nombre }))}
      />

      <div className="mt-6 animate-fade-in">
        <div className="flex items-start justify-between mb-5 animate-slide-up">
          <div>
            <h2 className="text-xl font-bold text-[#111827] mb-1">Publicados recientemente</h2>
            <p className="text-[13px] text-[#6B7280] max-w-[480px]">
              Revisa las últimas contribuciones del programa de Ingeniería de Sistemas.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="w-[34px] h-[34px] flex items-center justify-center border border-[#B91C1C] rounded-md bg-[#B91C1C] text-white cursor-default"
              aria-label="Vista en cuadrícula"
              title="Vista cuadrícula"
              aria-pressed="true"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" />
              </svg>
            </button>
          </div>
        </div>

        <GrillaProyectos
          proyectos={proyectos}
          cargando={cargando}
          error={error}
          vistaActual="grilla"
          onReintentar={() => cargarProyectos(aplicados, paginaActual)}
          mostrarVisibilidad={false}
          mostrarDirector
          mostrarIntegrantes
          columnas={2}
        />

        {!cargando && !error && totalElementos > 0 && (
          <div className="mt-6 flex justify-center">
            <Paginacion
              paginaActual={paginaActual + 1}
              totalPaginas={Math.max(totalPaginas, 1)}
              totalRegistros={totalElementos}
              registrosPorPagina={PAGINA_SIZE}
              labelEntidad="proyectos"
              onCambiarPagina={(p) => setPaginaActual(p - 1)}
            />
          </div>
        )}
      </div>
    </>
  )
}
