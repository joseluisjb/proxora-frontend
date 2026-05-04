import { useState } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'

export default function MyProjects() {
  const [projects] = useState([
    {
      id: 1,
      titulo: 'Optimización de Redes Neuronales para Tráfico Urbano',
      estado: 'en-progreso',
      descripcion: 'Un estudio exhaustivo sobre la aplicación de aprendizaje profundo para reducir congestión en...',
      profesores: ['Sofía Herrera'],
      ultActualizacion: 'Oct 12, 14:30'
    },
    {
      id: 2,
      titulo: 'Arquitectura Blockchain Escalable para Logística',
      estado: 'bajo-revision',
      descripcion: 'Investigando tecnologías de ledger distribuido para mejorar cadena de suministro...',
      profesores: ['Dr. Martínez'],
      ultActualizacion: 'Oct 10, 09:15'
    },
    {
      id: 3,
      titulo: 'Malla Sensores IoT para Análisis Térmico',
      estado: 'completado',
      descripcion: 'Despliegue completado de 50 sensores de bajo consumo para monitoreo térmico en tiempo real...',
      profesores: ['Dra. Elena V.'],
      ultActualizacion: 'Oct 08, 16:45',
      calificacion: '4.8/5.0'
    }
  ])

  const estadoConfig = {
    'en-progreso': { badge: 'en-progreso', label: 'EN PROGRESO' },
    'bajo-revision': { badge: 'bajo-revision', label: 'BAJO REVISIÓN' },
    'completado': { badge: 'completado', label: 'COMPLETADO' }
  }

  return (
    <div className="my-projects">
      <div className="page-header">
        <h1>Mis Proyectos</h1>
        <p>Gestiona tu investigación en Ingeniería de Sistemas y los hitos de tu proyecto.</p>
      </div>

      <div className="projects-container">
        {projects.map(project => {
          const cfg = estadoConfig[project.estado]
          return (
            <Card key={project.id}>
              <div className="project-card">
                <div className="project-header">
                  <Badge status={cfg.badge}>{cfg.label}</Badge>
                  <button className="btn-menu">⋯</button>
                </div>

                <h3 className="project-titulo">{project.titulo}</h3>
                <p className="project-descripcion">{project.descripcion}</p>

                <div className="project-meta">
                  <div className="meta-item">
                    <p className="meta-label">PROFESORES</p>
                    <p className="meta-value">{project.profesores.join(', ')}</p>
                  </div>
                  <div className="meta-item">
                    <p className="meta-label">ÚLTIMA ACTUALIZACIÓN</p>
                    <p className="meta-value">{project.ultActualizacion}</p>
                  </div>
                </div>

                {project.estado === 'completado' && (
                  <div className="project-grade">
                    <p className="grade-label">Calificación Final</p>
                    <p className="grade-value">{project.calificacion}</p>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: '96%' }}></div>
                    </div>
                  </div>
                )}

                <div className="project-actions">
                  <Button variant="secundario">Documento Reciente</Button>
                  <Button variant="primario">Ver Detalles</Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* CTA para registro */}
      <Card>
        <div className="register-cta">
          <div className="cta-icono">✅</div>
          <h3>Registrar Nuevo Proyecto</h3>
          <p>Plantilla de propuesta disponible</p>
          <Button variant="primario">Crear Proyecto</Button>
        </div>
      </Card>
    </div>
  )
}
