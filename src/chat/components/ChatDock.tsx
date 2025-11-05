import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, Loader2, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const MARKDOWN_LANGUAGES = new Set(["markdown", "md", "mdx"]);

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Code block component with copy button
function CodeBlock({ language, value }: { language?: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const normalizedLanguage = language?.toLowerCase().trim();
  const isMarkdownSnippet = normalizedLanguage
    ? MARKDOWN_LANGUAGES.has(normalizedLanguage)
    : false;
  const displayLanguage =
    !isMarkdownSnippet && language && language !== "text" ? language : null;

  if (isMarkdownSnippet) {
    return (
      <div className="my-3 space-y-3 rounded-xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white/95 dark:bg-neutral-950/80 px-4 py-3">
        <ReactMarkdown components={markdownComponents}>
          {value.trim()}
        </ReactMarkdown>
      </div>
    );
  }

  return (
    <div className="relative group my-4 overflow-hidden rounded-xl border border-neutral-200/60 dark:border-neutral-800/80 bg-[#1e1e1e] shadow-sm">
      <div className="absolute right-2 top-2 z-10">
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 text-xs bg-neutral-700 hover:bg-neutral-600 text-white rounded-md flex items-center gap-1.5 transition-colors opacity-0 group-hover:opacity-100"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy
            </>
          )}
        </button>
      </div>
      {displayLanguage && (
        <div className="absolute left-3 top-2 z-10 px-2 py-0.5 text-[10px] font-medium tracking-wide bg-neutral-900/80 text-neutral-200 rounded uppercase font-mono">
          {displayLanguage}
        </div>
      )}
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={displayLanguage || language || "text"}
        PreTag="div"
        className="mt-0!"
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: "0.85rem",
          paddingTop: displayLanguage ? "2.5rem" : "1.25rem",
          paddingBottom: "1.25rem",
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem",
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}

const markdownComponents: Components = {
  code({ inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className ?? "");
    const codeString = String(children).replace(/\n$/, "");

    if (!inline && match) {
      return <CodeBlock language={match[1]} value={codeString} />;
    }

    return (
      <code
        className="px-1.5 py-0.5 rounded-md bg-neutral-200/70 dark:bg-neutral-800/80 text-xs font-mono text-neutral-900 dark:text-neutral-100"
        {...props}
      >
        {children}
      </code>
    );
  },
  p({ children }: any) {
    return (
      <p className="text-sm leading-relaxed text-neutral-800 dark:text-neutral-100 whitespace-pre-wrap">
        {children}
      </p>
    );
  },
  h1({ children }: any) {
    return (
      <h1 className="text-base font-semibold text-neutral-900 dark:text-neutral-50 mt-4 mb-2">
        {children}
      </h1>
    );
  },
  h2({ children }: any) {
    return (
      <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mt-3 mb-1.5">
        {children}
      </h2>
    );
  },
  h3({ children }: any) {
    return (
      <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mt-2 mb-1">
        {children}
      </h3>
    );
  },
  ul({ children }: any) {
    return (
      <ul className="list-disc list-inside space-y-1 text-sm leading-relaxed text-neutral-800 dark:text-neutral-100">
        {children}
      </ul>
    );
  },
  ol({ children }: any) {
    return (
      <ol className="list-decimal list-inside space-y-1 text-sm leading-relaxed text-neutral-800 dark:text-neutral-100">
        {children}
      </ol>
    );
  },
  li({ children }: any) {
    return <li className="whitespace-pre-wrap">{children}</li>;
  },
  strong({ children }: any) {
    return (
      <strong className="font-semibold text-neutral-900 dark:text-neutral-50">
        {children}
      </strong>
    );
  },
  em({ children }: any) {
    return <em className="italic">{children}</em>;
  },
  a({ href, children }: any) {
    return (
      <a
        href={href}
        className="text-primary underline-offset-2 hover:underline"
        target="_blank"
        rel="noreferrer"
      >
        {children}
      </a>
    );
  },
  blockquote({ children }: any) {
    return (
      <blockquote className="border-l-2 border-neutral-300 dark:border-neutral-700 pl-3 italic text-neutral-700 dark:text-neutral-300">
        {children}
      </blockquote>
    );
  },
  hr() {
    return <hr className="my-4 border-neutral-200 dark:border-neutral-700" />;
  },
};

