import { getPostViewerData } from "@/lib/getPostViewerData";
import FancyPostLayout from "@/components/FancyPostLayout";
import { Metadata } from "next";
import { notFound } from "next/navigation";

const baseUrl = "https://farismujezinovic.si";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { category: string; slug: string } }): Promise<Metadata> {
  const result = await getPostViewerData(params.slug);

  if (!result) {
    return {
      title: "Objava ni najdena",
      description: "Stran, ki ste jo iskali, ne obstaja.",
    };
  }

  const { post } = result;

  return {
    title: post.title || "Objava",
    description: post.description || "Preberi več v tej objavi.",
    openGraph: {
      title: post.title,
      description: post.description || "",
      url: `${baseUrl}/blog/${params.category}/${params.slug}`,
      type: "article",
      images: [
        {
          url: post.ogImage || `${baseUrl}/default-og.png`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description || "",
      images: [post.ogImage || `${baseUrl}/default-og.png`],
    },
    alternates: {
      canonical: `${baseUrl}/blog/${params.category}/${params.slug}`,
    },
  };
}

export default async function PostPage({ params }: { params: { category: string; slug: string } }) {
  const result = await getPostViewerData(params.slug);
  if (!result) return notFound();

  const { post, MDXContent, prev, next } = result;

  return (
    <main className="flex flex-col bg-background text-foreground min-h-screen px-4 py-10 max-w-4xl mx-auto">
      <FancyPostLayout
        title={post.title}
        content={<MDXContent />}
        images={post.images || []}
        prevSlug={prev ? `/blog/${params.category}/${prev}` : null}
        nextSlug={next ? `/blog/${params.category}/${next}` : null}
      />
    </main>
  );
}
