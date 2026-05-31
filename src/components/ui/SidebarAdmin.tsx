import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './SidebarAdmin.css';

type ItemActivo = 'usuarios' | 'proyectos' | 'lineas' | 'materias' | 'semestres';

interface SidebarAdminProps {
  itemActivo?: ItemActivo;
}

interface NavItem {
  id: ItemActivo;
  label: string;
  path: string;
  icono: ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'usuarios',
    label: 'Gestión de Usuarios',
    path: '/admin/usuarios',
    icono: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    id: 'proyectos',
    label: 'Proyectos',
    path: '/admin/proyectos',
    icono: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 'lineas',
    label: 'Líneas de Investigación',
    path: '/admin/lineas-investigacion',
    icono: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
  },
  {
    id: 'materias',
    label: 'Materias',
    path: '/admin/materias',
    icono: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'semestres',
    label: 'Semestres',
    path: '/admin/semestres',
    icono: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
];

function itemActivoDesdeRuta(pathname: string): ItemActivo {
  if (pathname.startsWith('/admin/lineas-investigacion')) return 'lineas';
  if (pathname.startsWith('/admin/materias')) return 'materias';
  if (pathname.startsWith('/admin/semestres')) return 'semestres';
  if (pathname.startsWith('/admin/proyectos')) return 'proyectos';
  return 'usuarios';
}

export default function SidebarAdmin({ itemActivo: itemActivoProp }: SidebarAdminProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const itemActivo = itemActivoProp ?? itemActivoDesdeRuta(pathname);

  return (
    <aside className="sidebar-admin">
      <div className="sidebar-admin__identidad">
        <div className="sidebar-admin__avatar">P</div>
        <div>
          <p className="sidebar-admin__nombre">Proxora</p>
          <p className="sidebar-admin__subtitulo">Admin Panel</p>
        </div>
      </div>

      <nav className="sidebar-admin__nav">
        {NAV_ITEMS.map((item) => {
          const activo = item.id === itemActivo;
          return (
            <button
              key={item.id}
              className={`sidebar-admin__item ${activo ? 'sidebar-admin__item--activo' : ''}`}
              onClick={() => navigate(item.path)}
              aria-current={activo ? 'page' : undefined}
            >
              <span className="sidebar-admin__icono">{item.icono}</span>
              <span className="sidebar-admin__label">{item.label}</span>
              {activo && <span className="sidebar-admin__indicador" />}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
