import { createClient } from "@/utils/supabase/server";
import TablePosts from "@/components/dashboard/TablePosts";

export default async function PostsPage() {
  const supabase = await createClient(); // ⬅️ moraš dodati await

  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Napaka pri pridobivanju objav:", error.message);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Posts</h1>
      <TablePosts data={posts || []} />
    </div>
  );
}
