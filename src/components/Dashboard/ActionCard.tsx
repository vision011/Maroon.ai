import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { CardEyebrow, CardIcon } from "./CardParts";
import { GoldyChatSheet } from "@/components/Chat/GoldyChatSheet";
import { CanvasConnectSheet } from "@/components/Canvas/CanvasConnectSheet";
import type { ActionWidgetModel } from "@/types/sdui";

const CARD =
  "card-surface tap-highlight-none animate-in fade-in slide-in-from-bottom-2 block duration-300 transition-transform active:scale-[0.98]";

export function ActionCard({ widget }: { widget: ActionWidgetModel }) {
  const { eyebrow, title, detail, icon, tone, to, chat, connect } = widget.data;
  const [sheetOpen, setSheetOpen] = useState(false);

  if (widget.size === "featured") {
    const body = (
      <div className="flex items-center gap-4">
        <CardIcon icon={icon} tone={tone} />
        <div className="min-w-0 flex-1">
          <CardEyebrow tone={tone}>{eyebrow}</CardEyebrow>
          <p className="mt-1 font-display text-lg font-semibold leading-snug">{title}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{detail}</p>
        </div>
        <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
      </div>
    );

    // Cards with a chat or connect action open a sheet in place instead of navigating away.
    if (chat || connect) {
      return (
        <>
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className={`${CARD} col-span-2 w-full p-5 text-left`}
          >
            {body}
          </button>
          {chat ? (
            <GoldyChatSheet
              open={sheetOpen}
              onOpenChange={setSheetOpen}
              title={chat.title}
              intro={chat.intro}
            />
          ) : (
            <CanvasConnectSheet open={sheetOpen} onOpenChange={setSheetOpen} />
          )}
        </>
      );
    }

    return (
      <Link to={to ?? "/"} className={`${CARD} col-span-2 p-5`}>
        {body}
      </Link>
    );
  }

  return (
    <Link to={to ?? "/"} className={`${CARD} flex flex-col p-4`}>
      <div className="flex items-center justify-between">
        <CardIcon icon={icon} tone={tone} size="sm" />
        <ChevronRight className="size-4 text-muted-foreground" />
      </div>
      <div className="mt-3">
        <CardEyebrow tone={tone}>{eyebrow}</CardEyebrow>
      </div>
      <p className="mt-1 line-clamp-2 font-display text-[0.9375rem] font-semibold leading-snug">
        {title}
      </p>
      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{detail}</p>
    </Link>
  );
}
