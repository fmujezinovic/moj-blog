"use client"

import { Label } from "@/components/ui/label"
import UploadImageButton from "@/components/UploadImageButton"
import { SelectUnsplashImageDialog } from "@/components/SelectUnsplashImageDialog"
import { SelectPexelsImageDialog } from "@/components/SelectPexelsImageDialog"

interface ImageRef {
  url: string
  path: string | null
}

interface CoverImageSelectorProps {
  current?: ImageRef
  onSelect: (ref: ImageRef) => void
}

export default function CoverImageSelector({
  current,
  onSelect,
}: CoverImageSelectorProps) {
  // wrap sprejme bodisi string ali objekt (ImageRef ali Unsplash/Pexels sliko)
  const wrap = (u: any): ImageRef => {
    if (typeof u === "string") {
      return { url: u, path: null }
    }
    // če ima objekt lastnost url, ga vzamemo
    if (typeof u === "object" && typeof u.url === "string") {
      return { url: u.url, path: null }
    }
    // za vsak slučaj
    return { url: "", path: null }
  }

  return (
    <div className="flex flex-col gap-4">
      <Label className="text-md font-semibold">Naslovna slika</Label>

      <UploadImageButton
        currentUploadedPath={current?.path ?? null}
        onUploaded={onSelect}
        externalUrl={current?.url}
      />

      <div className="flex gap-4 mt-2">
        <SelectUnsplashImageDialog onSelect={(u) => onSelect(wrap(u))} />
        <SelectPexelsImageDialog onSelect={(u) => onSelect(wrap(u))} />
      </div>
    </div>
  )
}
