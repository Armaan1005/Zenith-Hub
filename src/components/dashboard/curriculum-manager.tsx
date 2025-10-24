"use client";

import { useState, useEffect, useMemo, Dispatch, SetStateAction } from "react";
import type { Subject, Chapter } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Trash2, Edit, Save, X, BookOpen, Palette } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

interface CurriculumManagerProps {
  subjects: Subject[];
  setSubjects: Dispatch<SetStateAction<Subject[]>>;
}

export function CurriculumManager({ subjects, setSubjects }: CurriculumManagerProps) {
  const [newSubjectName, setNewSubjectName] = useState("");
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editingSubjectName, setEditingSubjectName] = useState("");
  const [newChapterNames, setNewChapterNames] = useState<Record<string, string>>({});

  useEffect(() => {
    localStorage.setItem("curriculum_subjects", JSON.stringify(subjects));
    // Dispatch a storage event to notify other components like ClassroomManager
    window.dispatchEvent(new Event('storage'));
  }, [subjects]);

  const handleAddSubject = () => {
    if (newSubjectName.trim() === "") return;
    const newSubject: Subject = {
      id: crypto.randomUUID(),
      name: newSubjectName.trim(),
      chapters: [],
      color: CHART_COLORS[subjects.length % CHART_COLORS.length],
    };
    setSubjects([...subjects, newSubject]);
    setNewSubjectName("");
    setIsAddingSubject(false);
  };

  const handleAddChapter = (subjectId: string) => {
    const chapterName = newChapterNames[subjectId]?.trim();
    if (!chapterName) return;

    const newChapter: Chapter = {
      id: crypto.randomUUID(),
      name: chapterName,
      completed: false,
    };

    setSubjects(subjects.map(s => 
      s.id === subjectId ? { ...s, chapters: [...s.chapters, newChapter] } : s
    ));
    setNewChapterNames({ ...newChapterNames, [subjectId]: "" });
  };

  const toggleChapter = (subjectId: string, chapterId: string) => {
    setSubjects(subjects.map(s => 
      s.id === subjectId 
        ? { ...s, chapters: s.chapters.map(c => c.id === chapterId ? { ...c, completed: !c.completed } : c) }
        : s
    ));
  };
  
  const deleteSubject = (subjectId: string) => {
    setSubjects(subjects.filter(s => s.id !== subjectId));
  };
  
  const deleteChapter = (subjectId: string, chapterId: string) => {
     setSubjects(subjects.map(s => 
      s.id === subjectId 
        ? { ...s, chapters: s.chapters.filter(c => c.id !== chapterId)}
        : s
    ));
  };

  const startEditing = (subject: Subject) => {
    setEditingSubjectId(subject.id);
    setEditingSubjectName(subject.name);
  };

  const saveEditing = (subjectId: string) => {
    setSubjects(subjects.map(s => 
      s.id === subjectId ? { ...s, name: editingSubjectName } : s
    ));
    setEditingSubjectId(null);
  };
  
  const handleColorChange = (subjectId: string, color: string) => {
      setSubjects(subjects.map(s => s.id === subjectId ? { ...s, color } : s));
  };


  const chartData = useMemo(() => {
    return subjects.map(subject => {
      const totalChapters = subject.chapters.length;
      const completedChapters = subject.chapters.filter(c => c.completed).length;
      const progress = totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;
      return {
        name: subject.name,
        progress: parseFloat(progress.toFixed(1)),
        fill: subject.color,
      };
    });
  }, [subjects]);

  return (
    <Card className="flex flex-col md:col-span-2">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
            <BookOpen />
            Curriculum Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-96">
            <div className="flex flex-col gap-4">
                <h3 className="font-semibold">Chapter Checklist</h3>
                <ScrollArea className="pr-4 flex-1">
                    <Accordion type="multiple" className="w-full">
                    {subjects.map(subject => (
                        <AccordionItem key={subject.id} value={subject.id}>
                            <div className="flex items-center group w-full">
                                <AccordionTrigger>
                                {editingSubjectId === subject.id ? (
                                     <Input
                                        value={editingSubjectName}
                                        onChange={(e) => setEditingSubjectName(e.target.value)}
                                        className="h-8"
                                        onClick={(e) => e.stopPropagation()}
                                        onKeyDown={(e) => { if (e.key === 'Enter') saveEditing(subject.id)}}
                                    />
                                ) : (
                                    <span style={{ color: subject.color }} className="font-bold">{subject.name}</span>
                                )}
                                </AccordionTrigger>
                                <div className="flex items-center pl-2">
                                {editingSubjectId === subject.id ? (
                                    <>
                                        <Button onClick={(e) => {e.stopPropagation(); saveEditing(subject.id)}} size="icon" className="h-8 w-8"><Save className="h-4 w-4"/></Button>
                                        <Button onClick={(e) => {e.stopPropagation(); setEditingSubjectId(null);}} size="icon" variant="ghost" className="h-8 w-8"><X className="h-4 w-4"/></Button>
                                    </>
                                ) : (
                                   <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button onClick={(e) => {e.stopPropagation(); startEditing(subject)}} size="icon" variant="ghost" className="h-8 w-8"><Edit className="h-4 w-4 text-muted-foreground"/></Button>
                                        <Dialog onOpenChange={(open) => !open && setEditingSubjectId(null)}>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={e => e.stopPropagation()}><Palette className="h-4 w-4 text-muted-foreground"/></Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader><DialogTitle>Pick Color for {subject.name}</DialogTitle></DialogHeader>
                                                <div className="flex gap-2 py-4">
                                                    {CHART_COLORS.map(color => (
                                                        <DialogClose key={color} asChild>
                                                        <Button
                                                            className="w-10 h-10 rounded-full"
                                                            style={{ backgroundColor: color }}
                                                            onClick={() => handleColorChange(subject.id, color)}
                                                        />
                                                        </DialogClose>
                                                    ))}
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                        <Button onClick={(e) => {e.stopPropagation(); deleteSubject(subject.id)}} size="icon" variant="ghost" className="h-8 w-8 text-destructive/70 hover:text-destructive"><Trash2 className="h-4 w-4"/></Button>
                                    </div>
                                )}
                                </div>
                            </div>
                            <AccordionContent>
                                <AnimatePresence>
                                {subject.chapters.map(chapter => (
                                    <motion.div
                                        key={chapter.id}
                                        layout
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex items-center gap-3 rounded-md p-2 group"
                                    >
                                        <Checkbox
                                            id={`ch-${chapter.id}`}
                                            checked={chapter.completed}
                                            onCheckedChange={() => toggleChapter(subject.id, chapter.id)}
                                        />
                                        <label htmlFor={`ch-${chapter.id}`} className={cn("flex-1 cursor-pointer text-sm leading-none", chapter.completed && "line-through text-muted-foreground")}>{chapter.name}</label>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => deleteChapter(subject.id, chapter.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </motion.div>
                                ))}
                                </AnimatePresence>
                                <form onSubmit={(e) => {e.preventDefault(); handleAddChapter(subject.id);}} className="relative mt-2">
                                    <Input
                                        value={newChapterNames[subject.id] || ""}
                                        onChange={(e) => setNewChapterNames({ ...newChapterNames, [subject.id]: e.target.value })}
                                        placeholder="Add new chapter..."
                                        className="h-8 pr-8"
                                    />
                                    <Button type="submit" size="icon" variant="ghost" className="absolute right-0 top-0 h-8 w-8"><Plus className="h-4 w-4" /></Button>
                                </form>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                    </Accordion>
                </ScrollArea>
                 {isAddingSubject ? (
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="New subject name..."
                            value={newSubjectName}
                            onChange={(e) => setNewSubjectName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
                            className="h-9"
                        />
                        <Button onClick={handleAddSubject} size="icon"><Save className="h-4 w-4" /></Button>
                        <Button onClick={() => setIsAddingSubject(false)} size="icon" variant="ghost"><X className="h-4 w-4" /></Button>
                    </div>
                ) : (
                    <Button onClick={() => setIsAddingSubject(true)} variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" /> Add Subject
                    </Button>
                )}
            </div>
            <div className="flex flex-col gap-4">
                 <h3 className="font-semibold">Progress Overview</h3>
                 <div className="flex-1 w-full h-full min-h-[200px]">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fill: 'hsl(var(--foreground))' }} tickLine={{ stroke: 'hsl(var(--foreground))' }}/>
                                <YAxis domain={[0, 100]} unit="%" tick={{ fill: 'hsl(var(--foreground))' }} />
                                <Tooltip
                                    cursor={{fill: 'hsl(var(--muted))'}}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--background))',
                                        borderColor: 'hsl(var(--border))'
                                    }}
                                />
                                <Bar dataKey="progress" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed text-center text-muted-foreground">
                            <p>Add subjects and chapters to see your progress.</p>
                        </div>
                    )}
                 </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
