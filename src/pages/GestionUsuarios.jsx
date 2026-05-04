import { useState } from "react";
import "./GestionUsuarios.css";

const USUARIOS_MOCK = [
  {
    id: 1,
    iniciales: "AM",
    nombre: "Alejandro Martínez",
    email: "a.martinez@ufps.edu.co",
    rol: "docente",
    estado: "activo",
    foto: null,
  },
  {
    id: 2,
    iniciales: "ER",
    nombre: "Elena Rodríguez",
    email: "elena.rod@ufps.edu.co",
    rol: "estudiante",
    estado: "activo",
    foto: "https://i.pravatar.cc/40?img=5",
  },
  {
    id: 3,
    iniciales: "RC",
    nombre: "Ricardo Castro",
    email: "r.castro@ufps.edu.co",
    rol: "admin",
    estado: "suspendido",
    foto: null,
  },
  {
    id: 4,
    iniciales: "SV",
    nombre: "Sofía Valencia",
    email: "s.valencia@ufps.edu.co",
    rol: "docente",
    estado: "activo",
    foto: "https://i.pravatar.cc/40?img=9",
  },
];

const FILTROS = [
  { id: "todos", label: "Todos los Usuarios" },
  { id: "admin", label: "Administrador" },
  { id: "docente", label: "Docente" },
  { id: "estudiante", label: "Estudiante" },
];

const ROL_CONFIG = {
  docente: { clase: "badge-docente", label: "Docente", icono: "🎓" },
  estudiante: { clase: "badge-estudiante", label: "Estudiante", icono: "👤" },
  admin: { clase: "badge-admin", label: "Administrador", icono: "⚙️" },
};

const ACCION_POR_ROL = {
  docente: { label: "Asignar Admin", variante: "btn-secundario" },
  estudiante: { label: "Hacer Docente", variante: "btn-secundario" },
  admin: { label: "Revocar Admin", variante: "btn-secundario" },
};

export default function GestionUsuarios() {
  const [filtroActivo, setFiltroActivo] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  const usuariosFiltrados = USUARIOS_MOCK.filter((u) => {
    const coincideFiltro = filtroActivo === "todos" || u.rol === filtroActivo;
    const coincideBusqueda =
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email.toLowerCase().includes(busqueda.toLowerCase());
    return coincideFiltro && coincideBusqueda;
  });

  return (
    <div className="gu-contenedor">
      <div className="page-header">
        <h1>Gestión de Usuarios</h1>
        <p>
          Controla el acceso institucional, gestiona roles académicos y supervisa
          el estado de las cuentas en la facultad de Ingeniería de Sistemas.
        </p>
      </div>

      <div className="card">
        {/* Filtros y búsqueda */}
        <div className="gu-toolbar">
          <div className="gu-filtros">
            <span className="gu-filtros-label">Filtrar por Rol:</span>
            {FILTROS.map((f) => (
              <button
                key={f.id}
                className={`filtro-btn ${filtroActivo === f.id ? "filtro-btn--activo" : ""}`}
                onClick={() => setFiltroActivo(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="gu-busqueda-wrap">
            <div className="gu-busqueda">
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                type="text"
                placeholder="Buscar por nombre o correo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="gu-input-busqueda"
              />
            </div>
            <button className="btn btn-secundario gu-filtro-icono">
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th>Identidad del Usuario</th>
                <th>Rol Académico</th>
                <th>Estado de la Cuenta</th>
                <th>Acciones Administrativas</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((usuario) => {
                const rolCfg = ROL_CONFIG[usuario.rol];
                const accionCfg = ACCION_POR_ROL[usuario.rol];
                return (
                  <tr key={usuario.id}>
                    <td>
                      <div className="gu-usuario-celda">
                        <AvatarUsuario usuario={usuario} />
                        <div>
                          <p className="gu-usuario-nombre">{usuario.nombre}</p>
                          <p className="gu-usuario-email">{usuario.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${rolCfg.clase}`}>
                        {rolCfg.label}
                      </span>
                    </td>
                    <td>
                      <span className={`estado estado-${usuario.estado}`}>
                        {usuario.estado === "activo" ? "Activo" : "Suspendido"}
                      </span>
                    </td>
                    <td>
                      <div className="gu-acciones">
                        <button className={`btn ${accionCfg.variante} gu-btn-accion`}>
                          {accionCfg.label}
                        </button>
                        <button className="gu-btn-eliminar" title="Eliminar usuario">
                          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="gu-pie">
          <p className="gu-total-texto">
            Mostrando 1 a {usuariosFiltrados.length} de 24 resultados
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

function AvatarUsuario({ usuario }) {
  if (usuario.foto) {
    return (
      <img
        src={usuario.foto}
        alt={usuario.nombre}
        className="gu-avatar-img"
      />
    );
  }
  return (
    <div className="gu-avatar-iniciales">
      {usuario.iniciales}
    </div>
  );
}
