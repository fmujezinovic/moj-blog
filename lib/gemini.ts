"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { parseMarkdownToSections } from "@/utils/markdown";


const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function regenerateFullPostContent(title: string) {
  const prompt = `
Napiši članek na temo "${title}".
Članek mora biti razdeljen natanko na 3 sekcije.
Vsaka sekcija mora imeti naslov (## Naslov sekcije) in pod njim vsaj en paragraf kvalitetnega besedila.
Ne piši uvoda, zaključka ali karkoli zunaj sekcij.
Formatiraj članek v čisti Markdown obliki.

Primer:
## Naslov sekcije 1
Besedilo prve sekcije...

## Naslov sekcije 2
Besedilo druge sekcije...

## Naslov sekcije 3
Besedilo tretje sekcije...
`;

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  return parseMarkdownToSections(text.trim()); // že razbije na sekcije
}


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
 
export async function generateMetaDescription(
  title: string,
  allSectionsMarkdown: string
) {
  const prompt = `
Na osnovi naslednjega članka napiši meta opis (SEO description) do 160 znakov:
Naslov: "${title}"

Članek v Markdown obliki:
${allSectionsMarkdown}

– Naj bo jedrnat, privlačen, v slovenščini.
  `.trim();

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = await response.text();

  // skrajšaj na prvo vrstico in do 160 znakov
  const desc = text.split("\n")[0].trim().slice(0, 160);
  return desc;
}