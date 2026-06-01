import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SemestreResponse } from '../types/api.types';
import { semestresService } from '../services/semestres.service';
import PageHeader from '../components/ui/PageHeader';
import BadgeEstado from '../components/ui/BadgeEstado';
import FilaTablaAcciones from '../components/ui/FilaTablaAcciones';
import Paginacion from '../components/ui/Paginacion';

const REGISTROS_POR_PAGINA = 10;

function formatearFecha(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
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
      const resultado = await semestresService.listar({ page: pagActual - 1, size: REGISTROS_POR_PAGINA, sort: 'creadoEn,desc' });
      setSemestres(resultado.content);
      setTotalPaginas(resultado.totalPages || 1);
      setTotalElementos(resultado.totalElements);
    } catch { setError('Error al cargar los datos. Intenta de nuevo.'); }
    finally { setCargando(false); }
  }, []);

  useEffect(() => { cargarSemestres(pagina); }, [pagina, cargarSemestres]);

  const handleEliminar = async (semestre: SemestreResponse) => {
    if (!window.confirm(`¿Eliminar el semestre ${semestre.nombre}? Esta acción no se puede deshacer.`)) return;
    try { await semestresService.eliminar(semestre.id); await cargarSemestres(pagina); }
    catch { setError('No se pudo eliminar el semestre. Intenta de nuevo.'); }
  };

  const thCls = "text-left text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6B6B6B] px-4 py-3 border-b border-[#EBEBEB]";
  const tdCls = "px-4 py-3.5 border-b border-[#F0F0F0] align-middle";

  return (
    <div>
      <PageHeader
        titulo="Gestión de Semestres"
        subtitulo="Administra los Semestres académicos."
        breadcrumb={[{ label: 'Panel' }, { label: 'Semestres' }]}
        accionLabel="Nuevo Semestre"
        onAccion={() => navigate('/admin/semestres/nuevo')}
      />

      <div className="bg-white rounded-lg shadow-sm border border-[#EBEBEB] animate-slide-up">
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#F0F0F0] animate-fade-in">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#111111]">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#C0392B" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 6h18M3 14h18M3 18h18" />
            </svg>
            <span>Listado de Semestres</span>
          </div>
        </div>

        {error && (
          <div className="bg-[#FEF2F2] border-l-[3px] border-[#EF4444] px-4 py-3 mb-4 flex items-center gap-3 animate-scale-in" role="alert">
            <span className="flex-1">{error}</span>
            <button onClick={() => cargarSemestres(pagina)} className="font-semibold text-[#EF4444] bg-none border-none cursor-pointer">Reintentar</button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={thCls} style={{ width: '40%' }}>Nombre del semestre</th>
                <th className={thCls} style={{ width: '20%' }}>Estado</th>
                <th className={thCls} style={{ width: '30%' }}>Fecha de creación</th>
                <th className={thCls} style={{ width: '10%' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan={4}><div className="text-center py-12 text-[#6B6B6B] text-sm">Cargando...</div></td></tr>
              ) : semestres.length === 0 ? (
                <tr><td colSpan={4}><div className="text-center py-12 text-[#6B6B6B] text-sm">No hay semestres registrados</div></td></tr>
              ) : (
                semestres.map((sem, index) => (
                  <tr key={sem.id} className="hover:bg-[#F8F8F8] animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                    <td className={tdCls}>
                      <div className="flex items-center gap-2">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={sem.activo ? '#C0392B' : '#BBBBBB'} strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-semibold text-[#111111] text-sm">{sem.nombre}</span>
                      </div>
                    </td>
                    <td className={tdCls}>
                      <BadgeEstado variante={sem.activo ? 'activo' : 'inactivo'} />
                    </td>
                    <td className={`${tdCls} text-[#6B6B6B] text-[13px]`}>{formatearFecha(sem.creadoEn)}</td>
                    <td className={tdCls}>
                      <FilaTablaAcciones onEditar={() => navigate(`/admin/semestres/${sem.id}/editar`)} onEliminar={() => handleEliminar(sem)} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Paginacion paginaActual={pagina} totalPaginas={Math.max(totalPaginas, 1)} totalRegistros={totalElementos} registrosPorPagina={REGISTROS_POR_PAGINA} labelEntidad="semestres" onCambiarPagina={setPagina} />
      </div>
    </div>
  );
}
