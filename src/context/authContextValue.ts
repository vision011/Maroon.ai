import { createContext } from "react";
import type { ProfileUpdate, SignUpDetails, Student } from "@/types";

/**
 * Kept apart from AuthProvider so Fast Refresh can hot-swap the provider without creating
 * a second context, which leaves screens and RootNavigator reading different sessions.
 */
export interface AuthContextValue {
  student: Student | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  /** Signed in but hasn't finished onboarding yet. */
  needsOnboarding: boolean;
  login: (internetId: string, password: string) => Promise<void>;
  signUp: (details: SignUpDetails) => Promise<void>;
  updateProfile: (update: ProfileUpdate) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
