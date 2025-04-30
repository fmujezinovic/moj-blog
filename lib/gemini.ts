"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { parseMarkdownToSections } from "@/utils/markdown";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function regenerateFullPostContent(
  title: string,
  note?: string
) {
  // zdaj let namesto const
  let prompt = `
Napiši članek na temo "${title}", pri čemer upoštevaj naslednja pravila:

1. **Naslov (H1)**: do 60 znakov, vključi glavno ključno besedo ("${title}").
2. **Prva vrstica**: kratek, jasen uvod (“featured snippet”), ki takoj pojasni glavno temo.
3. **Ključna beseda**:
   - v naslovu (H1),
   - v prvem odstavku (uvod bo generiran posebej),
   - v vsaj 1–2 H2 podnaslovih,
   - naravno, brez ponavljanja (“no keyword stuffing”).
4. **Struktura sekcij**: razdeli besedilo v **3–7 glavnih sekcij** z Markdown H2 (\`##\`):
   - **Tematska izbira**: za preproste vodnike (“3 nasveti za …”) uporabi **3 sekcije**, za poglobljene teme **5–7 sekcij**.
   - Če je tema zelo kompleksna, lahko dodaš še eno sekcijo “Dodatni nasveti” ali “Pogosta vprašanja”.
   - Vsaka H2 naj vsebuje ključno besedo.
   - Za podsekcije uporabi H3 (\`###\`).
   - Vsaka sekcija naj šteje vsaj **200 besed**.
5. **Dolžina** (samo sekcije): **800–1500 besed**.
6. **Linki**:
   - vsaj 1 notranja povezava na drug blog post,
   - vsaj 1 zunanja povezava na avtoritativen vir (npr. Wikipedia).
7. **Slike**: če rabiš, vstavi \`![alt besedilo](url)\` z opisnim alt-tekstom.
8. **Meta description**, **uvod** in **zaključek** bodo generirani posebej, zato jih tu ne vključuj.

**Format**:
- **Ne** piši ničesar pred prvim \`##\`.
- **Ne** dodajaj uvoda ali zaključka.
- Samo čisti Markdown z 3–7 H2 sekcijami (po potrebi +1 “Dodatni nasveti” ali “Pogosta vprašanja”).

**Primer izhoda** (4 sekcije):
\`\`\`md
## Sekcija 1 (vključi ključno besedo)
Besedilo prve sekcije – poglobljeno, najmanj 200 besed...

## Sekcija 2 (vključi ključno besedo)
Besedilo druge sekcije – poglobljeno, najmanj 200 besed...

## Sekcija 3 (vključi ključno besedo)
Besedilo tretje sekcije – poglobljeno, najmanj 200 besed...

## Sekcija 4 (vključi ključno besedo)
Besedilo četrte sekcije – poglobljeno, najmanj 200 besed...
\`\`\`
`.trim();

  if (note) {
    prompt += `

# DODATNA NAVODILA:
${note.trim()}
`;
  }

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
Napiši vsebino brez uvoda ali zaključka.
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
