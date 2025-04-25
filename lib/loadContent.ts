import { supabase } from "@/lib/supabaseClient";
import { parseMDX } from "@/lib/parse-mdx";
import { notFound } from "next/navigation";

export async function loadContent({
  table,
  slug,
  categorySlug,
}: {
  table: "pages" | "posts";
  slug: string;
  categorySlug?: string; // samo za posts
}) {
  if (table === "posts" && categorySlug) {
    const { data: cat, error: catError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();

    if (catError || !cat) {
      notFound();
    }

    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .eq("category_id", cat.id)
      .eq("is_draft", false)
      .single();

    if (postError || !post) {
      notFound();
    }

    const MDXContent = await parseMDX(post.content_md);

    return { data: post, MDXContent };
  }

  // Če ni post, ampak stran (page)
  const { data: page, error: pageError } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .eq("is_draft", false)
    .single();

  if (pageError || !page) {
    notFound();
  }

  const MDXContent = await parseMDX(page.content_md);

  return { data: page, MDXContent };
}
