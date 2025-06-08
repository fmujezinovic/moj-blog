'use client';

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface UnsplashImage {
  url: string;       // za končni izbor
  alt: string;       // alt besedilo
  preview: string;   // za predogled
}

interface SelectUnsplashImageDialogProps {
  onSelect: (image: UnsplashImage) => void;
}

export function SelectUnsplashImageDialog({
  onSelect,
}: SelectUnsplashImageDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [loading, setLoading] = useState(false);

  /* 1. Poizvedba na API */
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/unsplash?query=${encodeURIComponent(searchQuery)}`
      );
      const data = await res.json();

      // mapiramo iz surove strukture na UnsplashImage[]
      const mapped = (data.results || []).map((img: any) => ({
        url: img.full,
        alt: img.alt || img.description || searchQuery,
        preview: img.regular,
      }));
      setImages(mapped);
    } catch (err) {
      console.error("Napaka pri iskanju Unsplash slik:", err);
    } finally {
      setLoading(false);
    }
  };

  /* 2. Izbor slike iz mreže */
  const handleImageSelect = (img: UnsplashImage) => {
    onSelect(img);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Izberi iz Unsplash
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Izberi sliko iz Unsplash</DialogTitle>
        </DialogHeader>

        {/* Polje za iskanje */}
        <div className="flex gap-2">
          <Input
            placeholder="Iskanje slik (npr. AI, narava, mesto...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
            }}
          />
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? "Iščem…" : "Išči"}
          </Button>
        </div>

        {/* Prikaz rezultatov */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto mt-4">
          {images.map((img, i) => (
            <div
              key={i}
              className="relative cursor-pointer group"
              onClick={() => handleImageSelect(img)}
            >
              <img
                src={img.preview}
                alt={img.alt}
                className="w-full h-48 object-cover rounded-lg transition-all duration-200 group-hover:opacity-75"
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
