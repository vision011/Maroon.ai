import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { PRIMARY_BUTTON } from "@/components/Auth/AuthShell";
import { LANGUAGES } from "@/utils/constants";

/**
 * Stops point at elements tagged `data-tour="<target>"`. Dashboard sections tag themselves
 * with their server section id, so a stop whose section the server didn't send is skipped.
 */
const STOPS = [
  {
    target: "quickActions",
    title: "Jump anywhere",
    body: "Your courses, clubs and account are one tap away.",
  },
  {
    target: "actions",
    title: "What needs you first",
    body: "Deadlines, exams and bills, with the most urgent on top. Tap a card for details.",
  },
  {
    target: "forYou",
    title: "Happening on campus",
    body: "Club events and opportunities coming up this week. Tap one to RSVP.",
  },
  {
    target: "goldy",
    title: "Ask Goldy",
    body: "Ask about your classes, your bill or campus. Goldy answers from your own data.",
  },
] as const;

type Stop = (typeof STOPS)[number];

/** Space kept between the highlighted element and the spotlight edge. */
const PAD = 8;
const CARD_GAP = 14;
/** Rough height of the tour card, used to pick which side of a stop it fits on. */
const CARD_HEIGHT = 200;

function languageName(code: string) {
  return LANGUAGES.find((l) => l.code === code)?.english;
}

export function DashboardTour({
  preferredLanguage,
  onFinish,
}: {
  preferredLanguage: string;
  onFinish: () => void;
}) {
  // -1 is the welcome card; 0..n-1 are the stops that exist on this dashboard.
  const [index, setIndex] = useState(-1);
  const [stops, setStops] = useState<Stop[]>([]);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStops(STOPS.filter((s) => document.querySelector(`[data-tour="${s.target}"]`)));
  }, []);

  const stop = index >= 0 ? stops[index] : undefined;

  // Scroll the current stop into view, then keep the spotlight on it while the page moves.
  useLayoutEffect(() => {
    if (!stop) {
      setRect(null);
      return;
    }
    const el = document.querySelector<HTMLElement>(`[data-tour="${stop.target}"]`);
    if (!el) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });

    // Browsers already fire scroll events once per frame, so measure on each one directly.
    const measure = () => setRect(el.getBoundingClientRect());
    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [stop]);

  // Move focus to the card so screen readers announce each stop.
  useEffect(() => {
    cardRef.current?.focus();
  }, [index]);

  const next = useCallback(() => {
    if (index + 1 >= stops.length) onFinish();
    else setIndex(index + 1);
  }, [index, stops.length, onFinish]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFinish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onFinish]);

  const language = languageName(preferredLanguage);
  const body =
    stop?.target === "goldy" && language && preferredLanguage !== "en"
      ? `${stop.body} You picked ${language}, so that's how Goldy will reply.`
      : stop?.body;

  // Card sits below the spotlight when there's room, else above it, else pinned to the
  // bottom of the screen over a stop too tall to leave room on either side.
  const viewportH = typeof window === "undefined" ? 0 : window.innerHeight;
  const room = CARD_HEIGHT + PAD + CARD_GAP;
  const cardStyle: React.CSSProperties = !rect
    ? {}
    : viewportH - rect.bottom >= room
      ? { top: rect.bottom + PAD + CARD_GAP }
      : rect.top >= room
        ? { bottom: viewportH - rect.top + PAD + CARD_GAP }
        : { bottom: "max(1rem, env(safe-area-inset-bottom))" };

  return (
    <div className="fixed inset-0 z-50" role="presentation">
      {/* Catches taps so the page underneath can't be used mid-tour. */}
      <div className="absolute inset-0" aria-hidden="true" />

      {rect ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute rounded-2xl"
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            // Gold outline around the stop, then a dim layer over everything else.
            boxShadow: "0 0 0 3px var(--color-accent), 0 0 0 9999px rgb(20 10 12 / 0.62)",
          }}
        />
      ) : (
        <div aria-hidden="true" className="absolute inset-0 bg-[rgb(20_10_12/0.62)]" />
      )}

      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        aria-describedby="tour-body"
        tabIndex={-1}
        className={`absolute inset-x-4 mx-auto max-w-sm rounded-2xl bg-card p-5 text-card-foreground shadow-xl outline-none ${
          stop ? "" : "top-1/2 -translate-y-1/2"
        }`}
        style={cardStyle}
      >
        {stop ? (
          <>
            <p className="eyebrow text-muted-foreground">
              {index + 1} of {stops.length}
            </p>
            <h2 id="tour-title" className="mt-1 text-xl font-semibold">
              {stop.title}
            </h2>
            <p id="tour-body" className="mt-1.5 text-sm text-muted-foreground">
              {body}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={onFinish}
                className="tap-highlight-none px-2 py-3 text-sm font-semibold text-muted-foreground"
              >
                Skip
              </button>
              <button type="button" onClick={next} className={`flex-1 ${PRIMARY_BUTTON}`}>
                {index + 1 >= stops.length ? "Start using Maroon.ai" : "Next"}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="eyebrow text-muted-foreground">Quick tour</p>
            <h2 id="tour-title" className="mt-1 text-2xl font-semibold">
              Your dashboard, in {stops.length} stops.
            </h2>
            <p id="tour-body" className="mt-1.5 text-sm text-muted-foreground">
              Takes about 20 seconds. You can replay it any time from Account.
            </p>
            <button
              type="button"
              onClick={() => (stops.length ? setIndex(0) : onFinish())}
              className={`mt-5 ${PRIMARY_BUTTON}`}
            >
              Show me around
            </button>
            <button
              type="button"
              onClick={onFinish}
              className="tap-highlight-none mt-1 w-full py-3 text-sm font-semibold text-muted-foreground"
            >
              Not now
            </button>
          </>
        )}
      </div>
    </div>
  );
}
