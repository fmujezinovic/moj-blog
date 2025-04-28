import { createClient } from "@/utils/supabase/client";
import { parseMDX }     from "@/lib/parse-mdx";
import { notFound }     from "next/navigation";

/* ------------------------------------------------------------------ */
/*                              1. HELPERS                            */
/* ------------------------------------------------------------------ */
const toUrlArray = (raw: any): string[] =>
  Array.isArray(raw)
    ? raw.map((item: any) => (typeof item === "string" ? item : item.url))
    : [];

/* ------------------------------------------------------------------ */
/*                       LOAD ENO OBJAVO (page / post)                */
/* ------------------------------------------------------------------ */
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

  /* --------------------- POST ZNOTRAJ KATEGORIJE --------------------- */
  if (table === "posts" && categorySlug) {
    /* category id */
    const { data: cat, error: catErr } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();

    if (catErr || !cat) {
      console.error(catErr);
      notFound();
    }

    /* post */
    const { data: post, error: postErr } = await supabase
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .eq("category_id", cat.id)
      .eq("is_draft", false)
      .single();

    if (postErr || !post) {
      console.error(postErr);
      notFound();
    }

    const MDXContent = await parseMDX(post.content_md);

    return {
      data: {
        ...post,
        images: toUrlArray(post.images), // ← samo URL-ovi
      },
      MDXContent,
    };
  }

  /* ----------------------------- PAGE ------------------------------- */
  const { data: page, error: pageErr } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .eq("is_draft", false)
    .single();

  if (pageErr || !page) {
    console.error(pageErr);
    notFound();
  }

  const MDXContent = await parseMDX(page.content_md);

  return {
    data: {
      ...page,
      images: [], // pages nimajo images
    },
    MDXContent,
  };
}

/* ------------------------------------------------------------------ */
/*                         SEZNAM OBJAV (posts)                       */
/* ------------------------------------------------------------------ */
export async function loadContentList({
  table,
  categorySlug,
}: {
  table: "posts";
  categorySlug: string;
}) {
  const supabase = createClient();

  if (table === "posts" && categorySlug) {
    /* category id */
    const { data: cat, error: catErr } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();

    if (catErr || !cat) {
      console.error(catErr);
      notFound();
    }

    /* posts */
    const { data: posts, error: postsErr } = await supabase
      .from("posts")
      .select("id, title, slug, published_at")
      .eq("category_id", cat.id)
      .eq("is_draft", false)
      .order("published_at", { ascending: false });

    if (postsErr || !posts) {
      console.error(postsErr);
      notFound();
    }

    return { data: posts };
  }

  return { data: [] };
}
