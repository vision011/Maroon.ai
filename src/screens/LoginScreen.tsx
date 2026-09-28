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

export function LoginScreen() {
  const { login } = useAuth();
  const [internetId, setInternetId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(internetId, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign you in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Maroon.ai"
      intro="Assignments, balances and club events — gathered into a single feed that reorders itself around what matters today."
    >
      <form onSubmit={onSubmit} noValidate>
        <label htmlFor="internetId" className="eyebrow">
          Internet ID
        </label>
        <input
          id="internetId"
          value={internetId}
          onChange={(e) => setInternetId(e.target.value)}
          placeholder="X500"
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="username"
          className={`mt-2 ${INPUT}`}
        />

        <label htmlFor="password" className="eyebrow mt-5 block">
          Password
        </label>
        <PasswordField value={password} onChange={setPassword} autoComplete="current-password" />

        <FormError message={error} />

        <button type="submit" disabled={busy} className={`mt-5 ${PRIMARY_BUTTON}`}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          New to Maroon.ai?{" "}
          <Link to="/signup" className="font-semibold text-primary">
            Create an account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
