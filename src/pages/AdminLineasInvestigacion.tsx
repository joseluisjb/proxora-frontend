import { useState, useEffect, useCallback } from 'react';
import type { LineaInvestigacionResponse } from '../types/api.types';
import { lineasService } from '../services/lineas.service';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/ui/PageHeader';
import FilaTablaAcciones from '../components/ui/FilaTablaAcciones';
import Paginacion from '../components/ui/Paginacion';
import BotonPrimario from '../components/ui/BotonPrimario';
import Modal from '../components/ui/Modal';
import { CampoTexto, CampoTextarea, CampoToggle } from '../components/ui/FormularioAdmin';

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

interface LineaForm { nombre: string; descripcion: string; activa: boolean; }
const FORM_VACIO: LineaForm = { nombre: '', descripcion: '', activa: true };

const btnCancelar = "h-9 px-4 text-sm text-[#444] border border-[#E0E0E0] rounded-lg hover:bg-[#F2F2F2] cursor-pointer disabled:opacity-50 transition-colors";
const btnGuardar  = "h-9 px-4 text-sm font-semibold bg-[#C0392B] text-white rounded-lg hover:bg-[#96281B] cursor-pointer disabled:opacity-50 transition-colors";
const btnEliminar = "h-9 px-4 text-sm font-semibold bg-[#DC2626] text-white rounded-lg hover:bg-[#B91C1C] cursor-pointer disabled:opacity-50 transition-colors";

export default function AdminLineasInvestigacion() {
  const { usuario } = useAuth();
  const [pagina, setPagina] = useState(1);
  const [lineas, setLineas] = useState<LineaInvestigacionResponse[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalElementos, setTotalElementos] = useState(0);

  const [modalCrear, setModalCrear] = useState(false);
  const [lineaAEditar, setLineaAEditar] = useState<LineaInvestigacionResponse | null>(null);
  const [lineaAEliminar, setLineaAEliminar] = useState<LineaInvestigacionResponse | null>(null);

  const [form, setForm] = useState<LineaForm>(FORM_VACIO);
  const [formErrores, setFormErrores] = useState<Partial<Record<keyof LineaForm, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);

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

  const setCampo = <K extends keyof LineaForm>(k: K, v: LineaForm[K]) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (formErrores[k]) setFormErrores((p) => ({ ...p, [k]: undefined }));
  };

  const validar = (): boolean => {
    const errs: Partial<Record<keyof LineaForm, string>> = {};
    if (!form.nombre.trim()) errs.nombre = 'El nombre es obligatorio';
    setFormErrores(errs);
    return Object.keys(errs).length === 0;
  };

  const abrirCrear = () => {
    setForm(FORM_VACIO);
    setFormErrores({});
    setFormError(null);
    setModalCrear(true);
  };

  const abrirEditar = (linea: LineaInvestigacionResponse) => {
    setForm({ nombre: linea.nombre, descripcion: linea.descripcion ?? '', activa: linea.activa });
    setFormErrores({});
    setFormError(null);
    setLineaAEditar(linea);
  };

  const cerrarModalForm = () => { setModalCrear(false); setLineaAEditar(null); };

  const handleGuardar = async () => {
    if (!validar()) return;
    setGuardando(true);
    setFormError(null);
    try {
      if (lineaAEditar) {
        await lineasService.actualizar(lineaAEditar.id, {
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim() || undefined,
          activa: form.activa,
        });
      } else {
        await lineasService.crear({
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim() || undefined,
          activa: form.activa,
          creadoPor: usuario?.id,
        });
      }
      cerrarModalForm();
      await cargarLineas(pagina);
    } catch {
      setFormError('No se pudo guardar la línea de investigación. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminar = async () => {
    if (!lineaAEliminar) return;
    setEliminando(true);
    try {
      await lineasService.eliminar(lineaAEliminar.id);
      setLineaAEliminar(null);
      await cargarLineas(pagina);
    } catch {
      setError('No se pudo eliminar la línea de investigación. Intenta de nuevo.');
      setLineaAEliminar(null);
    } finally {
      setEliminando(false);
    }
  };

  const thCls = "text-left text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6B6B6B] px-4 py-3 border-b border-[#EBEBEB]";
  const tdCls = "px-4 py-3.5 border-b border-[#F0F0F0] align-middle";

  const FormLinea = (
    <div className="flex flex-col gap-4">
      {formError && <p className="text-xs text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] rounded-lg px-3 py-2">{formError}</p>}
      <CampoTexto label="Nombre" valor={form.nombre} onChange={(v) => setCampo('nombre', v)} requerido error={formErrores.nombre} placeholder="Ej: Inteligencia Artificial" />
      <CampoTextarea label="Descripción" valor={form.descripcion} onChange={(v) => setCampo('descripcion', v)} placeholder="Describe brevemente el enfoque y alcance..." filas={3} />
      <CampoToggle label="Estado" valor={form.activa} onChange={(v) => setCampo('activa', v)} textoActivo="Activa – visible y disponible para proyectos" textoInactivo="Inactiva – no aparecerá como opción al registrar proyectos" />
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={cerrarModalForm} disabled={guardando} className={btnCancelar}>Cancelar</button>
        <button type="button" onClick={handleGuardar} disabled={guardando} className={btnGuardar}>{guardando ? 'Guardando...' : 'Guardar'}</button>
      </div>
    </div>
  );

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
                        <FilaTablaAcciones onEditar={() => abrirEditar(linea)} onEliminar={() => setLineaAEliminar(linea)} />
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
          <BotonPrimario label="Nueva Línea de Investigación" onClick={abrirCrear} />
        </div>
      </div>

      <Modal open={modalCrear} onClose={cerrarModalForm} title="Nueva Línea de Investigación">
        {FormLinea}
      </Modal>

      <Modal open={lineaAEditar !== null} onClose={cerrarModalForm} title="Editar Línea de Investigación">
        {FormLinea}
      </Modal>

      <Modal open={lineaAEliminar !== null} onClose={() => setLineaAEliminar(null)} title="Eliminar línea de investigación" size="sm">
        <div className="flex flex-col gap-5">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-9 h-9 rounded-full bg-[#FEE2E2] flex items-center justify-center">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#DC2626" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[13px] text-[#111111] leading-relaxed">
                ¿Eliminar la línea <span className="font-semibold">"{lineaAEliminar?.nombre}"</span>?
              </p>
              <p className="text-xs text-[#6B6B6B] mt-1">Esta acción no se puede deshacer.</p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setLineaAEliminar(null)} disabled={eliminando} className={btnCancelar}>Cancelar</button>
            <button type="button" onClick={confirmarEliminar} disabled={eliminando} className={btnEliminar}>{eliminando ? 'Eliminando...' : 'Eliminar'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
