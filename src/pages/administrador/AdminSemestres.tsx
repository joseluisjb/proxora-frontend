import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SemestreResponse } from '../../types/api.types';
import { semestresService } from '../../services/semestres.service';
import PageHeader from '../../components/ui/PageHeader';
import BadgeEstado from '../../components/ui/BadgeEstado';
import FilaTablaAcciones from '../../components/ui/FilaTablaAcciones';
import Paginacion from '../../components/ui/Paginacion';
import ModalConfirmacion from '../../components/ui/ModalConfirmacion';
import { useModalConfirmacion } from '../../hooks/useModalConfirmacion';
import { useAlertaContext } from '../../context/AlertaContext';

const REGISTROS_POR_PAGINA = 10;

function formatearFecha(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
}

export default function AdminSemestres() {
  const navigate = useNavigate();
  const { mostrarAlerta } = useAlertaContext();
  const [pagina, setPagina] = useState(1);
  const [semestres, setSemestres] = useState<SemestreResponse[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalElementos, setTotalElementos] = useState(0);
  const { modalProps, abrirModal } = useModalConfirmacion();

  const cargarSemestres = useCallback(async (pagActual: number) => {
    setCargando(true);
    setError(null);
    try {
      const resultado = await semestresService.listar({ page: pagActual - 1, size: REGISTROS_POR_PAGINA, sort: 'creadoEn,desc' });
      setSemestres(resultado.content);
      setTotalPaginas(resultado.totalPages || 1);
      setTotalElementos(resultado.totalElements);
    } catch {
      setError('Error al cargar los datos.');
      mostrarAlerta({ mensaje: 'Error al cargar los semestres. Intenta de nuevo.', variante: 'error' });
    }
    finally { setCargando(false); }
  }, [mostrarAlerta]);

  useEffect(() => { cargarSemestres(pagina); }, [pagina, cargarSemestres]);

  const handleEliminar = (semestre: SemestreResponse) => {
    abrirModal({
      titulo: 'Eliminar semestre',
      mensaje: `¿Eliminar el semestre "${semestre.nombre}"? Esta acción no se puede deshacer.`,
      labelConfirmar: 'Eliminar',
      variante: 'peligro',
      onConfirmar: async () => {
        try {
          await semestresService.eliminar(semestre.id);
          mostrarAlerta({ mensaje: `Semestre "${semestre.nombre}" eliminado correctamente.`, variante: 'exito' });
          await cargarSemestres(pagina);
        } catch {
          mostrarAlerta({ mensaje: 'No se pudo eliminar el semestre. Intenta de nuevo.', variante: 'error' });
        }
      },
    });
  };

  const thCls = "text-left text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6B6B6B] px-4 py-3 border-b border-[#EBEBEB]";
  const tdCls = "px-4 py-3.5 border-b border-[#F0F0F0] align-middle";

  return (
    <div>
      <ModalConfirmacion {...modalProps} />
      <PageHeader
        titulo="Gestión de Semestres"
        subtitulo="Administra los Semestres académicos."
        breadcrumb={[{ label: 'Panel' }, { label: 'Semestres' }]}
        accionLabel="Nuevo Semestre"
        onAccion={() => navigate('/admin/semestres/nuevo')}
      />

      <div className="bg-white rounded-lg shadow-sm border border-[#EBEBEB] animate-fade-in">
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#F0F0F0]">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#111111]">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#C0392B" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 6h18M3 14h18M3 18h18" />
            </svg>
            <span>Listado de Semestres</span>
          </div>
        </div>

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
              ) : error ? (
                <tr><td colSpan={4}><div className="text-center py-12 text-[#6B6B6B] text-sm">No se pudo cargar los datos.{' '}<button onClick={() => cargarSemestres(pagina)} className="text-[#EF4444] font-semibold cursor-pointer bg-transparent border-none">Reintentar</button></div></td></tr>
              ) : semestres.length === 0 ? (
                <tr><td colSpan={4}><div className="text-center py-12 text-[#6B6B6B] text-sm">No hay semestres registrados</div></td></tr>
              ) : (
                semestres.map((sem) => (
                  <tr key={sem.id} className="hover:bg-[#F8F8F8]">
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
