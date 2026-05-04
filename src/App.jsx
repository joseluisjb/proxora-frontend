import { useState } from "react";
import Sidebar from "./components/Sidebar";
import GestionUsuarios from "./pages/GestionUsuarios";
import ConfigAcademica from "./pages/ConfigAcademica";
import SupervisionProyectos from "./pages/SupervisionProyectos";
import "./styles/globals.css";

export default function App() {
  const [paginaActual, setPaginaActual] = useState("gestion-usuarios");

  const renderPagina = () => {
    switch (paginaActual) {
      case "gestion-usuarios":
        return <GestionUsuarios />;
      case "config-academica":
        return <ConfigAcademica />;
      case "supervision-proyectos":
        return <SupervisionProyectos />;
      default:
        return <GestionUsuarios />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar paginaActual={paginaActual} onNavegar={setPaginaActual} />
      <main className="app-main">{renderPagina()}</main>
    </div>
  );
}
