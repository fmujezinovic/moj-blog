"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { uploadImage } from "@/lib/upload-image";

interface UploadImageButtonProps {
  onUploaded: (url: string) => void;
}

export default function UploadImageButton({ onUploaded }: UploadImageButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadSelectedFile(file);
  };

  const uploadSelectedFile = async (file: File) => {
    setLoading(true);
    try {
      const url = await uploadImage(file);
      onUploaded(url);
      toast.success("Slika uspešno naložena!");
    } catch (error) {
      console.error(error);
      toast.error("Napaka pri nalaganju slike");
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile();
        if (file) {
          await uploadSelectedFile(file);
        }
      }
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-primary"
      onClick={openFileDialog}
      onPaste={handlePaste}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
      />
      <p className="text-sm text-muted-foreground">
        Klikni za upload slike ali prilepi sliko (CTRL+V)
      </p>
      <Button variant="secondary" size="sm" className="mt-2" disabled={loading}>
        {loading ? "Nalaganje..." : "Izberi sliko"}
      </Button>
    </div>
  );
}
