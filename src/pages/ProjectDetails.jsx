import { useState } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'

export default function ProjectDetails() {
  const [proyecto] = useState({
    id: 1,
    codigo: 'ID: UFPS-2024-042',
    titulo: 'Implementación de Tecnología de Ledger Distribuido para Credenciales Académicas Seguras en Educación Superior',
    estado: 'under-review',
    semester: '2024-I',
    area: 'Proyecto de Grado II',
    lineasInvestigacion: ['Sistemas Distribuidos', 'Criptografía', 'Ingeniería de Software'],
    resumen: 'Esta investigación examina la integración de arquitecturas de blockchain para crear un repositorio a prueba de falsificaciones para diplomas y expedientes académicos, abordando el desafío global del fraude académico con marcos institucionales.',
    detalles: 'Durante un ciclo de desarrollo de 18 meses, el equipo construyó una red privada capaz de procesar más de 500 validaciones de credenciales por segundo con consistencia del 99.9% entre nodos secundarios. El resultado final incluye una API robusta para verificación de terceros y un panel para estudiantes con propiedad criptográfica de sus logros académicos.',
    equipo: [
      { rol: 'Director', nombre: 'Dr. Ricardo Alfonso Méndez', titulo: 'Ph.D. en Ciencias de la Computación' },
      { rol: 'Mentor de Investigación', nombre: 'María Camila Ruiz', titulo: 'Maestría en Ciberseguridad' },
      { rol: 'Coinvestigador', nombre: 'Sebastián Duarte Gómez', titulo: 'Ingeniería de Sistemas' },
      { rol: 'Coinvestigador', nombre: 'Elena Rodríguez Mora', titulo: 'Ingeniería de Sistemas' }
    ],
    documentos: [
      { nombre: 'Final_Project_Report_v2.0', tipo: 'PDF', tamaño: '4.2 MB', fecha: 'Mayo 12, 2024', accion: 'Descargar' },
      { nombre: 'Architecture_Technical_Specifications', tipo: 'PDF', tamaño: '2.8 MB', fecha: 'Mar 05, 2024', accion: 'Ver' },
      { nombre: 'Proposal_Draft_v1', tipo: 'DOCX', tamaño: '1.1 MB', fecha: 'Ene 15, 2024', accion: 'Descargar' }
    ],
    evaluaciones: [
      {
        hito: 'Hito 3: Optimización de Desempeño',
        calificacion: '4.9',
        peso: 'PESO EN CALIFICACIÓN: 25%',
        fecha: 'Octubre 24, 2023',
        evaluador: 'Dra. Elena Rodríguez',
        feedback: 'La implementación de la variante del descenso del gradiente fue excepcionalmente limpia. Tu uso de factorización de matrices para reducir complejidad computacional en las capas ocultas mostró pensamiento sistémico de alto nivel. Se recomienda explorar el optimizador Adam en la próxima iteración para comparar tasas de convergencia.'
      },
      {
        hito: 'Hito 2: Pre-procesamiento de Datos',
        calificacion: '4.2',
        peso: 'PESO EN CALIFICACIÓN: 20%',
        fecha: 'Septiembre 12, 2023',
        evaluador: 'Prof. Marcus Thorne',
        feedback: 'Las técnicas de normalización aplicadas son robustas, sin embargo, la documentación respecto al manejo de valores atípicos en el conjunto de datos inicial es limitada. Por favor expande la justificación estadística detrás de tu elección del escalado Z-score sobre Min-Max.'
      }
    ],
    proximoEvento: {
      titulo: 'PRÓXIMO: DEFENSA FINAL',
      fecha: 'Programado: Dic 15',
      estado: 'locked'
    }
  })

  const estadoConfig = {
    'under-review': { badge: 'bajo-revision', label: 'BAJO REVISIÓN' }
  }

  const cfg = estadoConfig[proyecto.estado] || { badge: 'completado', label: proyecto.estado }

  return (
    <div className="project-details">
      <div className="details-header">
        <a href="#" className="back-link">← Volver a Búsqueda</a>
      </div>

      {/* Hero Section */}
      <div className="details-hero">
        <div className="hero-content">
          <Badge status={cfg.badge}>{cfg.label}</Badge>
          <h1>{proyecto.titulo}</h1>

          <div className="hero-meta">
            <div className="meta-item">
              <p className="meta-label">MATERIA</p>
              <p className="meta-value">{proyecto.area}</p>
            </div>
            <div className="meta-item">
              <p className="meta-label">LÍNEAS DE INVESTIGACIÓN</p>
              <p className="meta-value">{proyecto.lineasInvestigacion.join(', ')}</p>
            </div>
            <div className="meta-item">
              <p className="meta-label">FECHA DE ENTREGA</p>
              <p className="meta-value">{proyecto.semester}</p>
            </div>
            <div className="meta-item">
              <p className="meta-label">CÓDIGO DEL PROYECTO</p>
              <p className="meta-value">{proyecto.codigo}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="details-grid">
        {/* Columna principal */}
        <div className="details-main">
          {/* Project Summary */}
          <Card>
            <h2 className="card-title-lg">📋 Resumen del Proyecto</h2>
            <p className="project-text">{proyecto.resumen}</p>
          </Card>

          {/* Project Details */}
          <Card>
            <h2 className="card-title-lg">📄 Descripción Detallada</h2>
            <p className="project-text">{proyecto.detalles}</p>
          </Card>

          {/* Document Versions */}
          <Card>
            <h2 className="card-title-lg">📁 Versiones de Documentos</h2>
            <div className="documentos-list">
              {proyecto.documentos.map((doc, idx) => (
                <div key={idx} className="documento-item">
                  <div className="doc-icon">📄</div>
                  <div className="doc-info">
                    <p className="doc-nombre">{doc.nombre}</p>
                    <p className="doc-meta">{doc.tipo} • {doc.tamaño} • Actualizado {doc.fecha}</p>
                  </div>
                  <Button variant="secundario">{doc.accion}</Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Evaluation History */}
          <Card>
            <h2 className="card-title-lg">⭐ Historial de Evaluaciones</h2>
            <div className="evaluaciones-list">
              {proyecto.evaluaciones.map((evaluation, idx) => (
                <div key={idx} className="evaluacion-item">
                  <div className="eval-header">
                    <div>
                      <h4>{evaluation.hito}</h4>
                      <p className="eval-fecha">{evaluation.fecha} • {evaluation.evaluador}</p>
                    </div>
                    <div className="eval-score">
                      <span className="score-numero">{evaluation.calificacion}</span>
                      <p className="score-peso">{evaluation.peso}</p>
                    </div>
                  </div>
                  <div className="eval-feedback">
                    <p className="feedback-label">RETROALIMENTACIÓN</p>
                    <p className="feedback-text">{evaluation.feedback}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="details-sidebar">
          {/* Team Card */}
          <Card>
            <h2 className="card-title-lg">👥 Equipo del Proyecto</h2>
            <div className="team-list">
              {proyecto.equipo.map((miembro, idx) => (
                <div key={idx} className="team-member">
                  <div className="member-avatar">
                    {miembro.nombre.split(' ')[0][0]}{miembro.nombre.split(' ')[1][0]}
                  </div>
                  <div className="member-info">
                    <p className="member-rol">{miembro.rol}</p>
                    <p className="member-nombre">{miembro.nombre}</p>
                    <p className="member-titulo">{miembro.titulo}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Upcoming Event */}
          <Card>
            <div className="upcoming-event">
              <div className="event-icono">📅</div>
              <h3>{proyecto.proximoEvento.titulo}</h3>
              <p>{proyecto.proximoEvento.fecha}</p>
              <p className="event-hint">Los criterios de evaluación final serán publicados al enviar el prototipo del proyecto.</p>
            </div>
          </Card>

          {/* Actions */}
          <div className="sidebar-actions">
            <Button variant="primario" fullWidth>Calificar Proyecto</Button>
            <Button variant="secundario" fullWidth>Descargar Reporte</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
