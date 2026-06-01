import { useState } from 'react'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'

export default function RegisterNewProject() {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    area: 'Ingeniería de Software II',
    lineasInvestigacion: [],
    visibilidad: true,
    director: '',
    miembros: []
  })

  const [nuevoMiembro, setNuevoMiembro] = useState('')

  const areas = [
    'Ingeniería de Software II',
    'Inteligencia Artificial',
    'Seguridad',
    'Ciencia de Datos',
    'Hardware y Sistemas',
    'Medios Interactivos',
    'Computación en la Nube'
  ]

  const lineasDisponibles = [
    'Inteligencia Artificial',
    'Computación en la Nube',
    'Seguridad de la Información',
    'Blockchain',
    'IoT',
    'Análisis de Datos'
  ]

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleLineaChange = (linea) => {
    setFormData({
      ...formData,
      lineasInvestigacion: formData.lineasInvestigacion.includes(linea)
        ? formData.lineasInvestigacion.filter(l => l !== linea)
        : [...formData.lineasInvestigacion, linea]
    })
  }

  const agregarMiembro = () => {
    if (nuevoMiembro.trim() && !formData.miembros.includes(nuevoMiembro)) {
      setFormData({
        ...formData,
        miembros: [...formData.miembros, nuevoMiembro]
      })
      setNuevoMiembro('')
    }
  }

  const removerMiembro = (miembro) => {
    setFormData({
      ...formData,
      miembros: formData.miembros.filter(m => m !== miembro)
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    alert('Project registered successfully!')
  }

  return (
    <div className="register-project">
      <div className="page-header">
        <h1>Registrar Nuevo Proyecto</h1>
        <p>Inicia tu trabajo de grado o propuesta de investigación en Ingeniería de Sistemas. Todos los campos deben seguir estándares académicos institucionales.</p>
      </div>

      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-grid">
          {/* Columna izquierda */}
          <div className="form-column">
            <Card title="📝 Detalles del Proyecto">
              <div className="form-group">
                <label htmlFor="titulo">TÍTULO DEL PROYECTO</label>
                <Input
                  id="titulo"
                  name="titulo"
                  placeholder="Ej: Implementación de Tecnología de Ledger Distribuido en Cadena de Suministro"
                  value={formData.titulo}
                  onChange={handleChange}
                  required
                />
                <p className="form-hint">El título debe ser conciso y técnicamente descriptivo.</p>
              </div>

              <div className="form-group">
                <label htmlFor="descripcion">DESCRIPCIÓN Y OBJETIVOS</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  className="input input-textarea"
                  placeholder="Define el planteamiento del problema, alcance y objetivos técnicos..."
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows="6"
                  required
                />
              </div>
            </Card>

            <Card title="👥 Equipo Académico">
              <div className="form-group">
                <label htmlFor="director">DIRECTOR / CO-DIRECTOR</label>
                <Input
                  id="director"
                  name="director"
                  placeholder="Buscar asesor..."
                  value={formData.director}
                  onChange={handleChange}
                  required
                />
                <p className="form-hint">Selecciona hasta 3 integrantes del equipo.</p>
              </div>

              <div className="form-group">
                <label>INTEGRANTES DEL GRUPO</label>
                <div className="miembros-input">
                  <Input
                    placeholder="Agregar nombre del integrante..."
                    value={nuevoMiembro}
                    onChange={(e) => setNuevoMiembro(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarMiembro())}
                  />
                  <Button type="button" variant="secundario" onClick={agregarMiembro}>
                    Agregar
                  </Button>
                </div>

                {formData.miembros.length > 0 && (
                  <div className="miembros-lista">
                    {formData.miembros.map((miembro, idx) => (
                      <div key={idx} className="miembro-tag">
                        <span>{miembro}</span>
                        <button
                          type="button"
                          onClick={() => removerMiembro(miembro)}
                          className="btn-remove"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Columna derecha */}
          <div className="form-column">
            <Card title="🏷️ Categorización">
              <div className="form-group">
                <label htmlFor="area">ÁREA DE ESTUDIO</label>
                <select
                  id="area"
                  name="area"
                  className="input"
                  value={formData.area}
                  onChange={handleChange}
                >
                  {areas.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>LÍNEAS DE INVESTIGACIÓN</label>
                <div className="checkboxes-group">
                  {lineasDisponibles.map(linea => (
                    <label key={linea} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={formData.lineasInvestigacion.includes(linea)}
                        onChange={() => handleLineaChange(linea)}
                      />
                      <span>{linea}</span>
                    </label>
                  ))}
                </div>
              </div>
            </Card>

            <Card title="👁️ Visibilidad">
              <div className="form-group">
                <label className="checkbox-item checkbox-large">
                  <input
                    type="checkbox"
                    name="visibilidad"
                    checked={formData.visibilidad}
                    onChange={handleChange}
                  />
                  <div>
                    <p className="checkbox-label">Visibilidad del Proyecto</p>
                    <p className="checkbox-hint">Público para todos los estudiantes y profesores</p>
                  </div>
                </label>
              </div>

              {formData.visibilidad && (
                <div className="visibility-warning">
                  <p>⚠️ <strong>Los proyectos públicos se indexan en el repositorio y son visibles durante evaluaciones institucionales.</strong></p>
                </div>
              )}
            </Card>

            {/* Form Actions */}
            <div className="form-actions">
              <Button type="button" variant="secundario">Guardar como Borrador</Button>
              <Button type="submit" variant="primario">Registrar Proyecto</Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
