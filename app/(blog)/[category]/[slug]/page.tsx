// app/blog/[category]/[slug]/page.tsx

import * as React from "react";
import { notFound } from "next/navigation";
import FancyPostLayout from "@/components/FancyPostLayout";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

interface PostListItem {
  slug: string;
}

interface PageProps {
  params: {
    category: string;
    slug: string;
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { category, slug } = params; // destructure na začetku

  const { loadContent } = await import("@/lib/loadContent.server");
  const supabase = await createClient();

  // 1. Load the post content
  const result = await loadContent({
    table: "posts",
    slug,
    categorySlug: category,
  });

  if (!result?.data) {
    notFound();
  }

  const { data: post, MDXContent } = result;

  // 2. Get prev/next navigation
  const { data: list } = await supabase
    .from("posts")
    .select("slug")
    .eq("category_id", post.category_id)
    .eq("is_draft", false)
    .order("published_at");

  const idx = list?.findIndex((r: PostListItem) => r.slug === slug) ?? -1;
  const prev = idx > 0 ? list![idx - 1].slug : null;
  const next = idx >= 0 && idx < (list?.length ?? 0) - 1 ? list![idx + 1].slug : null;

  // 3. Render the blog post
  return (
    <React.Suspense fallback={<div className="py-10 text-center">Učitavam...</div>}>
      <FancyPostLayout
        title={post.title}
        intro={post.intro}
        content={<MDXContent />}
        conclusion={post.conclusion}
        images={post.images}
        prev={prev}
        next={next}
        category={category}
        slug={slug}
      />
    </React.Suspense>
  );
}
