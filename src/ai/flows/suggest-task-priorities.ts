// src/ai/flows/suggest-task-priorities.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow that suggests task priorities based on calendar events,
 * task list, and Pomodoro intervals to optimize study time.
 *
 * - suggestTaskPriorities - A function that suggests task priorities.
 * - SuggestTaskPrioritiesInput - The input type for the suggestTaskPriorities function.
 * - SuggestTaskPrioritiesOutput - The output type for the suggestTaskPriorities function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTaskPrioritiesInputSchema = z.object({
  calendarEvents: z.string().describe('A list of calendar events.'),
  taskList: z.string().describe('A list of tasks.'),
  pomodoroInterval: z.number().describe('The length of a Pomodoro interval in minutes.'),
});

export type SuggestTaskPrioritiesInput = z.infer<typeof SuggestTaskPrioritiesInputSchema>;

const SuggestTaskPrioritiesOutputSchema = z.object({
  prioritizedTasks: z.string().describe('A list of tasks with suggested priorities.'),
  reasoning: z.string().describe('The reasoning behind the suggested priorities.'),
});

export type SuggestTaskPrioritiesOutput = z.infer<typeof SuggestTaskPrioritiesOutputSchema>;

export async function suggestTaskPriorities(input: SuggestTaskPrioritiesInput): Promise<SuggestTaskPrioritiesOutput> {
  return suggestTaskPrioritiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTaskPrioritiesPrompt',
  input: {schema: SuggestTaskPrioritiesInputSchema},
  output: {schema: SuggestTaskPrioritiesOutputSchema},
  prompt: `You are an AI assistant designed to help students prioritize their tasks.

  Based on the student's calendar events, task list, and Pomodoro interval, suggest the best task priorities.

  Calendar Events: {{{calendarEvents}}}
  Task List: {{{taskList}}}
  Pomodoro Interval: {{{pomodoroInterval}}} minutes

  Prioritized Tasks: Provide a list of tasks with suggested priorities and the reasoning behind the suggested priorities.
  `,
});

const suggestTaskPrioritiesFlow = ai.defineFlow({
    name: 'suggestTaskPrioritiesFlow',
    inputSchema: SuggestTaskPrioritiesInputSchema,
    outputSchema: SuggestTaskPrioritiesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
