import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { misProyectosService } from '../../services/estudiante/misProyectos.service';
import { proyectosService } from '../../services/proyectos.service';
import type { ProyectoResponse, EstadoProyectoResponse } from '../../types/api.types';
import { VISIBILIDAD_INTERNA_CONFIG as VISIBILIDAD_CONFIG } from '../../constants/visibilidad';
import ModalConfirmacion from '../../components/ui/ModalConfirmacion';
import { useModalConfirmacion } from '../../hooks/useModalConfirmacion';
import Paginacion from '../../components/ui/Paginacion';
import Desplegable from '../../components/ui/Desplegable';
import { useAlertaContext } from '../../context/AlertaContext';
import { extraerMensajeError } from '../../utils/errores';

const PAGINA_SIZE = 6;

const ESTADO_CONFIG: Record<ProyectoResponse['estado'], { label: string; clases: string }> = {
  en_desarrollo: { label: 'En Desarrollo', clases: 'text-[#854D0E] bg-[#FEF9C3]' },
  bajo_revision: { label: 'Bajo Revisión', clases: 'text-[#1E40AF] bg-[#DBEAFE]' },
  retrasado:     { label: 'Retrasado',     clases: 'text-[#B91C1C] bg-[#FEE2E2]' },
  finalizado:    { label: 'Finalizado',    clases: 'text-[#166534] bg-[#DCFCE7]' },
};

const ETIQUETA_ESTADO: Record<string, string> = {
  en_desarrollo: 'En Desarrollo',
  finalizado:    'Finalizado',
  bajo_revision: 'Bajo Revisión',
  retrasado:     'Retrasado',
};

function MenuTarjeta({ onEditar, onEliminar }: { onEditar: () => void; onEliminar: () => void }) {
  const [abierto, setAbierto] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const cerrar = () => {
    if (!abierto || cerrando) return;
    setCerrando(true);
  };

  useEffect(() => {
    if (!abierto) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) cerrar();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [abierto, cerrando]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => abierto ? cerrar() : setAbierto(true)}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F3F4F6] transition-colors duration-150"
        aria-label="Opciones del proyecto"
      >
        <svg width="4" height="16" viewBox="0 0 4 16" fill="currentColor" aria-hidden="true">
          <circle cx="2" cy="2" r="1.5" />
          <circle cx="2" cy="8" r="1.5" />
          <circle cx="2" cy="14" r="1.5" />
        </svg>
      </button>

      {abierto && (
        <div
          className={`absolute right-0 top-9 z-50 min-w-[172px] bg-white rounded-xl border border-[#E5E7EB] shadow-lg py-1 ${cerrando ? 'animate-scale-out' : 'animate-scale-in'}`}
          onAnimationEnd={() => { if (cerrando) { setAbierto(false); setCerrando(false); } }}
        >
          <button
            type="button"
            onClick={() => { cerrar(); onEditar(); }}
            className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-[13px] text-[#374151] hover:bg-[#F9FAFB] transition-colors duration-100 text-left"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar proyecto
          </button>
          <div className="mx-3 h-px bg-[#F3F4F6]" />
          <button
            type="button"
            onClick={() => { cerrar(); onEliminar(); }}
            className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-[13px] text-[#B91C1C] hover:bg-[#FEF2F2] transition-colors duration-100 text-left"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Eliminar proyecto
          </button>
        </div>
      )}
    </div>
  );
}

