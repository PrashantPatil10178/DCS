import { useEffect, useRef, useState } from "react";
import { X, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useLocalChat } from "../hooks/useLocalChat";

type ChatWindowProps = {
  onClose?: () => void;
};

export function ChatWindow({ onClose }: ChatWindowProps) {
  const { messages, sendMessage } = useLocalChat();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    sendMessage(text);
    setInput("");
  };

  return (
    <Card className="w-full max-w-md h-[520px] flex flex-col border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="font-medium">Chat</div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close chat"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      <Separator />

      <div className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg border px-3 py-2 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-background"
                    : "bg-muted text-muted-foreground"
                } ${m.pending ? "opacity-70 animate-pulse" : ""}`}
              >
                {m.content}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      <Separator />
      <form onSubmit={onSubmit} className="p-3 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 h-10 rounded-md border border-neutral-200 dark:border-neutral-800 bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button type="submit" size="icon" aria-label="Send message">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </Card>
  );
}
