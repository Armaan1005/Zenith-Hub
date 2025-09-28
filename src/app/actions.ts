"use server";

import { chatWithGemini, type ChatInput } from "@/ai/flows/chat-with-gemini";
import { suggestTaskPriorities, type SuggestTaskPrioritiesInput } from "@/ai/flows/suggest-task-priorities";
import SpotifyWebApi from 'spotify-web-api-node';

function getSpotifyApi() {
  return new SpotifyWebApi({
    clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI,
  });
}

export async function getSpotifyAuthUrl() {
  const spotifyApi = getSpotifyApi();
  const scopes = [
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-modify-playback-state',
    'user-read-playback-state',
  ];
  const url = spotifyApi.createAuthorizeURL(scopes, 'state-goes-here');
  return { url };
}

export async function getSpotifyAccessToken(code: string) {
  const spotifyApi = getSpotifyApi();
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    return {
      accessToken: data.body['access_token'],
      refreshToken: data.body['refresh_token'],
      expiresIn: data.body['expires_in'],
    };
  } catch (error) {
    console.error('Error getting access token:', error);
    return { error: 'Failed to get access token' };
  }
}

export async function refreshSpotifyAccessToken(refreshToken: string) {
  const spotifyApi = getSpotifyApi();
  spotifyApi.setRefreshToken(refreshToken);
  try {
    const data = await spotifyApi.refreshAccessToken();
    return {
      accessToken: data.body['access_token'],
      expiresIn: data.body['expires_in'],
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return { error: 'Failed to refresh access token' };
  }
}

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
