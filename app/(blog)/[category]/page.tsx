// ✅ Strežniška komponenta (ni "use client")

import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  // Najprej await-aj params
  const { category } = await params;

  const { loadContentList } = await import("@/lib/loadContent.server");

  const { data: posts } = await loadContentList({
    table: "posts",
    categorySlug: category,
  });

  if (!posts) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <h1 className="font-heading text-4xl text-primary mb-4">
          Kategorija ni najdena
        </h1>
        <p className="font-body text-muted-foreground">Poskusite kasneje.</p>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-12 bg-background text-foreground">
      <h1 className="font-heading text-4xl md:text-5xl text-primary text-center capitalize">
        {category.replace(/-/g, " ")}
      </h1>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {posts.map((post) => {
          let coverImage = "/images/placeholder.jpg";

          try {
            const imagesArray = Array.isArray(post.images)
              ? post.images
              : JSON.parse(post.images || "[]");

            if (
              Array.isArray(imagesArray) &&
              imagesArray.length > 0 &&
              imagesArray[0]?.url
            ) {
              coverImage = imagesArray[0].url;
            }
          } catch {
            console.error("Napaka pri parsiranju slik za post:", post.slug);
          }

          return (
            <Link
              key={post.id}
              href={`/${category}/${post.slug}`}
              className="group"
            >
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
