import { useState, useCallback, useRef } from 'react';
import type { AlertaProps, VarianteAlerta } from '../components/ui/Alerta';

interface ConfigAlerta {
  mensaje: string;
  variante?: VarianteAlerta;
  duracion?: number;
}

export function useAlerta() {
  const [abierto, setAbierto] = useState(false);
  const [config, setConfig] = useState<ConfigAlerta>({ mensaje: '' });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mostrarAlerta = useCallback((cfg: ConfigAlerta) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setConfig(cfg);
    setAbierto(true);
    const duracion = cfg.duracion ?? 4000;
    timerRef.current = setTimeout(() => setAbierto(false), duracion);
  }, []);

  const cerrarAlerta = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setAbierto(false);
  }, []);

  const alertaProps: AlertaProps = {
    abierto,
    mensaje: config.mensaje,
    variante: config.variante,
    onCerrar: cerrarAlerta,
  };

  return { alertaProps, mostrarAlerta };
}
