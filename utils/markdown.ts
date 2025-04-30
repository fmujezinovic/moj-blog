// utils/markdown.ts

/* ------------------------- MARKDOWN ↔︎ SECTION -------------------------- */
export interface RawSection {
  heading: string;
  content: string;
}

export interface UiSection extends RawSection {
  imageUrl: string;
  uploadedImagePath: string | null;
}

/** 
 * “## Naslov …” → [{ heading, content }]
 * Robust parser that correctly captures even the first section.
 */
export const parseMarkdownToSections = (md: string): RawSection[] => {
  const text = md.trim();
  if (!text) return [];

  const lines = text.split(/\r?\n/);
  const sections: RawSection[] = [];
  let currentHeading: string | null = null;
  let currentContent: string[] = [];

  for (const line of lines) {
    if (line.startsWith("## ")) {
      // if we're already collecting a section, push it
      if (currentHeading !== null) {
        sections.push({
          heading: currentHeading,
          content: currentContent.join("\n").trim(),
        });
      }
      // start a new section
      currentHeading = line.slice(3).trim();
      currentContent = [];
    } else if (currentHeading !== null) {
      // collect lines for the current section
      currentContent.push(line);
    }
  }

  // push the final section
  if (currentHeading !== null) {
    sections.push({
      heading: currentHeading,
      content: currentContent.join("\n").trim(),
    });
  }

  return sections;
};

/** 
 * [{ heading, content }] → “## Naslov …” (za DB) 
 */
export const stringifySectionsToMarkdown = (ss: RawSection[]) =>
  ss
    .filter((s) => s.heading.trim() && s.content.trim())
    .map((s) => `## ${s.heading}\n\n${s.content.trim()}`)
    .join("\n\n");

/** 
 * Dodaj slike: indeks 0 = cover, ostale redom po sekcijah 
 */
export const attachSectionImages = (
  ss: RawSection[],
  imgs: string[]
): UiSection[] =>
  ss.map((s, i) => ({
    ...s,
    imageUrl: imgs[i + 1] || "",
    uploadedImagePath: null,
  }));
