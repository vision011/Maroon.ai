import { useState } from "react";
import { WidgetCard } from "./WidgetCard";
import { EmptyState } from "./EmptyState";
import { relativeDue, formatDate } from "@/utils/helpers";
import type { AcademicsWidgetModel } from "@/types/sdui";

const TYPE_LABEL: Record<string, string> = {
  assignment: "Assignment",
  exam: "Exam",
  quiz: "Quiz",
  lab: "Lab",
};

export function AcademicsWidget({ widget }: { widget: AcademicsWidgetModel }) {
  const [expanded, setExpanded] = useState(false);
  const items = widget.data.items;

  if (items.length === 0) {
    return <EmptyState title="Nothing due" description="You're all caught up this week." icon="✓" />;
  }

  const visible = expanded ? items : items.slice(0, 2);

  return (
    <WidgetCard
      title={widget.title}
      subtitle={widget.subtitle}
      footer={
        items.length > 2 ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="tap-highlight-none text-sm font-semibold text-primary"
          >
            {expanded ? "Show less" : `Show all ${items.length}`}
          </button>
        ) : null
      }
    >
      <ul className="space-y-3">
        {visible.map((item) => (
          <li key={item.id} className="flex items-start gap-3">
            <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <span>{item.courseCode}</span>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-wide text-secondary-foreground">
                  {TYPE_LABEL[item.type] ?? item.type}
                </span>
              </p>
              <p className="truncate text-sm text-foreground/80">{item.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {relativeDue(item.dueDate)} · {formatDate(item.dueDate)} · {item.location}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </WidgetCard>
  );
}
