import type { ProyectoResponse } from '../types/api.types';

export interface FiltrosProyectosValores {
  busqueda: string;
  semestre: string;
  materia: string;
  lineaInvestigacion: string;
  estado: string;
  visibilidad: string;
}

export function filtrarProyectos(proyectos: ProyectoResponse[], f: FiltrosProyectosValores): ProyectoResponse[] {
  const texto = f.busqueda.trim().toLowerCase();
  return proyectos.filter((p) => {
    if (texto && !p.titulo.toLowerCase().includes(texto)) return false;
    if (f.semestre && p.semestre !== f.semestre) return false;
    if (f.materia && p.materia !== f.materia) return false;
    if (f.estado && p.estado !== f.estado) return false;
    if (f.visibilidad && p.visibilidad !== f.visibilidad) return false;
    if (f.lineaInvestigacion && !p.lineas.some((l) => l.id === f.lineaInvestigacion)) return false;
    return true;
  });
}
