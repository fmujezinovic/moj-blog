/* ------------------------- MARKDOWN ↔︎ SECTION -------------------------- */
export interface RawSection {
  heading: string;
  content: string;
}

export interface UiSection extends RawSection {
  imageUrl: string;
  uploadedImagePath: string | null;
}

/** “## Naslov …” → [{ heading, content }] */
export const parseMarkdownToSections = (md: string): RawSection[] => {
  if (!md?.trim()) return [];
  const rx = /^##\s+(.*?)[\r\n]+([\s\S]*?)(?=^##\s+|$)/gm;
  const out: RawSection[] = [];
  let m: RegExpExecArray | null;
  while ((m = rx.exec(md))) {
    out.push({ heading: m[1].trim(), content: m[2].trim() });
  }
  return out;
};

/** [{ heading, content }] → “## Naslov …” (za DB) */
export const stringifySectionsToMarkdown = (ss: RawSection[]) =>
  ss
    .filter(s => s.heading.trim() && s.content.trim())
    .map(s => `## ${s.heading}\n\n${s.content.trim()}`)
    .join("\n\n");

/** Dodaj slike: indeks 0 = cover, ostale redom po sekcijama */
export const attachSectionImages = (ss: RawSection[], imgs: string[]): UiSection[] =>
  ss.map((s, i) => ({
    ...s,
    imageUrl: imgs[i + 1] || "",
    uploadedImagePath: null,
  }));
