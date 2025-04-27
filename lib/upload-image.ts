"use server";

import { createClient } from "@/utils/supabase/server";
import { v4 as uuidv4 } from "uuid";

export async function uploadImage(file: File) {
  const supabase = createClient();
  const fileExt = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase
    .storage
    .from('images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error(error);
    throw new Error('Napaka pri nalaganju slike.');
  }

  const { data: publicUrlData, error: urlError } = supabase
    .storage
    .from('images')
    .getPublicUrl(filePath);

  if (urlError) {
    console.error(urlError);
    throw new Error('Napaka pri pridobivanju URL slike.');
  }

  return publicUrlData?.publicUrl;
}
