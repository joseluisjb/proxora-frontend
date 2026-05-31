import { useState, useEffect, useRef, useCallback } from 'react';
import type { UsuarioResponse } from '../types/api.types';
import { usuariosService } from '../services/usuarios.service';
// MOCK DATA - reemplazado por llamada real a usuariosService
// import { USUARIOS_MOCK } from '../mocks/usuarios';
import PageHeader from '../components/ui/PageHeader';
import AvatarIniciales from '../components/ui/AvatarIniciales';
import BadgeEstado from '../components/ui/BadgeEstado';
import FiltroRoles from '../components/ui/FiltroRoles';
import BarraBusqueda from '../components/ui/BarraBusqueda';
import BotonAccionUsuario from '../components/ui/BotonAccionUsuario';
import FilaTablaAcciones from '../components/ui/FilaTablaAcciones';
import Paginacion from '../components/ui/Paginacion';
import '../styles/admin-ui.css';
import './AdminUsuarios.css';

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

  const cargarUsuarios = useCallback(async (
    rol: FiltroRol,
    texto: string,
    pagActual: number,
  ) => {
    setCargando(true);
    setError(null);
    try {
      const params = { page: pagActual - 1, size: REGISTROS_POR_PAGINA };
      let resultado;

      if (texto.trim()) {
        resultado = await usuariosService.buscar(texto.trim(), params);
      } else if (rol !== 'todos') {
        resultado = await usuariosService.listarPorRol(rol, params);
      } else {
        resultado = await usuariosService.listar(params);
      }

      setUsuarios(resultado.content);
      setTotalPaginas(resultado.totalPages || 1);
      setTotalElementos(resultado.totalElements);
    } catch {
      setError('Error al cargar los datos. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  }, []);

  // Debounce de 400 ms sobre el texto de búsqueda
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setBusquedaDebounced(busqueda);
      setPagina(1);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [busqueda]);

  useEffect(() => {
    cargarUsuarios(filtroRol, busquedaDebounced, pagina);
  }, [filtroRol, busquedaDebounced, pagina, cargarUsuarios]);

  const handleCambioFiltroRol = (rol: FiltroRol) => {
    setFiltroRol(rol);
    setPagina(1);
  };

  const handleHacerDocente = async (id: string) => {
    try {
      await usuariosService.convertirDocente(id);
      await cargarUsuarios(filtroRol, busquedaDebounced, pagina);
    } catch {
      setError('No se pudo cambiar el rol del usuario. Intenta de nuevo.');
    }
  };

  const handleRevocarDocente = async (id: string) => {
    try {
      await usuariosService.convertirEstudiante(id);
      await cargarUsuarios(filtroRol, busquedaDebounced, pagina);
    } catch {
      setError('No se pudo revocar el rol de docente. Intenta de nuevo.');
    }
  };

  const handleEliminar = async (usuario: UsuarioResponse) => {
    if (!window.confirm(
      `¿Desactivar al usuario ${usuario.nombre} ${usuario.apellido}? Su cuenta quedará inhabilitada.`
    )) return;
    try {
      // TODO: reemplazar por DELETE cuando el backend lo implemente
      await usuariosService.desactivar(usuario.id);
      await cargarUsuarios(filtroRol, busquedaDebounced, pagina);
    } catch {
      setError('No se pudo desactivar el usuario. Intenta de nuevo.');
    }
  };

  return (
    <div className="adm-usr">
      <PageHeader
        titulo="Gestión de Usuarios"
        subtitulo="Controla el acceso institucional, gestiona roles académicos y monitorea el estado de las cuentas del programa de Ingeniería de Sistemas."
      />

      <div className="adm-usr__controles">
        <FiltroRoles rolActivo={filtroRol} onChange={handleCambioFiltroRol} />
        <div className="adm-usr__busqueda-wrap">
          <BarraBusqueda
            placeholder="Buscar por nombre o correo..."
            valor={busqueda}
            onChange={setBusqueda}
          />
          <button className="adm-usr__opciones-btn" title="Más opciones" aria-label="Más opciones">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="card">
        {error && (
          <div
            style={{
              background: '#FEF2F2',
              borderLeft: '3px solid #EF4444',
              padding: '12px 16px',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
            role="alert"
          >
            <span style={{ flex: 1 }}>{error}</span>
            <button
              onClick={() => cargarUsuarios(filtroRol, busquedaDebounced, pagina)}
              style={{ fontWeight: 600, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Reintentar
            </button>
          </div>
        )}

        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Identidad del Usuario</th>
                <th style={{ width: '20%' }}>Rol Académico</th>
                <th style={{ width: '20%' }}>Estado de Cuenta</th>
                <th style={{ width: '20%', textAlign: 'right' }}>Acciones Administrativas</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={4}>
                    <div className="tabla-vacia">
                      <p style={{ color: 'var(--gris-400)' }}>Cargando...</p>
                    </div>
                  </td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="tabla-vacia">
                      <div className="tabla-vacia__icono">
                        <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z" />
                        </svg>
                      </div>
                      <p>No hay usuarios registrados</p>
                    </div>
                  </td>
                </tr>
              ) : (
                usuarios.map((usr) => (
                  <tr key={usr.id}>
                    <td>
                      <div className="adm-usr__identidad">
                        <AvatarIniciales
                          nombre={usr.nombre}
                          apellido={usr.apellido}
                          tamaño="md"
                        />
                        <div>
                          <p className="adm-usr__nombre">{usr.nombre} {usr.apellido}</p>
                          <p className="adm-usr__correo">{usr.correo}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <BadgeEstado variante={rolAVariante(usr.nombreRol)} />
                    </td>
                    <td>
                      <span className={`estado estado-${usr.activo ? 'activo' : 'suspendido'}`}>
                        {usr.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="adm-usr__acciones">
                        {usr.nombreRol === 'estudiante' && (
                          <BotonAccionUsuario
                            variante="hacer-docente"
                            onClick={() => handleHacerDocente(usr.id)}
                          />
                        )}
                        {usr.nombreRol === 'docente' && (
                          <BotonAccionUsuario
                            variante="revocar-docente"
                            onClick={() => handleRevocarDocente(usr.id)}
                          />
                        )}
                        {usr.nombreRol !== 'administrador' && (
                          <FilaTablaAcciones
                            mostrarEditar={false}
                            onEliminar={() => handleEliminar(usr)}
                          />
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

