"use client";

import type { ImageRef } from "@/types/image";
import { UiSection } from "@/utils/markdown";
import { Input }    from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label }    from "@/components/ui/label";
import { Button }   from "@/components/ui/button";
import UploadImageButton from "@/components/UploadImageButton";
import { SelectUnsplashImageDialog } from "@/components/SelectUnsplashImageDialog";
import { SelectPexelsImageDialog }   from "@/components/SelectPexelsImageDialog";
import SectionRegenerator            from "@/components/dashboard/SectionRegenerator";

interface Props {
  idx: number;
  section: UiSection;
  onChange: (idx: number, field: "heading" | "content", val: string) => void;
  onImage:  (idx: number, ref: ImageRef) => void;
  onDelete: (idx: number) => void;
}

export default function PostSectionEditor({
  idx,
  section,
  onChange,
  onImage,
  onDelete,
}: Props) {
  const wrap = (u: string | ImageRef): ImageRef =>
    typeof u === "string" ? { url: u, path: null } : u;

  return (
    <div className="space-y-6 bg-muted/50 p-6 rounded-md shadow-sm">
      {/* HEADING */}
      <div>
        <Label className="text-md font-semibold">Podnaslov</Label>
        <Input
          value={section.heading}
          placeholder="Unesi podnaslov"
          onChange={e => onChange(idx, "heading", e.target.value)}
        />
      </div>

      {/* CONTENT */}
      <div className="flex flex-col gap-2">
        <Label className="text-md font-semibold">Vsebina</Label>
        <Textarea
          rows={8}
          value={section.content}
          placeholder="Unesi vsebinu sekcije"
          onChange={e => onChange(idx, "content", e.target.value)}
        />
      </div>

      {/* IMAGE */}
      <div className="flex flex-col gap-4">
        <Label className="text-md font-semibold">Slika sekcije</Label>

        <UploadImageButton
          currentUploadedPath={section.uploadedImagePath}
          onUploaded={ref => onImage(idx, ref)}
          externalUrl={section.imageUrl}
        />

        <div className="flex gap-4">
          <SelectUnsplashImageDialog onSelect={u => onImage(idx, wrap(u))} />
          <SelectPexelsImageDialog  onSelect={u => onImage(idx, wrap(u))} />
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-4 mt-4">
        <SectionRegenerator
          sectionTitle={section.heading}
          onRegenerate={c => onChange(idx, "content", c)}
        />
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => onDelete(idx)}
        >
          Izbriši sekciju
        </Button>
      </div>
    </div>
  );
}
