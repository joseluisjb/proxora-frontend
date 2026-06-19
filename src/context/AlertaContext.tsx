import { createContext, useContext } from 'react';
import type { VarianteAlerta } from '../components/ui/Alerta';

interface MostrarAlertaParams {
  mensaje: string;
  variante?: VarianteAlerta;
  duracion?: number;
}

interface AlertaContextValue {
  mostrarAlerta: (params: MostrarAlertaParams) => void;
}

export const AlertaContext = createContext<AlertaContextValue>({ mostrarAlerta: () => {} });

export function useAlertaContext() {
  return useContext(AlertaContext);
}
