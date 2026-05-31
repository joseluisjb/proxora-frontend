import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LineaInvestigacionResponse } from '../types/api.types';
import { lineasService } from '../services/lineas.service';
// MOCK DATA - reemplazado por llamada real a lineasService
// import { LINEAS_MOCK } from '../mocks/lineas';
import PageHeader from '../components/ui/PageHeader';
import FilaTablaAcciones from '../components/ui/FilaTablaAcciones';
import Paginacion from '../components/ui/Paginacion';
import BotonPrimario from '../components/ui/BotonPrimario';
import '../styles/admin-ui.css';
import './AdminLineasInvestigacion.css';

const REGISTROS_POR_PAGINA = 10;

const COLORES_PASTEL = [
  { bg: '#DBEAFE', text: '#1E40AF' },
  { bg: '#D1FAE5', text: '#065F46' },
  { bg: '#FEF3C7', text: '#92400E' },
  { bg: '#EDE9FE', text: '#4C1D95' },
  { bg: '#FCE7F3', text: '#9D174D' },
];

function colorPorNombre(nombre: string) {
  let hash = 0;
  for (let i = 0; i < nombre.length; i++) hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
  return COLORES_PASTEL[Math.abs(hash) % COLORES_PASTEL.length];
}

function formatearFecha(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(iso));
}

export default function AdminLineasInvestigacion() {
  const navigate = useNavigate();
  const [pagina, setPagina] = useState(1);

  const [lineas, setLineas] = useState<LineaInvestigacionResponse[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalElementos, setTotalElementos] = useState(0);

  const cargarLineas = useCallback(async (pagActual: number) => {
    setCargando(true);
    setError(null);
    try {
      const resultado = await lineasService.listar({
        page: pagActual - 1,
        size: REGISTROS_POR_PAGINA,
        sort: 'creadoEn,desc',
      });
      setLineas(resultado.content);
      setTotalPaginas(resultado.totalPages || 1);
      setTotalElementos(resultado.totalElements);
    } catch {
      setError('Error al cargar los datos. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarLineas(pagina);
  }, [pagina, cargarLineas]);

  const handleNueva = () => navigate('/admin/lineas-investigacion/nueva');

  const handleEditar = (id: string) => navigate(`/admin/lineas-investigacion/${id}/editar`);

  const handleEliminar = async (linea: LineaInvestigacionResponse) => {
    if (!window.confirm(
      `¿Eliminar la línea ${linea.nombre}? Esta acción no se puede deshacer.`
    )) return;
    try {
      await lineasService.eliminar(linea.id);
      await cargarLineas(pagina);
    } catch {
      setError('No se pudo eliminar la línea de investigación. Intenta de nuevo.');
    }
  };

  return (
    <div className="adm-lin">
      <PageHeader titulo="Líneas de Investigación" />

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
              onClick={() => cargarLineas(pagina)}
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
                <th style={{ width: '60%' }}>Nombre de la Línea</th>
                <th style={{ width: '25%' }}>Fecha de Creación</th>
                <th style={{ width: '15%' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={3}>
                    <div className="tabla-vacia">
                      <p style={{ color: 'var(--gris-400)' }}>Cargando...</p>
                    </div>
                  </td>
                </tr>
              ) : lineas.length === 0 ? (
                <tr>
                  <td colSpan={3}>
                    <div className="tabla-vacia">
                      <div className="tabla-vacia__icono">
                        <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                      </div>
                      <p>No hay líneas de investigación registradas</p>
                    </div>
                  </td>
                </tr>
              ) : (
                lineas.map((linea) => {
                  const letras = linea.nombre.substring(0, 2).toUpperCase();
                  const color = colorPorNombre(linea.nombre);
                  return (
                    <tr key={linea.id}>
                      <td>
                        <div className="adm-lin__celda">
                          <div
                            className="adm-lin__avatar"
                            style={{ backgroundColor: color.bg, color: color.text }}
                          >
                            {letras}
                          </div>
                          <span className="adm-lin__nombre">{linea.nombre}</span>
                        </div>
                      </td>
                      <td className="adm-lin__fecha">{formatearFecha(linea.creadoEn)}</td>
                      <td>
                        <FilaTablaAcciones
                          onEditar={() => handleEditar(linea.id)}
                          onEliminar={() => handleEliminar(linea)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="adm-lin__pie">
          <Paginacion
            paginaActual={pagina}
            totalPaginas={Math.max(totalPaginas, 1)}
            totalRegistros={totalElementos}
            registrosPorPagina={REGISTROS_POR_PAGINA}
            labelEntidad="líneas"
            onCambiarPagina={setPagina}
          />
          <BotonPrimario label="Nueva Línea de Investigación" onClick={handleNueva} />
        </div>
      </div>
    </div>
  );
}
