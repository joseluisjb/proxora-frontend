import type { LineaInvestigacion } from '../types/admin';

export const LINEAS_MOCK: LineaInvestigacion[] = [
  {
    id: 'l1',
    nombre: 'Inteligencia Artificial',
    descripcion: 'Algoritmos de aprendizaje automático y redes neuronales aplicados a contextos académicos.',
    creadoEn: '2021-03-15T08:00:00Z',
  },
  {
    id: 'l2',
    nombre: 'Seguridad Informática',
    descripcion: 'Métodos criptográficos, evaluación de vulnerabilidades y gestión de riesgos en sistemas empresariales.',
    creadoEn: '2021-03-15T08:00:00Z',
  },
  {
    id: 'l3',
    nombre: 'Internet de las Cosas (IoT)',
    descripcion: 'Integración de sensores inteligentes y analítica de datos en tiempo real para infraestructura urbana.',
    creadoEn: '2022-01-20T08:00:00Z',
  },
  {
    id: 'l4',
    nombre: 'Computación en la Nube',
    descripcion: 'Arquitecturas distribuidas, servicios en la nube y modelos de despliegue escalables.',
    creadoEn: '2022-06-10T08:00:00Z',
  },
  {
    id: 'l5',
    nombre: 'Ciencia de Datos',
    descripcion: 'Análisis estadístico, visualización y modelos predictivos sobre grandes volúmenes de datos.',
    creadoEn: '2023-01-05T08:00:00Z',
  },
];
