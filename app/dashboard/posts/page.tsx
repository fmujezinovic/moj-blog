// app/dashboard/posts/page.tsx
import { createClient } from "@/utils/supabase/server";
import TablePosts       from "@/components/dashboard/TablePosts";

export const dynamic = "force-dynamic";          // uvijek svjež fetch

export default async function PostsPage() {
  const supabase = await createClient();         // ⬅ await obvezan

  /* —— dohvat + JOIN kategorije (slug) —— */
  const { data: posts, error } = await supabase
    .from("posts")
    .select(`
      id,
      title,
      slug,
      published_at,
      categories ( slug )
    `)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Napaka pri pridobivanju objav:", error.message);
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Posts</h1>
      <TablePosts data={posts || []} />
    </div>
  );
}
