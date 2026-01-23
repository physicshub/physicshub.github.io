import { BlockData } from "../components/theory";

export function slugify(text: string): string {
  console.log(text);
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

export function getTitles(blog: any) {
  return (
    blog.theory?.sections?.flatMap((section: any) => {
      const titles: any[] = [];

      if (section.title) {
        titles.push({
          title: section.title,
          id: slugify(section.title),
          isSubSection: false,
        });
      }

      const blockTitles =
        section.blocks
          ?.filter((block: BlockData) => block.type === "sectionTitle")
          .map((block: any) => ({
            title: block.text,
            id: slugify(block.text),
            isSubSection: section.title ? true : false,
          })) || [];

      return [...titles, ...blockTitles];
    }) || []
  );
}
