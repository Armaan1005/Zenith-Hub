"use client";

import { useState, useTransition } from "react";
import { Wand2 } from "lucide-react";
import { handleSuggestPriorities } from "@/app/actions";
import type { Task } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface AIPrioritizerProps {
  tasks: Task[];
  pomodoroInterval: number;
}

export function AIPrioritizer({ tasks, pomodoroInterval }: AIPrioritizerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [suggestion, setSuggestion] = useState<{ prioritizedTasks: string; reasoning: string } | null>(null);

  const getSuggestions = () => {
    startTransition(async () => {
      const taskList = tasks.map(t => `- ${t.text} (${t.completed ? 'completed' : 'pending'})`).join('\n');
      const calendarEvents = "No calendar connected. Current focus is on the task list."; // Placeholder
      
      const result = await handleSuggestPriorities({
        taskList,
        calendarEvents,
        pomodoroInterval,
      });

      setSuggestion(result);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Wand2 className="mr-2 h-4 w-4" />
          Suggest Priorities
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>AI Task Prioritization</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {!suggestion ? (
            <div className="text-center">
              <p className="mb-4 text-muted-foreground">
                Let AI analyze your tasks and suggest a prioritized plan to maximize your productivity.
              </p>
              <Button onClick={getSuggestions} disabled={isPending}>
                {isPending ? "Analyzing..." : "Generate Plan"}
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-96 pr-6">
              <div>
                <h3 className="mb-2 font-semibold">Prioritized Tasks</h3>
                <div className="prose prose-sm dark:prose-invert rounded-md border bg-muted/50 p-4 whitespace-pre-wrap">
                  {suggestion.prioritizedTasks}
                </div>
                <Separator className="my-4" />
                <h3 className="mb-2 font-semibold">Reasoning</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {suggestion.reasoning}
                </p>
              </div>
            </ScrollArea>
          )}
        </div>
        <DialogFooter>
          {suggestion && (
            <Button variant="ghost" onClick={getSuggestions} disabled={isPending}>
              {isPending ? "Regenerating..." : "Regenerate"}
            </Button>
          )}
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
