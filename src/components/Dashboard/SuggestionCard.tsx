import { Link } from "@tanstack/react-router";
import { CardEyebrow, CardIcon } from "./CardParts";
import type { SuggestionWidgetModel } from "@/types/sdui";

export function SuggestionCard({ widget }: { widget: SuggestionWidgetModel }) {
  const { eyebrow, title, detail, meta, icon, tone, to } = widget.data;

  return (
    <Link
      to={to ?? "/"}
      className="card-surface tap-highlight-none flex items-center gap-3 p-4 transition-transform active:scale-[0.98]"
    >
      <CardIcon icon={icon} tone={tone} size="sm" />
      <div className="min-w-0 flex-1">
        <CardEyebrow tone={tone}>{eyebrow}</CardEyebrow>
        <p className="mt-1 line-clamp-2 font-display text-[0.9375rem] font-semibold leading-snug">
          {title}
        </p>
        <p className="mt-1 truncate text-xs text-muted-foreground">{detail}</p>
      </div>
      {meta ? (
        <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[0.6875rem] font-bold text-secondary-foreground">
          {meta}
        </span>
      ) : null}
    </Link>
  );
}
