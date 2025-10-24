"use client";

import { useState, useEffect } from "react";
import type { Task, Subject } from "@/lib/types";

import { Header } from "@/components/dashboard/header";
import { PomodoroTimer } from "@/components/dashboard/pomodoro-timer";
import { TaskManager } from "@/components/dashboard/task-manager";
import { MediaPlayer } from "@/components/dashboard/media-player";
import { CalendarView } from "@/components/dashboard/calendar-view";
import { GeminiChat } from "@/components/dashboard/gemini-chat";
import { ArduinoControl } from "@/components/dashboard/arduino-control";
import { Toaster } from "@/components/ui/toaster";
import { CurriculumManager } from "@/components/dashboard/curriculum-manager";

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [pomodoroInterval, setPomodoroInterval] = useState(25);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const storedTasks = localStorage.getItem("zenith_tasks");
      if (storedTasks) {
        // Dates are stored as ISO strings, need to convert back to Date objects
        const parsedTasks = JSON.parse(storedTasks).map((task: Task) => ({
          ...task,
          date: task.date ? new Date(task.date) : undefined,
        }));
        setTasks(parsedTasks);
      } else {
        // Initialize with example data only on the client
         setTasks([
            { id: '1', text: 'Finish project proposal', completed: false, date: new Date() },
            { id: '2', text: 'Study for calculus exam', completed: false },
            { id: '3', text: 'Read chapter 4 of history book', completed: true },
        ]);
      }

      const storedSubjects = localStorage.getItem("curriculum_subjects");
      if (storedSubjects) {
        setSubjects(JSON.parse(storedSubjects));
      }
    } catch (error) {
      console.error("Failed to parse from localStorage", error);
       // Set default example tasks on error as well
       setTasks([
            { id: '1', text: 'Finish project proposal', completed: false, date: new Date() },
            { id: '2', text: 'Study for calculus exam', completed: false },
            { id: '3', text: 'Read chapter 4 of history book', completed: true },
        ]);
    }
  }, []);

  useEffect(() => {
    // Only run localStorage logic on the client
    if (isClient) {
      localStorage.setItem("zenith_tasks", JSON.stringify(tasks));
    }
  }, [tasks, isClient]);

  // Render a loading state or nothing until the client has mounted
  // This prevents rendering components that rely on client-side data on the server
  if (!isClient) {
    return null; // Or a loading spinner
  }

  return (
    <>
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto grid w-full max-w-screen-2xl grid-cols-1 items-start gap-6 lg:grid-cols-4">
            <div className="grid auto-rows-max items-start gap-6 lg:col-span-3">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <PomodoroTimer
                    pomodoroInterval={pomodoroInterval}
                    setPomodoroInterval={setPomodoroInterval}
                  />
                </div>
                <ArduinoControl />
              </div>
              <div className="grid gap-6">
                <MediaPlayer subjects={subjects} setSubjects={setSubjects} />
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                 <CurriculumManager subjects={subjects} setSubjects={setSubjects} />
              </div>
               <div className="grid gap-6 md:grid-cols-5">
                <div className="md:col-span-3">
                    <TaskManager
                        tasks={tasks}
                        setTasks={setTasks}
                        subjects={subjects}
                        pomodoroInterval={pomodoroInterval}
                    />
                </div>
                <div className="md:col-span-2">
                    <CalendarView tasks={tasks} subjects={subjects} />
                </div>
              </div>
            </div>

            <div className="grid auto-rows-max items-start gap-6 lg:col-span-1">
              <GeminiChat />
            </div>
          </div>
        </main>
      </div>
      <Toaster />
    </>
  );
}
