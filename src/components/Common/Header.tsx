import { initials } from "@/utils/helpers";
import { useAuth } from "@/hooks/useAuth";

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const { student } = useAuth();

  return (
    <header className="sticky top-0 z-20 bg-surface text-surface-foreground">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-4 px-5 pb-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <div className="min-w-0">
          <p className="eyebrow text-surface-foreground/60">University of Minnesota</p>
          <h1 className="mt-1 truncate text-2xl font-semibold">{title}</h1>
          {subtitle ? (
            <p className="mt-1 truncate text-sm text-surface-foreground/70">{subtitle}</p>
          ) : null}
        </div>
        {student ? (
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
            {initials(student.name)}
          </span>
        ) : null}
      </div>
    </header>
  );
}
