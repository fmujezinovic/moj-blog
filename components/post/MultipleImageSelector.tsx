"use client";

import type { ImageRef } from "@/types/image";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import UploadImageButton from "@/components/UploadImageButton";
import { SelectUnsplashImageDialog } from "@/components/SelectUnsplashImageDialog";
import { SelectPexelsImageDialog } from "@/components/SelectPexelsImageDialog";
import { Button } from "@/components/ui/button";

interface Props {
  images: ImageRef[];
  onChange: (images: ImageRef[]) => void;
}

export default function MultipleImageSelector({ images, onChange }: Props) {
  const handleUpdateImage = (index: number, image: ImageRef) => {
    const updated = [...images];
    updated[index] = image;
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    const updated = [...images];
    updated.splice(index, 1);
    onChange(updated);
  };

  const handleAddEmptyImage = () => {
    onChange([...images, { url: "", path: null }]);
  };

  return (
    <div className="flex flex-col gap-6">
      {images.map((img, i) => (
        <div key={i} className="border rounded-xl p-4 bg-muted">
          <Label className="font-semibold mb-2 block">Slika {i + 1}</Label>
          <div className="grid md:grid-cols-2 gap-4 items-start">
            {img.url && (
              <img
                src={img.url}
                alt={`Slika ${i + 1}`}
                className="rounded-lg max-h-48 object-contain"
              />
            )}
            <div className="flex flex-col gap-2">
              <UploadImageButton
                currentUploadedPath={img.path ?? null}
                onUploaded={(imgRef) => handleUpdateImage(i, imgRef)}
                externalUrl={img.url || undefined}
              />
              <div className="flex gap-2">
                <SelectUnsplashImageDialog
                  onSelect={(url: string) =>
                    handleUpdateImage(i, { url, path: null })
                  }
                />
                <SelectPexelsImageDialog
                  onSelect={(url: string) =>
                    handleUpdateImage(i, { url, path: null })
                  }
                />
                <Button
                  variant="destructive"
                  onClick={() => handleRemove(i)}
                >
                  Odstrani
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={handleAddEmptyImage}
      >
        Dodaj novo sliko
      </Button>
    </div>
  );
}
