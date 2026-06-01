import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LineaInvestigacionResponse } from '../types/api.types';
import { lineasService } from '../services/lineas.service';
import PageHeader from '../components/ui/PageHeader';
import FilaTablaAcciones from '../components/ui/FilaTablaAcciones';
import Paginacion from '../components/ui/Paginacion';
import BotonPrimario from '../components/ui/BotonPrimario';

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
  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
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
      const resultado = await lineasService.listar({ page: pagActual - 1, size: REGISTROS_POR_PAGINA, sort: 'creadoEn,desc' });
      setLineas(resultado.content);
      setTotalPaginas(resultado.totalPages || 1);
      setTotalElementos(resultado.totalElements);
    } catch { setError('Error al cargar los datos. Intenta de nuevo.'); }
    finally { setCargando(false); }
  }, []);

  useEffect(() => { cargarLineas(pagina); }, [pagina, cargarLineas]);

  const handleEliminar = async (linea: LineaInvestigacionResponse) => {
    if (!window.confirm(`¿Eliminar la línea ${linea.nombre}? Esta acción no se puede deshacer.`)) return;
    try { await lineasService.eliminar(linea.id); await cargarLineas(pagina); }
    catch { setError('No se pudo eliminar la línea de investigación. Intenta de nuevo.'); }
  };

  const thCls = "text-left text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6B6B6B] px-4 py-3 border-b border-[#EBEBEB]";
  const tdCls = "px-4 py-3.5 border-b border-[#F0F0F0] align-middle";

  return (
    <div>
      <PageHeader titulo="Líneas de Investigación" />

      <div className="bg-white rounded-lg shadow-sm border border-[#EBEBEB] animate-slide-up">
        {error && (
          <div className="bg-[#FEF2F2] border-l-[3px] border-[#EF4444] px-4 py-3 mb-4 flex items-center gap-3 animate-scale-in" role="alert">
            <span className="flex-1">{error}</span>
            <button onClick={() => cargarLineas(pagina)} className="font-semibold text-[#EF4444] bg-none border-none cursor-pointer">Reintentar</button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={thCls} style={{ width: '60%' }}>Nombre de la Línea</th>
                <th className={thCls} style={{ width: '25%' }}>Fecha de Creación</th>
                <th className={thCls} style={{ width: '15%' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan={3}><div className="text-center py-12 text-[#6B6B6B] text-sm">Cargando...</div></td></tr>
              ) : lineas.length === 0 ? (
                <tr><td colSpan={3}><div className="text-center py-12 text-[#6B6B6B] text-sm">No hay líneas de investigación registradas</div></td></tr>
              ) : (
                lineas.map((linea, index) => {
                  const letras = linea.nombre.substring(0, 2).toUpperCase();
                  const color = colorPorNombre(linea.nombre);
                  return (
                    <tr key={linea.id} className="hover:bg-[#F8F8F8] animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                      <td className={tdCls}>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0" style={{ backgroundColor: color.bg, color: color.text }}>
                            {letras}
                          </div>
                          <span className="text-sm text-[#111111]">{linea.nombre}</span>
                        </div>
                      </td>
                      <td className={`${tdCls} text-[13px] text-[#6B6B6B]`}>{formatearFecha(linea.creadoEn)}</td>
                      <td className={tdCls}>
                        <FilaTablaAcciones onEditar={() => navigate(`/admin/lineas-investigacion/${linea.id}/editar`)} onEliminar={() => handleEliminar(linea)} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center border-t border-[#F0F0F0] px-4 py-3.5 gap-4 animate-fade-in">
          <div className="flex-1">
            <Paginacion paginaActual={pagina} totalPaginas={Math.max(totalPaginas, 1)} totalRegistros={totalElementos} registrosPorPagina={REGISTROS_POR_PAGINA} labelEntidad="líneas" onCambiarPagina={setPagina} />
          </div>
          <BotonPrimario label="Nueva Línea de Investigación" onClick={() => navigate('/admin/lineas-investigacion/nueva')} />
        </div>
      </div>
    </div>
  );
}
