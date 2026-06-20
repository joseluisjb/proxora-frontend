import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { semestresService } from '../../services/semestres.service';
import FormularioAdmin, { CampoTexto, CampoToggle } from '../../components/ui/FormularioAdmin';
import { useAlertaContext } from '../../context/AlertaContext';
import { extraerMensajeError } from '../../utils/errores';
import ModalConfirmacion from '../../components/ui/ModalConfirmacion';
import { useModalConfirmacion } from '../../hooks/useModalConfirmacion';

interface SemestreFormData {
  nombre: string;
  activo: boolean;
}

const PATRON_SEMESTRE = /^\d{4}-[12]$/;

export default function FormularioSemestre() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { mostrarAlerta } = useAlertaContext();
  const { modalProps, abrirModal } = useModalConfirmacion();
  const esEdicion = !!id;

  const [datos, setDatos] = useState<SemestreFormData>({ nombre: '', activo: true });
  const [errores, setErrores] = useState<Partial<Record<keyof SemestreFormData, string>>>({});
  const [cargandoDato, setCargandoDato] = useState(false);

  useEffect(() => {
    if (!esEdicion || !id) return;
    setCargandoDato(true);
    semestresService
      .obtenerPorId(id)
      .then((sem) => setDatos({ nombre: sem.nombre, activo: sem.activo }))
      .catch((err) => mostrarAlerta({ mensaje: extraerMensajeError(err, 'No se pudo cargar el semestre. Puede haber sido eliminado.'), variante: 'error' }))
      .finally(() => setCargandoDato(false));
  }, [id, esEdicion, mostrarAlerta]);

  const handleCampo = <K extends keyof SemestreFormData>(campo: K, valor: SemestreFormData[K]) => {
    setDatos((prev) => ({ ...prev, [campo]: valor }));
    if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: undefined }));
  };

  const validar = (): boolean => {
    const nuevos: typeof errores = {};
    if (!datos.nombre.trim()) {
      nuevos.nombre = 'El nombre es obligatorio';
    } else if (!PATRON_SEMESTRE.test(datos.nombre.trim())) {
      nuevos.nombre = 'El formato debe ser YYYY-1 o YYYY-2. Ejemplo: 2026-1';
    }
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const guardar = async () => {
    try {
      if (esEdicion && id) {
        await semestresService.actualizar(id, { nombre: datos.nombre.trim(), activo: datos.activo });
      } else {
        await semestresService.crear({ nombre: datos.nombre.trim(), activo: datos.activo });
      }
      mostrarAlerta({ mensaje: esEdicion ? 'Semestre actualizado correctamente.' : 'Semestre creado correctamente.', variante: 'exito' });
      navigate('/admin/semestres');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } };
      if (axiosErr.response?.status === 400) {
        setErrores({ nombre: 'El servidor rechazó el formato. Usa YYYY-1 o YYYY-2.' });
      } else {
        mostrarAlerta({ mensaje: extraerMensajeError(err, 'No se pudo guardar el semestre. Intenta de nuevo.'), variante: 'error' });
      }
    }
  };

  const handleClickGuardar = () => {
    if (!validar()) return;
    const nombre = datos.nombre.trim();
    abrirModal({
      titulo: esEdicion ? 'Confirmar actualización' : 'Confirmar creación',
      mensaje: esEdicion
        ? `¿Deseas guardar los cambios del semestre "${nombre}"?`
        : `¿Deseas crear el semestre "${nombre}"?`,
      labelConfirmar: esEdicion ? 'Guardar cambios' : 'Crear semestre',
      variante: 'advertencia',
      onConfirmar: guardar,
    });
  };

  const breadcrumb = [
    { label: 'Panel' },
    { label: 'Semestres', href: '/admin/semestres' },
    { label: esEdicion ? 'Editar Semestre' : 'Nuevo Semestre' },
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
        </div>
      </div>
    );
  }

  return (
    <>
      <ModalConfirmacion {...modalProps} />
      <FormularioAdmin
        titulo={esEdicion ? 'Editar Semestre' : 'Nuevo Semestre'}
        subtitulo="Administra los semestres académicos."
        breadcrumb={breadcrumb}
        onCancelar={() => navigate('/admin/semestres')}
        onGuardar={handleClickGuardar}
      >
        <CampoTexto
          label="Nombre del semestre"
          valor={datos.nombre}
          onChange={(v) => handleCampo('nombre', v)}
          placeholder="Ej: 2026-1"
          requerido
          error={errores.nombre}
        />
        <CampoToggle
          label="Estado"
          valor={datos.activo}
          onChange={(v) => handleCampo('activo', v)}
          textoActivo="Activo – periodo académico vigente"
          textoInactivo="Inactivo – periodo académico cerrado o histórico"
        />
      </FormularioAdmin>
    </>
  );
}
