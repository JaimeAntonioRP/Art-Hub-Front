"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, type AuthResponse } from "@/lib/api";

type User = AuthResponse["user"];

type AuthState = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    wallet_address?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
};

const STORAGE_KEY = "arthub.auth";

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { user: User; token: string };
        setUser(parsed.user);
        setToken(parsed.token);
      }
    } catch {
      // ignore corrupt storage
    } finally {
      setLoading(false);
    }
  }, []);

  const persist = useCallback((data: AuthResponse | null) => {
    if (data) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setUser(data.user);
      setToken(data.token);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
      setUser(null);
      setToken(null);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await api.login({ email, password });
      persist(data);
    },
    [persist],
  );

  const register = useCallback(
    async (payload: Parameters<AuthState["register"]>[0]) => {
      const data = await api.register(payload);
      persist(data);
    },
    [persist],
  );

  const logout = useCallback(async () => {
    if (token) {
      try {
        await api.logout(token);
      } catch {
        // ignore network errors on logout
      }
    }
    persist(null);
  }, [persist, token]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
