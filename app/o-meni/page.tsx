
import FancyPageLayout from "@/components/FancyPageLayout";
import { Suspense } from "react";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await loadContent({ table: "pages", slug: "o-meni" });
  
  return {
    title: data.title || "O meni",
    description: data.description || "Več o meni.",
  };
}

async function LoadContent() {
  const { loadContentList } = await import("@/lib/loadContent.server");
  const { MDXContent } = await loadContent({ table: "pages", slug: "o-meni" });

  return (
    <section className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fadeIn">
      <FancyPageLayout
        content={<MDXContent />}
        images={[
          "/images/perinatologija.jpg",
          "/images/porodnistvo.jpg",
          "/images/predavanja.jpg",
          "/images/ultrazvok.jpg",
        ]}
        heroImage="/faris.jpg"
      />
    </section>
  );
}

export default function AboutPage() {
  return (
    <main className="flex flex-col min-h-screen bg-background text-foreground">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center py-32">
          <div className="font-subheading text-lg text-muted">Nalagam...</div>
        </div>
      }>
        <LoadContent />
      </Suspense>
    </main>
  );
}
