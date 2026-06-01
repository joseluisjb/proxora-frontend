import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ProyectoResponse } from '../../types/api.types';
import { proyectosService } from '../../services/proyectos.service';
import { useAuth } from '../../context/AuthContext';
import { GrillaProyectos } from '../../components/proyecto/GrillaProyectos';
import Paginacion from '../../components/ui/Paginacion';

const PAGINA_SIZE = 4;

export default function MisProyectos() {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [proyectos, setProyectos] = useState<ProyectoResponse[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginaActual, setPaginaActual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalElementos, setTotalElementos] = useState(0);

  const cargarProyectos = useCallback(async (pagina: number) => {
    if (!usuario?.id) return;
    setCargando(true);
    setError(null);
    try {
      const resultado = await proyectosService.listarPorIntegrante(usuario.id, {
        page: pagina,
        size: PAGINA_SIZE,
        sort: 'creadoEn,desc',
      });
      setProyectos(resultado.content);
      setTotalPaginas(resultado.totalPages || 1);
      setTotalElementos(resultado.totalElements);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } };
      if (axiosErr.response?.status === 401) {
        setError('Sesión expirada. Por favor inicia sesión nuevamente.');
      } else {
        setError('No se pudieron cargar tus proyectos. Intenta de nuevo.');
      }
    } finally {
      setCargando(false);
    }
  }, [usuario?.id]);

  useEffect(() => {
    cargarProyectos(paginaActual);
  }, [paginaActual, cargarProyectos]);

  return (
    <>
      <div className="mb-6 animate-slide-up">
        <h1 className="text-[28px] font-bold text-[#111827] mb-1.5 tracking-[-0.01em]">Mis Proyectos</h1>
        <p className="text-sm text-[#6B7280] max-w-[480px]">
          Proyectos de investigación en los que participas como integrante, director o evaluador.
        </p>
      </div>

      <div className="animate-fade-in">
        <GrillaProyectos
          proyectos={proyectos}
          cargando={cargando}
          error={error}
          vistaActual="grilla"
          onReintentar={() => cargarProyectos(paginaActual)}
          mostrarVisibilidad
          mostrarDirector
          mostrarIntegrantes
          columnas={2}
        />

        {!cargando && !error && totalElementos === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 animate-scale-in">
            <div className="w-16 h-16 rounded-2xl bg-[#FEF2F2] flex items-center justify-center">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#C0392B" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-[15px] font-semibold text-[#111827] mb-1">Aún no tienes proyectos</p>
              <p className="text-sm text-[#6B7280]">Registra tu primer proyecto de investigación para verlo aquí.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/estudiante/registrar')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C0392B] text-white rounded-lg font-sans text-sm font-bold cursor-pointer transition-all hover:bg-[#96281B] hover:-translate-y-px border-none"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Registrar proyecto
            </button>
          </div>
        )}

        {!cargando && !error && totalElementos > 0 && (
          <div className="mt-6 flex justify-center animate-fade-in">
            <Paginacion
              paginaActual={paginaActual + 1}
              totalPaginas={Math.max(totalPaginas, 1)}
              totalRegistros={totalElementos}
              registrosPorPagina={PAGINA_SIZE}
              labelEntidad="proyectos"
              onCambiarPagina={(p) => setPaginaActual(p - 1)}
            />
          </div>
        )}
      </div>
    </>
  );
}
