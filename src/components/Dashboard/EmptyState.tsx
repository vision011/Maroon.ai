export function EmptyState({
  title,
  description,
  icon = "✳",
}: {
  title: string;
  description: string;
  icon?: string;
}) {
  return (
    <div className="card-surface flex flex-col items-center gap-2 px-6 py-10 text-center">
      <span aria-hidden className="text-2xl text-muted-foreground">
        {icon}
      </span>
      <p className="font-display text-base font-semibold">{title}</p>
      <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
