import { loadContent } from "@/lib/loadContent";
import FancyPostLayout from "@/components/FancyPostLayout";
import { Suspense } from "react";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { category: string; slug: string } }): Promise<Metadata> {
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

export default async function PostPage({ params }: { params: { category: string; slug: string } }) {
  const { data: post, MDXContent } = await loadContent({
    table: "posts",
    slug: params.slug,
    categorySlug: params.category,
  });

  return (
    <main className="flex flex-col bg-background text-foreground min-h-screen">
      <Suspense fallback={<div className="text-center py-20 font-subheading text-base">Nalagam objavo...</div>}>
        <FancyPostLayout
          title={post.title}
          content={<MDXContent />}
          images={post.images || []}
        />
      </Suspense>
    </main>
  );
}
