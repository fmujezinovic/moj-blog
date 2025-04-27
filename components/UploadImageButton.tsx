"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { v4 as uuidv4 } from "uuid";

interface UploadImageButtonProps {
  currentUploadedPath: string | null;
  onUploaded: (url: string, path: string | null) => void;
}

export default function UploadImageButton({ currentUploadedPath, onUploaded }: UploadImageButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const supabase = createClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadSelectedFile(file);
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.includes("image")) {
        const file = item.getAsFile();
        if (file) {
          await uploadSelectedFile(file);
        }
      }
    }
  };

  const uploadSelectedFile = async (file: File) => {
    try {
      setUploading(true);
      setProgress(0);

      if (currentUploadedPath) {
        const { error } = await supabase.storage.from("images").remove([currentUploadedPath]);
        if (error) {
          console.error("Napaka pri brisanju stare slike:", error.message);
        } else {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error(uploadError);
        throw new Error("Napaka pri nalaganju slike.");
      }

      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 20));
        setProgress(i);
      }

      const { data: publicUrlData, error: urlError } = supabase
        .storage
        .from('images')
        .getPublicUrl(filePath);

      if (urlError || !publicUrlData?.publicUrl) {
        console.error(urlError);
        throw new Error("Napaka pri pridobivanju URL-ja slike.");
      }

      setUploadedUrl(publicUrlData.publicUrl);

      onUploaded(publicUrlData.publicUrl, filePath);

      toast.success("Slika uspešno naložena!");
    } catch (error) {
      console.error(error);
      toast.error("Napaka pri nalaganju slike.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleRemoveImage = async () => {
    if (currentUploadedPath) {
      const { error } = await supabase.storage.from("images").remove([currentUploadedPath]);
      if (error) {
        console.error("Napaka pri brisanju slike:", error.message);
        toast.error("Napaka pri brisanju slike.");
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    setUploadedUrl(null);
    onUploaded("", null);
    toast.success("Slika uspešno odstranjena!");
  };

  return (
    <div
      onPaste={handlePaste}
      className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center text-gray-500 hover:border-gray-400 transition relative"
    >
      {uploadedUrl ? (
        <div className="space-y-2">
          <img
            src={uploadedUrl}
            alt="Predogled slike"
            className="mx-auto w-32 h-32 object-cover rounded-md mb-2"
          />
          <button
            onClick={handleRemoveImage}
            className="text-red-500 underline text-sm hover:text-red-600"
          >
            Odstrani sliko
          </button>
        </div>
      ) : uploading ? (
        <div className="space-y-2">
          <div> Nalagam... {progress}% </div>
          <div className="h-2 w-full bg-gray-200 rounded">
            <div
              className="h-2 bg-blue-500 rounded"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <div onClick={() => fileInputRef.current?.click()}>
          Klikni za upload slike ali prilepi sliko (CTRL+V)
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
