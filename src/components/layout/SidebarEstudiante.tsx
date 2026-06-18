import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export type ItemSidebarEstudiante =
  | 'mis-proyectos'
  | 'dashboard'
  | 'registrar'
  | 'documentos'
  | 'evaluaciones';

export interface SidebarEstudianteProps {
  itemActivo: ItemSidebarEstudiante;
}

interface NavItemEst {
  id: ItemSidebarEstudiante;
  label: string;
  path: string;
  icono: ReactNode;
}

const NAV_ITEMS: NavItemEst[] = [
  {
    id: 'mis-proyectos',
    label: 'Mis Proyectos',
    path: '/estudiante/mis-proyectos',
    icono: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/estudiante/dashboard',
    icono: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
      </svg>
    ),
  },
  {
    id: 'registrar',
    label: 'Registrar',
    path: '/estudiante/registrar',
    icono: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'documentos',
    label: 'Documentos',
    path: '/estudiante/documentos',
    icono: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'evaluaciones',
    label: 'Evaluaciones',
    path: '/estudiante/evaluaciones',
    icono: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
];

export default function SidebarEstudiante({ itemActivo }: SidebarEstudianteProps) {
  const navigate = useNavigate();

  return (
    <aside className="fixed top-14 left-0 w-[220px] h-[calc(100vh-56px)] bg-white border-r border-[#E5E7EB] flex flex-col z-[100] overflow-y-auto animate-slide-right">
      <div className="px-4 pt-5 pb-4 border-b border-[#F3F4F6] mb-2">
        <p className="text-sm font-bold text-[#111827] leading-tight mb-1">Gestión de Proyectos</p>
        <p className="text-[11px] text-[#6B7280] uppercase tracking-[0.08em]">Ingeniería de Sistemas</p>
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
                <span className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#B91C1C] rounded-[3px_0_0_3px]" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
