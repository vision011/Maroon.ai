import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { MailCheck } from "lucide-react";
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
  /** Set when Supabase needs the student to confirm their email first. */
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const result = await signUp({ fullName, internetId, password });
      // Signed in: RootNavigator moves the student on to onboarding.
      if (result.status === "confirm-email") setConfirmEmail(result.email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create your account.");
    } finally {
      setBusy(false);
    }
  }

  if (confirmEmail) {
    return (
      <AuthShell title="Check your inbox" intro="One more step before you can sign in.">
        <div className="flex items-start gap-3">
          <MailCheck className="mt-0.5 size-6 shrink-0 text-primary" />
          <p className="text-sm">
            We sent a confirmation link to <span className="font-semibold">{confirmEmail}</span>.
            Open it on this device to finish setting up your account.
          </p>
        </div>
        <Link to="/login" className={`mt-6 block text-center ${PRIMARY_BUTTON}`}>
          Back to sign in
        </Link>
      </AuthShell>
    );
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
