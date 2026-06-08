import { useState, useEffect, useRef, useCallback } from 'react';
import type { UsuarioCreateRequest, UsuarioResponse } from '../types/api.types';
import { usuariosService } from '../services/usuarios.service';
import PageHeader from '../components/ui/PageHeader';
import AvatarIniciales from '../components/ui/AvatarIniciales';
import BadgeEstado from '../components/ui/BadgeEstado';
import FiltroRoles from '../components/ui/FiltroRoles';
import BarraBusqueda from '../components/ui/BarraBusqueda';
import BotonAccionUsuario from '../components/ui/BotonAccionUsuario';
import FilaTablaAcciones from '../components/ui/FilaTablaAcciones';
import Paginacion from '../components/ui/Paginacion';
import Modal from '../components/ui/Modal';

type FiltroRol = 'todos' | 'docente' | 'estudiante';
type AccionRol = { usuario: UsuarioResponse; tipo: 'hacer-docente' | 'revocar-docente' };

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

  const [modalAbierto, setModalAbierto] = useState(false);
  const [formData, setFormData] = useState<UsuarioCreateRequest>({ nombre: '', apellido: '', correo: '', contrasena: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [usuarioAEliminar, setUsuarioAEliminar] = useState<UsuarioResponse | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const [accionRol, setAccionRol] = useState<AccionRol | null>(null);
  const [cambiandoRol, setCambiandoRol] = useState(false);

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

  const handleHacerDocente = (usuario: UsuarioResponse) => setAccionRol({ usuario, tipo: 'hacer-docente' });
  const handleRevocarDocente = (usuario: UsuarioResponse) => setAccionRol({ usuario, tipo: 'revocar-docente' });

  const confirmarCambioRol = async () => {
    if (!accionRol) return;
    setCambiandoRol(true);
    try {
      if (accionRol.tipo === 'hacer-docente') await usuariosService.convertirDocente(accionRol.usuario.id);
      else await usuariosService.convertirEstudiante(accionRol.usuario.id);
      setAccionRol(null);
      await cargarUsuarios(filtroRol, busquedaDebounced, pagina);
    } catch {
      setError(accionRol.tipo === 'hacer-docente'
        ? 'No se pudo cambiar el rol del usuario. Intenta de nuevo.'
        : 'No se pudo revocar el rol de docente. Intenta de nuevo.');
      setAccionRol(null);
    } finally {
      setCambiandoRol(false);
    }
  };

  const handleEliminar = (usuario: UsuarioResponse) => {
    setUsuarioAEliminar(usuario);
  };

  const confirmarEliminar = async () => {
    if (!usuarioAEliminar) return;
    setEliminando(true);
    try {
      await usuariosService.desactivar(usuarioAEliminar.id);
      setUsuarioAEliminar(null);
      await cargarUsuarios(filtroRol, busquedaDebounced, pagina);
    } catch {
      setError('No se pudo desactivar el usuario. Intenta de nuevo.');
      setUsuarioAEliminar(null);
    } finally {
      setEliminando(false);
    }
  };

  const abrirModal = () => {
    setFormData({ nombre: '', apellido: '', correo: '', contrasena: '' });
    setFormError(null);
    setModalAbierto(true);
  };

  const cerrarModal = () => { setModalAbierto(false); };

  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setGuardando(true);
    try {
      await usuariosService.crear(formData);
      cerrarModal();
      await cargarUsuarios(filtroRol, busquedaDebounced, pagina);
    } catch {
      setFormError('No se pudo registrar el usuario. Verifica los datos e intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  const thCls = "text-left text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6B6B6B] px-4 py-3 border-b border-[#EBEBEB]";
  const tdCls = "px-4 py-3.5 border-b border-[#F0F0F0] align-middle";

  return (
    <div>
      <PageHeader
        titulo="Gestión de Usuarios"
        subtitulo="Controla el acceso institucional, gestiona roles académicos y monitorea el estado de las cuentas del programa de Ingeniería de Sistemas."
      />

      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap animate-slide-up">
        <FiltroRoles rolActivo={filtroRol} onChange={handleCambioFiltroRol} />
        <div className="flex items-center gap-2">
          <BarraBusqueda placeholder="Buscar por nombre o correo..." valor={busqueda} onChange={setBusqueda} />
          <button
            onClick={abrirModal}
            className="h-9 px-3.5 bg-[#111111] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-all hover:bg-[#333333]"
          >
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Registrar usuario
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-[#EBEBEB] animate-slide-up">
        {error && (
          <div className="bg-[#FEF2F2] border-l-[3px] border-[#EF4444] px-4 py-3 mb-4 flex items-center gap-3 animate-scale-in" role="alert">
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
                usuarios.map((usr, index) => (
                  <tr key={usr.id} className="hover:bg-[#F8F8F8] animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
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
                          <BotonAccionUsuario variante="hacer-docente" onClick={() => handleHacerDocente(usr)} />
                        )}
                        {usr.nombreRol === 'docente' && (
                          <BotonAccionUsuario variante="revocar-docente" onClick={() => handleRevocarDocente(usr)} />
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

      <Modal open={modalAbierto} onClose={cerrarModal} title="Registrar nuevo usuario">
        <form onSubmit={handleCrearUsuario} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#444] mb-1">Nombre</label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData((p) => ({ ...p, nombre: e.target.value }))}
                className="w-full h-9 px-3 border border-[#E0E0E0] rounded-lg text-sm text-[#111] focus:outline-none focus:border-[#111]"
                placeholder="Ej. Juan"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#444] mb-1">Apellido</label>
              <input
                type="text"
                required
                value={formData.apellido}
                onChange={(e) => setFormData((p) => ({ ...p, apellido: e.target.value }))}
                className="w-full h-9 px-3 border border-[#E0E0E0] rounded-lg text-sm text-[#111] focus:outline-none focus:border-[#111]"
                placeholder="Ej. Pérez"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#444] mb-1">Correo electrónico</label>
            <input
              type="email"
              required
              value={formData.correo}
              onChange={(e) => setFormData((p) => ({ ...p, correo: e.target.value }))}
              className="w-full h-9 px-3 border border-[#E0E0E0] rounded-lg text-sm text-[#111] focus:outline-none focus:border-[#111]"
              placeholder="correo@ejemplo.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#444] mb-1">Contraseña</label>
            <input
              type="password"
              required
              minLength={8}
              value={formData.contrasena}
              onChange={(e) => setFormData((p) => ({ ...p, contrasena: e.target.value }))}
              className="w-full h-9 px-3 border border-[#E0E0E0] rounded-lg text-sm text-[#111] focus:outline-none focus:border-[#111]"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          {formError && (
            <p className="text-xs text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] rounded-lg px-3 py-2">{formError}</p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={cerrarModal} className="h-9 px-4 text-sm text-[#444] border border-[#E0E0E0] rounded-lg hover:bg-[#F2F2F2] cursor-pointer">
              Cancelar
            </button>
            <button type="submit" disabled={guardando} className="h-9 px-4 text-sm font-semibold bg-[#111111] text-white rounded-lg hover:bg-[#333] cursor-pointer disabled:opacity-50">
              {guardando ? 'Registrando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={accionRol !== null}
        onClose={() => setAccionRol(null)}
        title={accionRol?.tipo === 'hacer-docente' ? 'Promover a Docente' : 'Revocar rol Docente'}
        size="sm"
      >
        <div className="flex flex-col gap-5">
          <div className="flex items-start gap-3">
            {accionRol?.tipo === 'hacer-docente' ? (
              <div className="shrink-0 w-9 h-9 rounded-full bg-[#EBF4FF] flex items-center justify-center">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#2563EB" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
            ) : (
              <div className="shrink-0 w-9 h-9 rounded-full bg-[#FFFBEB] flex items-center justify-center">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#D97706" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
            )}
            <div>
              <p className="text-[13px] text-[#111111] leading-relaxed">
                {accionRol?.tipo === 'hacer-docente' ? (
                  <>¿Promover a <span className="font-semibold">{accionRol.usuario.nombre} {accionRol.usuario.apellido}</span> como docente?</>
                ) : (
                  <>¿Revocar el rol docente de <span className="font-semibold">{accionRol?.usuario.nombre} {accionRol?.usuario.apellido}</span>?</>
                )}
              </p>
              <p className="text-xs text-[#6B6B6B] mt-1">
                {accionRol?.tipo === 'hacer-docente'
                  ? 'Podrá actuar como director y evaluador en proyectos académicos.'
                  : 'Perderá el acceso a las funciones de dirección y evaluación de proyectos.'}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAccionRol(null)}
              disabled={cambiandoRol}
              className="h-9 px-4 text-sm text-[#444] border border-[#E0E0E0] rounded-lg hover:bg-[#F2F2F2] cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmarCambioRol}
              disabled={cambiandoRol}
              className={`h-9 px-4 text-sm font-semibold text-white rounded-lg cursor-pointer disabled:opacity-50 transition-colors ${
                accionRol?.tipo === 'hacer-docente'
                  ? 'bg-[#2563EB] hover:bg-[#1D4ED8]'
                  : 'bg-[#D97706] hover:bg-[#B45309]'
              }`}
            >
              {cambiandoRol
                ? 'Aplicando...'
                : accionRol?.tipo === 'hacer-docente' ? 'Promover' : 'Revocar'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={usuarioAEliminar !== null}
        onClose={() => setUsuarioAEliminar(null)}
        title="Desactivar usuario"
        size="sm"
      >
        <div className="flex flex-col gap-5">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-9 h-9 rounded-full bg-[#FEE2E2] flex items-center justify-center">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#DC2626" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[13px] text-[#111111] leading-relaxed">
                ¿Desactivar la cuenta de{' '}
                <span className="font-semibold">{usuarioAEliminar?.nombre} {usuarioAEliminar?.apellido}</span>?
              </p>
              <p className="text-xs text-[#6B6B6B] mt-1">
                El usuario no podrá iniciar sesión. Esta acción puede revertirse desde la base de datos.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setUsuarioAEliminar(null)}
              disabled={eliminando}
              className="h-9 px-4 text-sm text-[#444] border border-[#E0E0E0] rounded-lg hover:bg-[#F2F2F2] cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmarEliminar}
              disabled={eliminando}
              className="h-9 px-4 text-sm font-semibold bg-[#DC2626] text-white rounded-lg hover:bg-[#B91C1C] cursor-pointer disabled:opacity-50 transition-colors"
            >
              {eliminando ? 'Desactivando...' : 'Desactivar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
