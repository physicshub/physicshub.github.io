import {
  BlockData,
  BlogContent,
  SectionData,
} from "../components/theory/types";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
}

export function getReadingTime(text: string): number {
  const wordsPerMinute = 225;
  const noOfWords = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(noOfWords / wordsPerMinute));
}

/**
 * Flatten an article's theory document to its human prose — for reading time and
 * word count. Deliberately skips `formula` (latex) and `code`: they inflate the
 * count and nobody "reads" them at 225 wpm. Feed the result to getReadingTime
 * instead of JSON.stringify(theory), which counted braces and keys.
 */
export function getPlainText(theory?: BlogContent): string {
  if (!theory?.sections) return "";
  const out: string[] = [];

  for (const section of theory.sections) {
    if (section.title) out.push(section.title);
    for (const block of section.blocks ?? []) {
      if (block.type === "formula" || block.type === "code") continue;
      if (typeof block.text === "string") out.push(block.text);
      if (typeof block.content === "string") out.push(block.content);
      if (typeof block.caption === "string") out.push(block.caption);

      const items = block.items;
      if (Array.isArray(items)) {
        for (const it of items) {
          if (typeof it === "string") out.push(it);
          else if (it && typeof it === "object")
            out.push(`${it.q ?? ""} ${it.a ?? ""}`);
        }
      }

      if (Array.isArray(block.data)) {
        for (const row of block.data) {
          for (const cell of Object.values(row)) {
            if (typeof cell === "string") out.push(cell);
          }
        }
      }
    }
  }

  return out.join(" ").replace(/\s+/g, " ").trim();
}

/** Word count of the article prose (same source as reading time). */
export function getWordCount(theory?: BlogContent): number {
  const text = getPlainText(theory);
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

export function getTitles(blog: { theory?: BlogContent }) {
  return (
    blog.theory?.sections?.flatMap((section: SectionData) => {
      const titles: { title: string; id: string; isSubSection: boolean }[] = [];

      if (section.title) {
        titles.push({
          title: section.title,
          id: slugify(section.title),
          isSubSection: false,
        });
      }

      // Assuming BlockData has a 'type' and 'text' property when type is 'sectionTitle'
      const blockTitles =
        section.blocks
          ?.filter((block: BlockData) => block.type === "sectionTitle")
          .map((block: BlockData) => ({
            title: block.text || "",
            id: slugify(block.text || ""),
            isSubSection: section.title ? true : false,
          })) || [];

      return [...titles, ...blockTitles];
    }) || []
  );
}
