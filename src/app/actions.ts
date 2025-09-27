"use server";

import { chatWithGemini, type ChatInput } from "@/ai/flows/chat-with-gemini";
import { suggestTaskPriorities, type SuggestTaskPrioritiesInput } from "@/ai/flows/suggest-task-priorities";

export async function handleGeminiChat(input: ChatInput) {
  try {
    const result = await chatWithGemini(input);
    return result;
  } catch (error) {
    console.error("Error in handleGeminiChat:", error);
    return { response: "An error occurred while communicating with the AI. Please try again." };
  }
}

export async function handleSuggestPriorities(input: SuggestTaskPrioritiesInput) {
  try {
    const result = await suggestTaskPriorities(input);
    return result;
  } catch (error) {
    console.error("Error in handleSuggestPriorities:", error);
    return {
      prioritizedTasks: "",
      reasoning: "An error occurred while generating task priorities. Please check your inputs and try again.",
    };
  }
}
