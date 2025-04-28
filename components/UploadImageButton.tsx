"use client";

import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import type { ImageRef } from "@/types/image";

interface Props {
  currentUploadedPath: string | null;
  onUploaded: (ref: ImageRef) => void;
  externalUrl?: string;
}

export default function UploadImageButton({
  currentUploadedPath,
  onUploaded,
  externalUrl,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const [uploading,   setUploading]   = useState(false);
  const [progress,    setProgress]    = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  /* thumbnail za Unsplash/Pexels */
  useEffect(() => {
    if (externalUrl) setUploadedUrl(externalUrl);
  }, [externalUrl]);

  /* ---- upload helper ---- */
  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      setProgress(0);

      if (currentUploadedPath) {
        await supabase.storage.from("images").remove([currentUploadedPath]);
      }

      const ext      = file.name.split(".").pop();
      const fileName = `${uuidv4()}.${ext}`;

      const { data, error } = await supabase.storage
        .from("images")
        .upload(fileName, file, { cacheControl: "3600" });
      if (error || !data) throw error;

      for (let i = 0; i <= 100; i += 10) {
        await new Promise(r => setTimeout(r, 20));
        setProgress(i);
      }

      const { data: urlData, error: urlErr } = supabase
        .storage.from("images")
        .getPublicUrl(data.path);
      if (urlErr || !urlData?.publicUrl) throw urlErr;

      setUploadedUrl(urlData.publicUrl);
      onUploaded({ url: urlData.publicUrl, path: data.path });
      toast.success("Slika uspešno naložena!");
    } catch (err) {
      console.error(err);
      toast.error("Napaka pri nalaganju slike.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const removeImage = async () => {
    try {
      if (currentUploadedPath) {
        await supabase.storage.from("images").remove([currentUploadedPath]);
      }
      setUploadedUrl(null);
      onUploaded({ url: "", path: null });
      toast.success("Slika odstranjena!");
    } catch {
      toast.error("Napaka pri brisanju slike.");
    }
  };

  /* ---- UI ---- */
  return (
    <div
      onPaste={e => {
        for (const it of e.clipboardData.items) {
          if (it.type.includes("image")) it.getAsFile() && uploadFile(it.getAsFile()!);
        }
      }}
      className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center text-gray-500 hover:border-gray-400 transition relative"
    >
      {uploadedUrl ? (
        <div className="space-y-2">
          <img
            src={uploadedUrl}
            alt="Predogled"
            className="mx-auto w-32 h-32 object-cover rounded-md mb-2"
          />
          <button
            onClick={removeImage}
            className="text-red-500 underline text-sm hover:text-red-600"
          >
            Odstrani sliku
          </button>
        </div>
      ) : uploading ? (
        <div className="space-y-2">
          <div>Nalaganje… {progress}%</div>
          <div className="h-2 w-full bg-gray-200 rounded">
            <div
              className="h-2 bg-blue-500 rounded"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <div onClick={() => inputRef.current?.click()}>
          Klikni za upload slike ili prilepi (CTRL+V)
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0])}
      />
    </div>
  );
}
