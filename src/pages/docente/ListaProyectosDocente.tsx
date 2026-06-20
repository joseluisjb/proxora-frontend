import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAlertaContext } from '../../context/AlertaContext'
import { extraerMensajeError } from '../../utils/errores'
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
import { filtrarProyectos, type FiltrosProyectosValores } from '../../utils/filtrarProyectos'

type FiltrosValores = FiltrosProyectosValores

const PAGINA_SIZE = 4
const LOTE_SIZE = 1000

export default function ListaProyectosDocente() {
  const { mostrarAlerta } = useAlertaContext()

  const [todosProyectos, setTodosProyectos]   = useState<ProyectoResponse[]>([])
  const [cargando, setCargando]               = useState(false)
  const [error, setError]                     = useState<string | null>(null)
  const [paginaActual, setPaginaActual]       = useState(0)

  const [filtros, setFiltros]     = useState<FiltrosValores>({
    busqueda: '', semestre: '', materia: '', lineaInvestigacion: '', estado: '', visibilidad: '',
  })
  const [aplicados, setAplicados] = useState<FiltrosValores>(filtros)
  const [aplicandoFiltro, setAplicandoFiltro] = useState(false)

  const [semestres, setSemestres]       = useState<SemestreResponse[]>([])
  const [materias, setMaterias]         = useState<MateriaResponse[]>([])
  const [lineas, setLineas]             = useState<LineaInvestigacionResponse[]>([])
  const [estados, setEstados]           = useState<EstadoProyectoResponse[]>([])
  const [visibilidades, setVisibilidades] = useState<NivelVisibilidadResponse[]>([])

  useEffect(() => {
    listaProyectosDocenteService.listarSemestres({ size: 100 }).then(r => setSemestres(r.content)).catch(() => {})
    listaProyectosDocenteService.listarMaterias({ size: 100 }).then(r => setMaterias(r.content)).catch(() => {})
    listaProyectosDocenteService.listarLineas({ size: 100 }).then(r => setLineas(r.content)).catch(() => {})
    proyectosService.listarEstados().then(setEstados).catch(() => {})
    proyectosService.listarNivelesVisibilidad().then(setVisibilidades).catch(() => {})
  }, [])

  const cargarProyectos = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const resultado = await listaProyectosDocenteService.listarProyectos({ size: LOTE_SIZE, sort: 'creadoEn,desc' })
      setTodosProyectos(resultado.content)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } }
      if (axiosErr.response?.status === 401) {
        setError('Sesión expirada. Por favor inicia sesión nuevamente.')
        mostrarAlerta({ mensaje: 'Sesión expirada. Por favor inicia sesión nuevamente.', variante: 'error' })
      } else {
        setError('Error al cargar los proyectos. Intenta de nuevo.')
        mostrarAlerta({ mensaje: extraerMensajeError(err, 'Error al cargar los proyectos. Intenta de nuevo.'), variante: 'error' })
      }
    } finally {
      setCargando(false)
    }
  }, [mostrarAlerta])

  useEffect(() => { cargarProyectos() }, [cargarProyectos])

  const proyectosFiltrados = useMemo(() => filtrarProyectos(todosProyectos, aplicados), [todosProyectos, aplicados])
  const totalElementos = proyectosFiltrados.length
  const totalPaginas = Math.max(1, Math.ceil(totalElementos / PAGINA_SIZE))
  const paginaSegura = Math.min(paginaActual, totalPaginas - 1)
  const proyectos = useMemo(
    () => proyectosFiltrados.slice(paginaSegura * PAGINA_SIZE, paginaSegura * PAGINA_SIZE + PAGINA_SIZE),
    [proyectosFiltrados, paginaSegura],
  )

  return (
    <>
      <FiltrosProyectos
        valores={filtros}
        onChange={(campo, valor) => setFiltros(prev => ({ ...prev, [campo]: valor }))}
        onFiltrar={() => {
          setAplicandoFiltro(true)
          setAplicados(filtros)
          setPaginaActual(0)
          setTimeout(() => setAplicandoFiltro(false), 350)
        }}
        semestres={semestres.map(s => ({ id: s.id, nombre: s.nombre }))}
        materias={materias.map(m => ({ id: m.id, nombre: m.nombre }))}
        lineas={lineas.map(l => ({ id: l.id, nombre: l.nombre }))}
        estados={estados}
        visibilidades={visibilidades}
        aplicandoFiltro={aplicandoFiltro}
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
          onReintentar={cargarProyectos}
          mostrarVisibilidad
          mostrarDirector
          mostrarIntegrantes
          columnas={2}
        />

        {!cargando && !error && totalElementos > 0 && (
          <div className="mt-6 flex justify-center">
            <Paginacion
              paginaActual={paginaSegura + 1}
              totalPaginas={totalPaginas}
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
