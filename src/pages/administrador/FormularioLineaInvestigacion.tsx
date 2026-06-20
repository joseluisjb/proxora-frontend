import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lineasService } from '../../services/lineas.service';
// MOCK DATA - reemplazado por llamada real a lineasService
// import { LINEAS_MOCK } from '../../mocks/lineas';
import FormularioAdmin, { CampoTexto, CampoTextarea, CampoToggle } from '../../components/ui/FormularioAdmin';
import { useAlertaContext } from '../../context/AlertaContext';

interface LineaInvestigacionFormData {
  nombre: string;
  descripcion: string;
  activa: boolean;
}

export default function FormularioLineaInvestigacion() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { mostrarAlerta } = useAlertaContext();
  const esEdicion = !!id;

  const [datos, setDatos] = useState<LineaInvestigacionFormData>({
    nombre: '', descripcion: '', activa: true,
  });
  const [errores, setErrores] = useState<Partial<Record<keyof LineaInvestigacionFormData, string>>>({});
  const [guardando, setGuardando] = useState(false);
  const [cargandoDato, setCargandoDato] = useState(false);

  useEffect(() => {
    if (!esEdicion || !id) return;
    setCargandoDato(true);
    lineasService
      .obtenerPorId(id)
      .then((linea) =>
        setDatos({ nombre: linea.nombre, descripcion: linea.descripcion ?? '', activa: linea.activa })
      )
      .catch(() => mostrarAlerta({ mensaje: 'No se pudo cargar la línea de investigación. Puede haber sido eliminada.', variante: 'error' }))
      .finally(() => setCargandoDato(false));
  }, [id, esEdicion, mostrarAlerta]);

  const handleCampo = <K extends keyof LineaInvestigacionFormData>(
    campo: K,
    valor: LineaInvestigacionFormData[K]
  ) => {
    setDatos((prev) => ({ ...prev, [campo]: valor }));
    if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: undefined }));
  };

  const validar = (): boolean => {
    const nuevos: typeof errores = {};
    if (!datos.nombre.trim()) nuevos.nombre = 'El nombre es obligatorio';
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const obtenerUsuarioId = (): string | undefined => {
    try {
      const raw = localStorage.getItem('proxora_usuario');
      if (raw) return (JSON.parse(raw) as { id?: string }).id;
    } catch {
      // localStorage no disponible
    }
    return undefined;
  };

  const handleGuardar = async () => {
    if (!validar()) return;
    setGuardando(true);
    try {
      if (esEdicion && id) {
        await lineasService.actualizar(id, {
          nombre: datos.nombre.trim(),
          descripcion: datos.descripcion.trim() || undefined,
          activa: datos.activa,
        });
      } else {
        await lineasService.crear({
          nombre: datos.nombre.trim(),
          descripcion: datos.descripcion.trim() || undefined,
          activa: datos.activa,
          creadoPor: obtenerUsuarioId(),
        });
      }
      mostrarAlerta({ mensaje: esEdicion ? 'Línea de investigación actualizada correctamente.' : 'Línea de investigación creada correctamente.', variante: 'exito' });
      navigate('/admin/lineas-investigacion');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
      mostrarAlerta({ mensaje: axiosErr.response?.data?.message ?? 'No se pudo guardar la línea de investigación. Intenta de nuevo.', variante: 'error' });
    } finally {
      setGuardando(false);
    }
  };

  const breadcrumb = [
    { label: 'Panel' },
    { label: 'Líneas de Investigación', href: '/admin/lineas-investigacion' },
    { label: esEdicion ? 'Editar Línea' : 'Nueva Línea' },
  ];

  return (
    <FormularioAdmin
      titulo={esEdicion ? 'Editar Línea de Investigación' : 'Nueva Línea de Investigación'}
      breadcrumb={breadcrumb}
      onCancelar={() => navigate('/admin/lineas-investigacion')}
      onGuardar={handleGuardar}
      guardando={guardando}
    >
      <CampoTexto
        label="Nombre"
        valor={datos.nombre}
        onChange={(v) => handleCampo('nombre', v)}
        placeholder={cargandoDato ? 'Cargando...' : 'Ej: Inteligencia Artificial'}
        requerido
        error={errores.nombre}
        disabled={cargandoDato}
      />
      <CampoTextarea
        label="Descripción"
        valor={datos.descripcion}
        onChange={(v) => handleCampo('descripcion', v)}
        placeholder={cargandoDato ? 'Cargando...' : 'Describe brevemente el enfoque y alcance de esta línea de investigación...'}
        filas={4}
        disabled={cargandoDato}
      />
      <CampoToggle
        label="Estado"
        valor={datos.activa}
        onChange={(v) => handleCampo('activa', v)}
        textoActivo="Activa – visible y disponible para asignar a proyectos"
        textoInactivo="Inactiva – no aparecerá como opción al registrar proyectos"
        disabled={cargandoDato}
      />
    </FormularioAdmin>
  );
}
