import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default async function CategoryPage({ params }: { params: { category: string } }) {
  // Pridobimo kategorijo po slug-u
  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", params.category)
    .single();

  // Če kategorije ni, prikaži napako
  if (!category) {
    return <div>Kategorija ni najdena.</div>;
  }

  // Pridobimo objave iz te kategorije
  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, slug, published_at")
    .eq("is_draft", false)
    .eq("category_id", category.id)
    .order("published_at", { ascending: false });

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="font-heading text-h2 text-primary capitalize">
        {params.category.replace(/-/g, " ")}
      </h1>

      {posts?.length === 0 && (
        <p className="font-body text-base text-muted-foreground">
          Ni objav v tej kategoriji.
        </p>
      )}

      {posts?.map((post) => (
        <Link key={post.id} href={`/${params.category}/${post.slug}`}>
          <article className="p-4 border rounded-md hover:bg-muted transition">
            <h2 className="font-subheading text-h3 text-foreground">
              {post.title}
            </h2>
            <p className="font-body text-small text-muted-foreground">
              {new Date(post.published_at).toLocaleDateString()}
            </p>
          </article>
        </Link>
      ))}
    </div>
  );
}
