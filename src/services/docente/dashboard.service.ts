import api from '../api'

export interface ResumenDashboardDocente {
  totalProyectos: number
  evaluacionesPendientes: number
}

export const dashboardDocenteService = {
  obtenerResumen: async (idDocente: string): Promise<ResumenDashboardDocente> => {
    const [total, pendientes] = await Promise.all([
      api.get<number>(`/usuarios/${idDocente}/evaluaciones/total`).then((r) => r.data),
      api.get<number>(`/usuarios/${idDocente}/evaluaciones/pendientes`).then((r) => r.data),
    ])
    return { totalProyectos: total, evaluacionesPendientes: pendientes }
  },
}
