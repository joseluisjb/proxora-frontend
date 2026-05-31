import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SemestreResponse } from '../types/api.types';
import { semestresService } from '../services/semestres.service';
// MOCK DATA - reemplazado por llamada real a semestresService
// import { SEMESTRES_MOCK } from '../mocks/semestres';
import PageHeader from '../components/ui/PageHeader';
import BadgeEstado from '../components/ui/BadgeEstado';
import FilaTablaAcciones from '../components/ui/FilaTablaAcciones';
import Paginacion from '../components/ui/Paginacion';
import './AdminSemestres.css';

const REGISTROS_POR_PAGINA = 10;

function formatearFecha(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(iso));
}

export default function AdminSemestres() {
  const navigate = useNavigate();
  const [pagina, setPagina] = useState(1);

  const [semestres, setSemestres] = useState<SemestreResponse[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalElementos, setTotalElementos] = useState(0);

  const cargarSemestres = useCallback(async (pagActual: number) => {
    setCargando(true);
    setError(null);
    try {
      const resultado = await semestresService.listar({
        page: pagActual - 1,
        size: REGISTROS_POR_PAGINA,
        sort: 'creadoEn,desc',
      });
      setSemestres(resultado.content);
      setTotalPaginas(resultado.totalPages || 1);
      setTotalElementos(resultado.totalElements);
    } catch {
      setError('Error al cargar los datos. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarSemestres(pagina);
  }, [pagina, cargarSemestres]);

  const handleNuevo = () => navigate('/admin/semestres/nuevo');

  const handleEditar = (id: string) => navigate(`/admin/semestres/${id}/editar`);

  const handleEliminar = async (semestre: SemestreResponse) => {
    if (!window.confirm(
      `¿Eliminar el semestre ${semestre.nombre}? Esta acción no se puede deshacer.`
    )) return;
    try {
      await semestresService.eliminar(semestre.id);
      await cargarSemestres(pagina);
    } catch {
      setError('No se pudo eliminar el semestre. Intenta de nuevo.');
    }
  };

  return (
    <div className="adm-sem">
      <PageHeader
        titulo="Gestión de Semestres"
        subtitulo="Administra los Semestres académicos."
        breadcrumb={[{ label: 'Panel' }, { label: 'Semestres' }]}
        accionLabel="Nuevo Semestre"
        onAccion={handleNuevo}
      />

      <div className="card">
        <div className="adm-sem__card-header">
          <div className="adm-sem__card-titulo">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="var(--rojo)" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 6h18M3 14h18M3 18h18" />
            </svg>
            <span>Listado de Semestres</span>
          </div>
        </div>

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
              onClick={() => cargarSemestres(pagina)}
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
                <th style={{ width: '40%' }}>Nombre del semestre</th>
                <th style={{ width: '20%' }}>Estado</th>
                <th style={{ width: '30%' }}>Fecha de creación</th>
                <th style={{ width: '10%' }}>Acciones</th>
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
              ) : semestres.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="tabla-vacia">
                      <div className="tabla-vacia__icono">
                        <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p>No hay semestres registrados</p>
                    </div>
                  </td>
                </tr>
              ) : (
                semestres.map((sem) => (
                  <tr key={sem.id}>
                    <td>
                      <div className="adm-sem__nombre-celda">
                        <svg
                          width="16" height="16" fill="none" viewBox="0 0 24 24"
                          stroke={sem.activo ? 'var(--rojo)' : 'var(--gris-300)'}
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="adm-sem__nombre">{sem.nombre}</span>
                      </div>
                    </td>
                    <td>
                      <BadgeEstado variante={sem.activo ? 'activo' : 'inactivo'} />
                    </td>
                    <td className="adm-sem__fecha">{formatearFecha(sem.creadoEn)}</td>
                    <td>
                      <FilaTablaAcciones
                        onEditar={() => handleEditar(sem.id)}
                        onEliminar={() => handleEliminar(sem)}
                      />
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
          labelEntidad="semestres"
          onCambiarPagina={setPagina}
        />
      </div>
    </div>
  );
}
