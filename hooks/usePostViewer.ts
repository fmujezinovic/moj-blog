"use client";

import { use } from "react";
import { loadContent } from "@/lib/loadContent";
import { createClient } from "@/utils/supabase/client";

export const usePostViewer = (slug: string) => {
  const supabase = createClient();

  /* 1. dohvati sam post */
  const { data: post, MDXContent } = use(
    loadContent({ table: "posts", slug, categorySlug: undefined }),
  );

  /* 2. dohvati listu slugova u istoj kategoriji */
  const { data: list } = use(
    supabase
      .from("posts")
      .select("slug")
      .eq("category_id", post.category_id)
      .eq("is_draft", false)
      .order("published_at")
  );

  const idx  = list.findIndex((r: any) => r.slug === slug);
  const prev = idx > 0               ? list[idx - 1].slug : null;
  const next = idx < list.length - 1 ? list[idx + 1].slug : null;

  return { post, MDXContent, prev, next };
};
