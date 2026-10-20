import getCategory, { getSubcategory } from "./getCategory";
import { slugifyAll } from "./slugify";
import type { ExplorerPost } from "@components/PostExplorer";
import type { CollectionEntry } from "astro:content";

/**
 * Flatten posts into the plain, serialisable shape the client-side post
 * explorer needs. Anything not listed here never reaches the browser.
 */
const getExplorerPosts = (posts: CollectionEntry<"blog">[]): ExplorerPost[] =>
  posts.map(post => {
    const category = getCategory(post);
    return {
      slug: post.slug,
      title: post.data.title,
      description: post.data.description,
      tagSlugs: slugifyAll(post.data.tags),
      categoryKey: category.key,
      categoryLabel: category.short,
      subcategory: getSubcategory(post),
      timestamp: new Date(post.data.pubDatetime).getTime(),
      data: post.data,
    };
  });

export default getExplorerPosts;
