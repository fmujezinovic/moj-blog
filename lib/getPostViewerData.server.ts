// lib/getPostViewerData.ts

import { createClient } from "@/utils/supabase/client";

export async function getPostViewerData(slug: string) {
  const { loadContent } = await import("@/lib/loadContent.server");
  const supabase = createClient();

  const result = await loadContent({
    table: "posts",
    slug,
    categorySlug: undefined,
  });

  if (!result?.data) return null;

  const { data: post, MDXContent } = result;

  const { data: list } = await supabase
    .from("posts")
    .select("slug")
    .eq("category_id", post.category_id)
    .eq("is_draft", false)
    .order("published_at");

  const idx = list?.findIndex((r) => r.slug === slug) ?? -1;
  const prev = idx > 0 ? list![idx - 1].slug : null;
  const next = idx >= 0 && idx < list!.length - 1 ? list![idx + 1].slug : null;

  return { post, MDXContent, prev, next };
}
