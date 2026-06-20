import { type ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

type ItemSidebarDocente = 'dashboard' | 'lista-proyectos' | 'evaluaciones';

interface SidebarDocenteProps {
  abierto: boolean;
  onCerrar: () => void;
}

interface NavItemDoc {
  id: ItemSidebarDocente;
  label: string;
  path: string;
  icono: ReactNode;
}

function itemActivoDesdeRuta(pathname: string): ItemSidebarDocente {
  if (pathname.startsWith('/docente/dashboard')) return 'dashboard';
  if (pathname.startsWith('/docente/lista-proyectos')) return 'lista-proyectos';
  if (pathname.startsWith('/docente/evaluaciones')) return 'evaluaciones';
  return 'dashboard';
}

const NAV_ITEMS: NavItemDoc[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/docente/dashboard',
    icono: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
      </svg>
    ),
  },
  {
    id: 'lista-proyectos',
    label: 'Lista de Proyectos',
    path: '/docente/lista-proyectos',
    icono: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h6m-6 4h6" />
      </svg>
    ),
  },
  {
    id: 'evaluaciones',
    label: 'Evaluaciones',
    path: '/docente/evaluaciones',
    icono: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
];

export default function SidebarDocente({ abierto, onCerrar }: SidebarDocenteProps) {
  const navigate = useNavigate();
  const { cerrarSesion } = useAuth();
  const { pathname } = useLocation();
  const itemActivo = itemActivoDesdeRuta(pathname);

  useEffect(() => {
    if (window.innerWidth < 1024) onCerrar();
  }, [pathname]);

  const handleCerrarSesion = () => {
    cerrarSesion();
    navigate('/login');
  };

  return (
    <>
      {abierto && (
        <div
          className="fixed top-14 inset-x-0 bottom-0 bg-black/40 z-[150] lg:hidden"
          onClick={onCerrar}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-14 left-0 w-[220px] h-[calc(100vh-56px)] bg-white border-r border-[#E5E7EB] flex flex-col z-[175] overflow-y-auto overflow-x-hidden transition-transform duration-300 ease-in-out animate-fade-in ${abierto ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="px-4 pt-5 pb-4 border-b border-[#F3F4F6] mb-2">
          <p className="text-sm font-bold text-[#111827] leading-tight mb-1">Portal Docente</p>
          <p className="text-[11px] text-[#6B7280] uppercase tracking-[0.08em]">Gestión Académica</p>
        </div>

        <nav className="flex flex-col gap-0.5 px-2 py-1 flex-1">
          {NAV_ITEMS.map((item) => {
            const activo = item.id === itemActivo;
            return (
              <button
                key={item.id}
                className={`relative flex items-center gap-2.5 px-4 py-2.5 rounded-lg border-none font-sans text-[13px] font-medium cursor-pointer text-left transition-all duration-150 w-full hover:translate-x-0.5 ${
                  activo
                    ? 'text-[#B91C1C] bg-[#FEF2F2] font-semibold'
                    : 'text-[#374151] bg-transparent hover:bg-[#FEF2F2] hover:text-[#B91C1C]'
                }`}
                onClick={() => navigate(item.path)}
                aria-current={activo ? 'page' : undefined}
              >
                <span className="flex items-center shrink-0">{item.icono}</span>
                <span className="flex-1">{item.label}</span>
                {activo && (
                  <span
                    className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#B91C1C] rounded-[3px_0_0_3px]"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-2 pt-2 pb-1 border-t border-[#F3F4F6]">
          <button
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg border-none font-sans text-[13px] font-medium cursor-pointer text-left transition-all duration-150 w-full text-[#374151] bg-transparent hover:bg-[#FEF2F2] hover:text-[#B91C1C]"
            onClick={handleCerrarSesion}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
