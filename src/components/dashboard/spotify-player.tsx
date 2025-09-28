"use client";

import { useState, useEffect, useCallback, useTransition } from 'react';
import Script from 'next/script';
import Image from 'next/image';
import { getSpotifyAuthUrl, refreshSpotifyAccessToken } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, SkipBack, SkipForward, Music2, Loader2 } from 'lucide-react';
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
  const [isLoginPending, startLoginTransition] = useTransition();

  const handleLogin = () => {
    startLoginTransition(async () => {
      const { url } = await getSpotifyAuthUrl();
      // This will redirect the entire page to the Spotify login.
      window.location.href = url;
    });
  };

  const handleTokenRefresh = useCallback(async () => {
    const refreshToken = localStorage.getItem(LS_REFRESH_TOKEN);
    if (!refreshToken) {
      setAccessToken(null);
      return null;
    };

    const result = await refreshSpotifyAccessToken(refreshToken);
    if ('accessToken' in result && result.accessToken) {
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
    } else {
        setAccessToken(null);
    }
  }, [handleTokenRefresh]);

  const onPlayerStateChanged = (state: Spotify.PlaybackState | null) => {
    if (!state) {
        toast({
            variant: "destructive",
            title: "Spotify Playback Error",
            description: "Playback stopped. Your device may have been disconnected or another app took control."
        });
        setCurrentState(null);
        return;
    }
    setCurrentState(state);
  };

  useEffect(() => {
    if (accessToken && !window.Spotify) {
      // If script is not loaded, it will be handled by the Script component
      return;
    }

    if (accessToken && !player) {
      const setupPlayer = () => {
          if (!window.Spotify) return;
          const spotifyPlayer = new window.Spotify.Player({
            name: 'Zenith Hub Player',
            getOAuthToken: (cb) => {
              const expiresAt = localStorage.getItem(LS_EXPIRES_AT);
              if (expiresAt && Date.now() >= parseInt(expiresAt)) {
                console.log('Spotify token expired, refreshing...');
                handleTokenRefresh().then(newToken => {
                  if (newToken) {
                    cb(newToken);
                  } else {
                    // Force re-login if refresh fails
                    setAccessToken(null);
                  }
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
            toast({ variant: 'destructive', title: 'Spotify Init Error', description: message });
          });
          spotifyPlayer.addListener('authentication_error', ({ message }) => {
            console.error('Authentication Error:', message);
            toast({ variant: 'destructive', title: 'Spotify Auth Error', description: "Please log in again." });
            // Clear all tokens to force re-login
            localStorage.removeItem(LS_ACCESS_TOKEN);
            localStorage.removeItem(LS_REFRESH_TOKEN);
            localStorage.removeItem(LS_EXPIRES_AT);
            setAccessToken(null);
          });
          spotifyPlayer.addListener('account_error', ({ message }) => {
            console.error('Account Error:', message);
            toast({ variant: 'destructive', title: 'Spotify Account Error', description: "A premium account is required." });
          });

          spotifyPlayer.connect().then(success => {
              if(success) {
                  console.log("The Web Playback SDK successfully connected to Spotify!");
              }
          });

          setPlayer(spotifyPlayer);
      }

      if (!window.onSpotifyWebPlaybackSDKReady) {
        window.onSpotifyWebPlaybackSDKReady = setupPlayer;
      } else {
        setupPlayer();
      }
    }
    
    return () => {
        if (player) {
            console.log("Disconnecting Spotify Player");
            player.disconnect();
            setPlayer(null);
        }
    }
  }, [accessToken, player, toast, handleTokenRefresh]);

  if (!accessToken) {
    return (
      <>
        <div className="flex h-48 flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 text-center">
          <h3 className="text-lg font-semibold">Connect your Spotify Account</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Log in to control your music from here.
          </p>
          <Button onClick={handleLogin} disabled={isLoginPending}>
            {isLoginPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Login with Spotify
          </Button>
        </div>
      </>
    );
  }

  if (!player || !isReady) {
    return (
      <>
        <Script src="https://sdk.scdn.co/spotify-player.js" />
        <div className="flex h-48 flex-col items-center justify-center text-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">Connecting to Spotify Player...</p>
            <p className="text-xs text-muted-foreground/50">Please ensure you have a Spotify Premium account.</p>
        </div>
      </>
    );
  }

  const currentTrack = currentState?.track_window?.current_track;
  const isPaused = currentState?.paused ?? true;

  return (
    <Card className="overflow-hidden">
        <Script src="https://sdk.scdn.co/spotify-player.js" strategy="lazyOnload" />
        <CardContent className="p-4 text-center">
        {currentTrack ? (
            <div className="flex flex-col items-center gap-4">
                 <div className="relative h-40 w-40">
                    <Image
                        src={currentTrack.album.images[0].url}
                        alt={currentTrack.album.name}
                        width={160}
                        height={160}
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
                <p className="text-sm text-muted-foreground">Start playing a song on one of your Spotify devices to control it here.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
