import { BackLink } from "@/components/Common/BackLink";
import { useEffect, useState } from "react";
import { Loading } from "@/components/Common/Loading";
import { EmptyState } from "@/components/Dashboard/EmptyState";
import { clubsService } from "@/services/clubsService";
import { formatDate } from "@/utils/helpers";
import type { ClubEvent } from "@/types";

export function ClubsScreen() {
  const [events, setEvents] = useState<ClubEvent[] | null>(null);

  useEffect(() => {
    let alive = true;
    void clubsService.getEvents().then((data) => {
      if (alive) setEvents(data);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <BackLink title="Clubs" />
      <div className="space-y-4 px-5 pb-8 pt-5">
        {!events ? (
          <Loading label="Loading events" />
        ) : events.length === 0 ? (
          <EmptyState
            title="No events yet"
            description="Follow student groups to fill up your calendar."
            icon="◎"
          />
        ) : (
          events.map((event) => (
            <article key={event.id} className="card-surface p-5">
              <p className="eyebrow">{event.clubName}</p>
              <h2 className="mt-1 text-base font-semibold">{event.eventTitle}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {formatDate(event.date)} ·{" "}
                {new Date(event.date).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}{" "}
                · {event.location}
              </p>
              <button
                type="button"
                className="tap-highlight-none mt-4 rounded-lg border border-input px-4 py-2 text-sm font-semibold text-primary"
              >
                RSVP
              </button>
            </article>
          ))
        )}
      </div>
    </>
  );
}
