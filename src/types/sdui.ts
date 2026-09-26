import type { AcademicItem, ClubEvent, PaymentItem } from "./index";

export type WidgetType = "academics" | "payments" | "clubs";

export interface WidgetBase {
  id: string;
  priority: number;
  hidden?: boolean;
  title: string;
  subtitle?: string;
}

export interface AcademicsWidgetModel extends WidgetBase {
  type: "academics";
  data: { items: AcademicItem[] };
}

export interface PaymentsWidgetModel extends WidgetBase {
  type: "payments";
  data: { balanceDue: number; items: PaymentItem[] };
}

export interface ClubsWidgetModel extends WidgetBase {
  type: "clubs";
  data: { events: ClubEvent[] };
}

export type Widget = AcademicsWidgetModel | PaymentsWidgetModel | ClubsWidgetModel;

export interface DashboardResponse {
  widgets: Widget[];
  metadata: { generatedAt: string; layoutVersion: string; studentId: string };
}

/** Sort by priority and drop widgets the server hid or that carry no data. */
export function resolveWidgets(widgets: Widget[]): Widget[] {
  return [...widgets]
    .filter((w) => !w.hidden && widgetHasData(w))
    .sort((a, b) => a.priority - b.priority);
}

export function widgetHasData(widget: Widget): boolean {
  switch (widget.type) {
    case "academics":
      return widget.data.items.length > 0;
    case "payments":
      return widget.data.items.length > 0 || widget.data.balanceDue > 0;
    case "clubs":
      return widget.data.events.length > 0;
    default:
      return false;
  }
}
