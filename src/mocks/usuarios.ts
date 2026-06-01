import type { Usuario } from '../types/admin';

export const USUARIOS_MOCK: Usuario[] = [
  {
    id: 'u1',
    nombre: 'Alejandro',
    apellido: 'Martínez',
    correo: 'a.martinez@ufps.edu.co',
    rol: 'docente',
    estado: 'activo',
  },
  {
    id: 'u2',
    nombre: 'Elena',
    apellido: 'Rodríguez',
    correo: 'elena.rod@ufps.edu.co',
    rol: 'estudiante',
    estado: 'activo',
    imagenUrl: 'https://i.pravatar.cc/80?img=5',
  },
  {
    id: 'u3',
    nombre: 'Ricardo',
    apellido: 'Castro',
    correo: 'r.castro@ufps.edu.co',
    rol: 'administrador',
    estado: 'suspendido',
  },
  {
    id: 'u4',
    nombre: 'Sofía',
    apellido: 'Valencia',
    correo: 's.valencia@ufps.edu.co',
    rol: 'docente',
    estado: 'activo',
    imagenUrl: 'https://i.pravatar.cc/80?img=9',
  },
  {
    id: 'u5',
    nombre: 'Carlos',
    apellido: 'Herrera',
    correo: 'c.herrera@ufps.edu.co',
    rol: 'estudiante',
    estado: 'activo',
  },
];
