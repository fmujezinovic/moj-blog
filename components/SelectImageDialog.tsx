"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SelectImageDialogProps {
  onSelect: (url: string) => void;
}

export function SelectImageDialog({ onSelect }: SelectImageDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      // Išči Unsplash + Pexels
      const [unsplashImages, pexelsImages] = await Promise.all([
        fetchUnsplashImages(searchQuery),
        fetchPexelsImages(searchQuery),
      ]);

      setImages([...unsplashImages, ...pexelsImages]);
    } catch (error) {
      console.error("Napaka pri iskanju slik:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (url: string) => {
    onSelect(url);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Izberi iz Unsplash/Pexels</Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Izberi sliko</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2">
          <Input
            placeholder="Iskanje slik (npr. AI, narava, mesto...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? "Iščem..." : "Išči"}
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto mt-4">
          {images.map((url) => (
            <img
              key={url}
              src={url}
              alt="Izbrana slika"
              onClick={() => handleSelect(url)}
              className="rounded-lg cursor-pointer hover:opacity-75 transition"
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

async function fetchUnsplashImages(query: string): Promise<string[]> {
  const res = await fetch(`https://api.unsplash.com/search/photos?query=${query}&client_id=${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`);
  const data = await res.json();
  return (data.results || []).map((item: any) => item.urls.small);
}

async function fetchPexelsImages(query: string): Promise<string[]> {
  const res = await fetch(`https://api.pexels.com/v1/search?query=${query}&per_page=10`, {
    headers: {
      Authorization: process.env.NEXT_PUBLIC_PEXELS_API_KEY!,
    },
  });
  const data = await res.json();
  return (data.photos || []).map((item: any) => item.src.medium);
}



