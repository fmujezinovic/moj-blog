// /app/api/pexels/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ photos: [] });
  }

  try {
    const res = await fetch(`https://api.pexels.com/v1/search?query=${query}&per_page=30`, {
      headers: {
        Authorization: process.env.NEXT_PUBLIC_PEXELS_API_KEY!,
      },
    });

    if (!res.ok) {
      throw new Error("Napaka pri fetchu s Pexels.");
    }

    const data = await res.json();

    return NextResponse.json({
      photos: (data.photos || []).map((item: any) => ({
        preview: item.src.medium,
        full: item.src.original,
        thumbnail: item.src.small
      })),
    });
  } catch (error) {
    console.error("Napaka pri pridobivanju Pexels slik:", error);
    return NextResponse.json({ photos: [] });
  }
}
