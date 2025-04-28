"use server";

import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/utils/supabase/server"; // = createServerSupabase()
import type { ImageRef } from "@/types/image";

/**
 * Upload image to Supabase Storage and return public URL + path.
 */
export async function uploadImage(file: File): Promise<ImageRef> {
  const supabase = createClient();                    // per-request client

  /* ---- generate unique name ------------------------------------------------ */
  const ext      = file.name.split(".").pop();
  const fileName = `${uuidv4()}.${ext}`;              // abc123.jpg
  const filePath = fileName;                          // folder structure optional

  /* ---- upload -------------------------------------------------------------- */
  const { data, error } = await supabase.storage
    .from("images")
    .upload(filePath, file, { cacheControl: "3600", upsert: false });

  if (error || !data) {
    console.error(error);
    throw new Error("Napaka pri nalaganju slike.");
  }

  /* ---- public URL ---------------------------------------------------------- */
  const { data: urlData, error: urlErr } = supabase.storage
    .from("images")
    .getPublicUrl(filePath);

  if (urlErr || !urlData?.publicUrl) {
    console.error(urlErr);
    throw new Error("Napaka pri pridobivanju URL-ja slike.");
  }

  /* ---- ready to return ----------------------------------------------------- */
  const ref: ImageRef = { url: urlData.publicUrl, path: data.path }; // <-- path bitan za kasnije brisanje
  return ref;
}
