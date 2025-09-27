"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Send, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { handleGeminiChat } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
}

export function GeminiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() === "" || isPending) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: input,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMessage]);
    
    startTransition(async () => {
      const aiResponse = await handleGeminiChat({ message: input });
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        text: aiResponse.response,
        sender: "ai",
      };
      setMessages((prev) => [...prev, aiMessage]);
    });
    
    setInput("");
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
             viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  return (
    <Card className="flex h-[80vh] flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Sparkles className="h-5 w-5 text-primary" />
          Gemini Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
            <div className="space-y-4">
            <AnimatePresence>
            {messages.map((message) => (
                <motion.div
                key={message.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={cn(
                    "flex items-start gap-3",
                    message.sender === "user" ? "justify-end" : "justify-start"
                )}
                >
                {message.sender === "ai" && (
                    <Avatar className="h-8 w-8">
                    <AvatarFallback>
                        <Sparkles className="h-4 w-4" />
                    </AvatarFallback>
                    </Avatar>
                )}
                <div
                    className={cn(
                    "max-w-xs rounded-lg px-3 py-2 text-sm lg:max-w-sm",
                    message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                >
                    {message.text}
                </div>
                {message.sender === "user" && (
                    <Avatar className="h-8 w-8">
                    <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                )}
                </motion.div>
            ))}
            </AnimatePresence>
            </div>
        </ScrollArea>
        <form onSubmit={handleSubmit} className="relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Gemini anything..."
            disabled={isPending}
            className="pr-12"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isPending}
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
