import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const supabase = createClient();

  // 1. Pridobi ID kategorije
  const { data: cat, error: catErr } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", category)
    .single();

  if (catErr || !cat) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <h1 className="font-heading text-4xl text-primary mb-4">
          Kategorija ni najdena
        </h1>
        <p className="font-body text-muted-foreground">Poskusite kasneje.</p>
      </div>
    );
  }

  // 2. Pridobi vse objave iz te kategorije
  const { data: posts, error: postsErr } = await supabase
    .from("posts")
    .select("id, slug, title, published_at, images")
    .eq("category_id", cat.id)
    .eq("is_draft", false)
    .order("published_at", { ascending: false });

  if (postsErr || !posts) {
    notFound();
  }

  // 3. Prikaži mrežo objav
  return (
    <main className="max-w-6xl mx-auto p-6 space-y-12 bg-background text-foreground">
      <h1 className="font-heading text-4xl md:text-5xl text-primary text-center capitalize">
        {category.replace(/-/g, " ")}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {posts.map((post) => {
          let coverImage = "/images/placeholder.jpg";

          try {
            const arr = Array.isArray(post.images)
              ? post.images
              : JSON.parse(post.images || "[]");
            if (Array.isArray(arr) && arr.length > 0 && arr[0]?.url) {
              coverImage = arr[0].url;
            }
          } catch {
            console.error("Napaka pri parsiranju slik za post:", post.slug);
          }

          return (
            <Link key={post.id} href={`/${category}/${post.slug}`} className="group">
              <article className="flex flex-col md:flex-row bg-muted rounded-xl overflow-hidden hover:shadow-lg transition-all h-full">
                <div className="relative w-full md:w-48 h-48 md:h-auto overflow-hidden">
                  <Image
                    src={coverImage}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 flex flex-col justify-between flex-1">
                  <h2 className="font-subheading text-xl md:text-2xl text-foreground group-hover:text-primary transition-colors mb-2">
                    {post.title}
                  </h2>
                  <p className="font-body text-sm text-muted-foreground">
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString("sl-SI")
                      : "Datum neznan"}
                  </p>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
