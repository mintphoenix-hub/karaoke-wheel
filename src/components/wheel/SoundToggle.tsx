import * as React from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { soundManager } from "@/lib/sound";

export function SoundToggle({ 
  isMuted, 
  onToggle 
}: { 
  isMuted: boolean; 
  onToggle: (muted: boolean) => void;
}) {
  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-full bg-background/50 backdrop-blur-md border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)] transition-all duration-300"
      onClick={() => {
        const newMuted = !isMuted;
        soundManager.isMuted = newMuted;
        onToggle(newMuted);
      }}
    >
      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
    </Button>
  );
}
