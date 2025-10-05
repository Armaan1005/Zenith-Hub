// src/ai/flows/get-youtube-playlist-duration.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow that calculates the total duration of a YouTube playlist.
 *
 * - getYoutubePlaylistDuration - A function that returns the total duration of a playlist.
 * - GetYoutubePlaylistDurationInput - The input type for the function.
 * - GetYoutubePlaylistDurationOutput - The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetYoutubePlaylistDurationInputSchema = z.object({
  playlistUrl: z.string().describe('The URL of the YouTube playlist.'),
});

export type GetYoutubePlaylistDurationInput = z.infer<typeof GetYoutubePlaylistDurationInputSchema>;

const GetYoutubePlaylistDurationOutputSchema = z.object({
  totalDurationSeconds: z.number().describe('The total duration of the playlist in seconds. If the URL is not a valid playlist or video, this should be 0.'),
});

export type GetYoutubePlaylistDurationOutput = z.infer<typeof GetYoutubePlaylistDurationOutputSchema>;

export async function getYoutubePlaylistDuration(input: GetYoutubePlaylistDurationInput): Promise<GetYoutubePlaylistDurationOutput> {
  return getYoutubePlaylistDurationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getYoutubePlaylistDurationPrompt',
  input: {schema: GetYoutubePlaylistDurationInputSchema},
  output: {schema: GetYoutubePlaylistDurationOutputSchema},
  prompt: `You are a YouTube playlist analysis tool. Your task is to calculate the total duration of all videos in the given YouTube playlist URL.

Analyze the playlist at the following URL: {{{playlistUrl}}}

First, determine if the URL points to a valid YouTube playlist or a single video.
- If it's a playlist, find all the videos in it and sum up their individual durations.
- If it's a single video, get the duration of that video.
- If the URL is not a valid YouTube video or playlist URL, return 0.

Return the total duration in seconds. For example, if the total duration is 1 hour, 54 minutes, and 3 seconds, you should return 6843.
`,
});

const getYoutubePlaylistDurationFlow = ai.defineFlow({
    name: 'getYoutubePlaylistDurationFlow',
    inputSchema: GetYoutubePlaylistDurationInputSchema,
    outputSchema: GetYoutubePlaylistDurationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
