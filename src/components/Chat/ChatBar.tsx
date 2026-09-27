import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUp } from "lucide-react";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { useChat } from "@/hooks/useChat";

const ASSISTANT_NAME = "Goldy";

function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  disabled?: boolean;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex items-center gap-2 rounded-full border border-border bg-card py-1.5 pl-5 pr-1.5 [box-shadow:var(--shadow-card)]"
    >
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Ask ${ASSISTANT_NAME} anything…`}
        aria-label={`Ask ${ASSISTANT_NAME}`}
        enterKeyHint="send"
        className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        aria-label="Send"
        className="tap-highlight-none grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
      >
        <ArrowUp className="size-4" strokeWidth={2.6} />
      </button>
    </form>
  );
}

/** Floating assistant prompt above the tab bar; opens a chat sheet once a question is sent. */
export function ChatBar() {
  const { messages, thinking, send } = useChat();
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  function submit(e: FormEvent) {
    e.preventDefault();
    const text = draft;
    setDraft("");
    setOpen(true);
    void send(text);
  }

  return (
    <>
      <div className="fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-20 px-4">
        <div className="mx-auto max-w-lg">
          <ChatInput value={draft} onChange={setDraft} onSubmit={submit} />
        </div>
      </div>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="mx-auto h-[80vh] max-w-lg">
          <DrawerTitle className="px-5 pt-3 font-display text-base">
            Ask {ASSISTANT_NAME}
          </DrawerTitle>
          <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
            {messages.map((m) => (
              <p
                key={m.id}
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "ml-auto rounded-br-md bg-primary text-primary-foreground"
                    : "rounded-bl-md bg-secondary text-secondary-foreground"
                }`}
              >
                {m.text}
              </p>
            ))}
            {thinking ? (
              <p className="w-fit rounded-2xl rounded-bl-md bg-secondary px-4 py-2.5 text-sm text-muted-foreground">
                {ASSISTANT_NAME} is thinking…
              </p>
            ) : null}
            <div ref={endRef} />
          </div>
          <div className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
            <ChatInput value={draft} onChange={setDraft} onSubmit={submit} disabled={thinking} />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