function TarjetaProyecto({
  proyecto,
  onVerDetalle,
  onEditar,
  onEliminar,
}: {
  proyecto: ProyectoResponse;
  onVerDetalle: () => void;
  onEditar: () => void;
  onEliminar: () => void;
}) {
  const cfg = ESTADO_CONFIG[proyecto.estado];
  const visCfg = VISIBILIDAD_CONFIG[proyecto.visibilidad];

  return (
    <div
      className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5 flex flex-col gap-3 hover:shadow-md hover:border-[#FECACA] transition-all duration-200 cursor-pointer"
      onClick={onVerDetalle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onVerDetalle(); }}
      aria-label={`Ver detalle de ${proyecto.titulo}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide ${cfg.clases}`}>
            {cfg.label}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide ${visCfg.clases}`}>
            {visCfg.label}
          </span>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <MenuTarjeta onEditar={onEditar} onEliminar={onEliminar} />
        </div>
      </div>

      <div>
        <h3 className="text-[15px] font-bold text-[#111827] leading-snug mb-1.5 line-clamp-3">
          {proyecto.titulo}
        </h3>
        <p className="text-[13px] text-[#6B7280] leading-relaxed line-clamp-2">
          {proyecto.resumen}
        </p>
      </div>

      {(proyecto.integrantes.length > 0 || proyecto.directores.length > 0) && (
        <div className="flex flex-col gap-1">
          {proyecto.integrantes.length > 0 && (
            <p className="text-[11px] text-[#6B7280] truncate">
              {proyecto.integrantes.slice(0, 2).map((m) => `${m.nombre} ${m.apellido}`).join(', ')}
              {proyecto.integrantes.length > 2 && ` +${proyecto.integrantes.length - 2} más`}
            </p>
          )}
          {proyecto.directores.length > 0 && (
            <p className="text-[11px] text-[#6B7280] truncate">
              <span className="font-medium text-[#9CA3AF]">Director: </span>
              {`${proyecto.directores[0].nombre} ${proyecto.directores[0].apellido}`}
            </p>
          )}
          {proyecto.directores.length > 1 && (
            <p className="text-[11px] text-[#6B7280] truncate">
              <span className="font-medium text-[#9CA3AF]">Co-Directores: </span>
              {proyecto.directores.slice(1).map((d) => `${d.nombre} ${d.apellido}`).join(', ')}
            </p>
          )}
        </div>
      )}

      {(proyecto.semestre || proyecto.materia) && (
        <p className="text-[11px] text-[#9CA3AF] font-medium uppercase tracking-wide flex items-center gap-1.5 flex-wrap">
          {proyecto.semestre && <span>{proyecto.semestre}</span>}
          {proyecto.semestre && proyecto.materia && <span aria-hidden="true">·</span>}
          {proyecto.materia && <span>{proyecto.materia}</span>}
        </p>
      )}

      {proyecto.lineas.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {proyecto.lineas.map((l) => (
            <span key={l.id} className="inline-flex items-center bg-[#F3F4F6] text-[#374151] px-2 py-0.5 rounded-full text-[10px] font-medium">
              {l.nombre}
            </span>
          ))}
        </div>
      )}

      {proyecto.estado === 'finalizado' && (
        <div className="pt-3 border-t border-[#F3F4F6] mt-auto">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12px] font-medium text-[#6B7280]">Calificación Final</span>
          </div>
          <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
            <div className="h-full bg-[#16A34A] rounded-full" style={{ width: '100%' }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function MisProyectos() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { modalProps, abrirModal } = useModalConfirmacion();
  const { mostrarAlerta } = useAlertaContext();

  const [proyectos, setProyectos] = useState<ProyectoResponse[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estadosDisponibles, setEstadosDisponibles] = useState<EstadoProyectoResponse[]>([]);

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);

  const cargar = useCallback(async () => {
    if (!usuario?.id) return;
    setCargando(true);
    setError(null);
    try {
      const result = await misProyectosService.listarMisProyectos(usuario.id, { size: 100 });
      setProyectos(result.content);
    } catch (err) {
      setError('Error al cargar tus proyectos. Intenta de nuevo.');
      mostrarAlerta({ mensaje: extraerMensajeError(err, 'Error al cargar tus proyectos. Intenta de nuevo.'), variante: 'error' });
    } finally {
      setCargando(false);
    }
  }, [usuario]);

  useEffect(() => { cargar(); }, [cargar]);

  useEffect(() => {
    proyectosService.listarEstados().then(setEstadosDisponibles).catch(() => {});
  }, []);

  useEffect(() => { setPaginaActual(1); }, [busqueda, filtroEstado]);

  const handleEliminar = (proyecto: ProyectoResponse) => {
    abrirModal({
      titulo: 'Eliminar proyecto',
      mensaje: `¿Estás seguro de que deseas eliminar "${proyecto.titulo}"? Esta acción no se puede deshacer.`,
      labelConfirmar: 'Eliminar',
      variante: 'peligro',
      onConfirmar: async () => {
        try {
          await misProyectosService.eliminar(proyecto.id);
          setProyectos((prev) => prev.filter((p) => p.id !== proyecto.id));
          mostrarAlerta({ mensaje: `Proyecto "${proyecto.titulo}" eliminado correctamente.`, variante: 'exito' });
        } catch (err) {
          mostrarAlerta({ mensaje: extraerMensajeError(err, 'No se pudo eliminar el proyecto. Intenta de nuevo.'), variante: 'error' });
        }
      },
    });
  };

  const t = busqueda.toLowerCase().trim();
  const proyectosFiltrados = proyectos.filter((p) => {
    if (filtroEstado && p.estado !== filtroEstado) return false;
    if (!t) return true;
    return (
      p.titulo.toLowerCase().includes(t) ||
      (p.semestre ?? '').toLowerCase().includes(t) ||
      (p.materia ?? '').toLowerCase().includes(t) ||
      p.lineas.some((l) => l.nombre.toLowerCase().includes(t))
    );
  });

  const totalPaginas = Math.max(1, Math.ceil(proyectosFiltrados.length / PAGINA_SIZE));
  const proyectosPaginados = proyectosFiltrados.slice(
    (paginaActual - 1) * PAGINA_SIZE,
    paginaActual * PAGINA_SIZE,
  );

  return (
    <>
      <ModalConfirmacion {...modalProps} />

      <div className="animate-fade-in">
        <div className="mb-6 animate-slide-up">
          <h1 className="text-2xl font-bold text-[#111827] mb-1">Mis Proyectos</h1>
          <p className="text-[13px] text-[#6B7280] max-w-[480px]">
            Gestiona tu investigación en Ingeniería de Sistemas y los hitos de tu proyecto.
          </p>
        </div>

        {!cargando && !error && proyectos.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-5">
            <div className="relative flex-1 min-w-[200px]">
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por título, semestre, materia o línea de investigación..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-[#E5E7EB] rounded-lg text-[13px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#B91C1C] transition-colors bg-white"
              />
            </div>
            <Desplegable
              valor={filtroEstado}
              onChange={setFiltroEstado}
              opciones={[
                { valor: '', etiqueta: 'Todos los estados' },
                ...estadosDisponibles.map((e) => ({ valor: e.nombre, etiqueta: ETIQUETA_ESTADO[e.nombre] ?? e.nombre })),
              ]}
              ariaLabel="Filtrar por estado"
              className="shrink-0"
            />
          </div>
        )}

        {cargando && (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-[#B91C1C] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && !cargando && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <p className="text-[14px] text-[#6B7280]">{error}</p>
            <button
              type="button"
              onClick={cargar}
              className="px-4 py-2 text-[13px] font-semibold text-white bg-[#B91C1C] rounded-lg hover:bg-[#991B1B] transition-colors duration-150"
            >
              Reintentar
            </button>
          </div>
        )}

        {!cargando && !error && proyectos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-12 h-12 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-1">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-[14px] text-[#6B7280]">No tienes proyectos registrados aún.</p>
            <button
              type="button"
              onClick={() => navigate('/estudiante/registrar')}
              className="px-4 py-2 text-[13px] font-semibold text-white bg-[#B91C1C] rounded-lg hover:bg-[#991B1B] transition-colors duration-150"
            >
              Registrar proyecto
            </button>
          </div>
        )}

        {!cargando && !error && proyectos.length > 0 && proyectosFiltrados.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth={1.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-[14px] text-[#6B7280]">No se encontraron proyectos con esos filtros.</p>
          </div>
        )}

        {!cargando && !error && proyectosPaginados.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
              {proyectosPaginados.map((p) => (
                <TarjetaProyecto
                  key={p.id}
                  proyecto={p}
                  onVerDetalle={() => navigate(`/estudiante/mis-proyectos/${p.id}`)}
                  onEditar={() => navigate(`/estudiante/mis-proyectos/${p.id}/editar`)}
                  onEliminar={() => handleEliminar(p)}
                />
              ))}
            </div>

            {proyectosFiltrados.length > PAGINA_SIZE && (
              <div className="mt-6 flex justify-center">
                <Paginacion
                  paginaActual={paginaActual}
                  totalPaginas={totalPaginas}
                  totalRegistros={proyectosFiltrados.length}
                  registrosPorPagina={PAGINA_SIZE}
                  labelEntidad="proyectos"
                  onCambiarPagina={setPaginaActual}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
