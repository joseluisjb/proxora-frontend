import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import NavbarTop from '../ui/NavbarTop';
import SidebarAdmin from './SidebarAdmin';
import Alerta from '../ui/Alerta';
import { AlertaContext } from '../../context/AlertaContext';
import { useAlerta } from '../../hooks/useAlerta';

export default function LayoutAdmin() {
  const { alertaProps, mostrarAlerta } = useAlerta();
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  return (
    <AlertaContext.Provider value={{ mostrarAlerta }}>
      <div className="flex flex-col min-h-screen">
        <NavbarTop
          onClickPerfil={() => console.log('Perfil clickeado')}
          onToggleMenu={() => setSidebarAbierto((prev) => !prev)}
        />
        <div className="flex flex-1 pt-14">
          <SidebarAdmin
            abierto={sidebarAbierto}
            onCerrar={() => setSidebarAbierto(false)}
          />
          <main className="flex-1 min-w-0 lg:ml-[220px] px-4 py-6 lg:px-10 lg:py-8 min-h-[calc(100vh-56px)] bg-[#F8F8F8]">
            <Outlet />
          </main>
        </div>
      </div>
      <Alerta {...alertaProps} />
    </AlertaContext.Provider>
  );
}
