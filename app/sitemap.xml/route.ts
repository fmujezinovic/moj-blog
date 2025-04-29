import { createClient } from "@/utils/supabase/server"; // prilagodi ako je tvoj path drugačiji
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient();

  const { data: posts } = await supabase
    .from("posts")
    .select("slug, category_id, published_at")
    .eq("is_draft", false); // ili .not("published_at", "is", null) ako koristiš taj flag

  const baseUrl = "https://farismujezinovic.si"; // 🚨 ZAMIJENI svojom pravom domenom

  const routes = posts?.map((post) => {
    const slug = post.slug;
    const category = post.category_id || "uncategorized"; // ili zamijeni sa slug ako koristiš relaciju
    const lastmod = post.published_at || new Date().toISOString();

    return `
      <url>
        <loc>${baseUrl}/blog/${category}/${slug}</loc>
        <lastmod>${new Date(lastmod).toISOString()}</lastmod>
      </url>
    `;
  }).join("");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${routes}
  </urlset>`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}

