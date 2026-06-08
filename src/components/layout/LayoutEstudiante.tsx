import { Outlet } from 'react-router-dom';
import NavbarTop from '../ui/NavbarTop';
import SidebarEstudiante from './SidebarEstudiante';

export default function LayoutEstudiante() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavbarTop />
      <div className="flex flex-1 pt-14">
        <SidebarEstudiante />
        <main className="flex-1 ml-[220px] p-8 min-h-[calc(100vh-56px)] bg-[#F9FAFB]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
