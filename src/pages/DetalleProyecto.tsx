import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { ProyectoResponse, VersionDocumentoResponse } from '../types/api.types';
import { proyectosService } from '../services/proyectos.service';
import NavbarPublica from '../components/layout/NavbarPublica';
import AvatarIniciales from '../components/ui/AvatarIniciales';
import './DetalleProyecto.css';

type EstadoProyecto = ProyectoResponse['estado'];
type NivelVisibilidad = ProyectoResponse['visibilidad'];

const ESTADO_CONFIG: Record<EstadoProyecto, { label: string; clase: string }> = {
  en_desarrollo: { label: 'En desarrollo', clase: 'dp-badge--amarillo' },
  finalizado:    { label: 'Finalizado',    clase: 'dp-badge--verde' },
  bajo_revision: { label: 'Bajo revisión', clase: 'dp-badge--azul' },
  retrasado:     { label: 'Retrasado',     clase: 'dp-badge--rojo' },
};

const VISIBILIDAD_LABEL: Record<NivelVisibilidad, string> = {
  solo_metadatos:   'Solo metadatos',
  lectura:          'Solo lectura',
  lectura_descarga: 'Lectura y descarga',
};

function formatearFecha(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(iso));
}

function formatearTamano(bytes: number | null): string {
  if (!bytes) return 'Tamaño desconocido';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extensionDeMime(mimeType: string | null, nombreArchivo: string): string {
  if (mimeType?.includes('pdf')) return 'PDF';
  if (mimeType?.includes('word') || mimeType?.includes('openxmlformats')) return 'DOCX';
  const partes = nombreArchivo.split('.');
  return partes.length > 1 ? partes[partes.length - 1].toUpperCase() : 'Archivo';
}

function IconoArchivo({ mimeType }: { mimeType: string | null }) {
  if (mimeType?.includes('pdf')) {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    );
  }
  if (mimeType?.includes('word') || mimeType?.includes('openxmlformats')) {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1E40AF" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    );
  }
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function SkeletonDetalle() {
  return (
    <div className="dp-layout">
      <div className="dp-col-izq">
        <div className="dp-skeleton dp-skeleton--alto" />
        <div className="dp-skeleton dp-skeleton--medio" style={{ marginTop: 16 }} />
      </div>
      <div className="dp-col-der">
        <div className="dp-skeleton dp-skeleton--medio" />
      </div>
    </div>
  );
}

export default function DetalleProyecto() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [proyecto, setProyecto] = useState<ProyectoResponse | null>(null);
  const [versiones, setVersiones] = useState<VersionDocumentoResponse[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorProyecto, setErrorProyecto] = useState<string | null>(null);
  const [errorVersiones, setErrorVersiones] = useState<string | null>(null);
  const [noEncontrado, setNoEncontrado] = useState(false);

  useEffect(() => {
    if (!id) return;

    setCargando(true);
    setErrorProyecto(null);

    Promise.allSettled([
      proyectosService.obtenerPorId(id),
      proyectosService.obtenerVersiones(id),
    ]).then(([resProyecto, resVersiones]) => {
      if (resProyecto.status === 'fulfilled') {
        setProyecto(resProyecto.value);
      } else {
        const err = resProyecto.reason as { response?: { status?: number } };
        if (err.response?.status === 404) {
          setNoEncontrado(true);
        } else {
          setErrorProyecto('No se pudo cargar el proyecto. Intenta de nuevo.');
        }
      }

      if (resVersiones.status === 'fulfilled') {
        setVersiones(resVersiones.value);
      } else {
        setErrorVersiones('No se pudieron cargar los documentos.');
      }

      setCargando(false);
    });
  }, [id]);

  if (noEncontrado) {
    return (
      <div className="dp-page">
        <NavbarPublica />
        <div className="dp-contenedor dp-no-encontrado">
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
          </svg>
          <h2>Proyecto no encontrado</h2>
          <p>El proyecto que buscas no existe o fue eliminado.</p>
          <button type="button" className="dp-btn-volver" onClick={() => navigate('/')}>
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (errorProyecto) {
    return (
      <div className="dp-page">
        <NavbarPublica />
        <div className="dp-contenedor dp-no-encontrado">
          <p className="dp-error-texto">{errorProyecto}</p>
          <button type="button" className="dp-btn-volver" onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dp-page">
      <NavbarPublica />

      <div className="dp-contenedor">
        {/* Volver */}
        <button type="button" className="dp-link-volver" onClick={() => navigate(-1)}>
          ← Volver a la búsqueda
        </button>

        {cargando || !proyecto ? (
          <SkeletonDetalle />
        ) : (
          <div className="dp-layout">
            {/* ── Columna izquierda ── */}
            <div className="dp-col-izq">
              {/* Tarjeta título */}
              <div className="dp-card">
                <span className={`dp-badge ${ESTADO_CONFIG[proyecto.estado].clase}`}>
                  {ESTADO_CONFIG[proyecto.estado].label}
                </span>
                <h1 className="dp-titulo">{proyecto.titulo}</h1>
                <div className="dp-meta-rapida">
                  <span className="dp-vis-badge">{VISIBILIDAD_LABEL[proyecto.visibilidad]}</span>
                  <span className="dp-meta-texto">Registrado el {formatearFecha(proyecto.creadoEn)}</span>
                  {proyecto.semestre && (
                    <span className="dp-meta-texto">Semestre {proyecto.semestre}</span>
                  )}
                </div>
              </div>

              {/* Tarjeta resumen */}
              <div className="dp-card" style={{ marginTop: 16 }}>
                <div className="dp-card-header">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#B91C1C" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h2 className="dp-card-titulo">Resumen del Proyecto</h2>
                </div>
                <p className="dp-resumen-texto">{proyecto.resumen}</p>
              </div>

              {/* Tarjeta versiones */}
              {proyecto.visibilidad === 'solo_metadatos' ? (
                <div className="dp-card dp-card--restringido" style={{ marginTop: 16 }}>
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  <p className="dp-restringido-titulo">Documentos no disponibles públicamente</p>
                  <p className="dp-restringido-sub">
                    Los autores de este proyecto han restringido el acceso a los documentos.
                    Inicia sesión si eres parte del equipo para acceder.
                  </p>
                </div>
              ) : (
                <div className="dp-card" style={{ marginTop: 16 }}>
                  <div className="dp-card-header">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#B91C1C" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <h2 className="dp-card-titulo">Versiones del Documento</h2>
                  </div>

                  {errorVersiones ? (
                    <p className="dp-meta-texto">{errorVersiones}</p>
                  ) : versiones.length === 0 ? (
                    <p className="dp-vacio-texto">Sin documentos disponibles para este proyecto</p>
                  ) : (
                    <ul className="dp-versiones-lista">
                      {versiones.map((ver) => (
                        <li key={ver.id} className="dp-version-fila">
                          <div className="dp-version-izq">
                            <IconoArchivo mimeType={ver.mimeType} />
                            <div>
                              <p className="dp-version-nombre">{ver.etiquetaVersion}</p>
                              <p className="dp-version-meta">
                                {extensionDeMime(ver.mimeType, ver.nombreArchivo)}
                                {' • '}{formatearTamano(ver.tamanoBytes)}
                                {' • Actualizado '}{formatearFecha(ver.creadoEn)}
                              </p>
                            </div>
                          </div>
                          <div className="dp-version-acciones">
                            {/* TODO: conectar con endpoint de URL prefirmada de S3
                                cuando el backend lo implemente (RF33) */}
                            <button
                              type="button"
                              className="dp-btn-ver"
                              onClick={() => alert('Descarga disponible próximamente')}
                              aria-label={`Ver ${ver.etiquetaVersion}`}
                            >
                              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Ver
                            </button>
                            {proyecto.visibilidad === 'lectura_descarga' && (
                              <button
                                type="button"
                                className="dp-btn-descargar"
                                onClick={() => alert('Descarga disponible próximamente')}
                                aria-label={`Descargar ${ver.etiquetaVersion}`}
                              >
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Descargar
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* ── Columna derecha ── */}
            <div className="dp-col-der">
              {/* Información académica */}
              <div className="dp-card">
                <div className="dp-info-seccion">
                  <p className="dp-info-label">MATERIA</p>
                  <p className="dp-info-valor">{proyecto.materia ?? '—'}</p>
                </div>
                <hr className="dp-separador" />
                <div className="dp-info-seccion">
                  <p className="dp-info-label">LÍNEAS DE INVESTIGACIÓN</p>
                  {proyecto.lineas.length === 0 ? (
                    <p className="dp-info-valor">—</p>
                  ) : (
                    <div className="dp-lineas-chips">
                      {proyecto.lineas.map((linea) => (
                        <span key={linea.id} className="dp-linea-chip">{linea.nombre}</span>
                      ))}
                    </div>
                  )}
                </div>
                <hr className="dp-separador" />
                <div className="dp-info-seccion">
                  <p className="dp-info-label">FECHA DE REGISTRO</p>
                  <p className="dp-info-valor">{formatearFecha(proyecto.creadoEn)}</p>
                  {proyecto.semestre && (
                    <p className="dp-info-sub">{proyecto.semestre}</p>
                  )}
                </div>
              </div>

              {/* Equipo */}
              <div className="dp-card" style={{ marginTop: 16 }}>
                <p className="dp-info-label" style={{ marginBottom: 16 }}>EQUIPO DEL PROYECTO</p>

                {proyecto.directores.length > 0 && (
                  <div className="dp-equipo-seccion">
                    <p className="dp-equipo-sublabel">Director</p>
                    {proyecto.directores.map((dir) => (
                      <div key={dir.id} className="dp-miembro-fila">
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#B91C1C" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                        </svg>
                        <div>
                          <p className="dp-miembro-nombre">{dir.nombre} {dir.apellido}</p>
                          <p className="dp-miembro-correo">{dir.correo}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {proyecto.directores.length > 0 && proyecto.integrantes.length > 0 && (
                  <hr className="dp-separador" />
                )}

                {proyecto.integrantes.length > 0 && (
                  <div className="dp-equipo-seccion">
                    <p className="dp-equipo-sublabel">Integrantes</p>
                    {proyecto.integrantes.map((int) => (
                      <div key={int.id} className="dp-miembro-fila">
                        <AvatarIniciales nombre={int.nombre} apellido={int.apellido} tamaño="sm" />
                        <div>
                          <p className="dp-miembro-nombre">{int.nombre} {int.apellido}</p>
                          <p className="dp-miembro-correo">{int.correo}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
