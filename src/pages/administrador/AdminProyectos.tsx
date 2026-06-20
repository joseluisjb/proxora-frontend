import { useState, useEffect, useCallback, useRef } from 'react';
import type { ProyectoResponse, NivelVisibilidad, SemestreResponse, MateriaResponse, LineaInvestigacionResponse, EstadoProyectoResponse, NivelVisibilidadResponse } from '../../types/api.types';
import { proyectosService } from '../../services/proyectos.service';
import { semestresService } from '../../services/semestres.service';
import { materiasService } from '../../services/materias.service';
import { lineasService } from '../../services/lineas.service';
import PageHeader from '../../components/ui/PageHeader';
import BadgeEstado from '../../components/ui/BadgeEstado';
import FilaTablaAcciones from '../../components/ui/FilaTablaAcciones';
import FiltrosProyectos from '../../components/ui/FiltrosProyectos';
import Paginacion from '../../components/ui/Paginacion';
import ModalConfirmacion from '../../components/ui/ModalConfirmacion';
import { useModalConfirmacion } from '../../hooks/useModalConfirmacion';
import { useAlertaContext } from '../../context/AlertaContext';

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
  const [estados, setEstados] = useState<EstadoProyectoResponse[]>([]);
  const [visibilidades, setVisibilidades] = useState<NivelVisibilidadResponse[]>([]);
  const { modalProps, abrirModal } = useModalConfirmacion();
  const { mostrarAlerta } = useAlertaContext();
  const estadosMapRef = useRef<Record<string, number>>({});

  useEffect(() => {
    semestresService.listar({ size: 100 }).then((r) => setSemestres(r.content)).catch(() => {});
    materiasService.listar({ size: 100 }).then((r) => setMaterias(r.content)).catch(() => {});
    lineasService.listar({ size: 100 }).then((r) => setLineas(r.content)).catch(() => {});
    proyectosService.listarEstados()
      .then((lista) => {
        estadosMapRef.current = Object.fromEntries(lista.map((e) => [e.nombre, e.id]));
        setEstados(lista);
      })
      .catch(() => {});
    proyectosService.listarNivelesVisibilidad().then(setVisibilidades).catch(() => {});
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
        resultado = await proyectosService.listarPorEstado(estadosMapRef.current[f.estado] ?? 1, params);
      } else resultado = await proyectosService.listar({ ...params, sort: 'creadoEn,desc' });
      setProyectos(resultado.content);
      setTotalPaginas(resultado.totalPages || 1);
      setTotalElementos(resultado.totalElements);
    } catch {
      setError('Error al cargar los datos.');
      mostrarAlerta({ mensaje: 'Error al cargar los proyectos. Intenta de nuevo.', variante: 'error' });
    } finally {
      setCargando(false);
    }
  }, [mostrarAlerta]);

  useEffect(() => { cargarProyectos(aplicados, pagina); }, [aplicados, pagina, cargarProyectos]);

  const handleEliminar = (proyecto: ProyectoResponse) => {
    abrirModal({
      titulo: 'Eliminar proyecto',
      mensaje: `¿Eliminar el proyecto "${proyecto.titulo}"? Esta acción no se puede deshacer.`,
      labelConfirmar: 'Eliminar',
      variante: 'peligro',
      onConfirmar: async () => {
        try {
          await proyectosService.eliminar(proyecto.id);
          mostrarAlerta({ mensaje: `Proyecto "${proyecto.titulo}" eliminado correctamente.`, variante: 'exito' });
          await cargarProyectos(aplicados, pagina);
        } catch {
          mostrarAlerta({ mensaje: 'No se pudo eliminar el proyecto. Intenta de nuevo.', variante: 'error' });
        }
      },
    });
  };

  const thCls = "text-left text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6B6B6B] px-4 py-3 border-b border-[#EBEBEB]";
  const tdCls = "px-4 py-3.5 border-b border-[#F0F0F0] align-middle";

  return (
    <div>
      <ModalConfirmacion {...modalProps} />
      <p className="text-[11px] font-bold text-[#C0392B] tracking-[0.1em] uppercase mb-1.5">ADMINISTRACIÓN DEL SISTEMA</p>
      <PageHeader
        titulo="Proyectos"
        subtitulo="Gestiona y supervisa todos los proyectos de investigación del programa de Ingeniería de Sistemas."
      />

      <FiltrosProyectos
        valores={filtros}
        onChange={(campo, valor) => setFiltros((prev) => ({ ...prev, [campo]: valor }))}
        onFiltrar={() => { setAplicados(filtros); setPagina(1); }}
        semestres={semestres.map((s) => ({ id: s.id, nombre: s.nombre }))}
        materias={materias.map((m) => ({ id: m.id, nombre: m.nombre }))}
        lineas={lineas.map((l) => ({ id: l.id, nombre: l.nombre }))}
        estados={estados}
        visibilidades={visibilidades}
      />

      <div className="bg-white rounded-lg shadow-sm border border-[#EBEBEB] animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={thCls} style={{ width: '26%' }}>Título del Proyecto</th>
                <th className={thCls} style={{ width: '16%' }}>Integrantes</th>
                <th className={thCls} style={{ width: '18%' }}>Director(es)</th>
                <th className={thCls} style={{ width: '13%' }}>Materia</th>
                <th className={thCls} style={{ width: '18%' }}>Líneas</th>
                <th className={thCls} style={{ width: '9%' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan={6}><div className="text-center py-12 px-5 text-[#6B6B6B]"><p className="text-sm">Cargando...</p></div></td></tr>
              ) : error ? (
                <tr><td colSpan={6}><div className="text-center py-12 px-5 text-[#6B6B6B]"><p className="text-sm">No se pudo cargar los datos.{' '}<button onClick={() => cargarProyectos(aplicados, pagina)} className="text-[#EF4444] font-semibold cursor-pointer bg-transparent border-none">Reintentar</button></p></div></td></tr>
              ) : proyectos.length === 0 ? (
                <tr><td colSpan={6}><div className="text-center py-12 px-5 text-[#6B6B6B]"><p className="text-sm">No hay proyectos registrados</p></div></td></tr>
              ) : (
                proyectos.map((proy) => (
                  <tr key={proy.id} className="hover:bg-[#F8F8F8]">
                    {/* Título */}
                    <td className={tdCls}>
                      <p className="text-[13px] font-medium text-[#111111] leading-tight mb-0.5">{proy.titulo}</p>
                      <span className={`text-[11px] font-medium ${proy.visibilidad === 'solo_metadatos' ? 'text-[#6B6B6B]' : 'text-[#16A34A]'}`}>
                        {VISIBILIDAD_LABEL[proy.visibilidad]}
                      </span>
                    </td>
                    {/* Integrantes */}
                    <td className={tdCls}>
                      {proy.integrantes.length > 0 ? (
                        <div className="flex flex-col gap-0.5">
                          {proy.integrantes.map((m) => (
                            <p key={m.id} className="text-[12px] text-[#3D3D3D] leading-snug">
                              {m.nombre} {m.apellido}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[12px] text-[#9CA3AF]">—</span>
                      )}
                    </td>
                    {/* Director(es) */}
                    <td className={tdCls}>
                      {proy.directores.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          <p className="text-[12px] text-[#3D3D3D] leading-snug">
                            <span className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide mr-1">Dir.</span>
                            {proy.directores[0].nombre} {proy.directores[0].apellido}
                          </p>
                          {proy.directores.slice(1).map((d) => (
                            <p key={d.id} className="text-[12px] text-[#3D3D3D] leading-snug">
                              <span className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide mr-1">Co.</span>
                              {d.nombre} {d.apellido}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[12px] text-[#9CA3AF]">—</span>
                      )}
                    </td>
                    {/* Materia */}
                    <td className={tdCls}>
                      <BadgeEstado variante="materia" label={proy.materia ?? 'Sin materia'} />
                    </td>
                    {/* Líneas */}
                    <td className={tdCls}>
                      {proy.lineas.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {proy.lineas.slice(0, 2).map((l) => (
                            <span key={l.id} className="text-[10px] px-1.5 py-0.5 rounded bg-[#F3F4F6] text-[#6B7280] font-medium">
                              {l.nombre}
                            </span>
                          ))}
                          {proy.lineas.length > 2 && (
                            <span className="text-[10px] text-[#9CA3AF] font-medium">+{proy.lineas.length - 2}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[12px] text-[#9CA3AF]">—</span>
                      )}
                    </td>
                    {/* Acciones */}
                    <td className={tdCls}>
                      <FilaTablaAcciones mostrarEditar={false} onEliminar={() => handleEliminar(proy)} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Paginacion paginaActual={pagina} totalPaginas={Math.max(totalPaginas, 1)} totalRegistros={totalElementos} registrosPorPagina={REGISTROS_POR_PAGINA} labelEntidad="proyectos" onCambiarPagina={setPagina} />
      </div>
    </div>
  );
}
