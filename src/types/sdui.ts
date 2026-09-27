export type WidgetType = "shortcut" | "action" | "suggestion";

/** Dashboard sections the server can place widgets into. */
export type SectionId = "quickActions" | "actions" | "forYou";

export type WidgetIcon =
  | "payment"
  | "assignment"
  | "exam"
  | "event"
  | "workshop"
  | "career"
  | "courses"
  | "clubs"
  | "account";

/** Drives the icon and eyebrow color: urgent = maroon, info = neutral, reward = gold. */
export type WidgetTone = "urgent" | "info" | "reward";

export interface WidgetBase {
  id: string;
  section: SectionId;
  priority: number;
  hidden?: boolean;
}

export interface CardContent {
  eyebrow: string;
  title: string;
  detail: string;
  icon: WidgetIcon;
  tone: WidgetTone;
  to?: string;
}

/** Round quick-action button that links to another screen. */
export interface ShortcutWidgetModel extends WidgetBase {
  type: "shortcut";
  data: { label: string; icon: WidgetIcon; to: string };
}

export interface ActionWidgetModel extends WidgetBase {
  type: "action";
  /** Featured cards span the full width; compact cards sit in a two-column grid. */
  size: "featured" | "compact";
  data: CardContent;
}

export interface SuggestionWidgetModel extends WidgetBase {
  type: "suggestion";
  data: CardContent & { meta?: string };
}

export type Widget = ShortcutWidgetModel | ActionWidgetModel | SuggestionWidgetModel;

export interface SectionModel {
  id: SectionId;
  title: string;
  priority: number;
}

export interface DashboardResponse {
  greeting: { title: string; subtitle: string };
  sections: SectionModel[];
  widgets: Widget[];
  metadata: { generatedAt: string; layoutVersion: string; studentId: string };
}

export interface ResolvedSection extends SectionModel {
  widgets: Widget[];
}

/** Sort by priority and drop widgets the server hid or that carry no data. */
export function resolveWidgets(widgets: Widget[]): Widget[] {
  return [...widgets]
    .filter((w) => !w.hidden && widgetHasData(w))
    .sort((a, b) => a.priority - b.priority);
}

/** Group resolved widgets under their sections, in section order, skipping empty sections. */
export function resolveSections(sections: SectionModel[], widgets: Widget[]): ResolvedSection[] {
  const visible = resolveWidgets(widgets);
  return [...sections]
    .sort((a, b) => a.priority - b.priority)
    .map((section) => ({ ...section, widgets: visible.filter((w) => w.section === section.id) }))
    .filter((section) => section.widgets.length > 0);
}

export function widgetHasData(widget: Widget): boolean {
  switch (widget.type) {
    case "shortcut":
      return widget.data.label.trim().length > 0;
    case "action":
    case "suggestion":
      return widget.data.title.trim().length > 0;
    default:
      return false;
  }
}
