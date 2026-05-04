import { useState } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'

export default function Dashboard() {
  const [user] = useState({
    nombre: 'Dr. Sterling',
    semestre: '2024-II'
  })

  const stats = [
    { label: 'Proyectos Asignados', valor: '12', tendencia: '+2 este mes' },
    { label: 'Evaluaciones Pendientes', valor: '04', alerta: true }
  ]

  const evaluacionesPendientes = [
    {
      id: 1,
      titulo: 'Tráfico Impulsado por IA...',
      tipo: 'TESIS FINAL',
      estudiantes: ['G. López', 'M. Silva'],
      fecha: 'Oct 24, 2023',
      diasOverdue: '2 DÍAS VENCIDO'
    },
    {
      id: 2,
      titulo: 'Blockchain para Cadena...',
      tipo: 'PROPUESTA',
      estudiantes: ['D. Ramírez'],
      fecha: 'Oct 25, 2023',
      diasOverdue: '1 DÍA VENCIDO'
    },
    {
      id: 3,
      titulo: 'Microservicios...',
      tipo: 'REPORTE PROGRESO',
      estudiantes: ['A. Torres', 'J. Cano'],
      fecha: 'Oct 26, 2023',
      diasOverdue: 'A TIEMPO'
    }
  ]

  const actividadReciente = [
    { icono: '✓', titulo: 'Documento aprobado', proyecto: 'Optimización Red Neuronal', tiempo: 'HACE 1 HORA' },
    { icono: '💬', titulo: 'Nuevo comentario', proyecto: 'Propuesta', tiempo: 'HACE 4 HORAS' },
    { icono: '⚠️', titulo: 'Plazo próximo', proyecto: 'Dashboard Microservicios', tiempo: 'HACE 8 HORAS' },
    { icono: '👤', titulo: 'Admin te asignó como Director', proyecto: 'Campus Inteligente', tiempo: 'AYER' }
  ]

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Bienvenida, {user.nombre}</h1>
        <p>Gestiona tus proyectos dirigidos y evaluaciones académicas para el semestre {user.semestre}.</p>
      </div>

      {/* Stats */}
      <div className="dashboard__stats">
        {stats.map((stat, idx) => (
          <Card key={idx} title={stat.label}>
            <div className="stat-content">
              <div className={`stat-numero ${stat.alerta ? 'stat-numero--alerta' : ''}`}>
                {stat.valor}
              </div>
              {stat.tendencia && <p className="stat-tendencia">{stat.tendencia}</p>}
              {stat.alerta && <p className="stat-alerta">⚠️ Requiere acción inmediata</p>}
            </div>
          </Card>
        ))}
      </div>

      {/* Main content */}
      <div className="dashboard__grid">
        {/* Evaluaciones pendientes */}
        <div className="dashboard__evaluaciones">
          <div className="section-header">
            <h2>Evaluaciones Pendientes</h2>
            <a href="#" className="link-primary">VER TODO</a>
          </div>

          <Card>
            <table className="tabla">
              <thead className="tabla__header">
                <tr>
                  <th>TÍTULO PROYECTO</th>
                  <th>NOMBRES ESTUDIANTES</th>
                  <th>FECHA ENTREGA</th>
                  <th>ACCIÓN</th>
                </tr>
              </thead>
              <tbody>
                {evaluacionesPendientes.map(evaluation => (
                  <tr key={evaluation.id} className="tabla__row">
                    <td>
                      <div>
                        <p className="bold">{evaluation.titulo}</p>
                        <p className="text-small">{evaluation.tipo}</p>
                      </div>
                    </td>
                    <td>
                      <div className="avatars-stack">
                        {evaluation.estudiantes.map((est, i) => (
                          <span key={i} className="avatar-badge">{est.split(' ')[0]}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div>
                        <p>{evaluation.fecha}</p>
                        <p className="text-overdue">{evaluation.diasOverdue}</p>
                      </div>
                    </td>
                    <td>
                      <Button variant="primario">Evaluar</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Actividad reciente */}
        <div className="dashboard__activity">
          <div className="section-header">
            <h2>Actividad Reciente</h2>
          </div>

          <Card>
            <div className="activity-list">
              {actividadReciente.map((act, idx) => (
                <div key={idx} className="activity-item">
                  <span className="activity-icono">{act.icono}</span>
                  <div className="activity-content">
                    <p className="activity-titulo">{act.titulo}</p>
                    <p className="activity-proyecto">{act.proyecto}</p>
                  </div>
                  <p className="activity-tiempo">{act.tiempo}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
