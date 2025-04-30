"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogTrigger,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input }  from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SelectImageDialogProps {
  onSelect: (url: string) => void;
}

export function SelectUnsplashImageDialog({ onSelect }: SelectImageDialogProps) {
  const [open,        setOpen]        = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [images,      setImages]      = useState<string[]>([]);
  const [loading,     setLoading]     = useState(false);

  /* Traži fotografije */
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res  = await fetch(`/api/unsplash?query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setImages(data.results || []);
    } catch (err) {
      console.error("Napaka pri iskanju Unsplash slik:", err);
    } finally {
      setLoading(false);
    }
  };

  /* Klik na thumbnail = odabir slike */
  const handleImageSelect = (image: any) => {
    onSelect({
      url: image.full, // Using full quality image for final selection
      alt: image.alt,
      preview: image.regular, // Using regular quality for preview
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Izberi iz Unsplash</Button>
      </DialogTrigger>

      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Izberi sliko iz Unsplash</DialogTitle>
        </DialogHeader>

        {/* Tražilica */}
        <div className="flex gap-2">
          <Input
            placeholder="Iskanje slik (npr. AI, narava, mesto...)"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => {
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

        {/* Rezultati */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto mt-4">
          {images.map((image: any, i: number) => (
            <div
              key={i}
              className="relative cursor-pointer group"
              onClick={() => handleImageSelect(image)}
            >
              <img
                src={image.small}
                alt={image.alt}
                className="w-full h-48 object-cover rounded-lg transition-all duration-200 group-hover:opacity-75"
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
