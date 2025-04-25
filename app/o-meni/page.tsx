import { loadContent } from "@/lib/loadContent";
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
  const { MDXContent } = await loadContent({ table: "pages", slug: "o-meni" });

  return (
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
  );
}

export default function AboutPage() {
  return (
    <main className="flex flex-col bg-background text-foreground">
      <Suspense fallback={<div className="text-center py-20 font-subheading text-base">Nalagam...</div>}>
        <LoadContent />
      </Suspense>
    </main>
  );
}
