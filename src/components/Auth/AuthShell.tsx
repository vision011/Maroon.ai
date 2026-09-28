import { useState, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";

export const INPUT =
  "w-full rounded-lg border border-input bg-card px-4 py-3 text-base outline-none focus:ring-2 focus:ring-ring";

export const PRIMARY_BUTTON =
  "tap-highlight-none w-full rounded-lg bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-opacity active:opacity-80 disabled:opacity-60";

/** Maroon hero on top, rounded sheet below. Shared by sign-in, sign-up and onboarding. */
export function AuthShell({
  title,
  intro,
  hero,
  children,
}: {
  title: string;
  intro: ReactNode;
  /** Extra hero content under the intro, e.g. onboarding progress. */
  hero?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface text-surface-foreground">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 pb-10 pt-[max(3rem,env(safe-area-inset-top))]">
        <p className="eyebrow text-accent/80">University of Minnesota</p>
        <h1 className="mt-3 text-6xl font-bold leading-none tracking-tight text-accent">{title}</h1>
        <div className="mt-5 max-w-sm text-base text-surface-foreground/75">{intro}</div>
        {hero}
      </div>

      <div className="w-full rounded-t-3xl bg-background pb-[max(2rem,env(safe-area-inset-bottom))] pt-7 text-foreground">
        <div className="mx-auto max-w-lg px-6">{children}</div>
      </div>
    </div>
  );
}

export function PasswordField({
  value,
  onChange,
  autoComplete,
}: {
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative mt-2">
      <input
        id="password"
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className={`${INPUT} pr-12`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="tap-highlight-none absolute inset-y-0 right-0 grid w-12 place-items-center text-muted-foreground"
      >
        {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
      </button>
    </div>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-3 text-sm text-destructive">
      {message}
    </p>
  );
}
