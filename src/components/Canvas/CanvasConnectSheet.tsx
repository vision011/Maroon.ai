import { useState, type FormEvent } from "react";
import { BookOpen, ExternalLink, Lock, Sparkles } from "lucide-react";
import { BottomSheet } from "@/components/Common/BottomSheet";
import { useDashboard } from "@/hooks/useDashboard";
import { CANVAS_TOKEN_URL, canvasService } from "@/services/canvasService";

const WHY = [
  {
    icon: BookOpen,
    title: "Your real deadlines",
    body: "Canvas is where your assignments, due dates and grades live. Connecting it puts them on your dashboard, ordered by what's due first.",
  },
  {
    icon: Sparkles,
    title: "A smarter Goldy",
    body: "Goldy can plan your week and suggest classes around your actual schedule instead of guessing.",
  },
  {
    icon: Lock,
    title: "Stays with you",
    body: "The token is saved only on this device and used only to read your courses, assignments and grades. Disconnect here or delete it in Canvas anytime.",
  },
];

const STEPS = [
  "Open Canvas settings (link below).",
  "Scroll to Approved Integrations and tap + New Access Token.",
  'Name it "Maroon.ai", then tap Generate Token.',
  "Copy the token and paste it here.",
];

export function CanvasConnectSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { refresh } = useDashboard();
  const [token, setToken] = useState("");
  const [error, setError] = useState<string>();
  const [connecting, setConnecting] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(undefined);
    setConnecting(true);
    try {
      await canvasService.connect(token);
      setToken("");
      onOpenChange(false);
      void refresh(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't connect to Canvas.");
    } finally {
      setConnecting(false);
    }
  }

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Connect Canvas">
      <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-4">
          <p className="text-sm text-muted-foreground">
            Maroon.ai needs a Canvas access token to see your classes. Here's why:
          </p>
          <ul className="space-y-4">
            {WHY.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground">
                  <Icon className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="card-surface p-4">
            <p className="eyebrow">How to get your token</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
              {STEPS.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <a
              href={CANVAS_TOKEN_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
            >
              Open Canvas settings <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>

        <div className="space-y-2 border-t border-border px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          <label htmlFor="canvas-token" className="sr-only">
            Canvas access token
          </label>
          <input
            id="canvas-token"
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste your Canvas access token"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className="w-full rounded-xl border border-input bg-card px-4 py-3 text-base outline-none focus:border-primary"
          />
          {error ? <p className="px-1 text-sm text-destructive">{error}</p> : null}
          <button
            type="submit"
            disabled={connecting || !token.trim()}
            className="tap-highlight-none w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
          >
            {connecting ? "Checking with Canvas…" : "Connect Canvas"}
          </button>
        </div>
      </form>
    </BottomSheet>
  );
}
