import { createClient } from "@/utils/supabase/client";
import { parseMDX }     from "@/lib/parse-mdx";
import { notFound }     from "next/navigation";

/* ------------------------------------------------------------------ */
/*                               HELPERS                              */
/* ------------------------------------------------------------------ */
const toUrlArray = (raw: any): string[] =>
  Array.isArray(raw)
    ? raw.map((i: any) => (typeof i === "string" ? i : i.url))
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
  const supabase = await createClient();

  /* -------- POST znotraj kategorije (public prikaz) -------- */
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

    const { data: post, error: postErr } = await supabase
      .from("posts")
      .select("*, categories ( slug )")
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
      data: { ...post, images: toUrlArray(post.images) },
      MDXContent,
    };
  }

  /* -------- POST brez categorySlug (admin viewer) -------- */
  if (table === "posts" && !categorySlug) {
    const { data: post, error } = await supabase
      .from("posts")
      .select("*, categories ( slug )")
      .eq("slug", slug)
      .single();
    
    if (error) {
      console.error("Napaka pri pridobivanju posta za slug:", slug, error?.message ?? error);
      notFound();
    }

    if (!post) {
      console.warn("Post ni najden za slug:", slug);
      notFound();
    }

    const MDXContent = await parseMDX(post.content_md);
    return {
      data: { ...post, images: toUrlArray(post.images) },
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

if (pageErr) {
  console.error("Napaka v Supabase poizvedbi:", pageErr.message ?? pageErr);
  notFound();
}
if (!page) {
  console.warn("Stran (page) ni najdena za slug:", slug);
  notFound();
}

const MDXContent = await parseMDX(page.content_md);
return {
  data: { ...page, images: [] }, // pages nimajo images
  MDXContent,
};
}  // Added missing closing brace for loadContent

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
    const { data: cat, error: catErr } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();
    if (catErr || !cat) {
      console.error(catErr);
      notFound();
    }

    const { data: posts, error: postsErr } = await supabase
      .from("posts")
      .select("id, title, slug, published_at, images")
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
