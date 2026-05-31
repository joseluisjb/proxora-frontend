import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MateriaResponse } from '../types/api.types';
import { materiasService } from '../services/materias.service';
// MOCK DATA - reemplazado por llamada real a materiasService
// import { MATERIAS_MOCK } from '../mocks/materias';
import PageHeader from '../components/ui/PageHeader';
import FilaTablaAcciones from '../components/ui/FilaTablaAcciones';
import Paginacion from '../components/ui/Paginacion';
import '../styles/admin-ui.css';
import './AdminMaterias.css';

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

export default function AdminMaterias() {
  const navigate = useNavigate();
  const [pagina, setPagina] = useState(1);

  const [materias, setMaterias] = useState<MateriaResponse[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalElementos, setTotalElementos] = useState(0);

  const cargarMaterias = useCallback(async (pagActual: number) => {
    setCargando(true);
    setError(null);
    try {
      const resultado = await materiasService.listar({
        page: pagActual - 1,
        size: REGISTROS_POR_PAGINA,
        sort: 'creadoEn,desc',
      });
      setMaterias(resultado.content);
      setTotalPaginas(resultado.totalPages || 1);
      setTotalElementos(resultado.totalElements);
    } catch {
      setError('Error al cargar los datos. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarMaterias(pagina);
  }, [pagina, cargarMaterias]);

  const handleNueva = () => navigate('/admin/materias/nueva');

  const handleEditar = (id: string) => navigate(`/admin/materias/${id}/editar`);

  const handleEliminar = async (materia: MateriaResponse) => {
    if (!window.confirm(
      `¿Eliminar la materia ${materia.nombre}? Esta acción no se puede deshacer.`
    )) return;
    try {
      await materiasService.eliminar(materia.id);
      await cargarMaterias(pagina);
    } catch {
      setError('No se pudo eliminar la materia. Intenta de nuevo.');
    }
  };

  return (
    <div className="adm-mat">
      <PageHeader
        titulo="Gestión de Materias"
        subtitulo="Administra el catálogo de asignaturas del programa académico."
        accionLabel="Nueva Materia"
        onAccion={handleNueva}
      />

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
              onClick={() => cargarMaterias(pagina)}
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
                <th style={{ width: '60%' }}>Nombre de la Materia</th>
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
              ) : materias.length === 0 ? (
                <tr>
                  <td colSpan={3}>
                    <div className="tabla-vacia">
                      <div className="tabla-vacia__icono">
                        <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p>No hay materias registradas</p>
                    </div>
                  </td>
                </tr>
              ) : (
                materias.map((mat) => {
                  const letras = mat.nombre.substring(0, 2).toUpperCase();
                  const color = colorPorNombre(mat.nombre);
                  return (
                    <tr key={mat.id}>
                      <td>
                        <div className="adm-mat__celda">
                          <div
                            className="adm-mat__avatar"
                            style={{ backgroundColor: color.bg, color: color.text }}
                          >
                            {letras}
                          </div>
                          <span className="adm-mat__nombre">{mat.nombre}</span>
                        </div>
                      </td>
                      <td className="adm-mat__fecha">{formatearFecha(mat.creadoEn)}</td>
                      <td>
                        <FilaTablaAcciones
                          onEditar={() => handleEditar(mat.id)}
                          onEliminar={() => handleEliminar(mat)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Paginacion
          paginaActual={pagina}
          totalPaginas={Math.max(totalPaginas, 1)}
          totalRegistros={totalElementos}
          registrosPorPagina={REGISTROS_POR_PAGINA}
          labelEntidad="materias"
          onCambiarPagina={setPagina}
        />
      </div>
    </div>
  );
}
