import { useCallback, useState } from "react";
import { chatService } from "@/services/chatService";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [thinking, setThinking] = useState(false);

  const send = useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question) return;
      const userMessage: ChatMessage = { id: `u-${Date.now()}`, role: "user", text: question };
      setMessages((prev) => [...prev, userMessage]);
      setThinking(true);
      try {
        const history = [...messages, userMessage].map(({ role, text }) => ({ role, text }));
        const reply = await chatService.ask(history);
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
    [messages],
  );

  return { messages, thinking, send };
}
