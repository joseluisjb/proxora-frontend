import { useState, useEffect, useCallback } from 'react';
import type {
  ProyectoResponse,
  SemestreResponse,
  MateriaResponse,
  LineaInvestigacionResponse,
} from '../types/api.types';
import { proyectosService } from '../services/proyectos.service';
import { semestresService } from '../services/semestres.service';
import { materiasService } from '../services/materias.service';
import { lineasService } from '../services/lineas.service';
import NavbarPublica from '../components/layout/NavbarPublica';
import { GrillaProyectos } from '../components/proyecto/GrillaProyectos';
import FiltrosProyectos from '../components/ui/FiltrosProyectos';
import Paginacion from '../components/ui/Paginacion';
import './LandingPage.css';

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

// TODO: el backend no soporta filtros combinados. Implementar cuando
// se agregue un endpoint de búsqueda avanzada.
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

export default function LandingPage() {
  const [proyectos, setProyectos] = useState<ProyectoResponse[]>([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paginaActual, setPaginaActual] = useState(0)   // base 0 para el backend
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

  // Carga de selects al montar
  useEffect(() => {
    semestresService.listar({ size: 100 }).then((r) => setSemestres(r.content)).catch(() => {})
    materiasService.listar({ size: 100 }).then((r) => setMaterias(r.content)).catch(() => {})
    lineasService.listar({ size: 100 }).then((r) => setLineas(r.content)).catch(() => {})
  }, [])

  const cargarProyectos = useCallback(async (f: FiltrosValores, pagina: number) => {
    setCargando(true)
    setError(null)
    try {
      const params = { page: pagina, size: PAGINA_SIZE }
      const modo = resolverModo(f)
      let resultado

      if (modo === 'busqueda') {
        resultado = await proyectosService.buscar(f.busqueda.trim(), params)
      } else if (modo === 'semestre') {
        resultado = await proyectosService.listarPorSemestre(f.semestre, params)
      } else if (modo === 'materia') {
        resultado = await proyectosService.listarPorMateria(f.materia, params)
      } else if (modo === 'estado') {
        resultado = await proyectosService.listarPorEstado(ESTADO_MAP[f.estado] ?? 1, params)
      } else {
        resultado = await proyectosService.listar({ ...params, sort: 'creadoEn,desc' })
      }

      // TODO: mover filtro de visibilidad al backend cuando se implemente
      // el endpoint de búsqueda avanzada
      let contenido = resultado.content
      if (f.visibilidad) {
        contenido = contenido.filter((p) => p.visibilidad === f.visibilidad)
      }

      setProyectos(contenido)
      setTotalPaginas(resultado.totalPages || 1)
      setTotalElementos(resultado.totalElements)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } }
      if (axiosErr.response?.status === 401) {
        // TODO: el backend requiere autenticación para listar proyectos.
        // Para la vista pública se necesita un endpoint sin auth o
        // una sesión de invitado automática.
        setError('Los proyectos requieren autenticación. Inicia sesión para verlos.')
      } else {
        setError('Error al cargar los proyectos. Intenta de nuevo.')
      }
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarProyectos(aplicados, paginaActual)
  }, [aplicados, paginaActual, cargarProyectos])

  const handleCambioFiltro = (campo: string, valor: string) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }))
  }

  const handleFiltrar = () => {
    setAplicados(filtros)
    setPaginaActual(0)
  }

  const handleCambiarPagina = (paginaBase1: number) => {
    setPaginaActual(paginaBase1 - 1)
  }

  return (
    <div className="landing-page">
      <NavbarPublica />

      {/* Barra de filtros */}
      <div className="landing-filtros-barra">
        <div className="landing-contenedor">
          <FiltrosProyectos
            valores={filtros}
            onChange={handleCambioFiltro}
            onFiltrar={handleFiltrar}
            semestres={semestres.map((s) => ({ id: s.id, nombre: s.nombre }))}
            materias={materias.map((m) => ({ id: m.id, nombre: m.nombre }))}
            lineas={lineas.map((l) => ({ id: l.id, nombre: l.nombre }))}
          />
        </div>
      </div>

      {/* Sección de proyectos */}
      <div className="landing-contenedor landing-seccion">
        {/* Encabezado de sección */}
        <div className="landing-seccion-header">
          <div>
            <h2 className="landing-seccion-titulo">Publicados recientemente</h2>
            <p className="landing-seccion-subtitulo">
              Revisa las últimas contribuciones del programa de Ingeniería de Sistemas.
            </p>
          </div>
          <div className="landing-vista-toggles">
            <button
              type="button"
              className={`landing-vista-btn ${vistaActual === 'grilla' ? 'landing-vista-btn--activo' : ''}`}
              onClick={() => setVistaActual('grilla')}
              aria-label="Vista en cuadrícula"
              title="Vista cuadrícula"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" />
              </svg>
            </button>
            <button
              type="button"
              className={`landing-vista-btn ${vistaActual === 'lista' ? 'landing-vista-btn--activo' : ''}`}
              onClick={() => setVistaActual('lista')}
              aria-label="Vista en lista"
              title="Vista lista"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 5h18v2H3V5zm0 6h18v2H3v-2zm0 6h18v2H3v-2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Grilla */}
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

        {/* Paginación */}
        {!cargando && !error && totalElementos > 0 && (
          <div className="landing-paginacion">
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
