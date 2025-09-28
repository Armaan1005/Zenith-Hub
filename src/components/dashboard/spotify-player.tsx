"use client";

import { useState, useEffect, useCallback } from 'react';
import Script from 'next/script';
import Image from 'next/image';
import { getSpotifyAuthUrl, getSpotifyAccessToken, refreshSpotifyAccessToken } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, SkipBack, SkipForward, Music2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LS_ACCESS_TOKEN = 'spotify_access_token';
const LS_REFRESH_TOKEN = 'spotify_refresh_token';
const LS_EXPIRES_AT = 'spotify_expires_at';

export function SpotifyPlayer() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentState, setCurrentState] = useState<Spotify.PlaybackState | null>(null);
  const { toast } = useToast();

  const handleLogin = async () => {
    const { url } = await getSpotifyAuthUrl();
    window.location.href = url;
  };

  const handleTokenRefresh = useCallback(async () => {
    const refreshToken = localStorage.getItem(LS_REFRESH_TOKEN);
    if (!refreshToken) return;

    const result = await refreshSpotifyAccessToken(refreshToken);
    if ('accessToken' in result) {
      const expiresAt = Date.now() + result.expiresIn! * 1000;
      localStorage.setItem(LS_ACCESS_TOKEN, result.accessToken!);
      localStorage.setItem(LS_EXPIRES_AT, expiresAt.toString());
      setAccessToken(result.accessToken!);
      return result.accessToken;
    } else {
      console.error('Failed to refresh token');
      // Clear tokens if refresh fails
      localStorage.removeItem(LS_ACCESS_TOKEN);
      localStorage.removeItem(LS_REFRESH_TOKEN);
      localStorage.removeItem(LS_EXPIRES_AT);
      setAccessToken(null);
      return null;
    }
  }, []);

  useEffect(() => {
    const localToken = localStorage.getItem(LS_ACCESS_TOKEN);
    const expiresAt = localStorage.getItem(LS_EXPIRES_AT);

    if (localToken && expiresAt && Date.now() < parseInt(expiresAt)) {
      setAccessToken(localToken);
    } else if (localStorage.getItem(LS_REFRESH_TOKEN)) {
      handleTokenRefresh();
    }
  }, [handleTokenRefresh]);

  const onPlayerStateChanged = (state: Spotify.PlaybackState | null) => {
    if (!state) {
        toast({
            title: "Spotify Playback Stopped",
            description: "No playback state found. Your device may have been disconnected."
        });
        return;
    }
    setCurrentState(state);
  };

  useEffect(() => {
    if (accessToken && !player) {
      window.onSpotifyWebPlaybackSDKReady = () => {
        const spotifyPlayer = new Spotify.Player({
          name: 'Zenith Hub Player',
          getOAuthToken: (cb) => {
            const expiresAt = localStorage.getItem(LS_EXPIRES_AT);
            if (expiresAt && Date.now() >= parseInt(expiresAt)) {
              console.log('Spotify token expired, refreshing...');
              handleTokenRefresh().then(newToken => {
                if (newToken) cb(newToken);
              });
            } else {
              cb(accessToken);
            }
          },
          volume: 0.5,
        });

        spotifyPlayer.addListener('ready', ({ device_id }) => {
          console.log('Ready with Device ID', device_id);
          setIsReady(true);
        });

        spotifyPlayer.addListener('not_ready', ({ device_id }) => {
          console.log('Device ID has gone offline', device_id);
          setIsReady(false);
        });
        
        spotifyPlayer.addListener('player_state_changed', onPlayerStateChanged);

        spotifyPlayer.addListener('initialization_error', ({ message }) => {
          console.error('Initialization Error:', message);
          toast({ variant: 'destructive', title: 'Spotify Error', description: message });
        });
        spotifyPlayer.addListener('authentication_error', ({ message }) => {
          console.error('Authentication Error:', message);
          toast({ variant: 'destructive', title: 'Spotify Auth Error', description: message });
          handleTokenRefresh();
        });
        spotifyPlayer.addListener('account_error', ({ message }) => {
          console.error('Account Error:', message);
          toast({ variant: 'destructive', title: 'Spotify Account Error', description: message });
        });

        spotifyPlayer.connect().then(success => {
            if(success) {
                console.log("The Web Playback SDK successfully connected to Spotify!");
            }
        });

        setPlayer(spotifyPlayer);
      };
    }
    
    return () => {
        if (player) {
            console.log("Disconnecting Spotify Player");
            player.disconnect();
        }
    }

  }, [accessToken, player, toast, handleTokenRefresh]);

  if (!accessToken) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 text-center">
        <h3 className="text-lg font-semibold">Connect your Spotify Account</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Log in to control your music from here.
        </p>
        <Button onClick={handleLogin}>Login with Spotify</Button>
      </div>
    );
  }

  if (!isReady || !player) {
    return (
      <div className="flex h-48 items-center justify-center">
        <p>Loading Spotify Player...</p>
        <Script src="https://sdk.scdn.co/spotify-player.js" />
      </div>
    );
  }

  const currentTrack = currentState?.track_window?.current_track;
  const isPaused = currentState?.paused ?? true;

  return (
    <Card className="overflow-hidden">
        <Script src="https://sdk.scdn.co/spotify-player.js" />
        <CardContent className="p-4 text-center">
        {currentTrack ? (
            <div className="flex flex-col items-center gap-4">
                 <div className="relative h-40 w-40">
                    <Image
                        src={currentTrack.album.images[0].url}
                        alt={currentTrack.album.name}
                        fill
                        className="rounded-md object-cover"
                    />
                </div>
                <div>
                    <h3 className="text-lg font-bold">{currentTrack.name}</h3>
                    <p className="text-sm text-muted-foreground">
                        {currentTrack.artists.map(a => a.name).join(', ')}
                    </p>
                </div>
                <div className="flex items-center justify-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => player.previousTrack()}>
                        <SkipBack />
                    </Button>
                    <Button variant="default" size="icon" className="h-12 w-12" onClick={() => player.togglePlay()}>
                        {isPaused ? <Play className="fill-current" /> : <Pause className="fill-current"/>}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => player.nextTrack()}>
                        <SkipForward />
                    </Button>
                </div>
            </div>
        ) : (
            <div className="flex h-48 flex-col items-center justify-center text-center">
                <Music2 className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Nothing Playing</h3>
                <p className="text-sm text-muted-foreground">Start playing a song on one of your Spotify devices.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
