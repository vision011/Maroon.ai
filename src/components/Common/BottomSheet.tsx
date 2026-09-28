import { useEffect, useId, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * How much of the screen the on-screen keyboard covers, and how tall the visible area is.
 * iOS shrinks the visual viewport for the keyboard without resizing fixed elements, and its
 * resize events can lag when the keyboard closes, so focus changes trigger re-checks too.
 */
function useKeyboardInset(active: boolean) {
  const [inset, setInset] = useState({ bottom: 0, visibleHeight: 0 });

  useEffect(() => {
    const vv = window.visualViewport;
    if (!active || !vv) return;
    const update = () =>
      setInset({
        bottom: Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)),
        visibleHeight: vv.height,
      });
    const timers: number[] = [];
    const settle = () => {
      update();
      // The keyboard animates for ~250 ms; measure again once it has finished.
      timers.push(window.setTimeout(update, 100), window.setTimeout(update, 400));
    };
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    document.addEventListener("focusin", settle);
    document.addEventListener("focusout", settle);
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      document.removeEventListener("focusin", settle);
      document.removeEventListener("focusout", settle);
    };
  }, [active]);

  return inset;
}

/** Bottom sheet (Goldy chats, Connect Canvas) that stays above the on-screen keyboard. */
export function BottomSheet({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
}) {
  const titleId = useId();
  const { bottom, visibleHeight } = useKeyboardInset(open);

  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40 animate-in fade-in duration-200"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute inset-x-0 mx-auto flex max-w-lg flex-col rounded-t-2xl border border-border bg-background animate-in slide-in-from-bottom duration-300"
        style={{
          // Sit on top of the keyboard; with no keyboard, bottom is 0.
          bottom,
          height: bottom
            ? `${Math.max(visibleHeight - 12, 240)}px`
            : "min(85dvh, calc(100% - 0.75rem))",
        }}
      >
        <div className="flex items-center justify-between gap-3 px-5 pb-1 pt-4">
          <h2 id={titleId} className="font-display text-base font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="tap-highlight-none -mr-2 grid size-8 place-items-center rounded-full text-muted-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
