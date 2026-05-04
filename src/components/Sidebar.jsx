export default function Sidebar({ paginaActual, onNavegar, rol = "estudiante" }) {
  const MENU_ESTUDIANTE = [
    { id: "dashboard", label: "Panel Principal", icono: "📊" },
    { id: "my-projects", label: "Mis Proyectos", icono: "📁" },
    { id: "register", label: "Registrar", icono: "➕" },
    { id: "documents", label: "Documentos", icono: "📄" },
    { id: "evaluations", label: "Evaluaciones", icono: "⭐" },
  ]

  const MENU_ADMIN = [
    { id: "dashboard", label: "Panel Principal", icono: "📊" },
    { id: "user-management", label: "Gestión de Usuarios", icono: "👥" },
    { id: "academic-config", label: "Config. Académica", icono: "🎓" },
    { id: "project-oversight", label: "Supervisión Proyectos", icono: "🔍" },
  ]

  const MENU_FACULTY = [
    { id: "dashboard", label: "Panel Principal", icono: "📊" },
    { id: "portfolio", label: "Portafolio Proyectos", icono: "📋" },
    { id: "evaluations", label: "Evaluaciones", icono: "⭐" },
  ]

  const getMenu = () => {
    switch (rol) {
      case "admin":
        return MENU_ADMIN
      case "faculty":
        return MENU_FACULTY
      default:
        return MENU_ESTUDIANTE
    }
  }

  const items = getMenu()

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">Proxora</div>
      <nav className="sidebar__nav">
        {items.map(item => (
          <button
            key={item.id}
            className={`sidebar__item ${paginaActual === item.id ? "sidebar__item--active" : ""}`}
            onClick={() => onNavegar(item.id)}
          >
            <span className="sidebar__icono">{item.icono}</span>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="sidebar__footer">
        <button className="sidebar__item">
          <span className="sidebar__icono">⚙️</span>
          Configuración
        </button>
        <button className="sidebar__item">
          <span className="sidebar__icono">🚪</span>
          Cerrar Sesión
        </button>
      </div>
    </aside>
  )
}


