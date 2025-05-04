import { createClient } from "@/utils/supabase/server"; // ⬅️ ključni popravek
import { parseMDX } from "@/lib/parse-mdx";
import { notFound } from "next/navigation";

const toUrlArray = (raw: any): string[] =>
  Array.isArray(raw)
    ? raw.map((i: any) => (typeof i === "string" ? i : i.url))
    : [];

export async function loadContent({
  table,
  slug,
  categorySlug,
  includeDraft = false,
}: {
  table: "pages" | "posts";
  slug: string;
  categorySlug?: string;
  includeDraft?: boolean;
}) {
  const supabase = await createClient(); // ✅ pravilen klic

  // ---------- POSTS Znotraj kategorije ----------
  if (table === "posts" && categorySlug) {
    const { data: cat, error: catErr } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();
    if (catErr || !cat) {
      console.error(catErr);
      notFound();
    }

    let query = supabase
      .from("posts")
      .select("*, categories ( slug )")
      .eq("slug", slug)
      .eq("category_id", cat.id);

    if (!includeDraft) {
      query = query.eq("is_draft", false);
    }

    const { data: post, error: postErr } = await query.single();

    if (postErr || !post) {
      console.error(postErr);
      notFound();
    }

    const MDXContent = await parseMDX(post.content_md);
    return {
      data: { ...post, images: toUrlArray(post.images) },
      MDXContent,
    };
  }

  // ---------- POSTS brez kategorije ----------
  if (table === "posts" && !categorySlug) {
    const { data: post, error } = await supabase
      .from("posts")
      .select("*, categories ( slug )")
      .eq("slug", slug)
      .single();

    if (error || !post) {
      console.error("Napaka pri pridobivanju posta:", slug, error?.message ?? error);
      notFound();
    }

    const MDXContent = await parseMDX(post.content_md);
    return {
      data: { ...post, images: toUrlArray(post.images) },
      MDXContent,
    };
  }

  // ---------- PAGE ----------
  const { data: page, error: pageErr } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .eq("is_draft", false)
    .single();

  if (pageErr || !page) {
    console.error("Napaka pri pridobivanju page:", slug, pageErr?.message ?? pageErr);
    notFound();
  }

  const MDXContent = await parseMDX(page.content_md);
  return {
    data: { ...page, images: [] },
    MDXContent,
  };
}
