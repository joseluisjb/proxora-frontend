import { useState, useEffect, useCallback } from 'react';
import type { SemestreResponse } from '../types/api.types';
import { semestresService } from '../services/semestres.service';
import PageHeader from '../components/ui/PageHeader';
import BadgeEstado from '../components/ui/BadgeEstado';
import FilaTablaAcciones from '../components/ui/FilaTablaAcciones';
import Paginacion from '../components/ui/Paginacion';
import Modal from '../components/ui/Modal';
import { CampoTexto, CampoToggle } from '../components/ui/FormularioAdmin';

const REGISTROS_POR_PAGINA = 10;
const PATRON_SEMESTRE = /^\d{4}-[12]$/;

function formatearFecha(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
}

interface SemestreForm { nombre: string; activo: boolean; }
const FORM_VACIO: SemestreForm = { nombre: '', activo: true };

const btnCancelar = "h-9 px-4 text-sm text-[#444] border border-[#E0E0E0] rounded-lg hover:bg-[#F2F2F2] cursor-pointer disabled:opacity-50 transition-colors";
const btnGuardar  = "h-9 px-4 text-sm font-semibold bg-[#C0392B] text-white rounded-lg hover:bg-[#96281B] cursor-pointer disabled:opacity-50 transition-colors";
const btnEliminar = "h-9 px-4 text-sm font-semibold bg-[#DC2626] text-white rounded-lg hover:bg-[#B91C1C] cursor-pointer disabled:opacity-50 transition-colors";

export default function AdminSemestres() {
  const [pagina, setPagina] = useState(1);
  const [semestres, setSemestres] = useState<SemestreResponse[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalElementos, setTotalElementos] = useState(0);

  const [modalCrear, setModalCrear] = useState(false);
  const [semestreAEditar, setSemestreAEditar] = useState<SemestreResponse | null>(null);
  const [semestreAEliminar, setSemestreAEliminar] = useState<SemestreResponse | null>(null);

  const [form, setForm] = useState<SemestreForm>(FORM_VACIO);
  const [formErrores, setFormErrores] = useState<Partial<Record<keyof SemestreForm, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);

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

  const setCampo = <K extends keyof SemestreForm>(k: K, v: SemestreForm[K]) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (formErrores[k]) setFormErrores((p) => ({ ...p, [k]: undefined }));
  };

  const validar = (): boolean => {
    const errs: Partial<Record<keyof SemestreForm, string>> = {};
    if (!form.nombre.trim()) errs.nombre = 'El nombre es obligatorio';
    else if (!PATRON_SEMESTRE.test(form.nombre.trim())) errs.nombre = 'El formato debe ser YYYY-1 o YYYY-2. Ejemplo: 2026-1';
    setFormErrores(errs);
    return Object.keys(errs).length === 0;
  };

  const abrirCrear = () => {
    setForm(FORM_VACIO);
    setFormErrores({});
    setFormError(null);
    setModalCrear(true);
  };

  const abrirEditar = (semestre: SemestreResponse) => {
    setForm({ nombre: semestre.nombre, activo: semestre.activo });
    setFormErrores({});
    setFormError(null);
    setSemestreAEditar(semestre);
  };

  const cerrarModalForm = () => { setModalCrear(false); setSemestreAEditar(null); };

  const handleGuardar = async () => {
    if (!validar()) return;
    setGuardando(true);
    setFormError(null);
    try {
      if (semestreAEditar) {
        await semestresService.actualizar(semestreAEditar.id, { nombre: form.nombre.trim(), activo: form.activo });
      } else {
        await semestresService.crear({ nombre: form.nombre.trim(), activo: form.activo });
      }
      cerrarModalForm();
      await cargarSemestres(pagina);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
      if (axiosErr.response?.status === 400) {
        setFormErrores({ nombre: 'El servidor rechazó el formato. Usa YYYY-1 o YYYY-2.' });
      } else {
        setFormError(axiosErr.response?.data?.message ?? 'No se pudo guardar el semestre. Intenta de nuevo.');
      }
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminar = async () => {
    if (!semestreAEliminar) return;
    setEliminando(true);
    try {
      await semestresService.eliminar(semestreAEliminar.id);
      setSemestreAEliminar(null);
      await cargarSemestres(pagina);
    } catch {
      setError('No se pudo eliminar el semestre. Intenta de nuevo.');
      setSemestreAEliminar(null);
    } finally {
      setEliminando(false);
    }
  };

  const thCls = "text-left text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6B6B6B] px-4 py-3 border-b border-[#EBEBEB]";
  const tdCls = "px-4 py-3.5 border-b border-[#F0F0F0] align-middle";

  const FormSemestre = (
    <div className="flex flex-col gap-4">
      {formError && <p className="text-xs text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] rounded-lg px-3 py-2">{formError}</p>}
      <CampoTexto
        label="Nombre del semestre"
        valor={form.nombre}
        onChange={(v) => setCampo('nombre', v)}
        requerido
        error={formErrores.nombre}
        placeholder="Ej: 2026-1"
      />
      <CampoToggle
        label="Estado"
        valor={form.activo}
        onChange={(v) => setCampo('activo', v)}
        textoActivo="Activo – periodo académico vigente"
        textoInactivo="Inactivo – periodo académico cerrado o histórico"
      />
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={cerrarModalForm} disabled={guardando} className={btnCancelar}>Cancelar</button>
        <button type="button" onClick={handleGuardar} disabled={guardando} className={btnGuardar}>{guardando ? 'Guardando...' : 'Guardar'}</button>
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader
        titulo="Gestión de Semestres"
        subtitulo="Administra los Semestres académicos."
        breadcrumb={[{ label: 'Panel' }, { label: 'Semestres' }]}
        accionLabel="Nuevo Semestre"
        onAccion={abrirCrear}
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
                      <FilaTablaAcciones onEditar={() => abrirEditar(sem)} onEliminar={() => setSemestreAEliminar(sem)} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Paginacion paginaActual={pagina} totalPaginas={Math.max(totalPaginas, 1)} totalRegistros={totalElementos} registrosPorPagina={REGISTROS_POR_PAGINA} labelEntidad="semestres" onCambiarPagina={setPagina} />
      </div>

      <Modal open={modalCrear} onClose={cerrarModalForm} title="Nuevo Semestre">
        {FormSemestre}
      </Modal>

      <Modal open={semestreAEditar !== null} onClose={cerrarModalForm} title="Editar Semestre">
        {FormSemestre}
      </Modal>

      <Modal open={semestreAEliminar !== null} onClose={() => setSemestreAEliminar(null)} title="Eliminar semestre" size="sm">
        <div className="flex flex-col gap-5">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-9 h-9 rounded-full bg-[#FEE2E2] flex items-center justify-center">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#DC2626" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[13px] text-[#111111] leading-relaxed">
                ¿Eliminar el semestre <span className="font-semibold">"{semestreAEliminar?.nombre}"</span>?
              </p>
              <p className="text-xs text-[#6B6B6B] mt-1">Esta acción no se puede deshacer.</p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setSemestreAEliminar(null)} disabled={eliminando} className={btnCancelar}>Cancelar</button>
            <button type="button" onClick={confirmarEliminar} disabled={eliminando} className={btnEliminar}>{eliminando ? 'Eliminando...' : 'Eliminar'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
