import { WidgetCard } from "./WidgetCard";
import { EmptyState } from "./EmptyState";
import { formatDate } from "@/utils/helpers";
import type { ClubsWidgetModel } from "@/types/sdui";

export function ClubsWidget({ widget }: { widget: ClubsWidgetModel }) {
  const events = widget.data.events;

  if (events.length === 0) {
    return (
      <EmptyState
        title="No upcoming events"
        description="Follow a few student groups to see their events here."
        icon="◎"
      />
    );
  }

  return (
    <WidgetCard title={widget.title} subtitle={widget.subtitle}>
      <ul className="space-y-3">
        {events.map((event) => (
          <li key={event.id} className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-xs font-bold text-secondary-foreground">
              {formatDate(event.date).split(" ")[1]}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{event.eventTitle}</p>
              <p className="truncate text-xs text-muted-foreground">
                {event.clubName} · {event.location}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </WidgetCard>
  );
}
