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
import SectionRegenerator           from "@/components/dashboard/SectionRegenerator";

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
  return (
    <div className="space-y-6 bg-muted/50 p-6 rounded-md shadow-sm">
      {/* HEADING */}
      <div>
        <Label className="text-md font-semibold">Podnaslov</Label>
        <Input
          placeholder="Unesi podnaslov"
          value={section.heading}
          onChange={e => onChange(idx, "heading", e.target.value)}
        />
      </div>

      {/* CONTENT */}
      <div className="flex flex-col gap-2">
        <Label className="text-md font-semibold">Vsebina</Label>
        <Textarea
          placeholder="Unesi vsebinu sekcije"
          rows={8}
          value={section.content}
          onChange={e => onChange(idx, "content", e.target.value)}
        />
      </div>

      {/* IMAGE */}
      <div className="flex flex-col gap-4">
        <Label className="text-md font-semibold">Slika sekcije</Label>

        <UploadImageButton
          currentUploadedPath={section.uploadedImagePath}
          onUploaded={ref => onImage(idx, ref)}
        />

        <div className="flex gap-4">
          <SelectUnsplashImageDialog onSelect={ref => onImage(idx, ref)} />
          <SelectPexelsImageDialog  onSelect={ref => onImage(idx, ref)} />
        </div>

        {section.imageUrl && (
          <img
            src={section.imageUrl}
            alt={`Sekcija ${idx + 1}`}
            className="mt-4 rounded-md max-h-48 object-cover"
          />
        )}
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
