import fs from "fs";
import matter from "gray-matter";
import { markdownToTxt } from "markdown-to-txt";

export const genDescription = (filepath: string): string | undefined => {
  if (fs.existsSync(filepath)) {
    const content = fs.readFileSync(filepath, "utf-8");
    const data = matter(content);
    const result = markdownToTxt(data.content.replace(/<[^>]+>/g, "")).replace(
      /\s+/g,
      " "
    );
    return result.length > 200 ? result.slice(0, 197) + "..." : result;
  }
};
