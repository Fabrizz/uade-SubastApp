import { api } from '@/lib/api';
import type { components } from '@/types/api';
import * as SecureStore from 'expo-secure-store';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserCategory = 'comun' | 'especial' | 'plata' | 'oro' | 'platino';

const TOKEN_KEY = 'auth_token';
const USER_KEY  = 'auth_user';

export interface User {
  email: string;
  category?: string;
}

export type PreRegisterBody = components['schemas']['PreRegisterRequest'];

export interface RegisterRequest {
  email: string;
  temporaryPassword: string;
  newPassword: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTokenExpiration(token: string): Date | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? new Date(payload.exp * 1000) : null;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const exp = getTokenExpiration(token);
  return exp ? exp <= new Date() : true;
}

// ─── Context shape ────────────────────────────────────────────────────────────

interface AuthContextValue {
  token: string | null;
  user: User | null;
  tokenExpiration: Date | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  preRegister: (body: PreRegisterBody) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token,     setToken]     = useState<string | null>(null);
  const [user,      setUser]      = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const expirationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSession = useCallback(async () => {
    if (expirationTimer.current) {
      clearTimeout(expirationTimer.current);
      expirationTimer.current = null;
    }
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
    setToken(null);
    setUser(null);
  }, []);

  const scheduleExpiration = useCallback((tok: string) => {
    if (expirationTimer.current) {
      clearTimeout(expirationTimer.current);
      expirationTimer.current = null;
    }
    const exp = getTokenExpiration(tok);
    if (!exp) return;
    const msUntilExpiry = exp.getTime() - Date.now();
    if (msUntilExpiry <= 0) return;
    expirationTimer.current = setTimeout(() => { clearSession(); }, msUntilExpiry);
  }, [clearSession]);

  // Restore session on mount; reject already-expired tokens
  useEffect(() => {
    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          SecureStore.getItemAsync(TOKEN_KEY),
          SecureStore.getItemAsync(USER_KEY),
        ]);
        if (storedToken && !isTokenExpired(storedToken)) {
          setToken(storedToken);
          setUser(storedUser ? JSON.parse(storedUser) : null);
          scheduleExpiration(storedToken);
        } else if (storedToken) {
          await Promise.all([
            SecureStore.deleteItemAsync(TOKEN_KEY),
            SecureStore.deleteItemAsync(USER_KEY),
          ]);
        }
      } finally {
        setIsLoading(false);
      }
    })();

    return () => {
      if (expirationTimer.current) clearTimeout(expirationTimer.current);
    };
  }, [scheduleExpiration]);

  const persistSession = useCallback(async (newToken: string, newUser: User) => {
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, newToken),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(newUser)),
    ]);
    setToken(newToken);
    setUser(newUser);
    scheduleExpiration(newToken);
  }, [scheduleExpiration]);

  // ── Actions ──

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await api.POST('/api/v1/auth/authenticate', {
      body: { email, password },
    });
    if (error || !data?.accessToken) {
      throw new Error('Credenciales incorrectas.');
    }
    await persistSession(data.accessToken, { email, category: data.categoria ?? undefined });
  }, [persistSession]);

  const logout = useCallback(async () => {
    await clearSession();
  }, [clearSession]);

  const preRegister = useCallback(async (body: PreRegisterBody) => {
    const { error } = await api.POST('/api/v1/auth/pre-register', { body });
    if (error) throw new Error('No se pudo completar el pre-registro.');
  }, []);

  const register = useCallback(async (body: RegisterRequest) => {
    const { data, error } = await api.POST('/api/v1/auth/register', {
      body: { email: body.email, temporaryPassword: body.temporaryPassword, newPassword: body.newPassword },
    });
    if (error || !data?.accessToken) {
      throw new Error('No se pudo completar el registro.');
    }
    await persistSession(data.accessToken, { email: body.email, category: data.categoria ?? undefined });
  }, [persistSession]);

  const tokenExpiration = useMemo(() => (token ? getTokenExpiration(token) : null), [token]);

  const value = useMemo<AuthContextValue>(() => ({
    token,
    user,
    tokenExpiration,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout,
    preRegister,
    register,
  }), [token, user, tokenExpiration, isLoading, login, logout, preRegister, register]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export function useAuth() {
  return useAuthContext();
}

export function useProfile() {
  const { user, isAuthenticated, isLoading } = useAuthContext();
  return { profile: user, isAuthenticated, isLoading };
}
