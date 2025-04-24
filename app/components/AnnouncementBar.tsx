'use client';

import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import { useState } from "react";

export function AnnouncementBar() {
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  if (!showAnnouncement) return null;

  return (
    <div className="sticky top-0 z-50 w-full bg-muted text-foreground px-4 py-2 flex items-center justify-center">
      <div className="flex text-center items-center gap-2 text-sm">
        <span>🏆 We won the first global ▲ Next.js Hackathon!</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setShowAnnouncement(false)}
          className="size-6 border border-border transition-all rounded-full !p-0 hover:bg-primary/10 text-xs opacity-60 hover:opacity-100"
        >
          <XIcon className="size-2" />
        </Button>
      </div>
    </div>
  );
} 