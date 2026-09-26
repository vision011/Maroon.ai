import type { ReactNode } from "react";

/** Generic shell every server-driven widget renders inside. */
export function WidgetCard({
  title,
  subtitle,
  badge,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="card-surface animate-in fade-in slide-in-from-bottom-2 overflow-hidden duration-300">
      <div className="flex items-start justify-between gap-3 px-5 pt-5">
        <div>
          <p className="eyebrow">{title}</p>
          {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        {badge}
      </div>
      <div className="px-5 pb-5 pt-4">{children}</div>
      {footer ? <div className="border-t border-border px-5 py-3">{footer}</div> : null}
    </section>
  );
}

export function WidgetError({ title, message }: { title: string; message: string }) {
  return (
    <section className="card-surface px-5 py-6">
      <p className="eyebrow">{title}</p>
      <p className="mt-2 text-sm text-destructive">{message}</p>
    </section>
  );
}
