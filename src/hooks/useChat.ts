import { useCallback, useState } from "react";
import { chatService } from "@/services/chatService";
import type { AssistantProfile } from "@/services/assistant.functions";
import { useAuth } from "./useAuth";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const { student } = useAuth();

  const send = useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question) return;
      const userMessage: ChatMessage = { id: `u-${Date.now()}`, role: "user", text: question };
      setMessages((prev) => [...prev, userMessage]);
      setThinking(true);
      try {
        const history = [...messages, userMessage].map(({ role, text }) => ({ role, text }));
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
