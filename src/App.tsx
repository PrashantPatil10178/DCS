import { assignmentsData } from "./data/assignments";
import { AssignmentCard } from "@/components/AssignmentCard";
import { ChatDock } from "./chat/components/ChatDock";

export default function App() {
  const assignments = assignmentsData.assignments;

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

      <ChatDock />
    </div>
  );
}
