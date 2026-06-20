import { Outlet } from 'react-router-dom';
import NavbarTop from '../ui/NavbarTop';
import SidebarDocente from './SidebarDocente';
import Alerta from '../ui/Alerta';
import { AlertaContext } from '../../context/AlertaContext';
import { useAlerta } from '../../hooks/useAlerta';

export default function LayoutDocente() {
  const { alertaProps, mostrarAlerta } = useAlerta();
  return (
    <AlertaContext.Provider value={{ mostrarAlerta }}>
      <div className="flex flex-col min-h-screen">
        <NavbarTop />
        <div className="flex flex-1 pt-14">
          <SidebarDocente />
          <main className="flex-1 ml-[220px] p-8 min-h-[calc(100vh-56px)] bg-[#F9FAFB] overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
      <Alerta {...alertaProps} />
    </AlertaContext.Provider>
  );
}
