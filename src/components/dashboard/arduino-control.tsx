"use client";

import { useState } from "react";
import { Usb, PlugZap } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ArduinoControl() {
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "connecting">(
    "disconnected"
  );
  const isConnected = connectionStatus === "connected";

  const handleConnect = () => {
    setConnectionStatus("connecting");
    // Placeholder for Web Serial API logic
    setTimeout(() => {
      setConnectionStatus(isConnected ? "disconnected" : "connected");
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Arduino Control</CardTitle>
          <Badge variant="outline" className={cn(
            "transition-colors",
            isConnected ? "border-accent text-accent-foreground bg-accent/20" : "border-border"
          )}>
            {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
          </Badge>
        </div>
        <CardDescription>
          Control the Pomodoro timer with a physical device.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-4 pt-4 text-center">
        <Usb className="h-12 w-12 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Connect your Arduino via USB to sync your physical timer with Zenith Hub.
        </p>
        <Button onClick={handleConnect} disabled={connectionStatus === "connecting"}>
          <PlugZap className="mr-2 h-4 w-4" />
          {isConnected ? "Disconnect" : connectionStatus === "connecting" ? "Connecting..." : "Connect"}
        </Button>
      </CardContent>
    </Card>
  );
}
