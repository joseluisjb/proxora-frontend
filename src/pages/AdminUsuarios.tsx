import { useState, useEffect, useRef, useCallback } from 'react';
import type { UsuarioResponse } from '../types/api.types';
import { usuariosService } from '../services/usuarios.service';
import PageHeader from '../components/ui/PageHeader';
import AvatarIniciales from '../components/ui/AvatarIniciales';
import BadgeEstado from '../components/ui/BadgeEstado';
import FiltroRoles from '../components/ui/FiltroRoles';
import BarraBusqueda from '../components/ui/BarraBusqueda';
import BotonAccionUsuario from '../components/ui/BotonAccionUsuario';
import FilaTablaAcciones from '../components/ui/FilaTablaAcciones';
import Paginacion from '../components/ui/Paginacion';

type FiltroRol = 'todos' | 'docente' | 'estudiante';

const REGISTROS_POR_PAGINA = 10;

function rolAVariante(rol: string): 'docente' | 'estudiante' | 'admin' {
  if (rol === 'administrador') return 'admin';
  if (rol === 'docente') return 'docente';
  return 'estudiante';
}

export default function AdminUsuarios() {
  const [filtroRol, setFiltroRol] = useState<FiltroRol>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [busquedaDebounced, setBusquedaDebounced] = useState('');
  const [pagina, setPagina] = useState(1);

  const [usuarios, setUsuarios] = useState<UsuarioResponse[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalElementos, setTotalElementos] = useState(0);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cargarUsuarios = useCallback(async (rol: FiltroRol, texto: string, pagActual: number) => {
    setCargando(true);
    setError(null);
    try {
      const params = { page: pagActual - 1, size: REGISTROS_POR_PAGINA };
      let resultado;
      if (texto.trim()) resultado = await usuariosService.buscar(texto.trim(), params);
      else if (rol !== 'todos') resultado = await usuariosService.listarPorRol(rol, params);
      else resultado = await usuariosService.listar(params);
      setUsuarios(resultado.content);
      setTotalPaginas(resultado.totalPages || 1);
      setTotalElementos(resultado.totalElements);
    } catch {
      setError('Error al cargar los datos. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setBusquedaDebounced(busqueda); setPagina(1); }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [busqueda]);

  useEffect(() => {
    cargarUsuarios(filtroRol, busquedaDebounced, pagina);
  }, [filtroRol, busquedaDebounced, pagina, cargarUsuarios]);

  const handleCambioFiltroRol = (rol: FiltroRol) => { setFiltroRol(rol); setPagina(1); };

  const handleHacerDocente = async (id: string) => {
    try { await usuariosService.convertirDocente(id); await cargarUsuarios(filtroRol, busquedaDebounced, pagina); }
    catch { setError('No se pudo cambiar el rol del usuario. Intenta de nuevo.'); }
  };

  const handleRevocarDocente = async (id: string) => {
    try { await usuariosService.convertirEstudiante(id); await cargarUsuarios(filtroRol, busquedaDebounced, pagina); }
    catch { setError('No se pudo revocar el rol de docente. Intenta de nuevo.'); }
  };

  const handleEliminar = async (usuario: UsuarioResponse) => {
    if (!window.confirm(`¿Desactivar al usuario ${usuario.nombre} ${usuario.apellido}? Su cuenta quedará inhabilitada.`)) return;
    try { await usuariosService.desactivar(usuario.id); await cargarUsuarios(filtroRol, busquedaDebounced, pagina); }
    catch { setError('No se pudo desactivar el usuario. Intenta de nuevo.'); }
  };

  const thCls = "text-left text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6B6B6B] px-4 py-3 border-b border-[#EBEBEB]";
  const tdCls = "px-4 py-3.5 border-b border-[#F0F0F0] align-middle";

  return (
    <div>
      <PageHeader
        titulo="Gestión de Usuarios"
        subtitulo="Controla el acceso institucional, gestiona roles académicos y monitorea el estado de las cuentas del programa de Ingeniería de Sistemas."
      />

      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <FiltroRoles rolActivo={filtroRol} onChange={handleCambioFiltroRol} />
        <div className="flex items-center gap-2">
          <BarraBusqueda placeholder="Buscar por nombre o correo..." valor={busqueda} onChange={setBusqueda} />
          <button className="w-9 h-9 border-[1.5px] border-[#E0E0E0] bg-white rounded-lg flex items-center justify-center cursor-pointer text-[#6B6B6B] transition-all hover:bg-[#F2F2F2] hover:text-[#111111]" title="Más opciones" aria-label="Más opciones">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-[#EBEBEB] animate-fade-in">
        {error && (
          <div className="bg-[#FEF2F2] border-l-[3px] border-[#EF4444] px-4 py-3 mb-4 flex items-center gap-3" role="alert">
            <span className="flex-1">{error}</span>
            <button onClick={() => cargarUsuarios(filtroRol, busquedaDebounced, pagina)} className="font-semibold text-[#EF4444] bg-none border-none cursor-pointer">Reintentar</button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={thCls} style={{ width: '40%' }}>Identidad del Usuario</th>
                <th className={thCls} style={{ width: '20%' }}>Rol Académico</th>
                <th className={thCls} style={{ width: '20%' }}>Estado de Cuenta</th>
                <th className={`${thCls} text-right`} style={{ width: '20%' }}>Acciones Administrativas</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={4}>
                    <div className="text-center py-12 px-5 text-[#6B6B6B]">
                      <p className="text-sm">Cargando...</p>
                    </div>
                  </td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="text-center py-12 px-5 text-[#6B6B6B]">
                      <div className="mb-3 opacity-40">
                        <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="mx-auto">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z" />
                        </svg>
                      </div>
                      <p className="text-sm">No hay usuarios registrados</p>
                    </div>
                  </td>
                </tr>
              ) : (
                usuarios.map((usr) => (
                  <tr key={usr.id} className="hover:bg-[#F8F8F8]">
                    <td className={tdCls}>
                      <div className="flex items-center gap-2.5">
                        <AvatarIniciales nombre={usr.nombre} apellido={usr.apellido} tamaño="md" />
                        <div>
                          <p className="text-[13px] font-semibold text-[#111111] leading-tight">{usr.nombre} {usr.apellido}</p>
                          <p className="text-xs text-[#6B6B6B] mt-0.5">{usr.correo}</p>
                        </div>
                      </div>
                    </td>
                    <td className={tdCls}>
                      <BadgeEstado variante={rolAVariante(usr.nombreRol)} />
                    </td>
                    <td className={tdCls}>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium before:content-[''] before:w-[7px] before:h-[7px] before:rounded-full before:inline-block ${usr.activo ? 'text-[#16A34A] before:bg-[#16A34A]' : 'text-[#DC2626] before:bg-[#DC2626]'}`}>
                        {usr.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className={tdCls}>
                      <div className="flex items-center justify-end gap-1.5">
                        {usr.nombreRol === 'estudiante' && (
                          <BotonAccionUsuario variante="hacer-docente" onClick={() => handleHacerDocente(usr.id)} />
                        )}
                        {usr.nombreRol === 'docente' && (
                          <BotonAccionUsuario variante="revocar-docente" onClick={() => handleRevocarDocente(usr.id)} />
                        )}
                        {usr.nombreRol !== 'administrador' && (
                          <FilaTablaAcciones mostrarEditar={false} onEliminar={() => handleEliminar(usr)} />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Paginacion
          paginaActual={pagina}
          totalPaginas={Math.max(totalPaginas, 1)}
          totalRegistros={totalElementos}
          registrosPorPagina={REGISTROS_POR_PAGINA}
          labelEntidad="usuarios"
          onCambiarPagina={setPagina}
        />
      </div>
    </div>
  );
}
