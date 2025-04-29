import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = "https://farismujezinovic.si"; // <- zamijeni sa tvojom stvarnom domenom

  const content = `
User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`;

  return new NextResponse(content.trim(), {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
