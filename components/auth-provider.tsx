"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { User } from "@/lib/types";

const STORAGE_KEY = "av_user";

interface AuthContextValue {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Store externo: `localStorage` + copia en memoria (la app funciona sin persistir si falla).
let raw: string | null = null;
let loaded = false;
const listeners = new Set<() => void>();

function readRaw(): string | null {
  if (!loaded) {
    loaded = true;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch {}
  }
  return raw;
}

function writeRaw(next: string | null) {
  loaded = true;
  raw = next;
  try {
    if (next === null) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, next);
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function parseUser(value: string | null): User | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return typeof parsed?.name === "string" ? { name: parsed.name } : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Servidor e hidratación usan `null`; React re-renderiza con el valor del cliente sin mismatch.
  const stored = useSyncExternalStore(subscribe, readRaw, () => null);
  const user = useMemo(() => parseUser(stored), [stored]);

  const login = useCallback((u: User) => writeRaw(JSON.stringify(u)), []);
  const logout = useCallback(() => writeRaw(null), []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
