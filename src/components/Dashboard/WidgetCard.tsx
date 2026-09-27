export function WidgetError({ title, message }: { title: string; message: string }) {
  return (
    <section className="card-surface px-5 py-6">
      <p className="eyebrow">{title}</p>
      <p className="mt-2 text-sm text-destructive">{message}</p>
    </section>
  );
}
