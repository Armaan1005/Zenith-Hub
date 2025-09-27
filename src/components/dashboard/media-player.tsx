"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function MediaPlayer() {
  const [spotifyUrl, setSpotifyUrl] = useState("https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M");
  const [embedUrl, setEmbedUrl] = useState("https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator");

  const handleSpotifySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const url = new URL(spotifyUrl);
      const pathParts = url.pathname.split('/');
      const playlistIndex = pathParts.findIndex(part => part === 'playlist');
      if (playlistIndex !== -1 && pathParts[playlistIndex + 1]) {
        const playlistId = pathParts[playlistIndex + 1];
        setEmbedUrl(`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator`);
      } else {
        // Handle cases where the URL is valid but not a playlist URL, or show an error
        console.warn("Invalid Spotify playlist URL format.");
      }
    } catch (error) {
      console.error("Invalid URL provided for Spotify playlist.", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Media Player</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="spotify">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="spotify">Spotify</TabsTrigger>
            <TabsTrigger value="youtube">YouTube</TabsTrigger>
          </TabsList>
          <TabsContent value="spotify" className="mt-4">
             <form onSubmit={handleSpotifySubmit} className="mb-4 space-y-2">
              <Label htmlFor="spotify-url">Spotify Playlist URL</Label>
              <div className="flex gap-2">
                <Input
                  id="spotify-url"
                  placeholder="Paste your playlist link here"
                  value={spotifyUrl}
                  onChange={(e) => setSpotifyUrl(e.target.value)}
                />
                <Button type="submit">Load</Button>
              </div>
            </form>
            <AspectRatio ratio={16 / 9}>
              <iframe
                key={embedUrl} // Add key to force re-render on URL change
                style={{ borderRadius: "12px" }}
                src={embedUrl}
                width="100%"
                height="100%"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title="Spotify Playlist"
              ></iframe>
            </AspectRatio>
          </TabsContent>
          <TabsContent value="youtube" className="mt-4">
            <AspectRatio ratio={16 / 9}>
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/jfKfPfyJRdk"
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </AspectRatio>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
