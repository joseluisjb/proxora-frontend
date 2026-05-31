import { useState, useEffect, useCallback } from 'react';
import type { ProyectoResponse, NivelVisibilidad, SemestreResponse, MateriaResponse, LineaInvestigacionResponse } from '../types/api.types';
import { proyectosService } from '../services/proyectos.service';
import { semestresService } from '../services/semestres.service';
import { materiasService } from '../services/materias.service';
import { lineasService } from '../services/lineas.service';
// MOCK DATA - reemplazado por llamadas reales a los servicios
// import { PROYECTOS_MOCK } from '../mocks/proyectos';
// import { SEMESTRES_MOCK } from '../mocks/semestres';
// import { MATERIAS_MOCK } from '../mocks/materias';
// import { LINEAS_MOCK } from '../mocks/lineas';
import PageHeader from '../components/ui/PageHeader';
import BadgeEstado from '../components/ui/BadgeEstado';
import FilaTablaAcciones from '../components/ui/FilaTablaAcciones';
import FiltrosProyectos from '../components/ui/FiltrosProyectos';
import Paginacion from '../components/ui/Paginacion';
import '../styles/admin-ui.css';
import './AdminProyectos.css';

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

// TODO: el backend no soporta filtros combinados. Implementar cuando
// se agregue un endpoint de búsqueda avanzada.
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
  const [filtros, setFiltros] = useState<FiltrosValores>({
    busqueda: '', semestre: '', materia: '', lineaInvestigacion: '', estado: '', visibilidad: '',
  });
  const [aplicados, setAplicados] = useState<FiltrosValores>(filtros);

  const [proyectos, setProyectos] = useState<ProyectoResponse[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalElementos, setTotalElementos] = useState(0);

  const [semestres, setSemestres] = useState<SemestreResponse[]>([]);
  const [materias, setMaterias] = useState<MateriaResponse[]>([]);
  const [lineas, setLineas] = useState<LineaInvestigacionResponse[]>([]);

  // Carga de opciones para selects de filtros
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

      if (modo === 'busqueda') {
        resultado = await proyectosService.buscar(f.busqueda.trim(), params);
      } else if (modo === 'semestre') {
        resultado = await proyectosService.listarPorSemestre(f.semestre, params);
      } else if (modo === 'materia') {
        resultado = await proyectosService.listarPorMateria(f.materia, params);
      } else if (modo === 'estado') {
        const estadoMap: Record<string, number> = {
          en_desarrollo: 1, finalizado: 2, bajo_revision: 3, retrasado: 4,
        };
        resultado = await proyectosService.listarPorEstado(estadoMap[f.estado] ?? 1, params);
      } else {
        resultado = await proyectosService.listar({ ...params, sort: 'creadoEn,desc' });
      }

      setProyectos(resultado.content);
      setTotalPaginas(resultado.totalPages || 1);
      setTotalElementos(resultado.totalElements);
    } catch {
      setError('Error al cargar los datos. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarProyectos(aplicados, pagina);
  }, [aplicados, pagina, cargarProyectos]);

  const handleCambioFiltro = (campo: string, valor: string) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleFiltrar = () => {
    setAplicados(filtros);
    setPagina(1);
  };

  const handleEliminar = async (proyecto: ProyectoResponse) => {
    if (!window.confirm(
      `¿Eliminar el proyecto "${proyecto.titulo}"? Se eliminará todo lo asociado (versiones, evaluaciones). Esta acción no se puede deshacer.`
    )) return;
    try {
      await proyectosService.eliminar(proyecto.id);
      await cargarProyectos(aplicados, pagina);
    } catch {
      setError('No se pudo eliminar el proyecto. Intenta de nuevo.');
    }
  };

  return (
    <div className="adm-proy">
      <p className="adm-proy__etiqueta">ADMINISTRACIÓN DEL SISTEMA</p>

      <PageHeader
        titulo="Proyectos"
        subtitulo="Gestiona y supervisa todos los proyectos de investigación del programa de Ingeniería de Sistemas."
      />

      <FiltrosProyectos
        valores={filtros}
        onChange={handleCambioFiltro}
        onFiltrar={handleFiltrar}
        semestres={semestres.map((s) => ({ id: s.id, nombre: s.nombre }))}
        materias={materias.map((m) => ({ id: m.id, nombre: m.nombre }))}
        lineas={lineas.map((l) => ({ id: l.id, nombre: l.nombre }))}
      />

      <div className="card">
        {error && (
          <div
            style={{
              background: '#FEF2F2',
              borderLeft: '3px solid #EF4444',
              padding: '12px 16px',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
            role="alert"
          >
            <span style={{ flex: 1 }}>{error}</span>
            <button
              onClick={() => cargarProyectos(aplicados, pagina)}
              style={{ fontWeight: 600, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Reintentar
            </button>
          </div>
        )}

        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th style={{ width: '30%' }}>Título del Proyecto</th>
                <th style={{ width: '15%' }}>Autor Principal</th>
                <th style={{ width: '20%' }}>Director</th>
                <th style={{ width: '15%' }}>Materia</th>
                <th style={{ width: '10%' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={5}>
                    <div className="tabla-vacia">
                      <p style={{ color: 'var(--gris-400)' }}>Cargando...</p>
                    </div>
                  </td>
                </tr>
              ) : proyectos.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="tabla-vacia">
                      <div className="tabla-vacia__icono">
                        <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        </svg>
                      </div>
                      <p>No hay proyectos registrados</p>
                    </div>
                  </td>
                </tr>
              ) : (
                proyectos.map((proy) => {
                  const director = proy.directores[0]
                    ? `${proy.directores[0].nombre} ${proy.directores[0].apellido}${proy.directores.length > 1 ? ` y ${proy.directores.length - 1} más` : ''}`
                    : '—';
                  return (
                    <tr key={proy.id}>
                      <td>
                        <p className="adm-proy__titulo">{proy.titulo}</p>
                        <p className="adm-proy__meta">
                          <span className={`adm-proy__vis adm-proy__vis--${proy.visibilidad === 'solo_metadatos' ? 'privado' : 'publico'}`}>
                            {VISIBILIDAD_LABEL[proy.visibilidad]}
                          </span>
                        </p>
                      </td>
                      <td className="adm-proy__td-texto">
                        {proy.registradoPor.nombre} {proy.registradoPor.apellido}
                      </td>
                      <td className="adm-proy__td-texto">{director}</td>
                      <td>
                        <BadgeEstado variante="materia" label={proy.materia ?? 'Sin materia'} />
                      </td>
                      <td>
                        <FilaTablaAcciones
                          mostrarEditar={false}
                          onEliminar={() => handleEliminar(proy)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Paginacion
          paginaActual={pagina}
          totalPaginas={Math.max(totalPaginas, 1)}
          totalRegistros={totalElementos}
          registrosPorPagina={REGISTROS_POR_PAGINA}
          labelEntidad="proyectos"
          onCambiarPagina={setPagina}
        />
      </div>
    </div>
  );
}
