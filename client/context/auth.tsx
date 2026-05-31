import * as SecureStore from 'expo-secure-store';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'https://cly-subastapp.fabriziob.com/';

// TODO: replace with auto-generated type from backend
export type UserCategory = 'comun' | 'especial' | 'plata' | 'oro' | 'platino';
const TOKEN_KEY = 'auth_token';
const USER_KEY  = 'auth_user';

export interface User {
  email: string;
  category?: string;
}

export interface AuthenticationResponse {
  token?: string;
  category?: string;
  message?: string;
}

export interface PreRegisterResponse {
  message?: string;
}

export interface RegisterRequest {
  email: string;
  temporaryPassword: string;
  password: string;
}

// ─── Context shape ────────────────────────────────────────────────────────────

interface AuthContextValue {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Step 1: send user data (FormData), backend emails a temp password. */
  preRegister: (formData: FormData) => Promise<PreRegisterResponse>;
  /** Step 2: confirm registration with temp password + choose final password. */
  register: (data: RegisterRequest) => Promise<void>;
  /** Returns true if the email is available (not yet registered). */
  checkEmail: (email: string) => Promise<boolean>;
}

// ─── Context + helpers ────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

async function post<T>(path: string, body: object | FormData, token?: string | null): Promise<{ ok: boolean; status: number; data: T }> {
  const isFormData = body instanceof FormData;
  const headers: Record<string, string> = {};
  if (!isFormData) headers['Content-Type'] = 'application/json';
  if (token)       headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: isFormData ? body : JSON.stringify(body),
  });

  let data: T;
  try { data = await res.json(); } catch { data = {} as T; }
  return { ok: res.ok, status: res.status, data };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token,     setToken]     = useState<string | null>(null);
  const [user,      setUser]      = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          SecureStore.getItemAsync(TOKEN_KEY),
          SecureStore.getItemAsync(USER_KEY),
        ]);
        if (storedToken) {
          setToken(storedToken);
          setUser(storedUser ? JSON.parse(storedUser) : null);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const persistSession = useCallback(async (newToken: string, newUser: User) => {
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, newToken),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(newUser)),
    ]);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const clearSession = useCallback(async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
    setToken(null);
    setUser(null);
  }, []);

  // ── Actions ──

  const login = useCallback(async (email: string, password: string) => {
    const { ok, data } = await post<AuthenticationResponse>(
      '/api/v1/auth/authenticate',
      { email, password },
    );
    if (!ok || !data.token) {
      throw new Error(data.message ?? 'Credenciales incorrectas.');
    }
    await persistSession(data.token, { email, category: data.category });
  }, [persistSession]);

  const logout = useCallback(async () => {
    await clearSession();
  }, [clearSession]);

  const preRegister = useCallback(async (formData: FormData): Promise<PreRegisterResponse> => {
    const { ok, data } = await post<PreRegisterResponse>('/api/v1/auth/pre-register', formData);
    if (!ok) throw new Error(data.message ?? 'No se pudo completar el pre-registro.');
    return data;
  }, []);

  const register = useCallback(async (body: RegisterRequest) => {
    const { ok, data } = await post<AuthenticationResponse>('/api/v1/auth/register', body);
    if (!ok || !data.token) {
      throw new Error(data.message ?? 'No se pudo completar el registro.');
    }
    await persistSession(data.token, { email: body.email, category: data.category });
  }, [persistSession]);

  const checkEmail = useCallback(async (email: string): Promise<boolean> => {
    const { status } = await post<unknown>('/api/v1/auth/check', { email });
    if (status === 200)  return true;   // available
    if (status === 409)  return false;  // already in use
    throw new Error('Error al verificar el correo.');
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    token,
    user,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout,
    preRegister,
    register,
    checkEmail,
  }), [token, user, isLoading, login, logout, preRegister, register, checkEmail]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

/** Auth actions + session state. */
export function useAuth() {
  const { token, user, isAuthenticated, isLoading, login, logout, preRegister, register, checkEmail } = useAuthContext();
  return { token, user, isAuthenticated, isLoading, login, logout, preRegister, register, checkEmail };
}

/** User profile data only. */
export function useProfile() {
  const { user, isAuthenticated, isLoading } = useAuthContext();
  return { profile: user, isAuthenticated, isLoading };
}
