import { Link } from "@tanstack/react-router";
import { ICONS } from "./CardParts";
import type { ShortcutWidgetModel } from "@/types/sdui";

export function ShortcutButton({ widget }: { widget: ShortcutWidgetModel }) {
  const { label, icon, to } = widget.data;
  const Icon = ICONS[icon];

  return (
    <Link
      to={to}
      className="tap-highlight-none flex w-20 flex-col items-center gap-2 transition-transform active:scale-95"
    >
      <span className="card-surface grid size-14 place-items-center rounded-full text-primary">
        <Icon className="size-6" strokeWidth={1.9} />
      </span>
      <span className="text-xs font-semibold">{label}</span>
    </Link>
  );
}
