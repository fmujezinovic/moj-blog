"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import UploadImageButton from "@/components/UploadImageButton"
import { SelectUnsplashImageDialog } from "@/components/SelectUnsplashImageDialog"
import { SelectPexelsImageDialog } from "@/components/SelectPexelsImageDialog"
import { Button } from "@/components/ui/button"

interface ImageRef {
  url: string
  path: string | null
}

interface MultipleImageSelectorProps {
  images: ImageRef[]
  onChange: (images: ImageRef[]) => void
}

export default function MultipleImageSelector({
  images,
  onChange,
}: MultipleImageSelectorProps) {
  // wrap sprejme string ali objekt iz Unsplash/Pexels in ga pretvori v ImageRef
  const wrap = (u: any): ImageRef => {
    if (typeof u === "string") {
      return { url: u, path: null }
    }
    if (u && typeof u.url === "string") {
      return { url: u.url, path: null }
    }
    return { url: "", path: null }
  }

  const handleUpdateImage = (index: number, image: ImageRef) => {
    const updated = [...images]
    updated[index] = image
    onChange(updated)
  }

  const handleRemove = (index: number) => {
    const updated = [...images]
    updated.splice(index, 1)
    onChange(updated)
  }

  const handleAddEmptyImage = () => {
    onChange([...images, { url: "", path: null }])
  }

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
                <SelectUnsplashImageDialog onSelect={(u) => handleUpdateImage(i, wrap(u))} />
                <SelectPexelsImageDialog onSelect={(u) => handleUpdateImage(i, wrap(u))} />
                <Button variant="destructive" onClick={() => handleRemove(i)}>
                  Odstrani
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" onClick={handleAddEmptyImage}>
        Dodaj novo sliko
      </Button>
    </div>
  )
}
