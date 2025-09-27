"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Music4 } from "lucide-react";

const focusMusic = [
  { title: "Pomodoro with Lofi Girl", embedUrl: "https://www.youtube.com/embed/1oDrJba2PSs", id: "1oDrJba2PSs" },
  { title: "Lofi Hip Hop Radio", embedUrl: "https://www.youtube.com/embed/jfKfPfyJRdk", id: "jfKfPfyJRdk" },
  { title: "Gentle Rain Sounds", embedUrl: "https://www.youtube.com/embed/-OekvEFm1lo", id: "-OekvEFm1lo" },
  { title: "Deep Focus Music", embedUrl: "https://www.youtube.com/embed/4oStw0r33so", id: "4oStw0r33so" },
];

export function MediaPlayer() {
  const [currentTrack, setCurrentTrack] = useState(focusMusic[0]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Media Player</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="focus">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="focus">Focus Music</TabsTrigger>
            <TabsTrigger value="spotify">Spotify</TabsTrigger>
            <TabsTrigger value="youtube">YouTube</TabsTrigger>
          </TabsList>

          <TabsContent value="focus" className="mt-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col space-y-2">
                 <h3 className="font-semibold">{currentTrack.title}</h3>
                 <AspectRatio ratio={16 / 9}>
                    <iframe
                        key={currentTrack.id}
                        width="100%"
                        height="100%"
                        src={currentTrack.embedUrl}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="rounded-lg"
                    ></iframe>
                </AspectRatio>
              </div>
              <div className="flex flex-col space-y-2">
                 <h3 className="font-semibold">Playlist</h3>
                 <div className="flex flex-col gap-2">
                    {focusMusic.map((track) => (
                        <Button
                            key={track.id}
                            variant={currentTrack.id === track.id ? "secondary" : "ghost"}
                            className="justify-start"
                            onClick={() => setCurrentTrack(track)}
                        >
                            <Music4 className="mr-2 h-4 w-4" />
                            {track.title}
                        </Button>
                    ))}
                 </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="spotify" className="mt-4">
            <div className="flex h-48 flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 text-center">
              <h3 className="text-lg font-semibold">Coming Soon!</h3>
              <p className="text-sm text-muted-foreground">Full Spotify integration is on the way.</p>
            </div>
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
                className="rounded-lg"
              ></iframe>
            </AspectRatio>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
