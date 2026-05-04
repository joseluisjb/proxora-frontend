import { useState } from "react";
import "./SupervisionProyectos.css";

const PROYECTOS_MOCK = [
  {
    id: "PRJ-2024-001",
    titulo: "Búsqueda de Arquitecturas Neuronales para IoT",
    autor: "Alejandro Ramírez",
    director: "Dra. Martha Elena V.",
    materia: "IA & Sistemas",
    visibilidad: "Público",
  },
  {
    id: "PRJ-2024-042",
    titulo: "Ledger Distribuido para Cadena de Suministro",
    autor: "Juliana Ortiz",
    director: "Ing. Ricardo Méndez",
    materia: "Blockchain",
    visibilidad: "Privado",
  },
  {
    id: "PRJ-2023-118",
    titulo: "Patrones de Seguridad en Microservicios",
    autor: "Cristian Morales",
    director: "Dra. Martha Elena V.",
    materia: "Ing. Software",
    visibilidad: "Público",
  },
  {
    id: "PRJ-2023-094",
    titulo: "Visualización de Datos para Tráfico Urbano",
    autor: "Sofía Herrera",
    director: "Ing. Camilo Soto",
    materia: "Ciencia de Datos",
    visibilidad: "Público",
  },
  {
    id: "PRJ-2024-015",
    titulo: "Prototipos de Criptografía Cuántica",
    autor: "David Jiménez",
    director: "Dra. Martha Elena V.",
    materia: "Ciberseguridad",
    visibilidad: "Privado",
  },
];

const SEMESTRES = ["Todos los Semestres", "2024-I", "2024-II", "2023-I", "2023-II"];
const MATERIAS = ["Todas las Materias", "IA & Sistemas", "Blockchain", "Ing. Software", "Ciencia de Datos", "Ciberseguridad"];
const VISIBILIDADES = ["Toda Visibilidad", "Público", "Privado"];

export default function SupervisionProyectos() {
  const [semestre, setSemestre] = useState("Todos los Semestres");
  const [materia, setMateria] = useState("Todas las Materias");
  const [visibilidad, setVisibilidad] = useState("Toda Visibilidad");

  const proyectosFiltrados = PROYECTOS_MOCK.filter((p) => {
    const okMateria = materia === "Todas las Materias" || p.materia === materia;
    const okVis = visibilidad === "Toda Visibilidad" || p.visibilidad === visibilidad;
    return okMateria && okVis;
  });

  return (
    <div className="sp-contenedor">
      {/* Header */}
      <div className="sp-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <p className="sp-seccion-label">Administración del Sistema</p>
          <h1>Supervisión de Proyectos</h1>
          <p>
            Gestiona y monitorea todos los proyectos de investigación en ingeniería de
            sistemas de la institución.
          </p>
        </div>
        <button className="btn btn-primario sp-btn-nuevo">
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Nuevo Proyecto
        </button>
      </div>

      {/* Filtros */}
      <div className="card sp-filtros-card">
        <div className="sp-filtros">
          <div className="sp-select-wrap">
            <label className="sp-select-label">Semestre</label>
            <select
              className="sp-select"
              value={semestre}
              onChange={(e) => setSemestre(e.target.value)}
            >
              {SEMESTRES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="sp-select-wrap">
            <label className="sp-select-label">Materia / Área</label>
            <select
              className="sp-select"
              value={materia}
              onChange={(e) => setMateria(e.target.value)}
            >
              {MATERIAS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>

          <div className="sp-select-wrap">
            <label className="sp-select-label">Visibilidad</label>
            <select
              className="sp-select"
              value={visibilidad}
              onChange={(e) => setVisibilidad(e.target.value)}
            >
              {VISIBILIDADES.map((v) => <option key={v}>{v}</option>)}
            </select>
          </div>

          <button className="btn btn-oscuro sp-btn-filtrar">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
            </svg>
            Aplicar Filtros
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="card sp-tabla-card">
        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th>Título del Proyecto</th>
                <th>Autor Principal</th>
                <th>Director</th>
                <th>Materia</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proyectosFiltrados.map((proyecto) => (
                <tr key={proyecto.id}>
                  <td>
                    <p className="sp-proyecto-titulo">{proyecto.titulo}</p>
                    <p className="sp-proyecto-meta">
                      ID: {proyecto.id} •{" "}
                      <span className={`sp-visibilidad sp-visibilidad--${proyecto.visibilidad === "Público" ? "publico" : "privado"}`}>
                        {proyecto.visibilidad}
                      </span>
                    </p>
                  </td>
                  <td className="sp-td-texto">{proyecto.autor}</td>
                  <td className="sp-td-texto">{proyecto.director}</td>
                  <td>
                    <span className="badge badge-materia">{proyecto.materia}</span>
                  </td>
                  <td>
                    <div className="sp-acciones">
                      <button className="ca-icono-btn" title="Ver proyecto">
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      </button>
                      <button className="ca-icono-btn" title="Editar">
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="sp-pie">
          <p className="gu-total-texto">
            Mostrando 1 a 5 de 124 proyectos
          </p>
          <div className="paginacion">
            <button className="pag-btn">‹</button>
            <button className="pag-btn activo">1</button>
            <button className="pag-btn">2</button>
            <button className="pag-btn">3</button>
            <button className="pag-btn">›</button>
          </div>
        </div>
      </div>
    </div>
  );
}
