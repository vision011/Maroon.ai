import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { authService, type SignUpResult } from "@/services/authService";
import { profileService } from "@/services/profileService";
import type { AuthSession, ProfileUpdate, SignUpDetails, Student } from "@/types";

export interface AuthContextValue {
  student: Student | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  /** Signed in but hasn't finished onboarding yet. */
  needsOnboarding: boolean;
  login: (internetId: string, password: string) => Promise<void>;
  signUp: (details: SignUpDetails) => Promise<SignUpResult>;
  updateProfile: (update: ProfileUpdate) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Restore the Supabase session after hydration to avoid SSR mismatches.
  useEffect(() => {
    let active = true;
    authService
      .getSession()
      .then((restored) => {
        if (active) setSession(restored);
      })
      .catch(() => {
        /* treat an unreadable session as signed out */
      })
      .finally(() => {
        if (active) setIsReady(true);
      });
    const unsubscribe = authService.onChange((next) => {
      if (active) setSession(next);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (internetId: string, password: string) => {
    setSession(await authService.signIn(internetId, password));
  }, []);

  const signUp = useCallback(async (details: SignUpDetails) => {
    const result = await authService.signUp(details);
    if (result.status === "signed-in") setSession(result.session);
    return result;
  }, []);

  const studentId = session?.student.id;
  const updateProfile = useCallback(
    async (update: ProfileUpdate) => {
      if (!studentId) throw new Error("You're signed out. Sign in again.");
      const student = await profileService.update(studentId, update);
      setSession((current) => (current ? { ...current, student } : current));
    },
    [studentId],
  );

  const logout = useCallback(() => {
    setSession(null);
    void authService.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      student: session?.student ?? null,
      token: session?.token ?? null,
      isAuthenticated: Boolean(session),
      isReady,
      needsOnboarding: Boolean(session && !session.student.onboardedAt),
      login,
      signUp,
      updateProfile,
      logout,
    }),
    [session, isReady, login, signUp, updateProfile, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
