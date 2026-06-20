import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { materiasService } from '../../services/materias.service';
import FormularioAdmin, { CampoTexto, CampoToggle } from '../../components/ui/FormularioAdmin';
import { useAlertaContext } from '../../context/AlertaContext';
import { extraerMensajeError } from '../../utils/errores';
import ModalConfirmacion from '../../components/ui/ModalConfirmacion';
import { useModalConfirmacion } from '../../hooks/useModalConfirmacion';

interface MateriaFormData {
  nombre: string;
  codigo: string;
  activa: boolean;
}

export default function FormularioMateria() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { mostrarAlerta } = useAlertaContext();
  const { modalProps, abrirModal } = useModalConfirmacion();
  const esEdicion = !!id;

  const [datos, setDatos] = useState<MateriaFormData>({ nombre: '', codigo: '', activa: true });
  const [errores, setErrores] = useState<Partial<Record<keyof MateriaFormData, string>>>({});
  const [cargandoDato, setCargandoDato] = useState(false);

  useEffect(() => {
    if (!esEdicion || !id) return;
    setCargandoDato(true);
    materiasService
      .obtenerPorId(id)
      .then((mat) =>
        setDatos({ nombre: mat.nombre, codigo: mat.codigo ?? '', activa: mat.activa })
      )
      .catch((err) => mostrarAlerta({ mensaje: extraerMensajeError(err, 'No se pudo cargar la materia. Puede haber sido eliminada.'), variante: 'error' }))
      .finally(() => setCargandoDato(false));
  }, [id, esEdicion, mostrarAlerta]);

  const handleCampo = <K extends keyof MateriaFormData>(campo: K, valor: MateriaFormData[K]) => {
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
        await materiasService.actualizar(id, {
          nombre: datos.nombre.trim(),
          codigo: datos.codigo.trim() || undefined,
          activa: datos.activa,
        });
      } else {
        await materiasService.crear({
          nombre: datos.nombre.trim(),
          codigo: datos.codigo.trim() || undefined,
          activa: datos.activa,
          creadoPor: obtenerUsuarioId(),
        });
      }
      mostrarAlerta({ mensaje: esEdicion ? 'Materia actualizada correctamente.' : 'Materia creada correctamente.', variante: 'exito' });
      navigate('/admin/materias');
    } catch (err: unknown) {
      mostrarAlerta({ mensaje: extraerMensajeError(err, 'No se pudo guardar la materia. Intenta de nuevo.'), variante: 'error' });
    }
  };

  const handleClickGuardar = () => {
    if (!validar()) return;
    const nombre = datos.nombre.trim();
    abrirModal({
      titulo: esEdicion ? 'Confirmar actualización' : 'Confirmar creación',
      mensaje: esEdicion
        ? `¿Deseas guardar los cambios de la materia "${nombre}"?`
        : `¿Deseas crear la materia "${nombre}"?`,
      labelConfirmar: esEdicion ? 'Guardar cambios' : 'Crear materia',
      variante: 'advertencia',
      onConfirmar: guardar,
    });
  };

  const breadcrumb = [
    { label: 'Panel' },
    { label: 'Materias', href: '/admin/materias' },
    { label: esEdicion ? 'Editar Materia' : 'Nueva Materia' },
  ];

  if (esEdicion && cargandoDato) {
    return (
      <div className="max-w-[680px] mx-auto animate-fade-in">
        <div className="h-4 w-40 bg-[#F0F0F0] rounded mb-4 animate-pulse" />
        <div className="h-8 w-56 bg-[#F0F0F0] rounded mb-2 animate-pulse" />
        <div className="h-4 w-72 bg-[#F0F0F0] rounded mb-6 animate-pulse" />
        <div className="bg-white rounded-lg shadow-sm border border-[#EBEBEB] p-7 flex flex-col gap-6">
          <div className="h-12 bg-[#F3F4F6] rounded-lg animate-pulse" />
          <div className="h-12 bg-[#F3F4F6] rounded-lg animate-pulse" />
          <div className="h-12 bg-[#F3F4F6] rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <>
      <ModalConfirmacion {...modalProps} />
      <FormularioAdmin
        titulo={esEdicion ? 'Editar Materia' : 'Nueva Materia'}
        subtitulo="Administra el catálogo de asignaturas del programa académico."
        breadcrumb={breadcrumb}
        onCancelar={() => navigate('/admin/materias')}
        onGuardar={handleClickGuardar}
      >
        <CampoTexto
          label="Nombre"
          valor={datos.nombre}
          onChange={(v) => handleCampo('nombre', v)}
          placeholder="Ej: Seminario Integrador I"
          requerido
          error={errores.nombre}
        />
        <CampoTexto
          label="Código"
          valor={datos.codigo}
          onChange={(v) => handleCampo('codigo', v)}
          placeholder="Ej: SI-401"
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
