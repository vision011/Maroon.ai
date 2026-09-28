import { useState } from "react";
import { useChat } from "@/hooks/useChat";
import { ASSISTANT_NAME, ChatInput, ChatThread } from "./ChatParts";
import { BottomSheet } from "@/components/Common/BottomSheet";

/** Floating assistant prompt above the tab bar; opens a chat sheet once a question is sent. */
export function ChatBar() {
  const { messages, thinking, send } = useChat();
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);

  function submit() {
    const text = draft;
    setDraft("");
    setOpen(true);
    void send(text);
  }

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-background via-background/90 to-transparent px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6">
        <div className="mx-auto max-w-lg" data-tour="goldy">
          <ChatInput value={draft} onChange={setDraft} onSubmit={submit} />
        </div>
      </div>

      <BottomSheet open={open} onOpenChange={setOpen} title={`Ask ${ASSISTANT_NAME}`}>
        <ChatThread messages={messages} thinking={thinking} />
        <div className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
          <ChatInput value={draft} onChange={setDraft} onSubmit={submit} disabled={thinking} />
        </div>
      </BottomSheet>
    </>
  );
}
