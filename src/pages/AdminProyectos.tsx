import { useState, useEffect, useCallback } from 'react';
import type { ProyectoResponse, NivelVisibilidad, SemestreResponse, MateriaResponse, LineaInvestigacionResponse } from '../types/api.types';
import { proyectosService } from '../services/proyectos.service';
import { semestresService } from '../services/semestres.service';
import { materiasService } from '../services/materias.service';
import { lineasService } from '../services/lineas.service';
import PageHeader from '../components/ui/PageHeader';
import BadgeEstado from '../components/ui/BadgeEstado';
import FilaTablaAcciones from '../components/ui/FilaTablaAcciones';
import FiltrosProyectos from '../components/ui/FiltrosProyectos';
import Paginacion from '../components/ui/Paginacion';

interface FiltrosValores {
  busqueda: string;
  semestre: string;
  materia: string;
  lineaInvestigacion: string;
  estado: string;
  visibilidad: string;
}

const REGISTROS_POR_PAGINA = 10;

const VISIBILIDAD_LABEL: Record<NivelVisibilidad, string> = {
  solo_metadatos:   'Privado',
  lectura:          'Público',
  lectura_descarga: 'Público',
};

type ModoConsulta = 'todos' | 'busqueda' | 'semestre' | 'materia' | 'estado';

function resolverModo(f: FiltrosValores): ModoConsulta {
  if (f.busqueda.trim()) return 'busqueda';
  if (f.semestre) return 'semestre';
  if (f.materia) return 'materia';
  if (f.estado) return 'estado';
  return 'todos';
}

