import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { UsuarioResponse, SemestreResponse, MateriaResponse, LineaInvestigacionResponse } from '../../types/api.types';
import { registrarService } from '../../services/estudiante/registrar.service';
import { misProyectosService } from '../../services/estudiante/misProyectos.service';
import { useAuth } from '../../context/AuthContext';
import AvatarIniciales from '../../components/ui/AvatarIniciales';
import ModalConfirmacion from '../../components/ui/ModalConfirmacion';
import { useModalConfirmacion } from '../../hooks/useModalConfirmacion';
import { useAlertaContext } from '../../context/AlertaContext';

const NIVELES_VISIBILIDAD = [
  { id: 1, nombre: 'Solo metadatos' },
  { id: 2, nombre: 'Solo lectura' },
  { id: 3, nombre: 'Lectura y descarga' },
] as const;

const DESCRIPCIONES_VISIBILIDAD: Record<number, string> = {
  1: 'El público solo verá el título, resumen y equipo. Los documentos no estarán accesibles.',
  2: 'El público puede leer los resúmenes y ver los documentos en pantalla sin posibilidad de descarga.',
  3: 'Los documentos son públicos y pueden descargarse libremente.',
};

const VISIBILIDAD_A_ID: Record<string, number> = {
  solo_metadatos: 1,
  lectura: 2,
  lectura_descarga: 3,
};

const ESTADOS_PROYECTO = [
  { id: 1, nombre: 'En Desarrollo' },
  { id: 2, nombre: 'Bajo Revisión' },
  { id: 3, nombre: 'Retrasado' },
  { id: 4, nombre: 'Finalizado' },
];

const ESTADO_A_ID: Record<string, number> = {
  en_desarrollo: 1,
  bajo_revision: 2,
  retrasado: 3,
  finalizado: 4,
};

