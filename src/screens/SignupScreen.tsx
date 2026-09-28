import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AuthShell,
  FormError,
  INPUT,
  PasswordField,
  PRIMARY_BUTTON,
} from "@/components/Auth/AuthShell";
import { useAuth } from "@/hooks/useAuth";

export function SignupScreen() {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [internetId, setInternetId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      // Signed in: RootNavigator moves the student on to onboarding.
      await signUp({ fullName, internetId, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create your account.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Join Maroon.ai"
      intro="Create an account with your UMN Internet ID. It takes about a minute."
    >
      <form onSubmit={onSubmit} noValidate>
        <label htmlFor="fullName" className="eyebrow">
          Full name
        </label>
        <input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
          className={`mt-2 ${INPUT}`}
        />

        <label htmlFor="internetId" className="eyebrow mt-5 block">
          Internet ID
        </label>
        <div className="relative mt-2">
          <input
            id="internetId"
            value={internetId}
            onChange={(e) => setInternetId(e.target.value)}
            placeholder="moha2048"
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="username"
            className={`${INPUT} pr-24`}
          />
          <span className="pointer-events-none absolute inset-y-0 right-4 grid place-items-center text-sm text-muted-foreground">
            @umn.edu
          </span>
        </div>

        <label htmlFor="password" className="eyebrow mt-5 block">
          Password
        </label>
        <PasswordField value={password} onChange={setPassword} autoComplete="new-password" />
        <p className="mt-2 text-xs text-muted-foreground">
          At least 8 characters. Don't reuse your UMN password.
        </p>

        <FormError message={error} />

        <button type="submit" disabled={busy} className={`mt-5 ${PRIMARY_BUTTON}`}>
          {busy ? "Creating account…" : "Create account"}
        </button>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
