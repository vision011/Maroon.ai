import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUp, FileText, Paperclip, X } from "lucide-react";
import type { ChatMessage } from "@/hooks/useChat";
import type { ChatAttachment } from "@/services/assistant.functions";

export const ASSISTANT_NAME = "Goldy";

/** Claude reads PDFs and images; keep uploads well under the request size limit. */
const ACCEPT = "application/pdf,image/png,image/jpeg,image/gif,image/webp";
const MAX_BYTES = 10 * 1024 * 1024;

function readAttachment(file: File): Promise<ChatAttachment> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // "data:application/pdf;base64,AAAA…" → "AAAA…"
      const data = String(reader.result).split(",")[1] ?? "";
      resolve({ name: file.name, mediaType: file.type, data });
    };
    reader.onerror = () => reject(reader.error ?? new Error("Couldn't read that file."));
    reader.readAsDataURL(file);
  });
}

function AttachmentChip({ name, onRemove }: { name: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-background/15 px-2 py-1 text-xs font-semibold">
      <FileText className="size-3.5 shrink-0" />
      <span className="truncate">{name}</span>
      {onRemove ? (
        <button type="button" onClick={onRemove} aria-label={`Remove ${name}`} className="shrink-0">
          <X className="size-3.5" />
        </button>
      ) : null}
    </span>
  );
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled,
  allowAttachments,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (attachment?: ChatAttachment) => void;
  disabled?: boolean;
  allowAttachments?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [attachment, setAttachment] = useState<ChatAttachment>();
  const [fileError, setFileError] = useState<string>();

  async function pick(file: File | undefined) {
    setFileError(undefined);
    if (!file) return;
    if (file.size > MAX_BYTES) return setFileError("That file is over 10 MB.");
    try {
      setAttachment(await readAttachment(file));
    } catch {
      setFileError("Couldn't read that file.");
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    onSubmit(attachment);
    setAttachment(undefined);
  }

  return (
    <div>
      {attachment || fileError ? (
        <div className="mb-2 flex items-center gap-2 px-2 text-sm">
          {attachment ? (
            <span className="rounded-lg bg-secondary text-secondary-foreground">
              <AttachmentChip name={attachment.name} onRemove={() => setAttachment(undefined)} />
            </span>
          ) : null}
          {fileError ? <span className="text-destructive">{fileError}</span> : null}
        </div>
      ) : null}
      <form
        onSubmit={submit}
        className="flex items-center gap-2 rounded-full border border-border bg-card py-1.5 pl-5 pr-1.5 [box-shadow:var(--shadow-card)]"
      >
        {allowAttachments ? (
          <>
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={(e) => {
                void pick(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              aria-label="Attach a document"
              className="tap-highlight-none -ml-2 grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground"
            >
              <Paperclip className="size-4" />
            </button>
          </>
        ) : null}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={attachment ? "Ask about this document…" : `Ask ${ASSISTANT_NAME} anything…`}
          aria-label={`Ask ${ASSISTANT_NAME}`}
          enterKeyHint="send"
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          disabled={disabled || (!value.trim() && !attachment)}
          aria-label="Send"
          className="tap-highlight-none grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
        >
          <ArrowUp className="size-4" strokeWidth={2.6} />
        </button>
      </form>
    </div>
  );
}

export function ChatThread({
  messages,
  thinking,
  intro,
}: {
  messages: ChatMessage[];
  thinking: boolean;
  intro?: string;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  // Scroll only the message list; scrollIntoView would also scroll the page behind the sheet.
  useEffect(() => {
    const list = listRef.current;
    list?.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  return (
    <div
      ref={listRef}
      className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-5 py-4"
    >
      {intro ? (
        <p className="max-w-[85%] rounded-2xl rounded-bl-md bg-secondary px-4 py-2.5 text-sm leading-relaxed text-secondary-foreground">
          {intro}
        </p>
      ) : null}
      {messages.map((m) => (
        <div
          key={m.id}
          className={`w-fit max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            m.role === "user"
              ? "ml-auto rounded-br-md bg-primary text-primary-foreground"
              : "rounded-bl-md bg-secondary text-secondary-foreground"
          }`}
        >
          {m.attachment ? (
            <div className="mb-1.5">
              <AttachmentChip name={m.attachment.name} />
            </div>
          ) : null}
          {m.text}
        </div>
      ))}
      {thinking ? (
        <p className="w-fit rounded-2xl rounded-bl-md bg-secondary px-4 py-2.5 text-sm text-muted-foreground">
          {ASSISTANT_NAME} is thinking…
        </p>
      ) : null}
    </div>
  );
}
