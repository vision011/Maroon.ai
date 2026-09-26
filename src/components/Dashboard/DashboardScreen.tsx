import { Header } from "@/components/Common/Header";
import { WidgetSkeleton } from "@/components/Common/Loading";
import { AcademicsWidget } from "./AcademicsWidget";
import { ClubsWidget } from "./ClubsWidget";
import { PaymentsWidget } from "./PaymentsWidget";
import { EmptyState } from "./EmptyState";
import { WidgetError } from "./WidgetCard";
import { useDashboard } from "@/hooks/useDashboard";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useAuth } from "@/hooks/useAuth";
import type { Widget } from "@/types/sdui";

function renderWidget(widget: Widget) {
  switch (widget.type) {
    case "academics":
      return <AcademicsWidget key={widget.id} widget={widget} />;
    case "payments":
      return <PaymentsWidget key={widget.id} widget={widget} />;
    case "clubs":
      return <ClubsWidget key={widget.id} widget={widget} />;
    default:
      // Unknown widget type from a newer server layout — skip it safely.
      return null;
  }
}

export function DashboardScreen() {
  const { student } = useAuth();
  const { widgets, loading, error, metadata, refresh } = useDashboard();
  const { pulling, pullDistance, refreshing } = usePullToRefresh();

  const firstName = student?.name.split(" ")[0] ?? "there";

  return (
    <>
      <Header title={`Hey ${firstName}`} subtitle="Here's your day at the U" />

      <div
        className="flex items-center justify-center overflow-hidden text-xs text-muted-foreground transition-all"
        style={{ height: pulling || refreshing ? 28 : Math.min(pullDistance, 28) }}
      >
        {refreshing ? "Refreshing…" : pulling ? "Pull to refresh" : null}
      </div>

      <div className="space-y-4 px-5 pb-6">
        {loading ? (
          <>
            <WidgetSkeleton />
            <WidgetSkeleton />
          </>
        ) : error ? (
          <WidgetError title="Dashboard" message={error} />
        ) : widgets.length === 0 ? (
          <EmptyState
            title="Nothing to show yet"
            description="Once your courses, bills and clubs sync, they'll appear right here."
          />
        ) : (
          widgets.map(renderWidget)
        )}

        <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
          <span>Layout {metadata?.layoutVersion ?? "—"}</span>
          <button
            type="button"
            onClick={() => void refresh(true)}
            className="tap-highlight-none font-semibold text-primary"
          >
            Refresh
          </button>
        </div>
      </div>
    </>
  );
}
