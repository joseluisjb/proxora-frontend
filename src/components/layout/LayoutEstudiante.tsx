import type { ReactNode } from 'react';
import NavbarTop from '../ui/NavbarTop';
import SidebarEstudiante, { type ItemSidebarEstudiante } from './SidebarEstudiante';
import './LayoutEstudiante.css';

interface LayoutEstudianteProps {
  itemActivo: ItemSidebarEstudiante;
  children: ReactNode;
}

export default function LayoutEstudiante({ itemActivo, children }: LayoutEstudianteProps) {
  return (
    <div className="layout-est">
      <NavbarTop />
      <div className="layout-est__body">
        <SidebarEstudiante itemActivo={itemActivo} />
        <main className="layout-est__contenido">
          {children}
        </main>
      </div>
    </div>
  );
}
