import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const INPUT =
  "w-full rounded-lg border border-input bg-card px-4 py-3 text-base outline-none focus:ring-2 focus:ring-ring";

export function LoginScreen() {
  const { login } = useAuth();
  const [internetId, setInternetId] = useState("mohamoud");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(internetId.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign you in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface text-surface-foreground">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 pb-10 pt-[max(3rem,env(safe-area-inset-top))]">
        <p className="eyebrow text-accent/80">University of Minnesota</p>
        <h1 className="mt-3 text-6xl font-bold leading-none tracking-tight text-accent">
          Maroon.ai
        </h1>
        <p className="mt-5 max-w-sm text-base text-surface-foreground/75">
          Assignments, balances and club events — gathered into a single feed that reorders itself
          around what matters today.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        noValidate
        className="w-full rounded-t-3xl bg-background pb-[max(2rem,env(safe-area-inset-bottom))] pt-7 text-foreground"
      >
        <div className="mx-auto max-w-lg px-6">
          <label htmlFor="internetId" className="eyebrow">
            Internet ID
          </label>
          <input
            id="internetId"
            value={internetId}
            onChange={(e) => setInternetId(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="username"
            className={`mt-2 ${INPUT}`}
          />

          <label htmlFor="password" className="eyebrow mt-5 block">
            Password
          </label>
          <div className="relative mt-2">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className={`${INPUT} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="tap-highlight-none absolute inset-y-0 right-0 grid w-12 place-items-center text-muted-foreground"
            >
              {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>

          {error ? (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="tap-highlight-none mt-5 w-full rounded-lg bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-opacity active:opacity-80 disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Demo sign-in — any password works for now.
          </p>
        </div>
      </form>
    </div>
  );
}
