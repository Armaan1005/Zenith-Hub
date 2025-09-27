"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Play, Pause, RefreshCw, Settings, SkipForward } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type Mode = "work" | "shortBreak" | "longBreak";

interface PomodoroTimerProps {
  pomodoroInterval: number;
  setPomodoroInterval: (interval: number) => void;
}

export function PomodoroTimer({ pomodoroInterval, setPomodoroInterval }: PomodoroTimerProps) {
  const [shortBreakInterval, setShortBreakInterval] = useState(5);
  const [longBreakInterval, setLongBreakInterval] = useState(15);
  const [cycles, setCycles] = useState(0);

  const timeDurations: Record<Mode, number> = useMemo(() => ({
    work: pomodoroInterval,
    shortBreak: shortBreakInterval,
    longBreak: longBreakInterval,
  }), [pomodoroInterval, shortBreakInterval, longBreakInterval]);

  const [mode, setMode] = useState<Mode>("work");
  const [timeLeft, setTimeLeft] = useState(timeDurations[mode] * 60);
  const [isActive, setIsActive] = useState(false);
  const { toast } = useToast();

  const switchMode = useCallback((newMode: Mode) => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(timeDurations[newMode] * 60);
  }, [timeDurations]);

  useEffect(() => {
    switchMode(mode);
  }, [timeDurations, mode, switchMode]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      
      const prevMode = mode;

      if (mode === "work") {
        const newCycles = cycles + 1;
        setCycles(newCycles);
        const nextMode = newCycles % 4 === 0 ? "longBreak" : "shortBreak";
        switchMode(nextMode);
      } else {
        switchMode("work");
      }
      
      toast({
        title: "Time's up!",
        description: `Your ${prevMode.replace(/([A-Z])/g, ' $1').toLowerCase()} session has ended. Time for a ${mode === 'work' ? 'work session' : 'break'}.`,
      });

    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, timeLeft, cycles, mode, switchMode, toast]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(timeDurations[mode] * 60);
  };
  
  const skipToNext = () => {
    const prevMode = mode;
    if (mode === "work") {
      const newCycles = cycles + 1;
      setCycles(newCycles);
      const nextMode = newCycles % 4 === 0 ? "longBreak" : "shortBreak";
      switchMode(nextMode);
       toast({
        title: "Session Skipped",
        description: `Skipped ${prevMode.replace(/([A-Z])/g, ' $1').toLowerCase()} session. Starting ${nextMode.replace(/([A-Z])/g, ' $1').toLowerCase()}.`,
      });
    } else {
      switchMode("work");
       toast({
        title: "Break Skipped",
        description: `Skipped ${prevMode.replace(/([A-Z])/g, ' $1').toLowerCase()}. Starting work session.`,
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const totalDuration = timeDurations[mode] * 60;
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl">Pomodoro Timer</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-center justify-center gap-4">
        <Tabs value={mode} onValueChange={(value) => switchMode(value as Mode)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="work">Work</TabsTrigger>
            <TabsTrigger value="shortBreak">Short Break</TabsTrigger>
            <TabsTrigger value="longBreak">Long Break</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative flex h-52 w-52 items-center justify-center">
          <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r={radius}
              className="stroke-muted"
              strokeWidth="10"
              fill="transparent"
            />
            <circle
              cx="100"
              cy="100"
              r={radius}
              className="stroke-primary transition-all duration-1000 ease-linear"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          <span className="font-mono text-5xl font-bold text-foreground">
            {formatTime(timeLeft)}
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          Cycles completed: {cycles}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center gap-2">
        <Button onClick={toggleTimer} size="icon" className="h-12 w-12 rounded-full">
          {isActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          <span className="sr-only">{isActive ? "Pause" : "Play"}</span>
        </Button>
        <Button onClick={resetTimer} size="icon" variant="outline" className="h-12 w-12 rounded-full">
          <RefreshCw className="h-5 w-5" />
          <span className="sr-only">Reset</span>
        </Button>
         <Button onClick={skipToNext} size="icon" variant="outline" className="h-12 w-12 rounded-full">
          <SkipForward className="h-5 w-5" />
          <span className="sr-only">Skip</span>
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="icon" variant="outline" className="h-12 w-12 rounded-full">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Timer Settings</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="work" className="text-right">Work</Label>
                <Input id="work" type="number" value={pomodoroInterval} onChange={(e) => setPomodoroInterval(Number(e.target.value))} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="short-break" className="text-right">Short Break</Label>
                <Input id="short-break" type="number" value={shortBreakInterval} onChange={(e) => setShortBreakInterval(Number(e.target.value))} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="long-break" className="text-right">Long Break</Label>
                <Input id="long-break" type="number" value={longBreakInterval} onChange={(e) => setLongBreakInterval(Number(e.target.value))} className="col-span-3" />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
