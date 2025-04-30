"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { parseMarkdownToSections } from "@/utils/markdown";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function regenerateFullPostContent(title: string) {
 const prompt = `
Napiši članek na temo "${title}", pri čemer upoštevaj naslednja pravila:

1. **Naslov (H1)**: do 60 znakov, naj vsebuje glavno ključno besedo ("${title}").
2. **Ključna beseda**:
   - v prvem odstavku (uvod bo generiran posebej),
   - v vsaj 1–2 H2 podnaslovih,
   - naravno, brez pretiranega ponavljanja.
3. Razdeli besedilo **izključno** v **3–7 glavnih sekcij** z Markdown H2 (\`##\`):
   - **Tematska izbira**:  
     • Če je tema preprosta (npr. “3 nasveti za …”), uporabi **3 sekcije**.  
     • Za bolj poglobljene teme raje uporabi **5–7 sekcij**.  
   - Če zaznaš, da bralci potrebujejo še dodatno pojasnilo, lahko dodaš še eno sekcijo “Dodatni nasveti” ali “Pogosta vprašanja”.
   - Vsaka H2 naj vsebuje ključno besedo.
   - Za notranje podsekcije po potrebi uporabi H3 (\`###\`).
4. Dolžina članka (samo sekcije): **800–1500 besed**.
5. Vključi vsaj 1 **notranjo povezavo** in 1 **zunanja povezava** na avtoritativen vir.
6. Če rabiš slike, vstavi \`![alt besedilo](url)\` z opisnim alt-tekstom.
7. **Meta description**, **uvod** in **zaključek** bodo generirani posebej, zato jih tu ne vključuj.

**Format**:
- **Ne** piši ničesar pred prvim \`##\`.
- **Ne** dodajaj uvoda ali zaključka.
- Samo čisti Markdown z 3–7 H2 sekcijami (po potrebi +1 “Dodatni nasveti” ali “Pogosta vprašanja”).

Primer izhoda s 5 sekcijami:
\`\`\`md
## Sekcija 1 (vključi ključno besedo)
…

## Sekcija 2 (vključi ključno besedo)
…

## Sekcija 3 (vključi ključno besedo)
…

## Sekcija 4 (vključi ključno besedo)
…

## Sekcija 5 (vključi ključno besedo)
…
\`\`\`
`.trim();


  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = await response.text();

  return parseMarkdownToSections(text.trim());
}

export async function regenerateSectionContent(sectionTitle: string, note: string) {
  const prompt = `
Piši sadržaj za sekcijo sa naslovom "${sectionTitle}".
${note ? `Dodatna uputstva: ${note}` : ""}
Napiši sadržaj kot kratek, a kakovosten paragraf, brez uvoda ali zaključka.
`.trim();

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = await response.text();

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

  return text.split("\n")[0].trim().slice(0, 160);
}
