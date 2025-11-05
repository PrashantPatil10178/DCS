import { lazy, Suspense, useState } from "react";
import { assignmentsData } from "./data/assignments";
import { AssignmentCard } from "@/components/AssignmentCard";
import { Button } from "@/components/ui/button";
import { MessageCircle, Loader2 } from "lucide-react";

const LazyChatDock = lazy(() =>
  import("./chat/components/ChatDock").then((module) => ({
    default: module.ChatDock,
  }))
);

export default function App() {
  const assignments = assignmentsData.assignments;
  const [chatLoaded, setChatLoaded] = useState(false);
  const [chatInitialOpen, setChatInitialOpen] = useState(false);

  const handleLaunchChat = () => {
    setChatLoaded(true);
    setChatInitialOpen(true);
  };

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white font-sans antialiased">
      {/* Header */}

      {/* Overview Stats (4 Cards per Row) */}
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        {/* Assignments */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Assignments</h2>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {assignments.length} items
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {assignments.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))}
          </div>
        </section>
      </main>

      {chatLoaded ? (
        <Suspense fallback={<ChatLauncherButton showSpinner disabled />}>
          <LazyChatDock initialOpen={chatInitialOpen} />
        </Suspense>
      ) : (
        <ChatLauncherButton onClick={handleLaunchChat} />
      )}
    </div>
  );
}

interface ChatLauncherButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  showSpinner?: boolean;
}

function ChatLauncherButton({
  onClick,
  disabled = false,
  showSpinner = false,
}: ChatLauncherButtonProps) {
  return (
    <Button
      size="icon-lg"
      className="rounded-full shadow-lg fixed bottom-4 right-4 z-40"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={showSpinner ? "Loading chat" : "Open chat"}
    >
      {showSpinner ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <MessageCircle className="w-5 h-5" />
      )}
    </Button>
  );
}
