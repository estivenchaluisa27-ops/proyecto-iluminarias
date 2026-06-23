/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { onAuthChange, login as fbLogin, logout as fbLogout, register as fbRegister } from '../services/auth.service';

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthChange((u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string) => {
    await fbLogin(email, password);
  };

  const register = async (email: string, password: string) => {
    await fbRegister(email, password);
  };

  const logout = async () => {
    await fbLogout();
  };

  return (
    <AuthContext value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext>
  );
}
