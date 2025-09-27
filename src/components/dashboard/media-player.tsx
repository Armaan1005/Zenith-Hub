"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AspectRatio } from "@/components/ui/aspect-ratio"

export function MediaPlayer() {
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
            <AspectRatio ratio={16 / 9}>
              <iframe
                style={{ borderRadius: "12px" }}
                src="https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator"
                width="100%"
                height="100%"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title="Spotify Lofi Playlist"
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
