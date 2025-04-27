import { createClient } from "@/utils/supabase/client";
import { parseMDX } from "@/lib/parse-mdx";
import { notFound } from "next/navigation";

// ==================== LOAD ENO OBJAVO ====================
export async function loadContent({
  table,
  slug,
  categorySlug,
}: {
  table: "pages" | "posts";
  slug: string;
  categorySlug?: string;
}) {
  const supabase = createClient();

  if (table === "posts" && categorySlug) {
    const { data: cat, error: catError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();

    if (catError || !cat) {
      console.error(catError);
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
      console.error(postError);
      notFound();
    }

    const MDXContent = await parseMDX(post.content_md);

    return {
      data: {
        ...post,
        images: Array.isArray(post.images) ? post.images : [], // 🔥 vedno array, tudi če manjka
      },
      MDXContent,
    };
  }

  // ==================== Če je stran (page) ====================
  const { data: page, error: pageError } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .eq("is_draft", false)
    .single();

  if (pageError || !page) {
    console.error(pageError);
    notFound();
  }

  const MDXContent = await parseMDX(page.content_md);

  return {
    data: {
      ...page,
      images: [], // 🔥 pages nimajo images => prazen array
    },
    MDXContent,
  };
}

// ==================== ZA SEZNAM OBJAV ====================
export async function loadContentList({
  table,
  categorySlug,
}: {
  table: "posts";
  categorySlug: string;
}) {
  const supabase = createClient();

  if (table === "posts" && categorySlug) {
    const { data: cat, error: catError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();

    if (catError || !cat) {
      console.error(catError);
      notFound();
    }

    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select("id, title, slug, published_at")
      .eq("category_id", cat.id)
      .eq("is_draft", false)
      .order("published_at", { ascending: false });

    if (postsError || !posts) {
      console.error(postsError);
      notFound();
    }

    return { data: posts };
  }

  return { data: [] };
}
