
"use server";
import { headers } from "next/headers";
import { chatWithGemini, type ChatInput } from "@/ai/flows/chat-with-gemini";
import { getYoutubePlaylistDuration, type GetYoutubePlaylistDurationInput } from "@/ai/flows/get-youtube-playlist-duration";
import { suggestTaskPriorities, type SuggestTaskPrioritiesInput } from "@/ai/flows/suggest-task-priorities";
import SpotifyWebApi from 'spotify-web-api-node';

function getSpotifyApi(redirectUri?: string) {
  // If no redirectUri is passed, we can still use it for non-auth actions
  // But for auth, it must be provided.
  return new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: redirectUri,
  });
}

function getRedirectUri() {
    const headersList = headers();
    const host = headersList.get('host') || 'localhost:9002';
    const protocol = host.startsWith('localhost') ? 'http' : 'https';
    return `${protocol}://${host}/callback`;
}


export async function getSpotifyAuthUrl() {
  const redirectUri = getRedirectUri();
  const spotifyApi = getSpotifyApi(redirectUri);
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
  const redirectUri = getRedirectUri();
  const spotifyApi = getSpotifyApi(redirectUri);
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    return {
      accessToken: data.body['access_token'],
      refreshToken: data.body['refresh_token'],
      expiresIn: data.body['expires_in'],
    };
  } catch (error: any) {
    console.error('Error getting access token:', error.body || error.message);
    return { error: 'Failed to get access token: ' + (error.body?.error_description || error.message) };
  }
}

export async function refreshSpotifyAccessToken(refreshToken: string) {
  // No redirectUri needed for refresh
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

export async function handleGetPlaylistDuration(input: GetYoutubePlaylistDurationInput) {
    try {
        const result = await getYoutubePlaylistDuration(input);
        return result;
    } catch (error) {
        console.error("Error in handleGetPlaylistDuration:", error);
        return { totalDurationSeconds: 0 };
    }
}
