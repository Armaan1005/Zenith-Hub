"use client";

import { useState } from "react";
import type { Task } from "@/lib/types";

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
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', text: 'Finish project proposal', completed: false },
    { id: '2', text: 'Study for calculus exam', completed: false },
    { id: '3', text: 'Read chapter 4 of history book', completed: true },
  ]);
  const [pomodoroInterval, setPomodoroInterval] = useState(25);

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
                <MediaPlayer />
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                 <CurriculumManager />
                 <TaskManager
                  tasks={tasks}
                  setTasks={setTasks}
                  pomodoroInterval={pomodoroInterval}
                />
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