export default function EditarProyecto() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [cargandoProyecto, setCargandoProyecto] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  const [titulo, setTitulo] = useState('');
  const [resumen, setResumen] = useState('');
  const [idSemestre, setIdSemestre] = useState('');
  const [idMateria, setIdMateria] = useState('');
  const [idEstado, setIdEstado] = useState(1);
  const [lineasIds, setLineasIds] = useState<string[]>([]);
  const [idVisibilidad, setIdVisibilidad] = useState(2);

  const [integrantesSeleccionados, setIntegrantesSeleccionados] = useState<UsuarioResponse[]>([]);
  const [directoresSeleccionados, setDirectoresSeleccionados] = useState<UsuarioResponse[]>([]);
  const [evaluadoresSeleccionados, setEvaluadoresSeleccionados] = useState<UsuarioResponse[]>([]);

  const [busquedaIntegrantes, setBusquedaIntegrantes] = useState('');
  const [mostrandoDropdownIntegrantes, setMostrandoDropdownIntegrantes] = useState(false);

  const [todoDocentes, setTodoDocentes] = useState<UsuarioResponse[]>([]);
  const [todosEstudiantes, setTodosEstudiantes] = useState<UsuarioResponse[]>([]);
  const [busquedaDirector, setBusquedaDirector] = useState('');
  const [busquedaEvaluador, setBusquedaEvaluador] = useState('');
  const [mostrandoDropdownDocentes, setMostrandoDropdownDocentes] = useState(false);
  const [mostrandoDropdownEvaluadores, setMostrandoDropdownEvaluadores] = useState(false);

  const [todasLineas, setTodasLineas] = useState<LineaInvestigacionResponse[]>([]);
  const [busquedaLinea, setBusquedaLinea] = useState('');
  const [mostrandoDropdownLineas, setMostrandoDropdownLineas] = useState(false);

  const [semestresActivos, setSemestresActivos] = useState<SemestreResponse[]>([]);
  const [materiasActivas, setMateriasActivas] = useState<MateriaResponse[]>([]);

  const [guardando, setGuardando] = useState(false);
  const { modalProps, abrirModal } = useModalConfirmacion();
  const { mostrarAlerta } = useAlertaContext();
  const [errores, setErrores] = useState<Record<string, string>>({});

  const refDropdownIntegrantes = useRef<HTMLDivElement>(null);
  const refDropdownDirector = useRef<HTMLDivElement>(null);
  const refDropdownEvaluador = useRef<HTMLDivElement>(null);
  const refDropdownLineas = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      misProyectosService.obtenerDetalle(id),
      registrarService.listarSemestresActivos({ size: 100 }).catch(() => registrarService.listarSemestres({ size: 100 })),
      registrarService.listarMateriasActivas({ size: 100 }).catch(() => registrarService.listarMaterias({ size: 100 })),
      registrarService.listarLineasActivas({ size: 100 }).catch(() => registrarService.listarLineas({ size: 100 })),
      registrarService.listarDocentes({ size: 50 }).catch(() => ({ content: [] as UsuarioResponse[] })),
      registrarService.listarEstudiantes({ size: 200 }).catch(() => ({ content: [] as UsuarioResponse[] })),
    ])
      .then(([proyecto, semestres, materias, lineas, docentes, estudiantes]) => {
        setSemestresActivos(semestres.content);
        setMateriasActivas(materias.content);
        setTodasLineas(lineas.content);
        setTodoDocentes(docentes.content);
        setTodosEstudiantes(estudiantes.content);

        setTitulo(proyecto.titulo);
        setResumen(proyecto.resumen);
        setIdEstado(ESTADO_A_ID[proyecto.estado] ?? 1);
        setIdVisibilidad(VISIBILIDAD_A_ID[proyecto.visibilidad] ?? 2);
        setLineasIds(proyecto.lineas.map((l) => l.id));

        setIntegrantesSeleccionados(
          proyecto.integrantes.map((i) => ({
            id: i.id, nombre: i.nombre, apellido: i.apellido, correo: i.correo, activo: true, nombreRol: 'estudiante',
          }))
        );
        setDirectoresSeleccionados(
          proyecto.directores.map((d) => ({
            id: d.id, nombre: d.nombre, apellido: d.apellido, correo: d.correo, activo: true, nombreRol: 'docente',
          }))
        );
        setEvaluadoresSeleccionados(
          proyecto.evaluadores.map((e) => ({
            id: e.id, nombre: e.nombre, apellido: e.apellido, correo: e.correo, activo: true, nombreRol: 'docente',
          }))
        );

        if (proyecto.semestre) {
          const s = semestres.content.find((s) => s.nombre === proyecto.semestre);
          if (s) setIdSemestre(s.id);
        }
        if (proyecto.materia) {
          const m = materias.content.find((m) => m.nombre === proyecto.materia);
          if (m) setIdMateria(m.id);
        }
      })
      .catch(() => {
        setErrorCarga('No se pudo cargar el proyecto para editar.');
        mostrarAlerta({ mensaje: 'No se pudo cargar el proyecto para editar.', variante: 'error' });
      })
      .finally(() => setCargandoProyecto(false));
  }, [id]);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (refDropdownIntegrantes.current && !refDropdownIntegrantes.current.contains(e.target as Node)) setMostrandoDropdownIntegrantes(false);
      if (refDropdownDirector.current && !refDropdownDirector.current.contains(e.target as Node)) setMostrandoDropdownDocentes(false);
      if (refDropdownEvaluador.current && !refDropdownEvaluador.current.contains(e.target as Node)) setMostrandoDropdownEvaluadores(false);
      if (refDropdownLineas.current && !refDropdownLineas.current.contains(e.target as Node)) setMostrandoDropdownLineas(false);
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleAddIntegrante = (u: UsuarioResponse) => {
    if (integrantesSeleccionados.length >= 3) return;
    setIntegrantesSeleccionados((prev) => [...prev, u]);
    setBusquedaIntegrantes('');
    setMostrandoDropdownIntegrantes(false);
  };

  const handleRemoveIntegrante = (uid: string) => { if (usuario?.id && uid === usuario.id) return; setIntegrantesSeleccionados((prev) => prev.filter((i) => i.id !== uid)); };
  const handleAddDirector = (u: UsuarioResponse) => { if (directoresSeleccionados.some((d) => d.id === u.id)) return; setDirectoresSeleccionados((prev) => [...prev, u]); setBusquedaDirector(''); setMostrandoDropdownDocentes(false); };
  const handleRemoveDirector = (uid: string) => setDirectoresSeleccionados((prev) => prev.filter((d) => d.id !== uid));
  const handleAddEvaluador = (u: UsuarioResponse) => { if (evaluadoresSeleccionados.some((e) => e.id === u.id)) return; setEvaluadoresSeleccionados((prev) => [...prev, u]); setBusquedaEvaluador(''); setMostrandoDropdownEvaluadores(false); };
  const handleRemoveEvaluador = (uid: string) => setEvaluadoresSeleccionados((prev) => prev.filter((e) => e.id !== uid));
  const handleAddLinea = (lid: string) => { if (lineasIds.includes(lid)) return; setLineasIds((prev) => [...prev, lid]); setBusquedaLinea(''); setMostrandoDropdownLineas(false); };
  const handleRemoveLinea = (lid: string) => setLineasIds((prev) => prev.filter((l) => l !== lid));

  const validar = useCallback((): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!titulo.trim()) errs.titulo = 'El título del proyecto es obligatorio';
    else if (titulo.trim().length < 10) errs.titulo = 'El título debe tener al menos 10 caracteres';
    else if (titulo.trim().length > 300) errs.titulo = 'El título no puede superar 300 caracteres';
    if (!resumen.trim()) errs.resumen = 'El resumen es obligatorio';
    else if (resumen.trim().length < 50) errs.resumen = 'El resumen debe tener al menos 50 caracteres';
    return errs;
  }, [titulo, resumen]);

  const handleSubmit = async () => {
    if (!id) return;
    setGuardando(true);
    try {
      await misProyectosService.actualizar(id, {
        titulo: titulo.trim(),
        resumen: resumen.trim(),
        idSemestre: idSemestre || null,
        idMateria: idMateria || null,
        idEstado: idEstado,
        idVisibilidad: idVisibilidad,
        integrantesIds: integrantesSeleccionados.map((i) => i.id),
        directoresIds: directoresSeleccionados.map((d) => d.id),
        lineasIds: lineasIds,
        evaluadoresIds: evaluadoresSeleccionados.map((e) => e.id),
      });
      mostrarAlerta({ mensaje: '¡Proyecto actualizado exitosamente!', variante: 'exito' });
      navigate(`/estudiante/mis-proyectos/${id}`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } };
      if (axiosErr.response?.status === 400 || axiosErr.response?.status === 404) {
        mostrarAlerta({ mensaje: 'Error al actualizar el proyecto. Verifica los datos e intenta de nuevo.', variante: 'error' });
      } else {
        mostrarAlerta({ mensaje: 'No se pudo conectar con el servidor. Intenta de nuevo.', variante: 'error' });
      }
    } finally {
      setGuardando(false);
    }
  };

  const handleClickGuardar = () => {
    const errs = validar();
    if (Object.keys(errs).length > 0) {
      setErrores(errs);
      mostrarAlerta({ mensaje: 'Completa los campos obligatorios antes de guardar los cambios.', variante: 'advertencia' });
      return;
    }
    abrirModal({
      titulo: 'Confirmar cambios',
      mensaje: '¿Estás seguro de que deseas guardar los cambios en este proyecto? Verifica que todos los datos sean correctos antes de continuar.',
      labelConfirmar: 'Guardar cambios',
      variante: 'advertencia',
      onConfirmar: handleSubmit,
    });
  };

  const resultadosIntegrantes = todosEstudiantes.filter((u) => { if (!busquedaIntegrantes.trim()) return false; if (integrantesSeleccionados.some((i) => i.id === u.id)) return false; const t = busquedaIntegrantes.toLowerCase(); return `${u.nombre} ${u.apellido}`.toLowerCase().includes(t) || u.correo.toLowerCase().includes(t); });
  const resultadosDirectores = todoDocentes.filter((d) => { if (!busquedaDirector.trim()) return false; if (directoresSeleccionados.some((dir) => dir.id === d.id)) return false; const t = busquedaDirector.toLowerCase(); return `${d.nombre} ${d.apellido}`.toLowerCase().includes(t) || d.correo.toLowerCase().includes(t); });
  const resultadosEvaluadores = todoDocentes.filter((d) => { if (!busquedaEvaluador.trim()) return false; if (evaluadoresSeleccionados.some((ev) => ev.id === d.id)) return false; const t = busquedaEvaluador.toLowerCase(); return `${d.nombre} ${d.apellido}`.toLowerCase().includes(t) || d.correo.toLowerCase().includes(t); });
  const lineasFiltradas = todasLineas.filter((l) => { if (!busquedaLinea.trim()) return true; return l.nombre.toLowerCase().includes(busquedaLinea.toLowerCase()); }).filter((l) => !lineasIds.includes(l.id));
  const lineasSeleccionadas = todasLineas.filter((l) => lineasIds.includes(l.id));

  const inputCls = (err?: string) => `w-full px-3.5 py-2.5 border-[1.5px] rounded-lg font-sans text-[13px] text-[#111827] bg-white transition-colors outline-none placeholder:text-[#9CA3AF] focus:border-[#B91C1C] ${err ? 'border-[#EF4444]' : 'border-[#E5E7EB]'}`;
  const selectCls = `w-full px-3.5 py-2.5 border-[1.5px] border-[#E5E7EB] rounded-lg font-sans text-[13px] text-[#111827] bg-white appearance-none cursor-pointer focus:outline-none focus:border-[#B91C1C] transition-colors`;
  const labelCls = "block text-[11px] font-bold text-[#6B7280] uppercase tracking-[0.07em] mb-1.5";
  const cardCls = "bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-7";
  const cardHeaderCls = "flex items-center gap-2.5 mb-5";
  const cardTituloCls = "text-[17px] font-bold text-[#111827]";
  const campoMb = "mb-[18px] last:mb-0";
  const errorCls = "mt-1 text-xs text-[#EF4444]";
  const ayudaCls = "mt-1.5 text-xs text-[#9CA3AF]";
  const dropdownCls = "absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-[#E5E7EB] rounded-lg shadow-md z-[50] max-h-[220px] overflow-y-auto";
  const dropdownItemCls = "flex items-center gap-2.5 w-full px-3.5 py-2.5 border-none bg-transparent font-sans cursor-pointer text-left hover:bg-[#F9FAFB] transition-colors";
  const personaFilaCls = "flex items-center gap-2.5 py-2";
  const personaInfoCls = "flex flex-col gap-px flex-1 min-w-0";
  const btnEliminarCls = "flex items-center justify-center w-7 h-7 border border-[#E5E7EB] rounded-md bg-white text-[#9CA3AF] cursor-pointer shrink-0 hover:bg-[#FEF2F2] hover:border-[#FECACA] hover:text-[#EF4444] transition-all";

  const buscadorWrap = (ref: React.RefObject<HTMLDivElement>, children: React.ReactNode) => (
    <div className="relative mb-3" ref={ref}>{children}</div>
  );

  if (cargandoProyecto) {
    return (
      <div className="animate-fade-in">
        <div className="h-4 w-36 bg-[#F3F4F6] rounded mb-4 animate-pulse" />
        <div className="h-8 w-48 bg-[#F3F4F6] rounded mb-2 animate-pulse" />
        <div className="h-4 w-80 bg-[#F3F4F6] rounded mb-6 animate-pulse" />
        <div className="grid grid-cols-[65fr_35fr] gap-6 items-start max-md:grid-cols-1">
          <div className="flex flex-col gap-4">
            <div className="bg-[#F3F4F6] rounded-xl h-[320px] animate-pulse" />
            <div className="bg-[#F3F4F6] rounded-xl h-[380px] animate-pulse" />
          </div>
          <div className="flex flex-col gap-4">
            <div className="bg-[#F3F4F6] rounded-xl h-[200px] animate-pulse" />
            <div className="bg-[#F3F4F6] rounded-xl h-[180px] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (errorCarga) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-[14px] text-[#6B7280]">{errorCarga}</p>
        <button
          type="button"
          onClick={() => navigate('/estudiante/mis-proyectos')}
          className="px-4 py-2 text-[13px] font-semibold text-white bg-[#B91C1C] rounded-lg hover:bg-[#991B1B] transition-colors duration-150"
        >
          Volver a Mis Proyectos
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <ModalConfirmacion {...modalProps} />

      <div className="mb-6 animate-slide-up">
        <button
          type="button"
          onClick={() => navigate(`/estudiante/mis-proyectos/${id}`)}
          className="flex items-center gap-1.5 text-[13px] text-[#9CA3AF] hover:text-[#B91C1C] transition-colors duration-150 mb-3 group"
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" className="group-hover:-translate-x-0.5 transition-transform duration-150">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Detalle del proyecto
        </button>
        <h1 className="text-[28px] font-bold text-[#111827] mb-1.5 tracking-[-0.01em]">Editar Proyecto</h1>
        <p className="text-sm text-[#6B7280] max-w-[560px]">
          Modifica los datos de tu proyecto de grado o propuesta de investigación del programa de Ingeniería de Sistemas.
        </p>
      </div>

      <div className="grid grid-cols-[65fr_35fr] gap-6 items-start max-md:grid-cols-1 animate-slide-up">

        <div className="flex flex-col gap-4">
          {/* Detalles */}
          <div className={cardCls}>
            <div className={cardHeaderCls}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#B91C1C" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <span className={cardTituloCls}>Detalles del Proyecto</span>
            </div>
            <div className={campoMb}>
              <label htmlFor="ep-titulo" className={labelCls}>TÍTULO DEL PROYECTO</label>
              <input id="ep-titulo" type="text" className={inputCls(errores.titulo)} placeholder="Ej. Implementación de Blockchain en cadenas de suministro académico" value={titulo} onChange={(e) => { setTitulo(e.target.value); setErrores((p) => ({ ...p, titulo: '' })); }} aria-invalid={!!errores.titulo} />
              {errores.titulo && <p className={errorCls} role="alert">{errores.titulo}</p>}
              <p className={ayudaCls}>El título debe ser conciso y técnicamente descriptivo.</p>
            </div>
            <div className={campoMb}>
              <label htmlFor="ep-semestre" className={labelCls}>SEMESTRE ACADÉMICO</label>
              <select id="ep-semestre" className={selectCls} value={idSemestre} onChange={(e) => setIdSemestre(e.target.value)}>
                <option value="">Selecciona un semestre</option>
                {semestresActivos.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>
            <div className={campoMb}>
              <label htmlFor="ep-estado" className={labelCls}>ESTADO DEL PROYECTO</label>
              <select id="ep-estado" className={selectCls} value={idEstado} onChange={(e) => setIdEstado(Number(e.target.value))}>
                {ESTADOS_PROYECTO.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
              </select>
            </div>
            <div className={campoMb}>
              <label htmlFor="ep-resumen" className={labelCls}>RESUMEN</label>
              <textarea id="ep-resumen" className={`${inputCls(errores.resumen)} resize-y min-h-[140px]`} rows={6} placeholder="Define el planteamiento del problema, el alcance y los objetivos técnicos del proyecto..." value={resumen} onChange={(e) => { setResumen(e.target.value); setErrores((p) => ({ ...p, resumen: '' })); }} aria-invalid={!!errores.resumen} />
              {errores.resumen && <p className={errorCls} role="alert">{errores.resumen}</p>}
            </div>
          </div>

          {/* Equipo */}
          <div className={cardCls}>
            <div className={cardHeaderCls}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#B91C1C" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>
              <span className={cardTituloCls}>Equipo Académico</span>
            </div>

            {/* Integrantes */}
            <div className="mb-5">
              <p className={labelCls}>INTEGRANTES DEL GRUPO</p>
              {buscadorWrap(refDropdownIntegrantes, <>
                <div className="flex gap-2">
                  <input type="text" className={`${inputCls()} flex-1`} placeholder="Buscar por nombre o correo..." value={busquedaIntegrantes} onChange={(e) => { setBusquedaIntegrantes(e.target.value); setMostrandoDropdownIntegrantes(e.target.value.length > 0); }} disabled={integrantesSeleccionados.length >= 3} aria-label="Buscar integrante" />
                  <button type="button" className="px-3.5 py-2 bg-[#F3F4F6] text-[#374151] border border-[#E5E7EB] rounded-lg font-sans text-[13px] font-semibold cursor-pointer whitespace-nowrap hover:bg-[#E5E7EB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0" disabled={integrantesSeleccionados.length >= 3}>Agregar Miembro</button>
                </div>
                {integrantesSeleccionados.length >= 3 && <p className="text-xs text-[#B91C1C] mt-1">Máximo 3 integrantes por grupo</p>}
                {mostrandoDropdownIntegrantes && resultadosIntegrantes.length > 0 && (
                  <div className={dropdownCls} role="listbox">
                    {resultadosIntegrantes.map((u) => (
                      <button key={u.id} type="button" className={dropdownItemCls} onClick={() => handleAddIntegrante(u)} role="option">
                        <AvatarIniciales nombre={u.nombre} apellido={u.apellido} tamaño="sm" />
                        <div className="flex flex-col gap-px flex-1 min-w-0">
                          <span className="text-[13px] font-semibold text-[#111827] truncate">{u.nombre} {u.apellido}</span>
                          <span className="text-[11px] text-[#6B7280] truncate">{u.correo}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {mostrandoDropdownIntegrantes && busquedaIntegrantes.trim() && resultadosIntegrantes.length === 0 && (
                  <div className={dropdownCls}><p className="px-3.5 py-3 text-[13px] text-[#9CA3AF] m-0">No se encontraron estudiantes disponibles</p></div>
                )}
              </>)}
              {integrantesSeleccionados.length === 0 ? (
                <p className="text-[13px] text-[#9CA3AF] m-0 py-1">No hay integrantes seleccionados</p>
              ) : (
                <ul className="list-none flex flex-col gap-2 m-0 p-0">
                  {integrantesSeleccionados.map((u) => {
                    const esUsuarioActual = usuario?.id ? u.id === usuario.id : u.correo === usuario?.correo;
                    return (
                      <li key={u.id} className={personaFilaCls}>
                        <AvatarIniciales nombre={u.nombre} apellido={u.apellido} tamaño="md" />
                        <div className={personaInfoCls}>
                          <span className="text-[13px] font-semibold text-[#111827]">{u.nombre} {u.apellido}</span>
                          <span className="text-[11px] text-[#6B7280]">{u.correo}</span>
                        </div>
                        {!esUsuarioActual && (
                          <button type="button" className={btnEliminarCls} onClick={() => handleRemoveIntegrante(u.id)} aria-label={`Eliminar a ${u.nombre}`}>
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Director */}
            <div className="mb-5 border-t border-[#F3F4F6] pt-5">
              <p className={labelCls}>DIRECTOR / CO-DIRECTOR</p>
              {buscadorWrap(refDropdownDirector, <>
                <div className="flex gap-2">
                  <input type="text" className={`${inputCls()} flex-1`} placeholder="Buscar director..." value={busquedaDirector} onChange={(e) => { setBusquedaDirector(e.target.value); setMostrandoDropdownDocentes(e.target.value.length > 0); }} aria-label="Buscar director" />
                  <button type="button" className="px-3.5 py-2 bg-[#F3F4F6] text-[#374151] border border-[#E5E7EB] rounded-lg font-sans text-[13px] font-semibold cursor-pointer whitespace-nowrap hover:bg-[#E5E7EB] transition-colors shrink-0">Agregar</button>
                </div>
                {mostrandoDropdownDocentes && resultadosDirectores.length > 0 && (
                  <div className={dropdownCls} role="listbox">
                    {resultadosDirectores.map((d) => (
                      <button key={d.id} type="button" className={dropdownItemCls} onClick={() => handleAddDirector(d)} role="option">
                        <AvatarIniciales nombre={d.nombre} apellido={d.apellido} tamaño="sm" />
                        <div className="flex flex-col gap-px flex-1 min-w-0">
                          <span className="text-[13px] font-semibold text-[#111827] truncate">{d.nombre} {d.apellido}</span>
                          <span className="text-[11px] text-[#6B7280] truncate">{d.correo}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {mostrandoDropdownDocentes && busquedaDirector.trim() && resultadosDirectores.length === 0 && (
                  <div className={dropdownCls}><p className="px-3.5 py-3 text-[13px] text-[#9CA3AF] m-0">No se encontraron directores disponibles</p></div>
                )}
              </>)}
              {directoresSeleccionados.length === 0 ? <p className="text-[13px] text-[#9CA3AF] m-0 py-1">No hay directores seleccionados</p> : (
                <ul className="list-none flex flex-col gap-2 m-0 p-0">
                  {directoresSeleccionados.map((d, idx) => (
                    <li key={d.id} className={personaFilaCls}>
                      <AvatarIniciales nombre={d.nombre} apellido={d.apellido} tamaño="md" />
                      <div className={personaInfoCls}>
                        <span className="text-[13px] font-semibold text-[#111827]">{d.nombre} {d.apellido}</span>
                        <span className="text-[11px] text-[#6B7280]">{d.correo}</span>
                      </div>
                      <span className={`inline-flex items-center px-2 py-[3px] rounded-full text-[10px] font-bold tracking-[0.05em] whitespace-nowrap shrink-0 ${idx === 0 ? 'bg-[#FEE2E2] text-[#B91C1C]' : 'bg-[#FEE2E2] text-[#991B1B]'}`}>{idx === 0 ? 'DIRECTOR' : 'CO-DIRECTOR'}</span>
                      <button type="button" className={btnEliminarCls} onClick={() => handleRemoveDirector(d.id)} aria-label={`Eliminar a ${d.nombre}`}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Evaluadores */}
            <div className="border-t border-[#F3F4F6] pt-5">
              <p className={labelCls}>EVALUADORES</p>
              {buscadorWrap(refDropdownEvaluador, <>
                <div className="flex gap-2">
                  <input type="text" className={`${inputCls()} flex-1`} placeholder="Buscar evaluador..." value={busquedaEvaluador} onChange={(e) => { setBusquedaEvaluador(e.target.value); setMostrandoDropdownEvaluadores(e.target.value.length > 0); }} aria-label="Buscar evaluador" />
                  <button type="button" className="px-3.5 py-2 bg-[#F3F4F6] text-[#374151] border border-[#E5E7EB] rounded-lg font-sans text-[13px] font-semibold cursor-pointer whitespace-nowrap hover:bg-[#E5E7EB] transition-colors shrink-0">Agregar</button>
                </div>
                {mostrandoDropdownEvaluadores && resultadosEvaluadores.length > 0 && (
                  <div className={dropdownCls} role="listbox">
                    {resultadosEvaluadores.map((e) => (
                      <button key={e.id} type="button" className={dropdownItemCls} onClick={() => handleAddEvaluador(e)} role="option">
                        <AvatarIniciales nombre={e.nombre} apellido={e.apellido} tamaño="sm" />
                        <div className="flex flex-col gap-px flex-1 min-w-0">
                          <span className="text-[13px] font-semibold text-[#111827] truncate">{e.nombre} {e.apellido}</span>
                          <span className="text-[11px] text-[#6B7280] truncate">{e.correo}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {mostrandoDropdownEvaluadores && busquedaEvaluador.trim() && resultadosEvaluadores.length === 0 && (
                  <div className={dropdownCls}><p className="px-3.5 py-3 text-[13px] text-[#9CA3AF] m-0">No se encontraron evaluadores disponibles</p></div>
                )}
              </>)}
              {evaluadoresSeleccionados.length === 0 ? <p className="text-[13px] text-[#9CA3AF] m-0 py-1">No hay evaluadores seleccionados</p> : (
                <ul className="list-none flex flex-col gap-2 m-0 p-0">
                  {evaluadoresSeleccionados.map((e) => (
                    <li key={e.id} className={personaFilaCls}>
                      <AvatarIniciales nombre={e.nombre} apellido={e.apellido} tamaño="md" />
                      <div className={personaInfoCls}>
                        <span className="text-[13px] font-semibold text-[#111827]">{e.nombre} {e.apellido}</span>
                        <span className="text-[11px] text-[#6B7280]">{e.correo}</span>
                      </div>
                      <span className="inline-flex items-center px-2 py-[3px] rounded-full text-[10px] font-bold tracking-[0.05em] whitespace-nowrap shrink-0 bg-[#DBEAFE] text-[#1D4ED8]">EVALUADOR</span>
                      <button type="button" className={btnEliminarCls} onClick={() => handleRemoveEvaluador(e.id)} aria-label={`Eliminar a ${e.nombre}`}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Categorización */}
          <div className={cardCls}>
            <div className={cardHeaderCls}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#B91C1C" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span className={cardTituloCls}>Categorización</span>
            </div>
            <div className={campoMb}>
              <label htmlFor="ep-materia" className={labelCls}>MATERIA</label>
              <select id="ep-materia" className={selectCls} value={idMateria} onChange={(e) => setIdMateria(e.target.value)}>
                <option value="">Selecciona una materia</option>
                {materiasActivas.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
              </select>
            </div>
            <div className={campoMb}>
              <p className={labelCls}>LÍNEAS DE INVESTIGACIÓN</p>
              {buscadorWrap(refDropdownLineas, <>
                <div className="relative">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth={2} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input type="text" className={`${inputCls()} pl-8`} placeholder="Buscar líneas de investigación..." value={busquedaLinea} onChange={(e) => { setBusquedaLinea(e.target.value); setMostrandoDropdownLineas(true); }} onFocus={() => setMostrandoDropdownLineas(true)} aria-label="Buscar líneas de investigación" />
                </div>
                {mostrandoDropdownLineas && lineasFiltradas.length > 0 && (
                  <div className={dropdownCls} role="listbox">
                    {lineasFiltradas.slice(0, 8).map((l) => (
                      <button key={l.id} type="button" className={`${dropdownItemCls} text-[13px] text-[#374151]`} onClick={() => handleAddLinea(l.id)} role="option">{l.nombre}</button>
                    ))}
                  </div>
                )}
              </>)}
              {lineasSeleccionadas.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {lineasSeleccionadas.map((l) => (
                    <span key={l.id} className="inline-flex items-center gap-1 bg-[#F3F4F6] text-[#374151] px-2.5 py-1 rounded-full text-xs font-medium">
                      {l.nombre}
                      <button type="button" className="bg-none border-none text-sm text-[#6B7280] cursor-pointer p-0 leading-none flex items-center hover:text-[#EF4444] transition-colors" onClick={() => handleRemoveLinea(l.id)} aria-label={`Quitar línea ${l.nombre}`}>×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Visibilidad */}
          <div className={cardCls}>
            <div className={cardHeaderCls}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#B91C1C" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              <span className={cardTituloCls}>Visibilidad</span>
            </div>
            <div className={campoMb}>
              <label htmlFor="ep-visibilidad" className={labelCls}>NIVEL DE VISIBILIDAD</label>
              <select id="ep-visibilidad" className={selectCls} value={idVisibilidad} onChange={(e) => setIdVisibilidad(Number(e.target.value))}>
                {NIVELES_VISIBILIDAD.map((v) => <option key={v.id} value={v.id}>{v.nombre}</option>)}
              </select>
              <p className={ayudaCls}>{DESCRIPCIONES_VISIBILIDAD[idVisibilidad]}</p>
            </div>
            <div className="flex items-start gap-2 bg-[#FFFBEB] border border-[#FDE68A] rounded-lg p-3 mt-3">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#D97706" strokeWidth={2} className="shrink-0 mt-px" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <p className="text-xs text-[#78350F] m-0 leading-relaxed">Los proyectos públicos son indexados en el repositorio y visibles durante evaluaciones institucionales.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end items-center gap-3 mt-6 pt-4">
        <button type="button" className="px-5 py-2.5 bg-white text-[#374151] border border-[#D1D5DB] rounded-lg font-sans text-sm font-medium cursor-pointer transition-colors hover:bg-[#F9FAFB] disabled:opacity-60 disabled:cursor-not-allowed" onClick={() => navigate(`/estudiante/mis-proyectos/${id}`)} disabled={guardando}>Cancelar</button>
        <button type="button" className="inline-flex items-center gap-1.5 px-[22px] py-2.5 bg-[#B91C1C] text-white border-none rounded-lg font-sans text-sm font-bold cursor-pointer transition-all hover:bg-[#991B1B] hover:-translate-y-px disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0" onClick={handleClickGuardar} disabled={guardando} aria-busy={guardando}>
          {guardando ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              Guardar Cambios
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