export default function AdminProyectos() {
  const [pagina, setPagina] = useState(1);
  const [filtros, setFiltros] = useState<FiltrosValores>({ busqueda: '', semestre: '', materia: '', lineaInvestigacion: '', estado: '', visibilidad: '' });
  const [aplicados, setAplicados] = useState<FiltrosValores>(filtros);

  const [proyectos, setProyectos] = useState<ProyectoResponse[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalElementos, setTotalElementos] = useState(0);

  const [semestres, setSemestres] = useState<SemestreResponse[]>([]);
  const [materias, setMaterias] = useState<MateriaResponse[]>([]);
  const [lineas, setLineas] = useState<LineaInvestigacionResponse[]>([]);

  useEffect(() => {
    semestresService.listar({ size: 100 }).then((r) => setSemestres(r.content)).catch(() => {});
    materiasService.listar({ size: 100 }).then((r) => setMaterias(r.content)).catch(() => {});
    lineasService.listar({ size: 100 }).then((r) => setLineas(r.content)).catch(() => {});
  }, []);

  const cargarProyectos = useCallback(async (f: FiltrosValores, pagActual: number) => {
    setCargando(true);
    setError(null);
    try {
      const params = { page: pagActual - 1, size: REGISTROS_POR_PAGINA };
      const modo = resolverModo(f);
      let resultado;
      if (modo === 'busqueda') resultado = await proyectosService.buscar(f.busqueda.trim(), params);
      else if (modo === 'semestre') resultado = await proyectosService.listarPorSemestre(f.semestre, params);
      else if (modo === 'materia') resultado = await proyectosService.listarPorMateria(f.materia, params);
      else if (modo === 'estado') {
        const estadoMap: Record<string, number> = { en_desarrollo: 1, finalizado: 2, bajo_revision: 3, retrasado: 4 };
        resultado = await proyectosService.listarPorEstado(estadoMap[f.estado] ?? 1, params);
      } else resultado = await proyectosService.listar({ ...params, sort: 'creadoEn,desc' });
      setProyectos(resultado.content);
      setTotalPaginas(resultado.totalPages || 1);
      setTotalElementos(resultado.totalElements);
    } catch {
      setError('Error al cargar los datos. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarProyectos(aplicados, pagina); }, [aplicados, pagina, cargarProyectos]);

  const handleEliminar = async (proyecto: ProyectoResponse) => {
    if (!window.confirm(`¿Eliminar el proyecto "${proyecto.titulo}"? Esta acción no se puede deshacer.`)) return;
    try { await proyectosService.eliminar(proyecto.id); await cargarProyectos(aplicados, pagina); }
    catch { setError('No se pudo eliminar el proyecto. Intenta de nuevo.'); }
  };

  const thCls = "text-left text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6B6B6B] px-4 py-3 border-b border-[#EBEBEB]";
  const tdCls = "px-4 py-3.5 border-b border-[#F0F0F0] align-middle";

  return (
    <div>
      <p className="text-[11px] font-bold text-[#C0392B] tracking-[0.1em] uppercase mb-1.5 animate-slide-up">ADMINISTRACIÓN DEL SISTEMA</p>
      <PageHeader
        titulo="Proyectos"
        subtitulo="Gestiona y supervisa todos los proyectos de investigación del programa de Ingeniería de Sistemas."
      />

      <div className="animate-slide-up">
        <FiltrosProyectos
          valores={filtros}
          onChange={(campo, valor) => setFiltros((prev) => ({ ...prev, [campo]: valor }))}
          onFiltrar={() => { setAplicados(filtros); setPagina(1); }}
          semestres={semestres.map((s) => ({ id: s.id, nombre: s.nombre }))}
          materias={materias.map((m) => ({ id: m.id, nombre: m.nombre }))}
          lineas={lineas.map((l) => ({ id: l.id, nombre: l.nombre }))}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-[#EBEBEB] animate-slide-up">
        {error && (
          <div className="bg-[#FEF2F2] border-l-[3px] border-[#EF4444] px-4 py-3 mb-4 flex items-center gap-3 animate-scale-in" role="alert">
            <span className="flex-1">{error}</span>
            <button onClick={() => cargarProyectos(aplicados, pagina)} className="font-semibold text-[#EF4444] bg-none border-none cursor-pointer">Reintentar</button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={thCls} style={{ width: '30%' }}>Título del Proyecto</th>
                <th className={thCls} style={{ width: '15%' }}>Autor Principal</th>
                <th className={thCls} style={{ width: '20%' }}>Director</th>
                <th className={thCls} style={{ width: '15%' }}>Materia</th>
                <th className={thCls} style={{ width: '10%' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan={5}><div className="text-center py-12 px-5 text-[#6B6B6B]"><p className="text-sm">Cargando...</p></div></td></tr>
              ) : proyectos.length === 0 ? (
                <tr><td colSpan={5}><div className="text-center py-12 px-5 text-[#6B6B6B]"><p className="text-sm">No hay proyectos registrados</p></div></td></tr>
              ) : (
                proyectos.map((proy, index) => {
                  const director = proy.directores[0]
                    ? `${proy.directores[0].nombre} ${proy.directores[0].apellido}${proy.directores.length > 1 ? ` y ${proy.directores.length - 1} más` : ''}`
                    : '—';
                  return (
                    <tr key={proy.id} className="hover:bg-[#F8F8F8] animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                      <td className={tdCls}>
                        <p className="text-[13px] font-medium text-[#111111] leading-tight">{proy.titulo}</p>
                        <p className="text-[11px] mt-0.5">
                          <span className={`font-medium ${proy.visibilidad === 'solo_metadatos' ? 'text-[#6B6B6B]' : 'text-[#16A34A]'}`}>
                            {VISIBILIDAD_LABEL[proy.visibilidad]}
                          </span>
                        </p>
                      </td>
                      <td className={`${tdCls} text-[13px] text-[#3D3D3D]`}>{proy.registradoPor.nombre} {proy.registradoPor.apellido}</td>
                      <td className={`${tdCls} text-[13px] text-[#3D3D3D]`}>{director}</td>
                      <td className={tdCls}>
                        <BadgeEstado variante="materia" label={proy.materia ?? 'Sin materia'} />
                      </td>
                      <td className={tdCls}>
                        <FilaTablaAcciones mostrarEditar={false} onEliminar={() => handleEliminar(proy)} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Paginacion paginaActual={pagina} totalPaginas={Math.max(totalPaginas, 1)} totalRegistros={totalElementos} registrosPorPagina={REGISTROS_POR_PAGINA} labelEntidad="proyectos" onCambiarPagina={setPagina} />
      </div>
    </div>
  );
}
