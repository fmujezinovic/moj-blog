import { loadContentList } from "@/lib/loadContent";
import Link from "next/link";

export const dynamic = "force-dynamic"; // vedno server-side fetch za sveže podatke

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const category = params.category;


  const { data: posts } = await loadContentList({
    table: "posts",
    categorySlug: category,
  });

  if (!posts) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <h1 className="font-heading text-4xl text-primary mb-4">Kategorija ni najdena</h1>
        <p className="font-body text-muted-foreground">Poskusite kasneje.</p>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-8 bg-background text-foreground">
      <h1 className="font-heading text-h1 text-primary text-center capitalize">
        {category.replace(/-/g, " ")}
      </h1>

      {posts.length === 0 ? (
        <p className="font-body text-base text-muted-foreground text-center">
          Trenutno ni objav v tej kategoriji.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/${category}/${post.slug}`}
              className="group"
            >
              <article className="p-6 rounded-lg border shadow-sm hover:shadow-md transition flex flex-col h-full">
                <h2 className="font-subheading text-xl text-foreground group-hover:text-primary mb-2">
                  {post.title}
                </h2>
                <p className="font-body text-sm text-muted-foreground">
                  {post.published_at ? new Date(post.published_at).toLocaleDateString("sl-SI") : "Datum neznan"}
                </p>
              </article>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
