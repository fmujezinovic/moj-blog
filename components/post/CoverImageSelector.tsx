"use client";

import type { ImageRef } from "@/types/image";
import { Label } from "@/components/ui/label";
import UploadImageButton from "@/components/UploadImageButton";
import { SelectUnsplashImageDialog } from "@/components/SelectUnsplashImageDialog";
import { SelectPexelsImageDialog }   from "@/components/SelectPexelsImageDialog";

interface Props {
  current: ImageRef | undefined;
  onSelect: (ref: ImageRef) => void;
}

export default function CoverImageSelector({ current, onSelect }: Props) {
  const wrap = (u: string | ImageRef): ImageRef =>
    typeof u === "string" ? { url: u, path: null } : u;

  return (
    <div className="flex flex-col gap-4">
      <Label className="text-md font-semibold">Naslovna slika</Label>

      <UploadImageButton
        currentUploadedPath={current?.path ?? null}
        onUploaded={onSelect}
        externalUrl={current?.url}
      />

      <div className="flex gap-4 mt-2">
        <SelectUnsplashImageDialog onSelect={u => onSelect(wrap(u))} />
        <SelectPexelsImageDialog  onSelect={u => onSelect(wrap(u))} />
      </div>
    </div>
  );
}
