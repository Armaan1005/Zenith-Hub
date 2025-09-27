"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import type { Task } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AIPrioritizer } from "./ai-prioritizer";
import { cn } from "@/lib/utils";

interface TaskManagerProps {
  tasks: Task[];
  setTasks: Dispatch<SetStateAction<Task[]>>;
  pomodoroInterval: number;
}

export function TaskManager({ tasks, setTasks, pomodoroInterval }: TaskManagerProps) {
  const [newTaskText, setNewTaskText] = useState("");

  const handleAddTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newTaskText.trim() === "") return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: newTaskText.trim(),
      completed: false,
    };
    setTasks([newTask, ...tasks]);
    setNewTaskText("");
  };

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const clearCompleted = () => {
    setTasks(tasks.filter((task) => !task.completed));
  };
  
  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Task Manager</CardTitle>
        <AIPrioritizer tasks={tasks} pomodoroInterval={pomodoroInterval} />
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <form onSubmit={handleAddTask} className="flex gap-2">
          <Input
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Add a new task..."
          />
          <Button type="submit" size="icon">
            <Plus className="h-4 w-4" />
            <span className="sr-only">Add Task</span>
          </Button>
        </form>
        <ScrollArea className="h-64 pr-4">
          <div className="space-y-2">
          <AnimatePresence>
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 rounded-md p-2 hover:bg-muted/50"
              >
                <Checkbox
                  id={`task-${task.id}`}
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id)}
                />
                <label
                  htmlFor={`task-${task.id}`}
                  className={cn(
                    "flex-1 cursor-pointer text-sm font-medium leading-none transition-colors",
                    task.completed ? "text-muted-foreground line-through" : "text-foreground"
                  )}
                >
                  {task.text}
                </label>
              </motion.div>
            ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <Button
          onClick={clearCompleted}
          variant="ghost"
          size="sm"
          disabled={completedCount === 0}
          className="text-muted-foreground"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clear {completedCount} Completed Task(s)
        </Button>
      </CardFooter>
    </Card>
  );
}
