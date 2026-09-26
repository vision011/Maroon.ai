import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export function LoginScreen() {
  const { login } = useAuth();
  const [internetId, setInternetId] = useState("mohamoud");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await login(internetId.trim());
    setBusy(false);
  }

  return (
    <div className="flex min-h-screen flex-col justify-between bg-surface text-surface-foreground">
      <div className="mx-auto w-full max-w-lg px-6 pt-[max(4rem,env(safe-area-inset-top))]">
        <p className="eyebrow text-surface-foreground/60">University of Minnesota</p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight">
          Your campus,
          <br />
          in one place.
        </h1>
        <p className="mt-4 max-w-sm text-sm text-surface-foreground/70">
          Assignments, balances and club events — gathered into a single feed that reorders itself
          around what matters today.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="mx-auto w-full max-w-lg rounded-t-3xl bg-background px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-7 text-foreground"
      >
        <label htmlFor="internetId" className="eyebrow">
          Internet ID
        </label>
        <input
          id="internetId"
          value={internetId}
          onChange={(e) => setInternetId(e.target.value)}
          autoCapitalize="none"
          className="mt-2 w-full rounded-lg border border-input bg-card px-4 py-3 text-base outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={busy}
          className="tap-highlight-none mt-4 w-full rounded-lg bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-opacity active:opacity-80 disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Demo sign-in — no password needed yet.
        </p>
      </form>
    </div>
  );
}
