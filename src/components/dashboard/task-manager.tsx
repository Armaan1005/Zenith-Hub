
"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Plus, Trash2, CalendarIcon, Tag, Edit, Save, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";

import type { Task, Subject } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { AIPrioritizer } from "./ai-prioritizer";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TaskManagerProps {
  tasks: Task[];
  setTasks: Dispatch<SetStateAction<Task[]>>;
  subjects: Subject[];
  pomodoroInterval: number;
}

export function TaskManager({ tasks, setTasks, subjects, pomodoroInterval }: TaskManagerProps) {
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskDate, setNewTaskDate] = useState<Date | undefined>();
  const [newTaskSubjectId, setNewTaskSubjectId] = useState<string | undefined>();
  
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskData, setEditingTaskData] = useState<Partial<Task> | null>(null);


  const getSubjectName = (subjectId: string | undefined) => {
    if (!subjectId) return null;
    return subjects.find(s => s.id === subjectId)?.name;
  };
   const getSubjectColor = (subjectId: string | undefined) => {
    if (!subjectId) return 'hsl(var(--border))';
    return subjects.find(s => s.id === subjectId)?.color;
  };

  const handleAddTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newTaskText.trim() === "") return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: newTaskText.trim(),
      completed: false,
      date: newTaskDate,
      subjectId: newTaskSubjectId,
    };
    setTasks([newTask, ...tasks]);
    setNewTaskText("");
    setNewTaskDate(undefined);
    setNewTaskSubjectId(undefined);
  };

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };
  
  const handleEditStart = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTaskData({ ...task });
  };
  
  const handleEditCancel = () => {
    setEditingTaskId(null);
    setEditingTaskData(null);
  };
  
  const handleEditSave = () => {
    if (!editingTaskId || !editingTaskData) return;
    setTasks(tasks.map(task => task.id === editingTaskId ? { ...task, ...editingTaskData } as Task : task));
    handleEditCancel();
  };

  const clearCompleted = () => {
    setTasks(tasks.filter((task) => !task.completed));
  };
  
  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">To-do List</CardTitle>
        <AIPrioritizer tasks={tasks} pomodoroInterval={pomodoroInterval} />
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4">
        <form onSubmit={handleAddTask} className="relative space-y-2">
          <Input
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Add a new task..."
            className="pr-12"
          />
          <div className="flex gap-2">
             <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className={cn("justify-start text-left font-normal", !newTaskDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newTaskDate ? format(newTaskDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={newTaskDate} onSelect={setNewTaskDate} initialFocus />
                </PopoverContent>
            </Popover>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="justify-start text-left font-normal">
                        <Tag className="mr-2 h-4 w-4" />
                        <span>{getSubjectName(newTaskSubjectId) || "Add Tag"}</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-56">
                  <Command>
                    <CommandInput placeholder="Select subject..." />
                    <CommandList>
                      <CommandEmpty>No subjects found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem onSelect={() => setNewTaskSubjectId(undefined)}>
                           (No Subject)
                        </CommandItem>
                        {subjects.map(subject => (
                          <CommandItem key={subject.id} value={subject.name} onSelect={() => setNewTaskSubjectId(subject.id)}>
                            {subject.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
            </Popover>
          </div>
          <Button
            type="submit"
            size="icon"
            className="absolute right-1 top-0 h-7 w-7"
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Add Task</span>
          </Button>
        </form>
        <ScrollArea className="flex-1 pr-4 -mr-4">
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
                className="flex items-start gap-3 rounded-md p-2 hover:bg-muted/50 group"
              >
                <Checkbox
                  id={`task-${task.id}`}
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id)}
                  className="mt-1"
                  disabled={!!editingTaskId}
                />
                
                {editingTaskId === task.id ? (
                  <div className="flex-1 space-y-2">
                    <Input 
                      value={editingTaskData?.text || ''}
                      onChange={(e) => setEditingTaskData({ ...editingTaskData, text: e.target.value })}
                      className="h-8"
                    />
                    <div className="flex gap-2">
                      <Popover>
                          <PopoverTrigger asChild>
                              <Button variant="outline" size="sm" className={cn("justify-start text-left font-normal h-8", !editingTaskData?.date && "text-muted-foreground")}>
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {editingTaskData?.date ? format(editingTaskData.date, "PPP") : <span>Pick a date</span>}
                              </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                              <Calendar mode="single" selected={editingTaskData?.date} onSelect={(date) => setEditingTaskData({...editingTaskData, date: date || undefined})} initialFocus />
                          </PopoverContent>
                      </Popover>
                       <Popover>
                          <PopoverTrigger asChild>
                              <Button variant="outline" size="sm" className="justify-start text-left font-normal h-8">
                                  <Tag className="mr-2 h-4 w-4" />
                                  <span>{getSubjectName(editingTaskData?.subjectId) || "Add Tag"}</span>
                              </Button>
                          </PopoverTrigger>
                           <PopoverContent className="p-0 w-56">
                            <Command>
                              <CommandInput placeholder="Select subject..." />
                              <CommandList>
                                <CommandEmpty>No subjects found.</CommandEmpty>
                                <CommandGroup>
                                  <CommandItem onSelect={() => setEditingTaskData({...editingTaskData, subjectId: undefined})}>
                                    (No Subject)
                                  </CommandItem>
                                  {subjects.map(subject => (
                                    <CommandItem key={subject.id} value={subject.name} onSelect={() => setEditingTaskData({...editingTaskData, subjectId: subject.id})}>
                                      {subject.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                      <label
                      htmlFor={`task-${task.id}`}
                      className={cn(
                          "cursor-pointer text-sm font-medium leading-none transition-colors",
                          task.completed ? "text-muted-foreground line-through" : "text-foreground"
                      )}
                      >
                      {task.text}
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                          {task.date && (
                              <Badge variant="outline" className="text-xs">
                                  <CalendarIcon className="mr-1 h-3 w-3" />
                                  {format(task.date, "MMM d")}
                              </Badge>
                          )}
                          {task.subjectId && (
                              <Badge variant="outline" style={{borderColor: getSubjectColor(task.subjectId), color: getSubjectColor(task.subjectId)}} className="text-xs bg-opacity-10">
                                  {getSubjectName(task.subjectId)}
                              </Badge>
                          )}
                      </div>
                  </div>
                )}
                 <div className="flex items-center self-start">
                    {editingTaskId === task.id ? (
                      <>
                        <Button onClick={handleEditSave} size="icon" className="h-7 w-7"><Save className="h-4 w-4"/></Button>
                        <Button onClick={handleEditCancel} size="icon" variant="ghost" className="h-7 w-7"><X className="h-4 w-4"/></Button>
                      </>
                    ) : (
                      <Button 
                        onClick={() => handleEditStart(task)} 
                        size="icon" 
                        variant="ghost" 
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={!!editingTaskId}
                      >
                        <Edit className="h-4 w-4"/>
                      </Button>
                    )}
                 </div>
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
          disabled={completedCount === 0 || !!editingTaskId}
          className="text-muted-foreground"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clear {completedCount} Completed Task(s)
        </Button>
      </CardFooter>
    </Card>
  );
}
 