import { WidgetCard } from "./WidgetCard";
import { formatCurrency, formatDate } from "@/utils/helpers";
import type { PaymentsWidgetModel } from "@/types/sdui";

export function PaymentsWidget({ widget }: { widget: PaymentsWidgetModel }) {
  const { balanceDue, items } = widget.data;

  return (
    <WidgetCard
      title={widget.title}
      subtitle={widget.subtitle}
      badge={
        <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
          Due soon
        </span>
      }
      footer={
        <button
          type="button"
          className="tap-highlight-none w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity active:opacity-80"
        >
          Pay now
        </button>
      }
    >
      <p className="font-display text-3xl font-semibold tracking-tight">
        {formatCurrency(balanceDue)}
      </p>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-foreground/80">
              {item.description}
              <span className="ml-2 text-xs text-muted-foreground">
                due {formatDate(item.dueDate)}
              </span>
            </span>
            <span className="font-semibold">{formatCurrency(item.amount)}</span>
          </li>
        ))}
      </ul>
    </WidgetCard>
  );
}
