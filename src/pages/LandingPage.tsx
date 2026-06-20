import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  ProyectoResponse,
  SemestreResponse,
  MateriaResponse,
  LineaInvestigacionResponse,
  EstadoProyectoResponse,
  NivelVisibilidadResponse,
} from '../types/api.types';
import { proyectosService } from '../services/proyectos.service';
import { semestresService } from '../services/semestres.service';
import { materiasService } from '../services/materias.service';
import { lineasService } from '../services/lineas.service';
import NavbarPublica from '../components/layout/NavbarPublica';
import { GrillaProyectos } from '../components/proyecto/GrillaProyectos';
import FiltrosProyectos from '../components/ui/FiltrosProyectos';
import Paginacion from '../components/ui/Paginacion';
import Alerta from '../components/ui/Alerta';
import { useAlerta } from '../hooks/useAlerta';

interface FiltrosValores {
  busqueda: string
  semestre: string
  materia: string
  lineaInvestigacion: string
  estado: string
  visibilidad: string
}

type VistaActual = 'grilla' | 'lista'
type ModoConsulta = 'todos' | 'busqueda' | 'semestre' | 'materia' | 'estado'

const PAGINA_SIZE = 6

function resolverModo(f: FiltrosValores): ModoConsulta {
  if (f.busqueda.trim()) return 'busqueda'
  if (f.semestre) return 'semestre'
  if (f.materia) return 'materia'
  if (f.estado) return 'estado'
  return 'todos'
}

