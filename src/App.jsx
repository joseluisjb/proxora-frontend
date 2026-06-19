import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import Registro from './pages/Registro';
import RecuperarContrasena from './pages/RecuperarContrasena';
import LandingPage from './pages/LandingPage';
import DetalleProyecto from './pages/DetalleProyecto';
import AdminUsuarios from './pages/AdminUsuarios';
import AdminProyectos from './pages/AdminProyectos';
import AdminLineasInvestigacion from './pages/AdminLineasInvestigacion';
import AdminMaterias from './pages/AdminMaterias';
import AdminSemestres from './pages/AdminSemestres';
import FormularioLineaInvestigacion from './pages/FormularioLineaInvestigacion';
import FormularioMateria from './pages/FormularioMateria';
import FormularioSemestre from './pages/FormularioSemestre';
import LayoutEstudiante from './components/layout/LayoutEstudiante';
import DashboardEstudiante from './pages/estudiante/DashboardEstudiante';
import RegistrarProyecto from './pages/estudiante/RegistrarProyecto';
import MisProyectos from './pages/estudiante/MisProyectos';
import ProyectoDetalleEstudiante from './pages/estudiante/ProyectoDetalleEstudiante';
import EditarProyecto from './pages/estudiante/EditarProyecto';
import Documentos from './pages/estudiante/Documentos';
import DocumentoVersiones from './pages/estudiante/DocumentoVersiones';
import Evaluaciones from './pages/estudiante/Evaluaciones';
import EvaluacionDetalle from './pages/estudiante/EvaluacionDetalle';
import './styles/globals.css'

const DESTINO_POR_ROL = {
  administrador: '/admin/usuarios',
  docente:       '/docente/dashboard',
  estudiante:    '/estudiante/dashboard',
};

/** "/" → LandingPage si no hay sesión; redirige al dashboard si hay sesión */
function RutaRaiz() {
  const { usuario } = useAuth();
  if (usuario && usuario.rol !== 'invitado') {
    const destino = DESTINO_POR_ROL[usuario.rol] ?? '/admin/usuarios';
    return <Navigate to={destino} replace />;
  }
  return <LandingPage />;
}

/** "/login" → Login si no hay sesión; redirige al dashboard si hay sesión */
function RutaLogin() {
  const { usuario } = useAuth();
  if (usuario && usuario.rol !== 'invitado') {
    const destino = DESTINO_POR_ROL[usuario.rol] ?? '/admin/usuarios';
    return <Navigate to={destino} replace />;
  }
  return <Login />;
}

/** "/registro" → Registro si no hay sesión; redirige si hay sesión */
function RutaRegistro() {
  const { usuario } = useAuth();
  if (usuario && usuario.rol !== 'invitado') {
    const destino = DESTINO_POR_ROL[usuario.rol] ?? '/admin/usuarios';
    return <Navigate to={destino} replace />;
  }
  return <Registro />;
}

/** Ruta protegida para el módulo de estudiante */
function RutaEstudiante({ children }) {
  const { usuario } = useAuth();
  if (!usuario || usuario.rol !== 'estudiante') {
    return <Navigate to="/login" replace />;
  }
  return children;
}

/** Página de marcador para vistas pendientes del módulo estudiante */
function PaginaPendiente({ titulo }) {
  return (
    <div style={{ padding: 32 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{titulo}</h2>
      <p style={{ color: '#6B7280', fontSize: 14 }}>Esta sección estará disponible próximamente.</p>
    </div>
  );
}

function Rutas() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<RutaRaiz />} />
      <Route path="/login" element={<RutaLogin />} />
      <Route path="/registro" element={<RutaRegistro />} />
      <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
      <Route path="/proyectos/:id" element={<DetalleProyecto />} />

      {/* Panel de administración */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="usuarios" replace />} />
        <Route path="usuarios" element={<AdminUsuarios />} />
        <Route path="proyectos" element={<AdminProyectos />} />

        <Route path="lineas-investigacion" element={<AdminLineasInvestigacion />} />
        <Route path="lineas-investigacion/nueva" element={<FormularioLineaInvestigacion />} />
        <Route path="lineas-investigacion/:id/editar" element={<FormularioLineaInvestigacion />} />

        <Route path="materias" element={<AdminMaterias />} />
        <Route path="materias/nueva" element={<FormularioMateria />} />
        <Route path="materias/:id/editar" element={<FormularioMateria />} />

        <Route path="semestres" element={<AdminSemestres />} />
        <Route path="semestres/nuevo" element={<FormularioSemestre />} />
        <Route path="semestres/:id/editar" element={<FormularioSemestre />} />
      </Route>

      {/* Módulo de estudiante */}
      <Route
        path="/estudiante"
        element={<RutaEstudiante><LayoutEstudiante /></RutaEstudiante>}
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardEstudiante />} />
        <Route path="mis-proyectos" element={<MisProyectos />} />
        <Route path="mis-proyectos/:id" element={<ProyectoDetalleEstudiante />} />
        <Route path="mis-proyectos/:id/editar" element={<EditarProyecto />} />
        <Route path="registrar" element={<RegistrarProyecto />} />
        <Route path="documentos" element={<Documentos />} />
        <Route path="documentos/:id" element={<DocumentoVersiones />} />
        <Route path="evaluaciones" element={<Evaluaciones />} />
        <Route path="evaluaciones/:id" element={<EvaluacionDetalle />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <Rutas />
      </AuthProvider>
    </BrowserRouter>
  );
}
