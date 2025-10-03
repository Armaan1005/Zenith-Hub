
"use client";

import { useState, useEffect, ChangeEvent } from "react";
import type { FileItem, Folder } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Music4, Folder as FolderIcon, File as FileIcon, Upload, FolderPlus, Trash2, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { SpotifyPlayer } from "./spotify-player";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const focusMusic = [
  { title: "Pomodoro with Lofi Girl", embedUrl: "https://www.youtube.com/embed/1oDrJba2PSs", id: "1oDrJba2PSs" },
  { title: "Lofi Hip Hop Radio", embedUrl: "https://www.youtube.com/embed/jfKfPfyJRdk", id: "jfKfPfyJRdk" },
  { title: "Gentle Rain Sounds", embedUrl: "https://www.youtube.com/embed/-OekvEFm1lo", id: "-OekvEFm1lo" },
  { title: "Peaceful Piano Radio", embedUrl: "https://www.youtube.com/embed/TtkFsfOP9QI", id: "TtkFsfOP9QI" },
];

function ClassroomManager() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(true);

  useEffect(() => {
    try {
      const storedFolders = localStorage.getItem("classroom_folders");
      if (storedFolders) {
        setFolders(JSON.parse(storedFolders));
      } else {
        // Initialize with a default folder if nothing is stored
        setFolders([{ id: "default", name: "My Study Materials", files: [] }]);
      }
    } catch (error) {
        console.error("Failed to parse classroom folders from localStorage", error);
        setFolders([{ id: "default", name: "My Study Materials", files: [] }]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("classroom_folders", JSON.stringify(folders));
  }, [folders]);

  const handleCreateFolder = () => {
    if (newFolderName.trim() === "") return;
    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name: newFolderName.trim(),
      files: [],
    };
    setFolders([...folders, newFolder]);
    setNewFolderName("");
    setIsFolderDialogOpen(false);
  };
  
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetFolderId = activeFolderId || folders[0]?.id;

    if (file && targetFolderId) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newFileItem: FileItem = {
          id: crypto.randomUUID(),
          name: file.name,
          dataUrl: event.target?.result as string,
        };
        setFolders(folders.map(folder =>
          folder.id === targetFolderId
            ? { ...folder, files: [...folder.files, newFileItem] }
            : folder
        ));
      };
      reader.readAsDataURL(file);
    }
    // Reset file input
    e.target.value = '';
  };
  
  const deleteFile = (folderId: string, fileId: string) => {
    setFolders(folders.map(folder => 
        folder.id === folderId 
            ? { ...folder, files: folder.files.filter(f => f.id !== fileId) }
            : folder
    ));
    if (selectedFile?.id === fileId) {
        setSelectedFile(null);
    }
  };

  const deleteFolder = (folderId: string) => {
    setFolders(folders.filter(f => f.id !== folderId));
    if (activeFolderId === folderId) {
        setActiveFolderId(null);
        setSelectedFile(null);
    }
  };


  const activeFolder = folders.find(f => f.id === activeFolderId) ?? folders[0];

  return (
     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[60vh]">
        {isLibraryOpen && (
            <div className="md:col-span-1 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">My Library</h3>
                    <Button variant="ghost" size="icon" onClick={() => setIsLibraryOpen(false)} className="md:hidden">
                        <PanelLeftClose />
                    </Button>
                </div>
                <div className="flex gap-2">
                     <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm"><FolderPlus className="mr-2" /> New Folder</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Create New Folder</DialogTitle></DialogHeader>
                            <div className="py-4">
                                <Input 
                                    placeholder="Folder name..." 
                                    value={newFolderName} 
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                                />
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreateFolder}>Create</Button>
                                <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Button size="sm" variant="outline" asChild>
                        <label htmlFor="pdf-upload"><Upload className="mr-2" /> Upload PDF</label>
                    </Button>
                    <input type="file" id="pdf-upload" accept="application/pdf" onChange={handleFileUpload} className="hidden" />
                </div>
                <Card className="flex-1">
                    <CardContent className="p-2">
                        <ul className="space-y-1">
                            {folders.map(folder => (
                                <li key={folder.id}>
                                    <div className="flex items-center">
                                        <Button
                                            variant={activeFolder?.id === folder.id ? "secondary" : "ghost"}
                                            className="w-full justify-start"
                                            onClick={() => setActiveFolderId(folder.id)}
                                        >
                                            <FolderIcon className="mr-2" />
                                            {folder.name}
                                        </Button>
                                        {folders.length > 1 && (
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteFolder(folder.id)}>
                                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        )}
                                    </div>
                                    {activeFolder?.id === folder.id && (
                                        <ul className="pl-6 mt-1 space-y-1">
                                            {folder.files.map(file => (
                                               <li key={file.id} className="flex items-center">
                                                    <Button
                                                        variant={selectedFile?.id === file.id ? "secondary" : "ghost"}
                                                        size="sm"
                                                        className="w-full justify-start h-8"
                                                        onClick={() => setSelectedFile(file)}
                                                    >
                                                        <FileIcon className="mr-2" />
                                                        <span className="truncate">{file.name}</span>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteFile(folder.id, file.id)}>
                                                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                                                    </Button>
                                                </li>
                                            ))}
                                            {folder.files.length === 0 && <p className="text-xs text-muted-foreground pl-4 py-1">No files yet.</p>}
                                        </ul>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        )}
        <div className={cn(
            "h-full",
            isLibraryOpen ? "md:col-span-2" : "md:col-span-3"
        )}>
            <div className="relative h-full">
                <Button variant="ghost" size="icon" onClick={() => setIsLibraryOpen(!isLibraryOpen)} className="absolute top-2 left-2 z-10 bg-background/50 hover:bg-background">
                    {isLibraryOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
                </Button>
                {selectedFile ? (
                  <embed
                    src={selectedFile.dataUrl}
                    type="application/pdf"
                    className="w-full h-full rounded-lg border"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-4 text-center">
                    <h3 className="text-lg font-semibold">Study Material Viewer</h3>
                    <p className="text-sm text-muted-foreground">Select a file from your library to view it here, or open the library with the button on the top left.</p>
                  </div>
                )}
            </div>
        </div>
     </div>
  );
}


export function MediaPlayer() {
  const [currentTrack, setCurrentTrack] = useState(focusMusic[0]);
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [youtubeEmbedUrl, setYoutubeEmbedUrl] = useState("https://www.youtube.com/embed/jfKfPfyJRdk");

  const handleLoadPlaylist = () => {
    try {
      const url = new URL(playlistUrl);
      let newEmbedUrl = "";
      if (url.hostname === "youtu.be") {
        const videoId = url.pathname.slice(1);
        newEmbedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (url.hostname.includes("youtube.com")) {
        const playlistId = url.searchParams.get("list");
        if (playlistId) {
          newEmbedUrl = `https://www.youtube.com/embed/videoseries?list=${playlistId}`;
        } else {
          // Handle single video URLs as a fallback
          const videoId = url.searchParams.get("v");
          if (videoId) {
            newEmbedUrl = `https://www.youtube.com/embed/${videoId}`;
          }
        }
      }

      if (newEmbedUrl) {
        setYoutubeEmbedUrl(newEmbedUrl);
      } else {
         // Show error to user
      }
    } catch (error) {
      console.error("Invalid YouTube URL", error);
      // Optionally, set an error state and show it to the user
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Media Player</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="focus">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="focus">Focus Music</TabsTrigger>
            <TabsTrigger value="spotify">Spotify</TabsTrigger>
            <TabsTrigger value="youtube">YouTube</TabsTrigger>
            <TabsTrigger value="classroom">Classroom</TabsTrigger>
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
            <SpotifyPlayer />
          </TabsContent>

          <TabsContent value="youtube" className="mt-4 space-y-4">
             <div className="flex items-center gap-2">
                <Input
                    placeholder="Enter YouTube playlist or video URL..."
                    value={playlistUrl}
                    onChange={(e) => setPlaylistUrl(e.target.value)}
                />
                <Button onClick={handleLoadPlaylist}>Load</Button>
            </div>
            <AspectRatio ratio={16 / 9}>
              <iframe
                key={youtubeEmbedUrl}
                width="100%"
                height="100%"
                src={youtubeEmbedUrl}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="rounded-lg"
              ></iframe>
            </AspectRatio>
          </TabsContent>
          <TabsContent value="classroom" className="mt-4">
            <ClassroomManager />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
