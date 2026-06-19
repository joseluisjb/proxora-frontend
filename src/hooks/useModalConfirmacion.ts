import { useState, useCallback, useRef } from 'react';
import type { ModalConfirmacionProps, VarianteModal } from '../components/ui/ModalConfirmacion';

interface ConfigModal {
  titulo: string;
  mensaje: string;
  labelConfirmar?: string;
  variante?: VarianteModal;
  onConfirmar: () => Promise<void>;
}

export function useModalConfirmacion() {
  const [abierto, setAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [config, setConfig] = useState<ConfigModal | null>(null);
  const configRef = useRef<ConfigModal | null>(null);

  const abrirModal = useCallback((cfg: ConfigModal) => {
    configRef.current = cfg;
    setConfig(cfg);
    setCargando(false);
    setAbierto(true);
  }, []);

  const cerrarModal = useCallback(() => {
    if (cargando) return;
    setAbierto(false);
  }, [cargando]);

  const confirmarModal = useCallback(async () => {
    const cfg = configRef.current;
    if (!cfg) return;
    setCargando(true);
    try {
      await cfg.onConfirmar();
    } finally {
      setCargando(false);
      setAbierto(false);
    }
  }, []);

  const modalProps: ModalConfirmacionProps = {
    abierto,
    titulo: config?.titulo ?? '',
    mensaje: config?.mensaje ?? '',
    labelConfirmar: config?.labelConfirmar,
    variante: config?.variante,
    cargando,
    onConfirmar: confirmarModal,
    onCancelar: cerrarModal,
  };

  return { modalProps, abrirModal };
}
