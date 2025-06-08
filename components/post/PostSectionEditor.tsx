"use client"

import { UiSection } from "@/utils/markdown"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import UploadImageButton from "@/components/UploadImageButton"
import { SelectUnsplashImageDialog } from "@/components/SelectUnsplashImageDialog"
import { SelectPexelsImageDialog } from "@/components/SelectPexelsImageDialog"
import SectionRegenerator from "@/components/dashboard/SectionRegenerator"

interface ImageRef {
  url: string
  path: string | null
}

interface PostSectionEditorProps {
  idx: number
  section: UiSection & {
    imageUrl?: string
    uploadedImagePath?: string | null
  }
  onChange: (idx: number, field: "heading" | "content", val: string) => void
  onImage: (idx: number, ref: ImageRef) => void
  onDelete: (idx: number) => void
}

export default function PostSectionEditor({
  idx,
  section,
  onChange,
  onImage,
  onDelete,
}: PostSectionEditorProps) {
  // wrap sprejme bodisi string URL ali že ImageRef in vrne ImageRef
  const wrap = (u: any): ImageRef =>
    typeof u === "string" ? { url: u, path: null } : { url: u.url, path: null }

  return (
    <div className="space-y-6 bg-muted/50 p-6 rounded-md shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEVA STRAN: heading + content */}
        <div className="flex flex-col gap-4">
          <div>
            <Label className="text-md font-semibold">Podnaslov</Label>
            <Input
              value={section.heading}
              placeholder="Unesi podnaslov"
              onChange={(e) => onChange(idx, "heading", e.target.value)}
            />
          </div>

          <div>
            <Label className="text-md font-semibold">Vsebina</Label>
            <Textarea
              rows={8}
              value={section.content}
              placeholder="Unesi vsebino sekcije"
              onChange={(e) => onChange(idx, "content", e.target.value)}
            />
          </div>
        </div>

        {/* DESNA STRAN: slika + gumbi */}
        <div className="flex flex-col gap-4">
          <Label className="text-md font-semibold">Slika sekcije</Label>

          <UploadImageButton
            currentUploadedPath={section.uploadedImagePath ?? null}
            onUploaded={(ref) => onImage(idx, ref)}
            externalUrl={section.imageUrl}
          />

          <div className="flex gap-4">
            <SelectUnsplashImageDialog
              onSelect={(u) => onImage(idx, wrap(u))}
            />
            <SelectPexelsImageDialog
              onSelect={(u) => onImage(idx, wrap(u))}
            />
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-4 mt-4">
        <SectionRegenerator
          sectionTitle={section.heading}
          onRegenerate={(c) => onChange(idx, "content", c)}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-red-600 hover:bg-red-50"
          onClick={() => onDelete(idx)}
        >
          Izbriši sekcijo
        </Button>
      </div>
    </div>
  )
}
