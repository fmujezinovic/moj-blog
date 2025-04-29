"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export function ViewLiveButton({ isDraft, url }: { isDraft: boolean; url: string }) {
  return isDraft ? (
 <Tooltip>
  <TooltipTrigger asChild>
    <div className="inline-flex" onClick={() => toast("Članek še ni objavljen")}>
      <Button variant="outline" disabled>
        👁 View live
      </Button>
    </div>
  </TooltipTrigger>
  <TooltipContent>Članek še ni objavljen</TooltipContent>
</Tooltip>

  ) : (
    <Button variant="outline" asChild>
      <a href={url} target="_blank" rel="noopener noreferrer">
        👁 View live
      </a>
    </Button>
  );
}
