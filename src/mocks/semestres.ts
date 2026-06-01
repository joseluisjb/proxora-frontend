import type { Semestre } from '../types/admin';

export const SEMESTRES_MOCK: Semestre[] = [
  { id: 's1', nombre: '2026-1', activo: true, creadoEn: '2026-01-10T08:00:00Z' },
  { id: 's2', nombre: '2025-2', activo: false, creadoEn: '2025-07-15T08:00:00Z' },
  { id: 's3', nombre: '2025-1', activo: false, creadoEn: '2025-01-12T08:00:00Z' },
  { id: 's4', nombre: '2024-2', activo: false, creadoEn: '2024-07-20T08:00:00Z' },
  { id: 's5', nombre: '2024-1', activo: false, creadoEn: '2024-01-08T08:00:00Z' },
];
