import { slugifyStr } from "./slugify";
import type { CollectionEntry } from "astro:content";
import postFilter from "./postFilter";

export interface TagWithCount {
  tag: string;
  tagName: string;
  count: number;
}

const getTagsWithCount = (
  posts: CollectionEntry<"blog">[]
): TagWithCount[] => {
  const counts = new Map<string, TagWithCount>();

  posts
    .filter(postFilter)
    .flatMap(post => post.data.tags)
    .forEach(tagName => {
      const tag = slugifyStr(tagName);
      const existing = counts.get(tag);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(tag, { tag, tagName, count: 1 });
      }
    });

  return [...counts.values()].sort(
    (a, b) => b.count - a.count || a.tagName.localeCompare(b.tagName)
  );
};

export default getTagsWithCount;
