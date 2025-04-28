"use client";

import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 }       from "uuid";
import { toast }              from "sonner";
import { createClient }       from "@/utils/supabase/client";
import type { ImageRef }      from "@/types/image";

interface UploadImageButtonProps {
  currentUploadedPath: string | null;   // path prethodne datoteke u bucketu
  onUploaded: (ref: ImageRef) => void;  // rezultat upload-a
  externalUrl?: string;                 // prikaz Unsplash / Pexels URL-a
}

export default function UploadImageButton({
  currentUploadedPath,
  onUploaded,
  externalUrl,
}: UploadImageButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading,   setUploading]   = useState(false);
  const [progress,    setProgress]    = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const supabase = createClient();

  /* ↻  kad vanjski URL stigne (Unsplash / Pexels) – pokaži thumbnail   */
  useEffect(() => {
    if (externalUrl) setUploadedUrl(externalUrl);
  }, [externalUrl]);

  /* ----------------------- Local helpers ---------------------------- */
  const emptyRef: ImageRef = { url: "", path: null };

  const uploadSelectedFile = async (file: File) => {
    try {
      setUploading(true);
      setProgress(0);

      /* briši staru (ako je bila upload-ana) */
      if (currentUploadedPath) {
        await supabase.storage.from("images").remove([currentUploadedPath]);
      }

      /* upload */
      const ext      = file.name.split(".").pop();
      const fileName = `${uuidv4()}.${ext}`;
      const { data, error } = await supabase.storage
        .from("images")
        .upload(fileName, file, { cacheControl: "3600" });

      if (error || !data) throw new Error("Upload failed");

      /* animacija progres bara (opcionalno) */
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(r => setTimeout(r, 20));
        setProgress(i);
      }

      /* public URL */
      const { data: urlData, error: urlErr } = supabase
        .storage.from("images")
        .getPublicUrl(data.path);
      if (urlErr || !urlData?.publicUrl) throw new Error("No public URL");

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

  const handleRemoveImage = async () => {
    try {
      if (currentUploadedPath) {
        await supabase.storage.from("images").remove([currentUploadedPath]);
      }
      setUploadedUrl(null);
      onUploaded(emptyRef);
      toast.success("Slika odstranjena!");
    } catch {
      toast.error("Napaka pri brisanju slike.");
    }
  };

  /* --------------------------- Handlers ---------------------------- */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadSelectedFile(file);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    for (const item of e.clipboardData.items) {
      if (item.type.includes("image")) {
        const file = item.getAsFile();
        if (file) uploadSelectedFile(file);
      }
    }
  };

  /* ---------------------------- UI --------------------------------- */
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
        <div onClick={() => fileInputRef.current?.click()}>
          Klikni za upload slike ili prilepi (CTRL+V)
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
