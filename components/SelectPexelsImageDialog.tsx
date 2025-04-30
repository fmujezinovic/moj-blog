"use client";

import { useState, ChangeEvent, KeyboardEvent } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SelectImageDialogProps {
  onSelect: (url: string) => void;
}

interface PexelsImage {
  preview: string;
  full: string;
  thumbnail: string;
}

export function SelectPexelsImageDialog({ onSelect }: SelectImageDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [images, setImages] = useState<PexelsImage[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/pexels?query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setImages(data.photos || []);
    } catch (error) {
      console.error("Napaka pri iskanju Pexels slik:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (image: PexelsImage) => {
    onSelect(image.full);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Izberi iz Pexels
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Izberi sliko iz Pexels</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2">
          <Input
            placeholder="Iskanje slik (npr. AI, narava, mesto...)"
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
            }}
          />
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? "Iščem..." : "Išči"}
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto mt-4">
          {images.map((image: PexelsImage, index: number) => (
            <div
              key={index}
              className="relative cursor-pointer group"
              onClick={() => handleSelect(image)}
            >
              <img
                src={image.preview}
                alt="Pexels slika"
                className="w-full h-48 object-cover rounded-lg transition-all duration-200 group-hover:opacity-75"
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
