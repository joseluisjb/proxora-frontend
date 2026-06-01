import { Outlet } from 'react-router-dom';
import NavbarTop from './ui/NavbarTop';
import SidebarAdmin from './ui/SidebarAdmin';

export default function AdminLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavbarTop onClickPerfil={() => console.log('Perfil clickeado')} />
      <div className="flex flex-1 pt-14">
        <SidebarAdmin />
        <main className="flex-1 ml-[220px] px-10 py-8 min-h-[calc(100vh-56px)] bg-[#F8F8F8]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
