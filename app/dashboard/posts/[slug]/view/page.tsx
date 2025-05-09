import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import FancyPostLayout from "@/components/FancyPostLayout";
import { createClient } from "@/utils/supabase/server";
import { ViewLiveButton } from "@/components/posts/ViewLiveButton";

export const dynamic = "force-dynamic";

interface ViewPageProps {
  params: { slug: string };
}

export default async function ViewPage(props: ViewPageProps) {
  const slug = props.params.slug;

  const { loadContent } = await import("@/lib/loadContent.server");
  const supabase = await createClient();

  // 1. Naloži post (vključno z osnutki)
  const {
    data: post,
    MDXContent,
  } = await loadContent({
    table: "posts",
    slug,
    includeDraft: true, // ⚠️ zelo pomembno za admin prikaz
  });

  if (!post) {
    notFound();
  }

  // 2. Pridobi sosednje objave iz iste kategorije
  const { data: list } = await supabase
    .from("posts")
    .select("slug")
    .eq("category_id", post.category_id)
    .eq("is_draft", false)
    .order("published_at");

  const idx = list.findIndex((r: any) => r.slug === slug);
  const prev = idx > 0 ? list[idx - 1].slug : null;
  const next = idx < list.length - 1 ? list[idx + 1].slug : null;

  // 3. Prikaz UI
  return (
    <main className="px-4 py-6">
      {/* Navigacija */}
      <div className="flex justify-between mb-4">
        <div className="space-x-2">
          {prev && (
            <Button variant="outline" asChild>
              <a href={`/dashboard/posts/${prev}/view`}>⬅ Prev</a>
            </Button>
          )}
          {next && (
            <Button variant="outline" asChild>
              <a href={`/dashboard/posts/${next}/view`}>Next ➡</a>
            </Button>
          )}
        </div>

        <div className="space-x-2">
          <ViewLiveButton
            isDraft={post.is_draft}
            url={`/${post.categories.slug}/${post.slug}`}
          />
          <Button asChild>
            <a href={`/dashboard/posts/${post.slug}/edit`}>✏️ Edit</a>
          </Button>
        </div>
      </div>

      {/* Vsebina */}
      <Suspense fallback={<div className="py-10 text-center">Nalagam…</div>}>
        <FancyPostLayout
          title={post.title}
          intro={post.intro}
          content={<MDXContent />}
          conclusion={post.conclusion}
          images={post.images}
          prev={prev}
          next={next}
          category={post.categories.slug}
          slug={post.slug}
        />
      </Suspense>
    </main>
  );
}
