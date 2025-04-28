/**
 * Referenca na sliku spremljenu uz post/stranicu.
 * - `url`  → javni URL za <img src="…" />
 * - `path` → putanja u Supabase bucket-u; `null` za eksterne (Unsplash/Pexels)
 */
export interface ImageRef {
  url: string;
  path: string | null;
}
