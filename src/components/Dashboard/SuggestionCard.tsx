import { Link } from "@tanstack/react-router";
import { CardEyebrow, CardIcon } from "./CardParts";
import type { SuggestionWidgetModel } from "@/types/sdui";

export function SuggestionCard({ widget }: { widget: SuggestionWidgetModel }) {
  const { eyebrow, title, detail, meta, icon, tone, to } = widget.data;

  return (
    <Link
      to={to ?? "/"}
      className="card-surface tap-highlight-none flex w-[15.5rem] shrink-0 snap-start flex-col p-4 transition-transform active:scale-[0.98]"
    >
      <div className="flex items-center justify-between">
        <CardIcon icon={icon} tone={tone} size="sm" />
        {meta ? (
          <span className="rounded-full bg-secondary px-2.5 py-1 text-[0.6875rem] font-bold text-secondary-foreground">
            {meta}
          </span>
        ) : null}
      </div>
      <div className="mt-3">
        <CardEyebrow tone={tone}>{eyebrow}</CardEyebrow>
      </div>
      <p className="mt-1 line-clamp-2 font-display text-[0.9375rem] font-semibold leading-snug">
        {title}
      </p>
      <p className="mt-1 truncate text-xs text-muted-foreground">{detail}</p>
    </Link>
  );
}
