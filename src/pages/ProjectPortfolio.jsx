import { useState } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import Input from '../components/Input'

export default function ProjectPortfolio() {
  const [filtros, setFiltros] = useState({
    semestre: '2024-I',
    area: 'todos',
    estado: 'todos'
  })
  const [busqueda, setBusqueda] = useState('')
  const [paginaActual, setPaginaActual] = useState(1)

  const proyectos = [
    {
      id: 1,
      titulo: 'Verificación de Credenciales Académicas en Blockchain',
      estado: 'completado',
      mes: 'Mayo 2024',
      descripcion: 'Una aplicación descentralizada que aprovecha contratos inteligentes de Ethereum para emitir y verificar diplomas y certificados universitarios de forma segura.',
      area: 'Ingeniería de Software',
      profesores: ['Carlos Mario Peña', 'Elena Sofía Ruiz'],
      director: 'Ing. Ricardo Jaramillo',
      tipo: 'Proyecto de Tesis'
    },
    {
      id: 2,
      titulo: 'Optimización de Flujo de Tráfico con Simulación de Red Neuronal',
      estado: 'en-progreso',
      mes: 'Junio 2024',
      descripcion: 'Modelos de aprendizaje profundo aplicados a datos de sensores de tráfico urbano para predecir patrones de congestión en áreas metropolitanas.',
      area: 'Inteligencia Artificial',
      profesores: ['Sebastián Gómez', 'Luis Alberto Vázquez'],
      director: 'Dra. Marta Lucía Castro',
      tipo: 'Investigación'
    },
    {
      id: 3,
      titulo: 'Monitoreo Basado en IoT para Agricultura Sostenible',
      estado: 'bajo-revision',
      mes: 'Junio 2024',
      descripcion: 'Una solución de hardware y software de bajo costo para monitorear pH del suelo y humedad en plantaciones usando tecnología LoRaWAN.',
      area: 'Hardware y Sistemas',
      profesores: ['Diana Patricia López'],
      director: 'Ing. José David Torres',
      tipo: 'Proyecto de Grado'
    },
    {
      id: 4,
      titulo: 'Marco de Ciberseguridad para Bases de Datos Municipales',
      estado: 'completado',
      mes: 'Dic 2023',
      descripcion: 'Implementación de estándares NIST para proteger datos de la administración pública contra ataques de ransomware.',
      area: 'Seguridad',
      profesores: ['Mauricio Ortega'],
      director: 'Ing. Claudia Ortiz',
      tipo: 'Informe Técnico'
    },
    {
      id: 5,
      titulo: 'Herramienta de Realidad Virtual para Educación Anatómica',
      estado: 'retrasado',
      mes: 'Feb 2024',
      descripcion: 'Desarrollo de un ambiente inmersivo para estudiantes de medicina usando Unity3D y hardware Oculus Rift.',
      area: 'Medios Interactivos',
      profesores: ['Andrés Felipe Mesa'],
      director: 'Ing. Fabio Ramírez',
      tipo: 'Laboratorio de Innovación'
    },
    {
      id: 6,
      titulo: 'Análisis de Datos sobre Patrones de Retención Estudiantil',
      estado: 'completado',
      mes: 'Nov 2023',
      descripcion: 'Minería de registros académicos históricos para identificar factores que conducen a deserción estudiantil y desarrollar advertencias predictivas.',
      area: 'Ciencia de Datos',
      profesores: ['Sandra Milena Remolti'],
      director: 'Dr. Wilson Guevara',
      tipo: 'Auditoría Interna'
    }
  ]

  const areas = ['Todos', 'Ingeniería de Software', 'Inteligencia Artificial', 'Seguridad', 'Ciencia de Datos', 'Hardware y Sistemas', 'Medios Interactivos']
  const estados = ['Todos', 'Completado', 'En Progreso', 'Bajo Revisión', 'Retrasado']
  const semestres = ['2024-I', '2024-II', '2023-II', '2023-I']

  const estadoConfig = {
    'completado': { badge: 'completado', label: 'Completado' },
    'en-progreso': { badge: 'en-progreso', label: 'En Progreso' },
    'bajo-revision': { badge: 'bajo-revision', label: 'Bajo Revisión' },
    'retrasado': { badge: 'retrasado', label: 'Retrasado' }
  }

  // Filtrar proyectos
  const proyectosFiltrados = proyectos.filter(p => {
    const coincideArea = filtros.area === 'todos' || p.area === filtros.area
    const coincideEstado = filtros.estado === 'todos' || p.estado === filtros.estado
    const coincideBusqueda = p.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
                           p.descripcion.toLowerCase().includes(busqueda.toLowerCase())
    return coincideArea && coincideEstado && coincideBusqueda
  })

  // Paginación
  const porPagina = 6
  const totalPaginas = Math.ceil(proyectosFiltrados.length / porPagina)
  const inicio = (paginaActual - 1) * porPagina
  const proyectosPaginados = proyectosFiltrados.slice(inicio, inicio + porPagina)

  return (
    <div className="portfolio">
      <div className="page-header">
        <h1>Portafolio de Proyectos</h1>
        <p>Gestiona y evalúa proyectos de tesis de ingeniería de sistemas de pregrado para el ciclo actual.</p>
      </div>

      {/* Filtros */}
      <Card>
        <div className="filtros-container">
          <div className="filtros-grid">
            <div className="filtro-item">
              <label>SEMESTRE ACADÉMICO</label>
              <select
                value={filtros.semestre}
                onChange={(e) => setFiltros({...filtros, semestre: e.target.value})}
                className="input"
              >
                {semestres.map(s => <option key={s} value={s}>{s} (Actual)</option>)}
              </select>
            </div>

            <div className="filtro-item">
              <label>ÁREA DE ESTUDIO</label>
              <select
                value={filtros.area}
                onChange={(e) => setFiltros({...filtros, area: e.target.value})}
                className="input"
              >
                {areas.map(a => (
                  <option key={a} value={a.toLowerCase() === 'todos' ? 'todos' : a}>
                    {a === 'Todos' ? 'Todas las Áreas' : a}
                  </option>
                ))}
              </select>
            </div>

            <div className="filtro-item">
              <label>ESTADO DEL PROYECTO</label>
              <select
                value={filtros.estado}
                onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
                className="input"
              >
                {estados.map(e => (
                  <option key={e} value={e.toLowerCase() === 'todos' ? 'todos' : e.toLowerCase().replace(' ', '-')}>
                    {e === 'Todos' ? 'Todos los Estados' : e}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="filtros-busqueda">
            <Input
              placeholder="Buscar proyectos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <Button variant="primario">Aplicar Filtros</Button>
          </div>
        </div>

        {/* Filtros activos */}
        {(busqueda || filtros.area !== 'todos' || filtros.estado !== 'todos') && (
          <div className="filtros-activos">
            {busqueda && (
              <span className="filtro-tag">
                Búsqueda: "{busqueda}"
                <button onClick={() => setBusqueda('')}>×</button>
              </span>
            )}
            {filtros.area !== 'todos' && (
              <span className="filtro-tag">
                {filtros.area}
                <button onClick={() => setFiltros({...filtros, area: 'todos'})}>×</button>
              </span>
            )}
            {filtros.estado !== 'todos' && (
              <span className="filtro-tag">
                {filtros.estado}
                <button onClick={() => setFiltros({...filtros, estado: 'todos'})}>×</button>
              </span>
            )}
            <button
              className="link-primary"
              onClick={() => {
                setBusqueda('')
                setFiltros({semestre: '2024-I', area: 'todos', estado: 'todos'})
              }}
            >
              Limpiar todos los filtros
            </button>
          </div>
        )}
      </Card>

      {/* Grid de proyectos */}
      <div className="portfolio-grid">
        {proyectosPaginados.map(proyecto => {
          const cfg = estadoConfig[proyecto.estado]
          return (
            <Card key={proyecto.id}>
              <div className="portfolio-card">
                <div className="card-header">
                  <Badge status={cfg.badge}>{cfg.label}</Badge>
                  <span className="card-mes">{proyecto.mes}</span>
                </div>

                <h3 className="card-titulo">{proyecto.titulo}</h3>
                <p className="card-descripcion">{proyecto.descripcion}</p>

                <div className="card-meta">
                  <div className="meta-row">
                    <span className="meta-icon">📁</span>
                    <div>
                      <p className="meta-label">TIPO DE PROYECTO</p>
                      <p className="meta-value">{proyecto.tipo}</p>
                    </div>
                  </div>
                  <div className="meta-row">
                    <span className="meta-icon">👥</span>
                    <div>
                      <p className="meta-label">INTEGRANTES DEL EQUIPO</p>
                      <p className="meta-value">{proyecto.profesores.join(', ')}</p>
                    </div>
                  </div>
                  <div className="meta-row">
                    <span className="meta-icon">👨‍🎓</span>
                    <div>
                      <p className="meta-label">DIRECTOR</p>
                      <p className="meta-value">{proyecto.director}</p>
                    </div>
                  </div>
                </div>

                <div className="card-footer">
                  <span className="area-tag">{proyecto.area}</span>
                  <Button variant="primario">Ver Proyecto →</Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Paginación */}
      <div className="paginacion-container">
        <p className="paginacion-texto">
          Mostrando {inicio + 1} a {Math.min(inicio + porPagina, proyectosFiltrados.length)} de {proyectosFiltrados.length} proyectos
        </p>
        <div className="paginacion">
          <button
            className="pag-btn"
            onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
            disabled={paginaActual === 1}
          >
            ‹
          </button>
          {Array.from({length: totalPaginas}, (_, i) => (
            <button
              key={i + 1}
              className={`pag-btn ${paginaActual === i + 1 ? 'activo' : ''}`}
              onClick={() => setPaginaActual(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="pag-btn"
            onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
            disabled={paginaActual === totalPaginas}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  )
}
