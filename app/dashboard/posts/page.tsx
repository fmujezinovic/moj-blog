// app/dashboard/posts/page.tsx
import * as React from "react";
import { createClient } from "@/utils/supabase/server";
import TablePosts from "@/components/dashboard/TablePosts";

export const dynamic = "force-dynamic"; // vedno svež fetch

export default async function PostsPage() {
  const supabase = await createClient(); // ⬅ await obvezen

  // —— dohvat + JOIN kategorije (slug, name) —— 
  const { data: rawPosts, error } = await supabase
    .from("posts")
    .select(`
      id,
      title,
      slug,
      published_at,
      is_draft,
      categories (
        name,
        slug
      )
    `)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Napaka pri pridobivanju objav:", error.message);
  }

  // Pretvorimo array categories[] v single object
  const posts =
    rawPosts?.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      published_at: p.published_at,
      is_draft: p.is_draft,
      // Supabase vrne categories kot polje, vzamemo prvi element ali default
      categories:
        Array.isArray(p.categories) && p.categories.length > 0
          ? p.categories[0]
          : { name: "", slug: "" },
    })) || [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Posts</h1>
      <TablePosts data={posts} />
    </div>
  );
}
