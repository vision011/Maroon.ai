import type { AuthError, Session } from "@supabase/supabase-js";
import { requireSupabase, supabase } from "@/lib/supabase";
import { profileService } from "./profileService";
import type { AuthSession, SignUpDetails } from "@/types";

/**
 * Accounts live in Supabase Auth. Internet IDs map to `<id>@umn.edu` emails, and sign-up
 * creates the matching `profiles` row through a database trigger. A session only counts as
 * signed in when that profile row exists.
 */

export type SignUpResult =
  | { status: "signed-in"; session: AuthSession }
  /** Email confirmation is on: the student must open the link before signing in. */
  | { status: "confirm-email"; email: string };

const NO_ACCOUNT = "No account with that Internet ID. Create one first.";

/** Accepts "moha2048" or "moha2048@umn.edu". */
export function normalizeInternetId(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/@umn\.edu$/, "");
}

function friendlyError(error: AuthError): Error {
  switch (error.code) {
    case "invalid_credentials":
      // Supabase doesn't reveal whether the account exists, so cover both cases.
      return new Error(
        "That Internet ID and password don't match. New here? Create an account first.",
      );
    case "email_not_confirmed":
      return new Error("Confirm your email first. Check your UMN inbox for the link.");
    case "user_already_exists":
      return new Error("An account with that Internet ID already exists. Sign in instead.");
    case "weak_password":
      return new Error("Choose a stronger password (at least 8 characters).");
    default:
      return new Error(error.message);
  }
}

/** Pairs a Supabase session with its profile, or signs out if the profile is missing. */
async function withProfile(session: Session): Promise<AuthSession | null> {
  const student = await profileService.get(session.user.id);
  if (!student) {
    await requireSupabase().auth.signOut();
    return null;
  }
  return { student, token: session.access_token };
}

export const authService = {
  async getSession(): Promise<AuthSession | null> {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session ? withProfile(data.session) : null;
  },

  /** Calls back when Supabase signs in, refreshes or ends the session. Returns an unsubscribe. */
  onChange(callback: (session: AuthSession | null) => void): () => void {
    if (!supabase) return () => {};
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) return callback(null);
      // Token refreshes don't change the profile; skip the extra query.
      if (event === "TOKEN_REFRESHED") return;
      // Defer: awaiting Supabase calls inside this callback deadlocks the client.
      setTimeout(() => {
        withProfile(session).then(callback, () => callback(null));
      }, 0);
    });
    return () => data.subscription.unsubscribe();
  },

  async signIn(rawInternetId: string, password: string): Promise<AuthSession> {
    const internetId = normalizeInternetId(rawInternetId);
    if (!internetId || !password) throw new Error("Enter your Internet ID and password.");

    const { data, error } = await requireSupabase().auth.signInWithPassword({
      email: `${internetId}@umn.edu`,
      password,
    });
    if (error) throw friendlyError(error);
    const session = await withProfile(data.session);
    if (!session) throw new Error(NO_ACCOUNT);
    return session;
  },

  async signUp(details: SignUpDetails): Promise<SignUpResult> {
    const internetId = normalizeInternetId(details.internetId);
    const fullName = details.fullName.trim();
    if (!fullName) throw new Error("Enter your full name.");
    if (!/^[a-z0-9]{2,32}$/.test(internetId)) {
      throw new Error("Enter your Internet ID, e.g. moha2048.");
    }
    if (details.password.length < 8)
      throw new Error("Use at least 8 characters for your password.");

    const email = `${internetId}@umn.edu`;
    const { data, error } = await requireSupabase().auth.signUp({
      email,
      password: details.password,
      options: {
        // Read by the handle_new_user trigger to fill in the profile.
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/onboarding`,
      },
    });
    if (error) throw friendlyError(error);
    if (!data.session) return { status: "confirm-email", email };

    const session = await withProfile(data.session);
    if (!session) throw new Error("Couldn't create your profile. Try again.");
    return { status: "signed-in", session };
  },

  async signOut(): Promise<void> {
    await supabase?.auth.signOut();
  },
};
