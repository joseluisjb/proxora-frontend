import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import MyProjects from "./pages/MyProjects";
import ProjectPortfolio from "./pages/ProjectPortfolio";
import RegisterNewProject from "./pages/RegisterNewProject";
import ProjectDetails from "./pages/ProjectDetails";
import GestionUsuarios from "./pages/GestionUsuarios";
import ConfigAcademica from "./pages/ConfigAcademica";
import SupervisionProyectos from "./pages/SupervisionProyectos";
import "./styles/globals.css";

export default function App() {
  const [paginaActual, setPaginaActual] = useState("dashboard");
  const [rol, setRol] = useState("faculty"); // "estudiante", "faculty", "admin"

  const renderPagina = () => {
    switch (paginaActual) {
      case "dashboard":
        return <Dashboard />;
      case "my-projects":
        return <MyProjects />;
      case "portfolio":
        return <ProjectPortfolio />;
      case "register":
        return <RegisterNewProject />;
      case "project-details":
        return <ProjectDetails />;
      case "user-management":
        return <GestionUsuarios />;
      case "academic-config":
        return <ConfigAcademica />;
      case "project-oversight":
        return <SupervisionProyectos />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      <Sidebar paginaActual={paginaActual} onNavegar={setPaginaActual} rol={rol} />
      <main className="main">
        <Header />
        <div className="content">
          {renderPagina()}
        </div>
      </main>
    </div>
  );
}


