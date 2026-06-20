import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { semestresService } from '../../services/semestres.service';
// MOCK DATA - reemplazado por llamada real a semestresService
// import { SEMESTRES_MOCK } from '../../mocks/semestres';
import FormularioAdmin, { CampoTexto, CampoToggle } from '../../components/ui/FormularioAdmin';
import { useAlertaContext } from '../../context/AlertaContext';

interface SemestreFormData {
  nombre: string;
  activo: boolean;
}

const PATRON_SEMESTRE = /^\d{4}-[12]$/;

export default function FormularioSemestre() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { mostrarAlerta } = useAlertaContext();
  const esEdicion = !!id;

  const [datos, setDatos] = useState<SemestreFormData>({ nombre: '', activo: true });
  const [errores, setErrores] = useState<Partial<Record<keyof SemestreFormData, string>>>({});
  const [guardando, setGuardando] = useState(false);
  const [cargandoDato, setCargandoDato] = useState(false);

  useEffect(() => {
    if (!esEdicion || !id) return;
    setCargandoDato(true);
    semestresService
      .obtenerPorId(id)
      .then((sem) => setDatos({ nombre: sem.nombre, activo: sem.activo }))
      .catch(() => mostrarAlerta({ mensaje: 'No se pudo cargar el semestre. Puede haber sido eliminado.', variante: 'error' }))
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

  const handleGuardar = async () => {
    if (!validar()) return;
    setGuardando(true);
    try {
      if (esEdicion && id) {
        await semestresService.actualizar(id, { nombre: datos.nombre.trim(), activo: datos.activo });
      } else {
        await semestresService.crear({ nombre: datos.nombre.trim(), activo: datos.activo });
      }
      mostrarAlerta({ mensaje: esEdicion ? 'Semestre actualizado correctamente.' : 'Semestre creado correctamente.', variante: 'exito' });
      navigate('/admin/semestres');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
      if (axiosErr.response?.status === 400) {
        setErrores({ nombre: 'El servidor rechazó el formato. Usa YYYY-1 o YYYY-2.' });
      } else {
        mostrarAlerta({ mensaje: axiosErr.response?.data?.message ?? 'No se pudo guardar el semestre. Intenta de nuevo.', variante: 'error' });
      }
    } finally {
      setGuardando(false);
    }
  };

  const breadcrumb = [
    { label: 'Panel' },
    { label: 'Semestres', href: '/admin/semestres' },
    { label: esEdicion ? 'Editar Semestre' : 'Nuevo Semestre' },
  ];

  return (
    <FormularioAdmin
      titulo={esEdicion ? 'Editar Semestre' : 'Nuevo Semestre'}
      subtitulo="Administra los semestres académicos."
      breadcrumb={breadcrumb}
      onCancelar={() => navigate('/admin/semestres')}
      onGuardar={handleGuardar}
      guardando={guardando}
    >
      <CampoTexto
        label="Nombre del semestre"
        valor={cargandoDato ? '' : datos.nombre}
        onChange={(v) => handleCampo('nombre', v)}
        placeholder={cargandoDato ? 'Cargando...' : 'Ej: 2026-1'}
        requerido
        error={errores.nombre}
        disabled={cargandoDato}
      />
      <CampoToggle
        label="Estado"
        valor={datos.activo}
        onChange={(v) => handleCampo('activo', v)}
        textoActivo="Activo – periodo académico vigente"
        textoInactivo="Inactivo – periodo académico cerrado o histórico"
        disabled={cargandoDato}
      />
    </FormularioAdmin>
  );
}
