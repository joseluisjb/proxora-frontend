import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { materiasService } from '../services/materias.service';
// MOCK DATA - reemplazado por llamada real a materiasService
// import { MATERIAS_MOCK } from '../mocks/materias';
import FormularioAdmin, { CampoTexto, CampoToggle } from '../components/ui/FormularioAdmin';

interface MateriaFormData {
  nombre: string;
  codigo: string;
  activa: boolean;
}

export default function FormularioMateria() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const esEdicion = !!id;

  const [datos, setDatos] = useState<MateriaFormData>({ nombre: '', codigo: '', activa: true });
  const [errores, setErrores] = useState<Partial<Record<keyof MateriaFormData, string>>>({});
  const [guardando, setGuardando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [cargandoDato, setCargandoDato] = useState(false);

  useEffect(() => {
    if (!esEdicion || !id) return;
    setCargandoDato(true);
    materiasService
      .obtenerPorId(id)
      .then((mat) =>
        setDatos({ nombre: mat.nombre, codigo: mat.codigo ?? '', activa: mat.activa })
      )
      .catch(() => setErrorGeneral('No se pudo cargar la materia. Puede haber sido eliminada.'))
      .finally(() => setCargandoDato(false));
  }, [id, esEdicion]);

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

  const handleGuardar = async () => {
    if (!validar()) return;
    setGuardando(true);
    setErrorGeneral(null);
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
      navigate('/admin/materias');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
      setErrorGeneral(
        axiosErr.response?.data?.message ?? 'No se pudo guardar la materia. Intenta de nuevo.'
      );
    } finally {
      setGuardando(false);
    }
  };

  const breadcrumb = [
    { label: 'Panel' },
    { label: 'Materias', href: '/admin/materias' },
    { label: esEdicion ? 'Editar Materia' : 'Nueva Materia' },
  ];

  return (
    <FormularioAdmin
      titulo={esEdicion ? 'Editar Materia' : 'Nueva Materia'}
      subtitulo="Administra el catálogo de asignaturas del programa académico."
      breadcrumb={breadcrumb}
      onCancelar={() => navigate('/admin/materias')}
      onGuardar={handleGuardar}
      guardando={guardando}
    >
      {errorGeneral && (
        <div
          style={{
            background: '#FEF2F2',
            borderLeft: '3px solid #EF4444',
            padding: '12px 16px',
            marginBottom: 16,
          }}
          role="alert"
        >
          {errorGeneral}
        </div>
      )}
      <CampoTexto
        label="Nombre"
        valor={datos.nombre}
        onChange={(v) => handleCampo('nombre', v)}
        placeholder={cargandoDato ? 'Cargando...' : 'Ej: Seminario Integrador I'}
        requerido
        error={errores.nombre}
        disabled={cargandoDato}
      />
      <CampoTexto
        label="Código"
        valor={datos.codigo}
        onChange={(v) => handleCampo('codigo', v)}
        placeholder={cargandoDato ? 'Cargando...' : 'Ej: SI-401'}
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
