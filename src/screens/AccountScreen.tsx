import { useAuth } from "@/hooks/useAuth";

export function AccountScreen() {
  const { student, logout } = useAuth();

  return (
    <>
      <div className="space-y-4 px-5 pb-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <section className="card-surface p-5">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-semibold">{student?.name}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Student ID</dt>
              <dd className="font-semibold">{student?.studentId}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-semibold">{student?.email}</dd>
            </div>
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
          onClick={logout}
          className="tap-highlight-none w-full rounded-lg border border-input py-3 text-sm font-semibold text-destructive"
        >
          Sign out
        </button>
      </div>
    </>
  );
}
