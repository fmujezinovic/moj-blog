import { NextRequest, NextResponse } from "next/server";

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY!;
const PEXELS_API_KEY = process.env.PEXELS_API_KEY!;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    // UNSPLASH ISKANJE
    const unsplashRes = await fetch(
      `https://api.unsplash.com/search/photos?query=${query}&per_page=10&client_id=${UNSPLASH_ACCESS_KEY}`
    );
    const unsplashData = await unsplashRes.json();
    const unsplashImages = unsplashData.results?.map((img: any) => img.urls.small) || [];

    // PEXELS ISKANJE
    const pexelsRes = await fetch(`https://api.pexels.com/v1/search?query=${query}&per_page=10`, {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    });
    const pexelsData = await pexelsRes.json();
    const pexelsImages = pexelsData.photos?.map((img: any) => img.src.medium) || [];

    const allImages = [...unsplashImages, ...pexelsImages];

    return NextResponse.json({ results: allImages });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
