import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lineasService } from '../../services/lineas.service';
import FormularioAdmin, { CampoTexto, CampoTextarea, CampoToggle } from '../../components/ui/FormularioAdmin';
import { useAlertaContext } from '../../context/AlertaContext';
import { extraerMensajeError } from '../../utils/errores';
import ModalConfirmacion from '../../components/ui/ModalConfirmacion';
import { useModalConfirmacion } from '../../hooks/useModalConfirmacion';

interface LineaInvestigacionFormData {
  nombre: string;
  descripcion: string;
  activa: boolean;
}

export default function FormularioLineaInvestigacion() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { mostrarAlerta } = useAlertaContext();
  const { modalProps, abrirModal } = useModalConfirmacion();
  const esEdicion = !!id;

  const [datos, setDatos] = useState<LineaInvestigacionFormData>({
    nombre: '', descripcion: '', activa: true,
  });
  const [errores, setErrores] = useState<Partial<Record<keyof LineaInvestigacionFormData, string>>>({});
  const [cargandoDato, setCargandoDato] = useState(false);

  useEffect(() => {
    if (!esEdicion || !id) return;
    setCargandoDato(true);
    lineasService
      .obtenerPorId(id)
      .then((linea) =>
        setDatos({ nombre: linea.nombre, descripcion: linea.descripcion ?? '', activa: linea.activa })
      )
      .catch((err) => mostrarAlerta({ mensaje: extraerMensajeError(err, 'No se pudo cargar la línea de investigación. Puede haber sido eliminada.'), variante: 'error' }))
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

  const guardar = async () => {
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
      mostrarAlerta({ mensaje: extraerMensajeError(err, 'No se pudo guardar la línea de investigación. Intenta de nuevo.'), variante: 'error' });
    }
  };

  const handleClickGuardar = () => {
    if (!validar()) return;
    const nombre = datos.nombre.trim();
    abrirModal({
      titulo: esEdicion ? 'Confirmar actualización' : 'Confirmar creación',
      mensaje: esEdicion
        ? `¿Deseas guardar los cambios de la línea de investigación "${nombre}"?`
        : `¿Deseas crear la línea de investigación "${nombre}"?`,
      labelConfirmar: esEdicion ? 'Guardar cambios' : 'Crear línea',
      variante: 'advertencia',
      onConfirmar: guardar,
    });
  };

  const breadcrumb = [
    { label: 'Panel' },
    { label: 'Líneas de Investigación', href: '/admin/lineas-investigacion' },
    { label: esEdicion ? 'Editar Línea' : 'Nueva Línea' },
  ];

  if (esEdicion && cargandoDato) {
    return (
      <div className="max-w-[680px] mx-auto animate-fade-in">
        <div className="h-4 w-40 bg-[#F0F0F0] rounded mb-4 animate-pulse" />
        <div className="h-8 w-56 bg-[#F0F0F0] rounded mb-2 animate-pulse" />
        <div className="bg-white rounded-lg shadow-sm border border-[#EBEBEB] p-7 flex flex-col gap-6 mt-6">
          <div className="h-12 bg-[#F3F4F6] rounded-lg animate-pulse" />
          <div className="h-24 bg-[#F3F4F6] rounded-lg animate-pulse" />
          <div className="h-12 bg-[#F3F4F6] rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <>
      <ModalConfirmacion {...modalProps} />
      <FormularioAdmin
        titulo={esEdicion ? 'Editar Línea de Investigación' : 'Nueva Línea de Investigación'}
        breadcrumb={breadcrumb}
        onCancelar={() => navigate('/admin/lineas-investigacion')}
        onGuardar={handleClickGuardar}
      >
        <CampoTexto
          label="Nombre"
          valor={datos.nombre}
          onChange={(v) => handleCampo('nombre', v)}
          placeholder="Ej: Inteligencia Artificial"
          requerido
          error={errores.nombre}
        />
        <CampoTextarea
          label="Descripción"
          valor={datos.descripcion}
          onChange={(v) => handleCampo('descripcion', v)}
          placeholder="Describe brevemente el enfoque y alcance de esta línea de investigación..."
          filas={4}
        />
        <CampoToggle
          label="Estado"
          valor={datos.activa}
          onChange={(v) => handleCampo('activa', v)}
          textoActivo="Activa – visible y disponible para asignar a proyectos"
          textoInactivo="Inactiva – no aparecerá como opción al registrar proyectos"
        />
      </FormularioAdmin>
    </>
  );
}
