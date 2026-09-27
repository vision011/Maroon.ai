import { WidgetSkeleton } from "@/components/Common/Loading";
import { ChatBar } from "@/components/Chat/ChatBar";
import { ActionCard } from "./ActionCard";
import { SuggestionCard } from "./SuggestionCard";
import { EmptyState } from "./EmptyState";
import { WidgetError } from "./WidgetCard";
import { useDashboard } from "@/hooks/useDashboard";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useAuth } from "@/hooks/useAuth";
import { initials } from "@/utils/helpers";
import type { ResolvedSection, Widget } from "@/types/sdui";

function renderWidget(widget: Widget) {
  switch (widget.type) {
    case "action":
      return <ActionCard key={widget.id} widget={widget} />;
    case "suggestion":
      return <SuggestionCard key={widget.id} widget={widget} />;
    default:
      // Unknown widget type from a newer server layout — skip it safely.
      return null;
  }
}

function Section({ section }: { section: ResolvedSection }) {
  return (
    <section>
      <h2 className="eyebrow px-5">{section.title}</h2>
      {section.id === "forYou" ? (
        <div className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-5 px-5 pb-2 [scrollbar-width:none]">
          {section.widgets.map(renderWidget)}
        </div>
      ) : (
        // Odd trailing compact card stretches so the grid never leaves a hole.
        <div className="mt-3 grid grid-cols-2 gap-3 px-5 [&>*:last-child:nth-child(even)]:col-span-2">
          {section.widgets.map(renderWidget)}
        </div>
      )}
    </section>
  );
}

export function DashboardScreen() {
  const { student } = useAuth();
  const { sections, greeting, loading, error, metadata, refresh } = useDashboard();
  const { pulling, pullDistance, refreshing } = usePullToRefresh();

  return (
    <div className="pb-24 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <div
        className="flex items-center justify-center overflow-hidden text-xs text-muted-foreground transition-all"
        style={{ height: pulling || refreshing ? 28 : Math.min(pullDistance, 28) }}
      >
        {refreshing ? "Refreshing…" : pulling ? "Pull to refresh" : null}
      </div>

      <div className="flex items-center gap-2.5 px-5">
        {student ? (
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
            {initials(student.name)}
          </span>
        ) : null}
        <p className="eyebrow">University of Minnesota</p>
      </div>

      {greeting ? (
        <div className="px-5 pt-5">
          <h1 className="text-[2rem] font-semibold leading-[1.1]">{greeting.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{greeting.subtitle}</p>
        </div>
      ) : null}

      <div className="mt-7 space-y-7">
        {loading ? (
          <div className="space-y-4 px-5">
            <WidgetSkeleton />
            <WidgetSkeleton />
          </div>
        ) : error ? (
          <div className="px-5">
            <WidgetError title="Dashboard" message={error} />
          </div>
        ) : sections.length === 0 ? (
          <div className="px-5">
            <EmptyState
              title="Nothing to show yet"
              description="Once your courses, bills and clubs sync, they'll appear right here."
            />
          </div>
        ) : (
          sections.map((section) => <Section key={section.id} section={section} />)
        )}
      </div>

      <div className="flex items-center justify-between px-5 pt-6 text-xs text-muted-foreground">
        <span>Layout {metadata?.layoutVersion ?? "—"}</span>
        <button
          type="button"
          onClick={() => void refresh(true)}
          className="tap-highlight-none font-semibold text-primary"
        >
          Refresh
        </button>
      </div>

      <ChatBar />
    </div>
  );
}
