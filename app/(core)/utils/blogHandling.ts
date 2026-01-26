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
  const noOfWords = text.split(/\s+/).length;
  return Math.ceil(noOfWords / wordsPerMinute);
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
