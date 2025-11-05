import { useMemo, useState } from "react";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  pending?: boolean;
}

export function useLocalChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: generateId(),
      role: "assistant",
      content:
        "Hi! This chat is not connected yet. Send a message and you'll see a placeholder response. Hook up Voltagent/ChatKit to stream real replies.",
    },
  ]);

  const canSend = useMemo(() => true, []);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const user: ChatMessage = {
      id: generateId(),
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, user]);

    // Placeholder assistant message. Replace this block with
    // your Voltagent stream handling and ChatKit updates later.
    const placeholder: ChatMessage = {
      id: generateId(),
      role: "assistant",
      pending: true,
      content:
        "(placeholder) Connect your backend to stream a real response here.",
    };
    setMessages((prev) => [...prev, placeholder]);

    // Simulate a short delay and finalize the placeholder message.
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholder.id
            ? {
                ...m,
                pending: false,
                content:
                  "This is a stubbed reply. Once you wire Voltagent, replace this with streamed content.",
              }
            : m
        )
      );
    }, 600);
  };

  return { messages, canSend, sendMessage };
}

function generateId() {
  // Prefer crypto.randomUUID when available (modern browsers)
  // Fallback to a simple random string for older environments.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyCrypto: any = typeof crypto !== "undefined" ? crypto : undefined;
  if (anyCrypto?.randomUUID) return anyCrypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
