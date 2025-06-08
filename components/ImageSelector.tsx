'use client';

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import UploadImageButton from "@/components/UploadImageButton";
import { SelectUnsplashImageDialog } from "@/components/SelectUnsplashImageDialog";
import { SelectPexelsImageDialog } from "@/components/SelectPexelsImageDialog";
import Image from "next/image";

// Lokalna definicija tipa, ker '@/types/image' ne obstaja
interface ImageRef {
  url: string;
  path: string | null;
}

interface ImageSelectorProps {
  value: ImageRef | null;
  onChange: (ref: ImageRef | null) => void;
  label?: string;
  showRemove?: boolean;
}

export default function ImageSelector({
  value,
  onChange,
  label = "Slika",
  showRemove = true,
}: ImageSelectorProps) {
  const [preview, setPreview] = useState(value?.url ?? "");

  const wrap = (u: string | ImageRef): ImageRef =>
    typeof u === "string" ? { url: u, path: null } : u;

  const handleSelect = (ref: ImageRef) => {
    setPreview(ref.url);
    onChange(ref);
  };

  const handleRemove = () => {
    setPreview("");
    onChange(null);
  };

  return (
    <div className="flex flex-col gap-3 border rounded-lg p-4 shadow-sm bg-white">
      <Label className="text-md font-semibold">{label}</Label>

      {preview && (
        <div className="relative w-full h-48 rounded-md overflow-hidden border bg-muted">
          <Image
            src={preview}
            alt="Predogled"
            fill
            className="object-contain"
          />
        </div>
      )}

      <UploadImageButton
        currentUploadedPath={value?.path ?? null}
        onUploaded={handleSelect}
        externalUrl={value?.url}
      />

      <div className="flex gap-3">
        <SelectUnsplashImageDialog onSelect={(u) => handleSelect(wrap(u))} />
        <SelectPexelsImageDialog onSelect={(u) => handleSelect(wrap(u))} />
        {showRemove && value && (
          <Button variant="outline" onClick={handleRemove}>
            Odstrani
          </Button>
        )}
      </div>
    </div>
  );
}
