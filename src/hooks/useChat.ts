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

  const send = useCallback(async (text: string) => {
    const question = text.trim();
    if (!question) return;
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", text: question }]);
    setThinking(true);
    try {
      const reply = await chatService.ask(question);
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
  }, []);

  return { messages, thinking, send };
}
