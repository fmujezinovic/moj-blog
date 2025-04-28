import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import FancyPostLayout from "@/components/FancyPostLayout";
import { createClient } from "@/utils/supabase/server";
import { loadContent } from "@/lib/loadContent";

export const dynamic = "force-dynamic"; // uvek svjež podatak

export default async function ViewPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = await createClient();

  /* ----- 1. Dohvati sam post -------------- */
  const {
    data: post,
    MDXContent,
  } = await loadContent({
    table: "posts",
    slug: params.slug,
  });

  if (!post) notFound();

  /* ----- 2. Popis svih slugova u toj kategoriji ------ */
  const { data: list } = await supabase
    .from("posts")
    .select("slug")
    .eq("category_id", post.category_id)
    .eq("is_draft", false)
    .order("published_at");

  const idx  = list.findIndex((r: any) => r.slug === params.slug);
  const prev = idx > 0               ? list[idx - 1].slug : null;
  const next = idx < list.length - 1 ? list[idx + 1].slug : null;

  /* ----- 3. UI ----- */
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
          <Button variant="outline" asChild>
            <a
              href={`/${post.categories.slug}/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              👁 View live
            </a>
          </Button>
          <Button asChild>
            <a href={`/dashboard/posts/${post.slug}/edit`}>✏️ Edit</a>
          </Button>
        </div>
      </div>

      {/* Read-only prikaz */}
      <Suspense fallback={<div className="py-10 text-center">Nalagam…</div>}>
        <FancyPostLayout
          title={post.title}
          content={<MDXContent />}
          images={post.images}
        />
      </Suspense>
    </main>
  );
}