export default function LandingPage() {
  const { alertaProps, mostrarAlerta } = useAlerta()
  const [proyectos, setProyectos] = useState<ProyectoResponse[]>([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paginaActual, setPaginaActual] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalElementos, setTotalElementos] = useState(0)
  const [vistaActual, setVistaActual] = useState<VistaActual>('grilla')

  const [filtros, setFiltros] = useState<FiltrosValores>({
    busqueda: '', semestre: '', materia: '',
    lineaInvestigacion: '', estado: '', visibilidad: '',
  })
  const [aplicados, setAplicados] = useState<FiltrosValores>(filtros)

  const [semestres, setSemestres] = useState<SemestreResponse[]>([])
  const [materias, setMaterias] = useState<MateriaResponse[]>([])
  const [lineas, setLineas] = useState<LineaInvestigacionResponse[]>([])
  const [estados, setEstados] = useState<EstadoProyectoResponse[]>([])
  const [visibilidades, setVisibilidades] = useState<NivelVisibilidadResponse[]>([])
  const estadosMapRef = useRef<Record<string, number>>({})

  useEffect(() => {
    semestresService.listar({ size: 100 }).then((r) => setSemestres(r.content)).catch(() => {})
    materiasService.listar({ size: 100 }).then((r) => setMaterias(r.content)).catch(() => {})
    lineasService.listar({ size: 100 }).then((r) => setLineas(r.content)).catch(() => {})
    proyectosService.listarEstados()
      .then((lista) => {
        estadosMapRef.current = Object.fromEntries(lista.map((e) => [e.nombre, e.id]))
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
      const modo = resolverModo(f)
      let resultado

      if (modo === 'busqueda') resultado = await proyectosService.buscar(f.busqueda.trim(), params)
      else if (modo === 'semestre') resultado = await proyectosService.listarPorSemestre(f.semestre, params)
      else if (modo === 'materia') resultado = await proyectosService.listarPorMateria(f.materia, params)
      else if (modo === 'estado') resultado = await proyectosService.listarPorEstado(estadosMapRef.current[f.estado] ?? 1, params)
      else resultado = await proyectosService.listar({ ...params, sort: 'creadoEn,desc' })

      let contenido = resultado.content
      if (f.visibilidad) contenido = contenido.filter((p) => p.visibilidad === f.visibilidad)

      setProyectos(contenido)
      setTotalPaginas(resultado.totalPages || 1)
      setTotalElementos(resultado.totalElements)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } }
      if (axiosErr.response?.status === 401) {
        setError('Los proyectos requieren autenticación. Inicia sesión para verlos.')
        mostrarAlerta({ mensaje: 'Los proyectos requieren autenticación. Inicia sesión para verlos.', variante: 'advertencia' })
      } else {
        setError('Error al cargar los proyectos. Intenta de nuevo.')
        mostrarAlerta({ mensaje: 'Error al cargar los proyectos. Intenta de nuevo.', variante: 'error' })
      }
    } finally {
      setCargando(false)
    }
  }, [mostrarAlerta])

  useEffect(() => {
    cargarProyectos(aplicados, paginaActual)
  }, [aplicados, paginaActual, cargarProyectos])

  const handleCambioFiltro = (campo: string, valor: string) => setFiltros((prev) => ({ ...prev, [campo]: valor }))
  const handleFiltrar = () => { setAplicados(filtros); setPaginaActual(0) }
  const handleCambiarPagina = (paginaBase1: number) => setPaginaActual(paginaBase1 - 1)

  const vistaBtnCls = (activo: boolean) =>
    `w-9 h-9 flex items-center justify-center border-none rounded-md cursor-pointer transition-colors ${activo ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB] hover:text-[#374151]'}`;

  return (
    <div className="min-h-screen bg-white font-sans">
      <Alerta {...alertaProps} />
      <NavbarPublica />

      <div className="bg-white border-b border-[#E5E7EB] py-4 sticky top-14 z-[90]">
        <div className="max-w-[1200px] mx-auto px-12 max-lg:px-6 max-sm:px-4">
          <FiltrosProyectos
            valores={filtros}
            onChange={handleCambioFiltro}
            onFiltrar={handleFiltrar}
            semestres={semestres.map((s) => ({ id: s.id, nombre: s.nombre }))}
            materias={materias.map((m) => ({ id: m.id, nombre: m.nombre }))}
            lineas={lineas.map((l) => ({ id: l.id, nombre: l.nombre }))}
            estados={estados}
            visibilidades={visibilidades}
          />
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-12 pt-8 pb-12 max-lg:px-6 max-sm:px-4 animate-fade-in">
        <div className="flex items-start justify-between gap-4 mb-6 max-sm:flex-col animate-slide-up">
          <div>
            <h2 className="text-2xl font-bold text-[#111827] m-0 mb-1">Publicados recientemente</h2>
            <p className="text-sm text-[#6B7280] m-0">Revisa las últimas contribuciones del programa de Ingeniería de Sistemas.</p>
          </div>
          <div className="flex gap-1 shrink-0">
            <button type="button" className={vistaBtnCls(vistaActual === 'grilla')} onClick={() => setVistaActual('grilla')} aria-label="Vista en cuadrícula" title="Vista cuadrícula">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" /></svg>
            </button>
            <button type="button" className={vistaBtnCls(vistaActual === 'lista')} onClick={() => setVistaActual('lista')} aria-label="Vista en lista" title="Vista lista">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 5h18v2H3V5zm0 6h18v2H3v-2zm0 6h18v2H3v-2z" /></svg>
            </button>
          </div>
        </div>

        <GrillaProyectos
          proyectos={proyectos}
          cargando={cargando}
          error={error}
          vistaActual={vistaActual}
          onReintentar={() => cargarProyectos(aplicados, paginaActual)}
          mostrarVisibilidad
          mostrarDirector
          mostrarIntegrantes
        />

        {!cargando && !error && totalElementos > 0 && (
          <div className="flex justify-center mt-8">
            <Paginacion
              paginaActual={paginaActual + 1}
              totalPaginas={Math.max(totalPaginas, 1)}
              totalRegistros={totalElementos}
              registrosPorPagina={PAGINA_SIZE}
              labelEntidad="proyectos"
              onCambiarPagina={handleCambiarPagina}
            />
          </div>
        )}
      </div>
    </div>
  )
}
