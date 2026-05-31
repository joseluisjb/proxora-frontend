import type { ReactNode } from 'react';
import NavbarTop from '../ui/NavbarTop';
import SidebarEstudiante, { type ItemSidebarEstudiante } from './SidebarEstudiante';

interface LayoutEstudianteProps {
  itemActivo: ItemSidebarEstudiante;
  children: ReactNode;
}

export default function LayoutEstudiante({ itemActivo, children }: LayoutEstudianteProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <NavbarTop />
      <div className="flex flex-1 pt-14">
        <SidebarEstudiante itemActivo={itemActivo} />
        <main className="flex-1 ml-[220px] p-8 min-h-[calc(100vh-56px)] bg-[#F9FAFB] overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
