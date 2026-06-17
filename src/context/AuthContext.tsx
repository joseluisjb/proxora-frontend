import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface UsuarioSesion {
  id?: string;
  correo: string;
  rol: 'administrador' | 'docente' | 'estudiante' | 'invitado';
  token?: string;
  nombre?: string;
  apellido?: string;
}

interface AuthContextType {
  usuario: UsuarioSesion | null;
  iniciarSesion: (usuario: UsuarioSesion) => void;
  cerrarSesion: () => void;
}

const STORAGE_KEY = 'proxora_usuario';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(() => {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY);
      return guardado ? (JSON.parse(guardado) as UsuarioSesion) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (usuario) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(usuario));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [usuario]);

  const iniciarSesion = (u: UsuarioSesion) => setUsuario(u);
  const cerrarSesion = () => setUsuario(null);

  return (
    <AuthContext.Provider value={{ usuario, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
