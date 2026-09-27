import {
  BookOpen,
  Briefcase,
  CalendarDays,
  ClipboardCheck,
  CreditCard,
  Wrench,
} from "lucide-react";
import type { WidgetIcon, WidgetTone } from "@/types/sdui";

const ICONS = {
  payment: CreditCard,
  assignment: BookOpen,
  exam: ClipboardCheck,
  event: CalendarDays,
  workshop: Wrench,
  career: Briefcase,
} as const;

const ICON_TONE: Record<WidgetTone, string> = {
  urgent: "bg-primary text-primary-foreground",
  info: "bg-secondary text-secondary-foreground",
  reward: "bg-accent text-accent-foreground",
};

const EYEBROW_TONE: Record<WidgetTone, string> = {
  urgent: "text-primary",
  info: "text-muted-foreground",
  reward: "text-accent-foreground",
};

export function CardIcon({
  icon,
  tone,
  size = "md",
}: {
  icon: WidgetIcon;
  tone: WidgetTone;
  size?: "sm" | "md";
}) {
  const Icon = ICONS[icon];
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full ${ICON_TONE[tone]} ${
        size === "sm" ? "size-7" : "size-10"
      }`}
    >
      <Icon className={size === "sm" ? "size-3.5" : "size-5"} strokeWidth={2.2} />
    </span>
  );
}

export function CardEyebrow({ tone, children }: { tone: WidgetTone; children: string }) {
  return (
    <p
      className={`truncate text-[0.625rem] font-bold uppercase tracking-[0.1em] ${EYEBROW_TONE[tone]}`}
    >
      {children}
    </p>
  );
}
