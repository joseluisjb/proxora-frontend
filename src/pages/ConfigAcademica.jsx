import { useState } from "react";
import "./ConfigAcademica.css";

const MATERIAS_MOCK = [
  { id: 1, nombre: "Análisis de Sistemas I", semestre: 5, codigo: "SYS-101" },
  { id: 2, nombre: "Ingeniería de Bases de Datos", semestre: 6, codigo: "DBE-204" },
  { id: 3, nombre: "Gestión de Proyectos", semestre: 9, codigo: "MGMT-500" },
  { id: 4, nombre: "Arquitectura de Software", semestre: 7, codigo: "ARC-302" },
];

const LINEAS_ACTIVAS = [
  {
    id: 1,
    nombre: "Seguridad Informática",
    descripcion:
      "Métodos criptográficos, evaluación de vulnerabilidades de red y marcos de gestión de riesgos para datos empresariales.",
  },
  {
    id: 2,
    nombre: "Inteligencia Artificial",
    descripcion:
      "Algoritmos de aprendizaje automático, optimización de redes neuronales y aplicación de PLN en entornos de investigación académica.",
  },
  {
    id: 3,
    nombre: "Internet de las Cosas (IoT)",
    descripcion:
      "Integración de sensores inteligentes, protocolos de computación en el borde y analítica de datos en tiempo real para infraestructura urbana.",
  },
];

const STATS = [
  { label: "Total de Materias", valor: 48 },
  { label: "Líneas de Investigación", valor: 12 },
  { label: "Personal Docente", valor: 34 },
];

export default function ConfigAcademica() {
  const [formLinea, setFormLinea] = useState({
    nombre: "",
    descripcion: "",
    activa: false,
  });

  const handleFormChange = (campo, valor) => {
    setFormLinea((prev) => ({ ...prev, [campo]: valor }));
  };

  return (
    <div className="ca-contenedor">
      <div className="page-header">
        <h1>Marco Institucional</h1>
        <p>
          Define y gestiona las materias curriculares y las líneas de investigación
          estratégicas que sustentan el departamento de Ingeniería de Sistemas.
        </p>
      </div>

      <div className="ca-grid">
        {/* Columna izquierda */}
        <div className="ca-col-izq">
          {/* Repositorio de materias */}
          <div className="card ca-card">
            <div className="ca-card-header">
              <div className="ca-card-titulo">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="var(--rojo)" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
                </svg>
                <h2>Repositorio de Materias</h2>
              </div>
              <button className="btn btn-primario ca-btn-agregar">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                </svg>
                Agregar Materia
              </button>
            </div>

            <table className="tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Semestre</th>
                  <th>Código</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {MATERIAS_MOCK.map((materia) => (
                  <tr key={materia.id}>
                    <td className="ca-materia-nombre">{materia.nombre}</td>
                    <td>
                      <span className="badge badge-materia">
                        Semestre {materia.semestre}
                      </span>
                    </td>
                    <td className="ca-codigo">{materia.codigo}</td>
                    <td>
                      <div className="ca-acciones-tabla">
                        <button className="ca-icono-btn" title="Editar">
                          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                          </svg>
                        </button>
                        <button className="ca-icono-btn ca-icono-btn--eliminar" title="Eliminar">
                          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="ca-tabla-pie">
              <span>Mostrando 4 de 48 materias</span>
              <div className="ca-nav-tabla">
                <button className="pag-btn">‹</button>
                <button className="pag-btn">›</button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="ca-stats">
            {STATS.map((s) => (
              <div key={s.label} className="card ca-stat-card">
                <p className="ca-stat-label">{s.label}</p>
                <p className="ca-stat-valor">{s.valor}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Columna derecha */}
        <div className="ca-col-der">
          {/* Formulario nueva línea */}
          <div className="card ca-card ca-form-card">
            <div className="ca-form-header">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--rojo)" strokeWidth={2}>
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/>
              </svg>
              <h2>Nueva Línea de Investigación</h2>
            </div>

            <div className="ca-form">
              <div className="ca-campo">
                <label className="ca-label">Nombre de la Línea</label>
                <input
                  type="text"
                  className="input"
                  placeholder="ej. Computación Distribuida"
                  value={formLinea.nombre}
                  onChange={(e) => handleFormChange("nombre", e.target.value)}
                />
              </div>

              <div className="ca-campo">
                <label className="ca-label">Descripción</label>
                <textarea
                  className="input"
                  placeholder="Define el alcance y los objetivos..."
                  value={formLinea.descripcion}
                  onChange={(e) => handleFormChange("descripcion", e.target.value)}
                />
              </div>

              <div className="ca-checkbox-fila">
                <input
                  type="checkbox"
                  id="activa"
                  className="ca-checkbox"
                  checked={formLinea.activa}
                  onChange={(e) => handleFormChange("activa", e.target.checked)}
                />
                <label htmlFor="activa" className="ca-checkbox-label">
                  Activa para el período académico actual
                </label>
              </div>

              <button className="btn btn-primario ca-btn-crear">
                CREAR LÍNEA DE INVESTIGACIÓN
              </button>
            </div>
          </div>

          {/* Líneas activas */}
          <div className="card ca-card">
            <div className="ca-lineas-header">
              <h2>Líneas Activas</h2>
              <span className="ca-badge-gestion">GESTIÓN</span>
            </div>
            <div className="ca-lineas-lista">
              {LINEAS_ACTIVAS.map((linea) => (
                <div key={linea.id} className="ca-linea-item">
                  <p className="ca-linea-nombre">{linea.nombre}</p>
                  <p className="ca-linea-desc">{linea.descripcion}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
