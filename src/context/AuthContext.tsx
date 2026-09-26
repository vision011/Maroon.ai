import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthSession, Student } from "@/types";

const STORAGE_KEY = "umn.auth.session";

const MOCK_STUDENT: Student = {
  name: "Salah Mohamoud",
  studentId: "1234567",
  email: "mohamoud@umn.edu",
  program: "B.S. Computer Science",
};

export interface AuthContextValue {
  student: Student | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (internetId: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Read persisted token after hydration to avoid SSR mismatches.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setSession(JSON.parse(raw) as AuthSession);
    } catch {
      /* ignore corrupt storage */
    }
    setIsReady(true);
  }, []);

  const login = useCallback(async (internetId: string) => {
    // TODO: replace with real UMN SSO exchange.
    const next: AuthSession = {
      student: { ...MOCK_STUDENT, email: `${internetId || "mohamoud"}@umn.edu` },
      token: `mock-token-${Date.now()}`,
    };
    setSession(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      student: session?.student ?? null,
      token: session?.token ?? null,
      isAuthenticated: Boolean(session),
      isReady,
      login,
      logout,
    }),
    [session, isReady, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
