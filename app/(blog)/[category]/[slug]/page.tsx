import { loadContent } from "@/lib/loadContent";
import RenderedMDX from "@/components/RenderedMDX";
import { Metadata } from "next";

export const dynamic = "force-dynamic"; // Da vedno server-side fetch-a (če se v Supabase kaj spremeni)

export async function generateMetadata({
  params,
}: {
  params: { category: string; slug: string };
}): Promise<Metadata> {
  const { data: post } = await loadContent({
    table: "posts",
    slug: params.slug,
    categorySlug: params.category,
  });

  return {
    title: post.title || "Objava",
    description: post.description || "Preberi več v tej objavi.",
  };
}

export default async function PostPage({
  params,
}: {
  params: { category: string; slug: string };
}) {
  const { MDXContent, data: post } = await loadContent({
    table: "posts",
    slug: params.slug,
    categorySlug: params.category,
  });

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 flex flex-col space-y-6 bg-background text-foreground">
      <h1 className="font-heading text-h1 text-primary">{post.title}</h1>
      <RenderedMDX>
        <MDXContent />
      </RenderedMDX>
    </div>
  );
}
