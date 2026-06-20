import { useState, useEffect, useCallback, useRef } from 'react'
import { useAlertaContext } from '../../context/AlertaContext'
import { listaProyectosDocenteService } from '../../services/docente/listaProyectos.service'
import { proyectosService } from '../../services/proyectos.service'
import FiltrosProyectos from '../../components/ui/FiltrosProyectos'
import { GrillaProyectos } from '../../components/proyecto/GrillaProyectos'
import Paginacion from '../../components/ui/Paginacion'
import type {
  ProyectoResponse,
  SemestreResponse,
  MateriaResponse,
  LineaInvestigacionResponse,
  EstadoProyectoResponse,
  NivelVisibilidadResponse,
} from '../../types/api.types'

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
  if (f.semestre)        return 'semestre'
  if (f.materia)         return 'materia'
  if (f.estado)          return 'estado'
  return 'todos'
}

export default function ListaProyectosDocente() {
  const { mostrarAlerta } = useAlertaContext()

  const [proyectos, setProyectos]             = useState<ProyectoResponse[]>([])
  const [cargando, setCargando]               = useState(false)
  const [error, setError]                     = useState<string | null>(null)
  const [paginaActual, setPaginaActual]       = useState(0)
  const [totalPaginas, setTotalPaginas]       = useState(1)
  const [totalElementos, setTotalElementos]   = useState(0)

  const [filtros, setFiltros]     = useState<FiltrosValores>({
    busqueda: '', semestre: '', materia: '', lineaInvestigacion: '', estado: '', visibilidad: '',
  })
  const [aplicados, setAplicados] = useState<FiltrosValores>(filtros)

  const [semestres, setSemestres]       = useState<SemestreResponse[]>([])
  const [materias, setMaterias]         = useState<MateriaResponse[]>([])
  const [lineas, setLineas]             = useState<LineaInvestigacionResponse[]>([])
  const [estados, setEstados]           = useState<EstadoProyectoResponse[]>([])
  const [visibilidades, setVisibilidades] = useState<NivelVisibilidadResponse[]>([])
  const estadosMapRef                   = useRef<Record<string, number>>({})

  useEffect(() => {
    listaProyectosDocenteService.listarSemestres({ size: 100 }).then(r => setSemestres(r.content)).catch(() => {})
    listaProyectosDocenteService.listarMaterias({ size: 100 }).then(r => setMaterias(r.content)).catch(() => {})
    listaProyectosDocenteService.listarLineas({ size: 100 }).then(r => setLineas(r.content)).catch(() => {})
    proyectosService.listarEstados()
      .then(lista => {
        estadosMapRef.current = Object.fromEntries(lista.map(e => [e.nombre, e.id]))
        setEstados(lista)
      })
      .catch(() => {})
    proyectosService.listarNivelesVisibilidad().then(setVisibilidades).catch(() => {})
  }, [])

  const cargarProyectos = useCallback(async (f: FiltrosValores, pagina: number) => {
    setCargando(true)
    setError(null)
    try {
      const params = { page: pagina, size: PAGINA_SIZE }
      const modo   = resolverModo(f)
      let resultado

      if (modo === 'busqueda')  resultado = await listaProyectosDocenteService.buscarProyectos(f.busqueda.trim(), params)
      else if (modo === 'semestre') resultado = await listaProyectosDocenteService.listarPorSemestre(f.semestre, params)
      else if (modo === 'materia')  resultado = await listaProyectosDocenteService.listarPorMateria(f.materia, params)
      else if (modo === 'estado')   resultado = await listaProyectosDocenteService.listarPorEstado(estadosMapRef.current[f.estado] ?? 1, params)
      else resultado = await listaProyectosDocenteService.listarProyectos({ ...params, sort: 'creadoEn,desc' })

      let contenido = resultado.content
      if (f.visibilidad) contenido = contenido.filter(p => p.visibilidad === f.visibilidad)

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
        onChange={(campo, valor) => setFiltros(prev => ({ ...prev, [campo]: valor }))}
        onFiltrar={() => { setAplicados(filtros); setPaginaActual(0) }}
        semestres={semestres.map(s => ({ id: s.id, nombre: s.nombre }))}
        materias={materias.map(m => ({ id: m.id, nombre: m.nombre }))}
        lineas={lineas.map(l => ({ id: l.id, nombre: l.nombre }))}
        estados={estados}
        visibilidades={visibilidades}
      />

      <div className="mt-6 animate-fade-in">
        <div className="mb-5 animate-slide-up">
          <h2 className="text-xl font-bold text-[#111827] mb-1">Lista de Proyectos</h2>
          <p className="text-[13px] text-[#6B7280] max-w-[480px]">
            Gestiona y evalúa los proyectos de tesis del programa de Ingeniería de Sistemas.
          </p>
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
              onCambiarPagina={p => setPaginaActual(p - 1)}
            />
          </div>
        )}
      </div>
    </>
  )
}
