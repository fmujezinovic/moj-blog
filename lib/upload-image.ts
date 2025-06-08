// lib/upload-image.ts
"use server";

import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/utils/supabase/server"; // per-request Supabase client

// Local ImageRef definition
interface ImageRef {
  url: string;
  path: string | null;
}

/**
 * Uploads a File to Supabase Storage and returns its public URL + storage path.
 */
export async function uploadImage(file: File): Promise<ImageRef> {
  const supabase = createClient();

  // Generate a unique filename
  const ext      = file.name.split(".").pop();
  const fileName = `${uuidv4()}.${ext}`;  

  // Upload to the "images" bucket
  const { data: uploadData, error: uploadErr } = await supabase.storage
    .from("images")
    .upload(fileName, file, { cacheControl: "3600", upsert: false });

  if (uploadErr || !uploadData) {
    console.error(uploadErr);
    throw new Error("Napaka pri nalaganju slike.");
  }

  // Get its public URL
  const { data: urlData, error: urlErr } = supabase.storage
    .from("images")
    .getPublicUrl(fileName);

  if (urlErr || !urlData?.publicUrl) {
    console.error(urlErr);
    throw new Error("Napaka pri pridobivanju URL-ja slike.");
  }

  // Return both URL and path so you can later delete the file if needed
  return { url: urlData.publicUrl, path: uploadData.path };
}
