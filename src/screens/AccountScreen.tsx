import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { BackLink } from "@/components/Common/BackLink";
import { FormError } from "@/components/Auth/AuthShell";
import { useAuth } from "@/hooks/useAuth";

export function AccountScreen() {
  const { student, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  /** Clears the tour flag so the dashboard shows the tour again. */
  async function replayTour() {
    setError(null);
    try {
      await updateProfile({ touredAt: undefined });
      void navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't restart the tour. Try again.");
    }
  }

  return (
    <>
      <BackLink title="Account" />
      <div className="space-y-4 px-5 pb-8 pt-5">
        <section className="card-surface p-5">
          <dl className="space-y-3 text-sm">
            <Row label="Name" value={student?.name} />
            <Row label="Internet ID" value={student?.internetId} />
            <Row label="Email" value={student?.email} />
            <Row label="Student ID" value={student?.studentId} />
            <Row label="Program" value={student?.program} />
            <Row label="Graduating" value={student?.graduationYear?.toString()} />
          </dl>
        </section>

        <section className="card-surface p-5">
          <p className="eyebrow">What&apos;s next</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>· Real UMN sign-in and live student data</li>
            <li>· Push notifications for due dates</li>
            <li>· Offline cache and background sync</li>
            <li>· Usage analytics for widget ordering</li>
          </ul>
        </section>

        <button
          type="button"
          onClick={() => void replayTour()}
          className="tap-highlight-none w-full rounded-lg border border-input py-3 text-sm font-semibold"
        >
          Replay the dashboard tour
        </button>
        <FormError message={error} />

        <button
          type="button"
          onClick={logout}
          className="tap-highlight-none w-full rounded-lg border border-input py-3 text-sm font-semibold text-destructive"
        >
          Sign out
        </button>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={value ? "text-right font-semibold" : "text-muted-foreground"}>
        {value ?? "Not added"}
      </dd>
    </div>
  );
}
