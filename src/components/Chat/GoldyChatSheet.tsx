import { useState } from "react";
import { useChat } from "@/hooks/useChat";
import { ChatInput, ChatThread } from "./ChatParts";
import { BottomSheet } from "@/components/Common/BottomSheet";

/** A focused Goldy conversation about one card, with document upload. */
export function GoldyChatSheet({
  open,
  onOpenChange,
  title,
  intro,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  intro: string;
}) {
  const { messages, thinking, send } = useChat();
  const [draft, setDraft] = useState("");

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title={title}>
      <ChatThread messages={messages} thinking={thinking} intro={intro} />
      <div className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
        <ChatInput
          value={draft}
          onChange={setDraft}
          disabled={thinking}
          allowAttachments
          onSubmit={(attachment) => {
            const text = draft;
            setDraft("");
            void send(text, attachment);
          }}
        />
      </div>
    </BottomSheet>
  );
}
