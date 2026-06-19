import { type ReactNode, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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
  const { cerrarSesion } = useAuth();
  const itemActivo = itemActivoProp ?? itemActivoDesdeRuta(pathname);

  const [estiloEntrada, setEstiloEntrada] = useState<React.CSSProperties>({
    opacity: 0,
    transform: 'translateX(-16px)',
  });

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setEstiloEntrada({ opacity: 1, transform: 'translateX(0)', transition: 'opacity 0.35s ease, transform 0.35s ease' });
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const handleCerrarSesion = () => {
    cerrarSesion();
    navigate('/login');
  };

  return (
    <aside className="fixed top-14 left-0 w-[220px] h-[calc(100vh-56px)] bg-white border-r border-[#EBEBEB] flex flex-col pb-4 z-[100] overflow-y-auto overflow-x-hidden" style={estiloEntrada}>
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-[#F0F0F0]">
        <div className="w-10 h-10 bg-[#C0392B] text-white rounded-[10px] flex items-center justify-center text-base font-bold shrink-0">P</div>
        <div>
          <p className="text-sm font-bold text-[#111111] leading-tight">Proxora</p>
          <p className="text-[10px] text-[#6B6B6B] uppercase tracking-[0.06em] mt-0.5">Admin Panel</p>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5 px-2.5 pt-3 flex-1">
        {NAV_ITEMS.map((item) => {
          const activo = item.id === itemActivo;
          return (
            <button
              key={item.id}
              className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg border-none font-sans text-[11px] font-semibold tracking-[0.05em] uppercase cursor-pointer text-left transition-all duration-150 w-full hover:translate-x-0.5 ${
                activo
                  ? 'text-[#C0392B] bg-[#FDECEA] font-bold'
                  : 'text-[#6B6B6B] bg-transparent hover:bg-[#F8F8F8] hover:text-[#C0392B]'
              }`}
              onClick={() => navigate(item.path)}
              aria-current={activo ? 'page' : undefined}
            >
              <span className="flex items-center shrink-0">{item.icono}</span>
              <span className="flex-1 leading-tight">{item.label}</span>
              {activo && (
                <span className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#C0392B] rounded-[3px_0_0_3px]" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-2.5 pt-2 pb-1 border-t border-[#F0F0F0]">
        <button
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border-none font-sans text-[11px] font-semibold tracking-[0.05em] uppercase cursor-pointer text-left transition-all duration-150 w-full text-[#6B6B6B] bg-transparent hover:bg-[#FEF2F2] hover:text-[#C0392B]"
          onClick={handleCerrarSesion}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
