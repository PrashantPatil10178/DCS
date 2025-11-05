import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileCode2,
  Terminal,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Files,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AssignmentFile {
  file_name: string;
  language: string;
  code: string;
}

interface AssignmentPart {
  title: string;
  files: AssignmentFile[];
  run_instructions: string[];
}

interface AssignmentDownload {
  label: string;
  href: string;
  description?: string;
}

interface Assignment {
  id: number;
  title: string;
  topic: string;
  files?: AssignmentFile[];
  parts?: AssignmentPart[];
  run_instructions?: string[];
  download?: AssignmentDownload;
}

interface AssignmentCardProps {
  assignment: Assignment;
}

export function AssignmentCard({ assignment }: AssignmentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const allFiles: AssignmentFile[] = assignment.parts
    ? assignment.parts.flatMap((part) => part.files)
    : assignment.files ?? [];

  const uniqueLanguages = Array.from(
    new Set(allFiles.map((file) => file.language).filter(Boolean))
  );

  const instructionGroups = assignment.parts
    ? assignment.parts.map((part) => ({
        title: part.title,
        steps: part.run_instructions ?? [],
      }))
    : [
        {
          title: assignment.title,
          steps: assignment.run_instructions ?? [],
        },
      ];

  const copyToClipboard = (code: string, fileName: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(fileName);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const copyAllFiles = () => {
    // Create PowerShell commands to create all files
    let output = `# Assignment ${assignment.id}: ${assignment.title}\n`;
    output += `# Topic: ${assignment.topic}\n`;
    output += `# Paste this entire block into PowerShell to create all files\n\n`;

    // Add PowerShell commands for each file
    allFiles.forEach((file) => {
      output += `@"\n${file.code}\n"@ | Out-File -FilePath "${file.file_name}" -Encoding UTF8\n`;
      output += `Write-Host "Created: ${file.file_name}" -ForegroundColor Green\n\n`;
    });

    // Add run instructions as comments and a separate instructions file
    output += `# Run Instructions:\n`;
    instructionGroups.forEach((group) => {
      if (assignment.parts) {
        output += `# ${group.title}\n`;
      }
      group.steps.forEach((instruction, index) => {
        output += `# ${index + 1}. ${instruction}\n`;
      });
      output += "#\n";
    });

    output += `\n# Creating instructions file...\n`;
    const instructionsContent = instructionGroups
      .map((group) => {
        const header = assignment.parts ? group.title : "Instructions";
        const steps = group.steps
          .map((instruction, index) => `${index + 1}. ${instruction}`)
          .join("\n");
        return `${header}\n${steps}`.trim();
      })
      .filter(Boolean)
      .join("\n\n");

    output += `@"\n${instructionsContent}\n"@ | Out-File -FilePath "RUN_INSTRUCTIONS.txt" -Encoding UTF8\n`;
    output += `Write-Host "Created: RUN_INSTRUCTIONS.txt" -ForegroundColor Green\n`;
    output += `Write-Host "All files created successfully!" -ForegroundColor Cyan\n\n`;
    output += `# Clear both session history AND persistent PSReadLine history\n`;
    output += `Write-Host "Clearing PowerShell command history..." -ForegroundColor Yellow\n`;
    output += `Clear-History\n`;
    output += `Remove-Item -Force (Get-PSReadlineOption).HistorySavePath -ErrorAction SilentlyContinue\n`;
    output += `New-Item -ItemType File -Path (Get-PSReadlineOption).HistorySavePath -Force | Out-Null\n`;
    output += `Write-Host "Terminal history completely cleared (session + persistent file)." -ForegroundColor Green\n`;
    output += `Write-Host "Close and reopen PowerShell for full effect." -ForegroundColor Yellow\n`;

    // Copy to clipboard
    navigator.clipboard.writeText(output);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <Card className="w-full rounded-lg border bg-card text-card-foreground">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline">#{assignment.id}</Badge>
              <CardTitle className="text-xl font-semibold">
                {assignment.title}
              </CardTitle>
            </div>
            <CardDescription className="flex items-center gap-2">
              <FileCode2 className="w-4 h-4" />
              {assignment.topic}
            </CardDescription>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-md border hover:bg-muted"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* File Count Badge */}
        <div className="flex gap-2 flex-wrap items-center justify-between">
          <div className="flex gap-2">
            <Badge variant="secondary">
              {allFiles.length} {allFiles.length === 1 ? "File" : "Files"}
            </Badge>
            {uniqueLanguages.length > 0 && (
              <Badge variant="secondary">
                {uniqueLanguages.length === 1
                  ? uniqueLanguages[0]
                  : `${uniqueLanguages.length} languages`}
              </Badge>
            )}
            {assignment.parts && (
              <Badge variant="outline">{assignment.parts.length} parts</Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={copyAllFiles}
            className="gap-2"
            disabled={
              allFiles.length === 0 &&
              instructionGroups.every((g) => g.steps.length === 0)
            }
          >
            {copiedAll ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Copied All
              </>
            ) : (
              <>
                <Files className="w-3.5 h-3.5" />
                Copy All
              </>
            )}
          </Button>
          {assignment.download && (
            <Button variant="default" size="sm" className="gap-2" asChild>
              <a
                href={assignment.download.href}
                download
                title={assignment.download.description}
              >
                <Download className="w-3.5 h-3.5" />
                {assignment.download.label}
              </a>
            </Button>
          )}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4 pt-0">
          <Tabs defaultValue="code" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="code">
                <FileCode2 className="w-4 h-4 mr-2" />
                Source Code
              </TabsTrigger>
              <TabsTrigger value="instructions">
                <Terminal className="w-4 h-4 mr-2" />
                Run Instructions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="code" className="space-y-4 mt-4">
              {assignment.parts
                ? assignment.parts.map((part, partIndex) => (
                    <div key={partIndex} className="space-y-3">
                      <h4 className="text-sm font-semibold text-muted-foreground">
                        {part.title}
                      </h4>
                      {part.files.map((file, fileIndex) => (
                        <div
                          key={`${partIndex}-${fileIndex}`}
                          className="rounded-md border overflow-hidden"
                        >
                          <div className="flex items-center justify-between bg-muted px-4 py-2 border-b">
                            <div className="flex items-center gap-3">
                              <FileCode2 className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-mono font-medium">
                                {file.file_name}
                              </span>
                            </div>
                            <button
                              onClick={() =>
                                copyToClipboard(file.code, file.file_name)
                              }
                              className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-md border bg-background hover:bg-muted"
                            >
                              {copiedCode === file.file_name ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  Copy
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="bg-muted p-4 overflow-x-auto">
                            <code className="text-sm text-muted-foreground font-mono leading-relaxed">
                              {file.code}
                            </code>
                          </pre>
                        </div>
                      ))}
                    </div>
                  ))
                : assignment.files?.map((file, index) => (
                    <div
                      key={index}
                      className="rounded-md border overflow-hidden"
                    >
                      <div className="flex items-center justify-between bg-muted px-4 py-2 border-b">
                        <div className="flex items-center gap-3">
                          <FileCode2 className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-mono font-medium">
                            {file.file_name}
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            copyToClipboard(file.code, file.file_name)
                          }
                          className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-md border bg-background hover:bg-muted"
                        >
                          {copiedCode === file.file_name ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="bg-muted p-4 overflow-x-auto">
                        <code className="text-sm text-muted-foreground font-mono leading-relaxed">
                          {file.code}
                        </code>
                      </pre>
                    </div>
                  ))}
              {allFiles.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No source files included for this assignment. Use the download
                  link if provided.
                </p>
              )}
            </TabsContent>

            <TabsContent value="instructions" className="mt-4">
              <div className="rounded-md border">
                <div className="px-4 py-2 border-b bg-muted flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  <span className="text-sm font-medium">Terminal commands</span>
                </div>
                <div className="p-4">
                  {instructionGroups.every(
                    (group) => group.steps.length === 0
                  ) ? (
                    <p className="text-sm text-muted-foreground">
                      No run instructions provided.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {instructionGroups.map((group, groupIndex) => (
                        <div key={groupIndex} className="space-y-2">
                          {assignment.parts && (
                            <h4 className="text-xs uppercase tracking-wide text-muted-foreground">
                              {group.title}
                            </h4>
                          )}
                          <ol className="list-decimal pl-6 space-y-2">
                            {group.steps.map((instruction, index) => (
                              <li
                                key={index}
                                className="text-sm text-muted-foreground font-mono"
                              >
                                {instruction}
                              </li>
                            ))}
                          </ol>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
}
