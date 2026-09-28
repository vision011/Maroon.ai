import { useCallback, useState } from "react";
import { chatService } from "@/services/chatService";
import type { AssistantProfile, ChatAttachment } from "@/services/assistant.functions";
import { useAuth } from "./useAuth";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  attachment?: ChatAttachment;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const { student } = useAuth();

  const send = useCallback(
    async (text: string, attachment?: ChatAttachment) => {
      const question = text.trim() || (attachment ? "Explain this document." : "");
      if (!question) return;
      const userMessage: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        text: question,
        ...(attachment ? { attachment } : {}),
      };
      setMessages((prev) => [...prev, userMessage]);
      setThinking(true);
      try {
        // Attachments stay in the history so follow-up questions can refer back to them.
        const history = [...messages, userMessage].map(({ role, text, attachment: file }) => ({
          role,
          text,
          ...(file ? { attachment: file } : {}),
        }));
        const profile: AssistantProfile = {
          firstName: student?.name.split(" ")[0] ?? "there",
          preferredLanguage: student?.preferredLanguage ?? "en",
          plainLanguage: student?.plainLanguage ?? false,
          ...(student?.program ? { program: student.program } : {}),
          ...(student?.transferStudent !== undefined
            ? { transferStudent: student.transferStudent }
            : {}),
        };
        const reply = await chatService.ask(history, profile);
        setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: "assistant", text: reply }]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            text: "Sorry, I couldn't answer that right now.",
          },
        ]);
      } finally {
        setThinking(false);
      }
    },
    [messages, student],
  );

  return { messages, thinking, send };
}
