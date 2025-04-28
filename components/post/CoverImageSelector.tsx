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
  return (
    <div className="flex flex-col gap-4">
      <Label className="text-md font-semibold">Naslovna slika</Label>

      <UploadImageButton
        currentUploadedPath={current?.path ?? null}
        onUploaded={onSelect}
      />

      <div className="flex gap-4 mt-2">
        <SelectUnsplashImageDialog onSelect={onSelect} />
        <SelectPexelsImageDialog  onSelect={onSelect} />
      </div>

      {current?.url && (
        <img
          src={current.url}
          alt="Cover"
          className="mt-4 rounded-md max-h-64 object-cover"
        />
      )}
    </div>
  );
}