export function ChatDock() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId] = useState(() => `conv_${Date.now()}`);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const greeting = `Hi! I'm your Distributed Computing Systems assistant. Ask me anything about the DCS assignments, socket programming, RMI, clock synchronization, MapReduce, or any code in this project.`;

  const suggestedPrompts = [
    {
      label: "Explain Echo Server",
      prompt:
        "Explain how the Echo Server implementation works in Assignment 1",
    },
    {
      label: "RMI Architecture",
      prompt:
        "How does the RMI (Remote Method Invocation) work in Assignment 2?",
    },
    {
      label: "Berkeley Algorithm",
      prompt:
        "Explain the Berkeley clock synchronization algorithm implementation",
    },
    {
      label: "MapReduce Flow",
      prompt: "Walk me through the MapReduce word count implementation",
    },
  ];

  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, autoScroll]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setAutoScroll(isNearBottom);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "http://localhost:3141/agents/DCS%20Code%20Assistant/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify({
            input: [
              {
                parts: [{ type: "text", text: text }],
                id: userMessage.id,
                role: "user",
              },
            ],
            options: {
              conversationId: conversationId,
              userId: "DCS_Student",
              temperature: 0.7,
              maxTokens: 16000,
              maxSteps: 15,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Voltagent error: ${response.statusText}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      if (reader) {
        const assistantId = crypto.randomUUID();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.slice(6).trim();

              // Skip [DONE] marker
              if (dataStr === "[DONE]") continue;

              try {
                const data = JSON.parse(dataStr);

                // Handle text-delta events from Voltagent
                if (data.type === "text-delta" && data.delta) {
                  assistantMessage += data.delta;

                  // Update message in real-time
                  setMessages((prev) => {
                    const filtered = prev.filter((m) => m.id !== assistantId);
                    return [
                      ...filtered,
                      {
                        id: assistantId,
                        role: "assistant",
                        content: assistantMessage,
                        timestamp: new Date(),
                      },
                    ];
                  });
                }
                // Also handle generic text content (fallback)
                else if (data.type === "text" && data.content) {
                  assistantMessage += data.content;

                  setMessages((prev) => {
                    const filtered = prev.filter((m) => m.id !== assistantId);
                    return [
                      ...filtered,
                      {
                        id: assistantId,
                        role: "assistant",
                        content: assistantMessage,
                        timestamp: new Date(),
                      },
                    ];
                  });
                }
              } catch (e) {
                // Skip invalid JSON or other markers
                console.debug("Skipping SSE line:", dataStr);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Sorry, I couldn't connect to the Voltagent server. Make sure it's running at http://localhost:3141",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptClick = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div className="mb-3 w-[95vw] sm:w-[88vw] max-w-3xl h-[70vh] md:h-[78vh] min-h-[520px] bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 rounded-2xl shadow-xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
            <h2 className="font-semibold text-sm">DCS Code Assistant</h2>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              ✕
            </Button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 p-4 overflow-y-auto"
            ref={scrollRef}
            onScroll={handleScroll}
          >
            {messages.length === 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{greeting}</p>
                <div className="grid grid-cols-1 gap-2">
                  {suggestedPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handlePromptClick(prompt.prompt)}
                      className="text-left px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                    >
                      {prompt.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => {
                  const isUser = message.role === "user";

                  return (
                    <div
                      key={message.id}
                      className={`flex ${
                        isUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl text-sm shadow-sm border backdrop-blur ${
                          isUser
                            ? "bg-primary text-primary-foreground border-primary/70"
                            : "bg-white/90 dark:bg-neutral-950/60 border-neutral-200/70 dark:border-neutral-800/70 text-neutral-900 dark:text-neutral-50"
                        } p-4 space-y-3 transition-colors`}
                      >
                        <div
                          className={`uppercase text-[10px] tracking-wide font-semibold ${
                            isUser
                              ? "text-primary-foreground/70"
                              : "text-neutral-500 dark:text-neutral-400"
                          }`}
                        >
                          {isUser ? "You" : "Assistant"}
                        </div>

                        <div className="space-y-3">
                          {isUser ? (
                            <div className="whitespace-pre-wrap leading-relaxed">
                              {message.content}
                            </div>
                          ) : (
                            <div className="flex flex-col gap-3 text-sm leading-relaxed text-neutral-800 dark:text-neutral-100">
                              <ReactMarkdown components={markdownComponents}>
                                {message.content.trim()}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-neutral-200 dark:border-neutral-800 p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about DCS assignments..."
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-sm rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className="rounded-full"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
            <p className="text-[10px] text-muted-foreground mt-2 text-center">
              AI assistant for DCS assignments. Responses based on project code.
            </p>
          </div>
        </div>
      )}
      <Button
        size="icon-lg"
        className="rounded-full shadow-lg"
        aria-label={open ? "Close chat" : "Open chat"}
        onClick={() => setOpen((v) => !v)}
      >
        <MessageCircle className="w-5 h-5" />
      </Button>
    </div>
  );
}
