// /app/api/unsplash/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const res = await fetch(`https://api.unsplash.com/search/photos?query=${query}&per_page=30&client_id=${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`);
  const data = await res.json();

  const images = (data.results || []).map((item: any) => ({
    small: item.urls.small, // preview thumbnail
    regular: item.urls.regular, // good for web (1080px wide)
    full: item.urls.full, // original size, high quality
    alt: item.alt_description || item.description || query,
  }));

  return NextResponse.json({ results: images });
}
