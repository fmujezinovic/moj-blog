// app/blog/[category]/[slug]/page.tsx

import { loadContent } from "@/lib/loadContent";
import FancyPostLayout from "@/components/FancyPostLayout";
import { Suspense } from "react";
import { Metadata } from "next";

const baseUrl = "https://farismujezinovic.si"; // 🔥 Dodaj ovde!

export const dynamic = "force-dynamic";

// 🔽 OVA FUNKCIJA IDE OVDE
export async function generateMetadata({ params }: { params: { category: string; slug: string } }): Promise<Metadata> {
  const { data: post } = await loadContent({
    table: "posts",
    slug: params.slug,
    categorySlug: params.category,
  });

  if (!post) {
    return {
      title: "Objava ni najdena",
      description: "Stran, ki ste jo iskali, ne obstaja.",
    };
  }

  const baseUrl = "https://farismujezinovic.si"; // <- zamijeni s pravom domenom

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

// 🔽 Tvoja stranica
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


    {/* Dodajemo structured data */}
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.description?.slice(0, 160) || "",
          image: post.ogImage || `${baseUrl}/default-og.png`,
          datePublished: post.published_at || new Date().toISOString(),
          dateModified: post.updated_at || post.published_at || new Date().toISOString(),
          author: {
            "@type": "Person",
            name: "Faris Mujezinović", // tvoj ime kao autor
          },
          publisher: {
            "@type": "Organization",
            name: "Faris Mujezinović",
            logo: {
              "@type": "ImageObject",
              url: `${baseUrl}/logo.png`, // Ako imaš logo, ovde ga stavi (ili promijeni putanju)
            },
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `${baseUrl}/blog/${params.category}/${params.slug}`,
          },
        }),
      }}
    />
    </main>
  );
}
