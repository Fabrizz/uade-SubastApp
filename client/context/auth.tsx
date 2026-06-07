import { api } from '@/lib/api';
import type { components } from '@/types/api';
import * as SecureStore from 'expo-secure-store';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
export type UserCategory = 'comun' | 'especial' | 'plata' | 'oro' | 'platino' | 'admin';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export interface User {
  email: string;
  name?: string;
  category?: UserCategory;
  id?: number;
}

export type PreRegisterBody = components['schemas']['PreRegisterRequest'];

export interface RegisterRequest {
  email: string;
  temporaryPassword: string;
  newPassword: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function base64Decode(str: string): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let padded = str;
  while (padded.length % 4 !== 0) {
    padded += "=";
  }
  let result = "";
  for (let i = 0; i < padded.length; i += 4) {
    const code1 = chars.indexOf(padded.charAt(i));
    const code2 = chars.indexOf(padded.charAt(i + 1));
    const code3 = chars.indexOf(padded.charAt(i + 2));
    const code4 = chars.indexOf(padded.charAt(i + 3));

    const byte1 = (code1 << 2) | (code2 >> 4);
    const byte2 = ((code2 & 15) << 4) | (code3 >> 2);
    const byte3 = ((code3 & 3) << 6) | code4;

    result += String.fromCharCode(byte1);
    if (padded.charAt(i + 2) !== "=") {
      result += String.fromCharCode(byte2);
    }
    if (padded.charAt(i + 3) !== "=") {
      result += String.fromCharCode(byte3);
    }
  }
  return result;
}

function getTokenExpiration(token: string): Date | null {
  try {
    const payload = JSON.parse(base64Decode(token.split('.')[1]));
    return payload.exp ? new Date(payload.exp * 1000) : null;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const exp = getTokenExpiration(token);
  return exp ? exp <= new Date() : true;
}

function getTokenId(token: string): number | null {
  try {
    const payload = JSON.parse(base64Decode(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    const raw = payload.id;
    if (typeof raw === 'number') return raw;
    if (typeof raw === 'string') { const n = parseInt(raw, 10); return isNaN(n) ? null : n; }
    return null;
  } catch {
    return null;
  }
}

async function syncPersona(tok: string, base: User): Promise<User> {
  const id = base.id ?? getTokenId(tok);
  if (!id) return base;
  try {
    const { data } = await api.GET('/api/v1/personas/{id}', {
      params: { path: { id } },
      headers: { Authorization: `Bearer ${tok}` },
    });
    if (!data) return base;
    return {
      ...base,
      id,
      name:     data.nombre   ?? base.name,
      category: (data.categoria as UserCategory) ?? base.category,
    };
  } catch {
    return base;
  }
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
  refreshUser: () => Promise<void>;
  hasPaymentMethod: boolean;
  completePaymentSetup: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPaymentMethod, setHasPaymentMethod] = useState<boolean>(true);
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
    setHasPaymentMethod(true);
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
          const parsed: User | null = storedUser ? JSON.parse(storedUser) : null;
          const base: User = parsed
            ? { ...parsed, id: parsed.id ?? getTokenId(storedToken) ?? undefined }
            : { email: '', id: getTokenId(storedToken) ?? undefined };
          const fresh = await syncPersona(storedToken, base);
          setToken(storedToken);
          setUser(fresh);
          if (fresh.name !== parsed?.name || fresh.category !== parsed?.category)
            await SecureStore.setItemAsync(USER_KEY, JSON.stringify(fresh));
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
    const base: User = { email, category: data.categoria as UserCategory ?? undefined, id: getTokenId(data.accessToken) ?? undefined };
    await persistSession(data.accessToken, await syncPersona(data.accessToken, base));
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
    const base: User = { email: body.email, category: data.categoria as UserCategory ?? undefined, id: getTokenId(data.accessToken) ?? undefined };
    await persistSession(data.accessToken, await syncPersona(data.accessToken, base));
  }, [persistSession]);

  const refreshUser = useCallback(async () => {
    if (!token || !user) return;
    const fresh = await syncPersona(token, user);
    setUser(fresh);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(fresh));
  }, [token, user]);

  const completePaymentSetup = useCallback(async () => {
    // FILL HERE
  }, [user]);

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
    refreshUser,
    hasPaymentMethod,
    completePaymentSetup,
  }), [token, user, tokenExpiration, isLoading, login, logout, preRegister, register, refreshUser, hasPaymentMethod, completePaymentSetup]);

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