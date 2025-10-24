"use client";

import { useState, useMemo } from "react";
import { isSameDay } from "date-fns";
import type { Task } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/lib/utils";

interface CalendarViewProps {
  tasks: Task[];
}

export function CalendarView({ tasks }: CalendarViewProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    tasks.forEach(task => {
      if (task.date) {
        const day = task.date.toISOString().split('T')[0];
        if (!grouped[day]) {
          grouped[day] = [];
        }
        grouped[day].push(task);
      }
    });
    return grouped;
  }, [tasks]);

  const selectedDayTasks = useMemo(() => {
    if (!date) return [];
    return tasks.filter(task => task.date && isSameDay(task.date, date));
  }, [date, tasks]);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="text-xl">Calendar</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md"
          modifiers={{
            hasTask: (day) => {
              const dayString = day.toISOString().split('T')[0];
              return tasksByDate[dayString]?.length > 0;
            }
          }}
          modifiersStyles={{
            hasTask: {
              position: 'relative',
            }
          }}
           components={{
            DayContent: (props) => {
              const dayString = props.date.toISOString().split('T')[0];
              const hasTask = tasksByDate[dayString]?.length > 0;
              return (
                <div className="relative">
                  {props.date.getDate()}
                  {hasTask && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />}
                </div>
              );
            }
          }}
        />
        <div className="w-full flex-1 mt-4">
            <h3 className="font-semibold text-sm mb-2 px-1">
                Tasks for {date ? date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'selected day'}:
            </h3>
            <ScrollArea className="h-40">
                {selectedDayTasks.length > 0 ? (
                    <ul className="space-y-2">
                        {selectedDayTasks.map(task => (
                            <li key={task.id} className={cn("text-sm text-muted-foreground flex items-center", task.completed && "line-through")}>
                                <div className={cn("w-2 h-2 rounded-full mr-2", task.completed ? 'bg-green-500' : 'bg-primary')}></div>
                                {task.text}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground text-center pt-4">No tasks for this day.</p>
                )}
            </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
