export function Loading({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 px-1 py-6 text-sm text-muted-foreground">
      <span className="size-4 animate-spin rounded-full border-2 border-border border-t-primary" />
      {label}…
    </div>
  );
}

export function WidgetSkeleton() {
  return (
    <div className="card-surface animate-pulse p-5">
      <div className="h-3 w-24 rounded bg-muted" />
      <div className="mt-4 h-6 w-40 rounded bg-muted" />
      <div className="mt-5 space-y-3">
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-2/3 rounded bg-muted" />
      </div>
    </div>
  );
}
