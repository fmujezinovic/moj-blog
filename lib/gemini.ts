"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function regenerateSectionContent(sectionTitle: string, note: string) {
  const prompt = `
Piši sadržaj za sekciju sa naslovom "${sectionTitle}".
${note ? `Dodatna uputstva: ${note}` : ""}
Napiši sadržaj kao kratak ali kvalitetan paragraf, kao za blog.
Bez uvoda ili dodatnih opisa.
`;

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  return text.trim();
}
 