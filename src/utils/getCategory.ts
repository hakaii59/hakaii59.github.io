import { CATEGORIES, UNCATEGORIZED } from "@config";
import type { Category } from "../types";
import type { CollectionEntry } from "astro:content";

/**
 * The content-layer glob loader keeps the file's path on the entry, but it is
 * not part of the generated `CollectionEntry` type — read it defensively.
 */
const entryPath = (post: CollectionEntry<"blog">): string =>
  ((post as { filePath?: string }).filePath ?? post.id ?? "").toLowerCase();

/**
 * Resolve a post's section: an explicit `category` in frontmatter wins,
 * otherwise the post's folder inside src/content/blog decides.
 */
export const getCategory = (post: CollectionEntry<"blog">): Category => {
  const declared = post.data.category?.toLowerCase();
  if (declared) {
    const byKey = CATEGORIES.find(c => c.key === declared);
    if (byKey) return byKey;
  }

  const path = entryPath(post);
  const byPath = CATEGORIES.find(c =>
    c.match.some(segment => path.includes(segment.toLowerCase()))
  );

  return byPath ?? UNCATEGORIZED;
};

/** The post's grouping inside its section, e.g. "Machine" or "K17 CTF 2026". */
export const getSubcategory = (
  post: CollectionEntry<"blog">
): string | undefined => post.data.subcategory?.trim() || undefined;

export type CategoryWithCount = Category & { count: number };

/**
 * Every section that actually has posts, in the order declared in config,
 * with its post count.
 */
export const getCategoriesWithCount = (
  posts: CollectionEntry<"blog">[]
): CategoryWithCount[] => {
  const counts = new Map<string, number>();
  for (const post of posts) {
    const key = getCategory(post).key;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...CATEGORIES, UNCATEGORIZED]
    .filter(category => counts.has(category.key))
    .map(category => ({
      ...category,
      count: counts.get(category.key) as number,
    }));
};

export type SubcategoryWithCount = { name: string; count: number };

/**
 * Subcategories present in the given posts, biggest group first. Used for the
 * filter pills on a section page, so pass posts already scoped to it.
 */
export const getSubcategoriesWithCount = (
  posts: CollectionEntry<"blog">[]
): SubcategoryWithCount[] => {
  const counts = new Map<string, number>();
  for (const post of posts) {
    const name = getSubcategory(post);
    if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
};

/** Posts belonging to one section. */
export const getPostsByCategory = (
  posts: CollectionEntry<"blog">[],
  key: string
) => posts.filter(post => getCategory(post).key === key);

export default getCategory;
