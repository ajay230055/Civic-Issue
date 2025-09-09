import React from 'react';
import { AuthRole } from '../types';

interface AuthState {
  token: string | null;
  role: AuthRole | null;
  username: string | null;
}

interface AuthContextType extends AuthState {
  login: (data: { token: string; role: AuthRole; username?: string | null }) => void;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'auth_state';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = React.useState<AuthState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { token: null, role: null, username: null };
      return JSON.parse(raw);
    } catch {
      return { token: null, role: null, username: null };
    }
  });

  const login = (data: { token: string; role: AuthRole; username?: string | null }) => {
    const next: AuthState = { token: data.token, role: data.role, username: data.username ?? null };
    setState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const logout = () => {
    const next: AuthState = { token: null, role: null, username: null };
    setState(next);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value: AuthContextType = { ...state, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};


