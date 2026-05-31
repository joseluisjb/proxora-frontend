import { Outlet } from 'react-router-dom';
import NavbarTop from './ui/NavbarTop';
import SidebarAdmin from './ui/SidebarAdmin';
import './AdminLayout.css';

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <NavbarTop onClickPerfil={() => console.log('Perfil clickeado')} />
      <div className="admin-body">
        <SidebarAdmin />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
