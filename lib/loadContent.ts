import { supabase } from "@/lib/supabaseClient";
import { parseMDX } from "@/lib/parse-mdx";
import { notFound } from "next/navigation";

// ==================== OSTAJA TVOJA FUNKCIJA ====================
export async function loadContent({
  table,
  slug,
  categorySlug,
}: {
  table: "pages" | "posts";
  slug: string;
  categorySlug?: string;
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
      console.log("POST: ", post);
console.log("POST CONTENT_MD:", post?.content_md);


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

// ==================== NOVO: ZA SEZNAM OBJAV ====================
export async function loadContentList({
  table,
  categorySlug,
}: {
  table: "posts";
  categorySlug: string;
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

    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select("id, title, slug, published_at")
      .eq("category_id", cat.id)
      .eq("is_draft", false)
      .order("published_at", { ascending: false });

    if (postsError || !posts) {
      notFound();
    }

    return { data: posts };
  }

  return { data: [] };
}
