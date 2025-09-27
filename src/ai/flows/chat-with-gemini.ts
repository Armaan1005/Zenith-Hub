// src/ai/flows/chat-with-gemini.ts
'use server';

/**
 * @fileOverview Implements a Genkit flow for chatting with Gemini.
 *
 * - chatWithGemini - A function that allows users to chat with the Gemini model.
 * - ChatInput - The input type for the chatWithGemini function.
 * - ChatOutput - The return type for the chatWithGemini function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatInputSchema = z.object({
  message: z.string().describe('The user message to send to Gemini.'),
});

export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe('The response from the Gemini model.'),
});

export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chatWithGemini(input: ChatInput): Promise<ChatOutput> {
  return chatWithGeminiFlow(input);
}

const chatWithGeminiPrompt = ai.definePrompt({
  name: 'chatWithGeminiPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema},
  prompt: `You are a helpful AI assistant. Respond to the user message:

  {{message}}`,
});

const chatWithGeminiFlow = ai.defineFlow(
  {
    name: 'chatWithGeminiFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async input => {
    const {output} = await chatWithGeminiPrompt(input);
    return output!;
  }
);
