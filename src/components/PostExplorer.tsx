import Fuse from "fuse.js";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import PostCard from "@components/PostCard";
import type { CollectionEntry } from "astro:content";

export type ExplorerPost = {
  slug: string;
  title: string;
  description: string;
  /** Slugified tags, used by the tag filter. */
  tagSlugs: string[];
  categoryKey: string;
  categoryLabel: string;
  subcategory?: string;
  /** Epoch ms of pubDatetime, for sorting. */
  timestamp: number;
  data: CollectionEntry<"blog">["data"];
};

export type ExplorerCategory = {
  key: string;
  short: string;
  count: number;
};

export type ExplorerSubcategory = {
  name: string;
  count: number;
};

export type ExplorerTag = {
  tag: string;
  tagName: string;
  count: number;
};

interface Props {
  posts: ExplorerPost[];
  tags: ExplorerTag[];
  /** Section pills, for the all-posts page. */
  categories?: ExplorerCategory[];
  /** Group pills, for a section page where the section is already implied. */
  subcategories?: ExplorerSubcategory[];
  /** Tags beyond this many hide behind a "show all" toggle. */
  tagLimit?: number;
}

type SortOrder = "newest" | "oldest";

const ALL = "all";

/**
 * The post browser used by /posts and by every section page: free-text search
 * plus section-or-group and tag filters, all client-side over the post list it
 * is handed. Filter state is mirrored into the URL so a view can be linked.
 */
export default function PostExplorer({
  posts,
  tags,
  categories = [],
  subcategories = [],
  tagLimit = 16,
}: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(ALL);
  const [group, setGroup] = useState<string>(ALL);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOrder>("newest");
  const [showAllTags, setShowAllTags] = useState(false);

  // Hydrate filters from the URL on first paint.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    const cat = params.get("cat");
    const grp = params.get("group");
    const tag = params.getAll("tag").flatMap(value => value.split(","));

    if (q) setQuery(q);
    if (cat && categories.some(c => c.key === cat)) setCategory(cat);
    if (grp && subcategories.some(s => s.name === grp)) setGroup(grp);

    const known = tag.filter(t => tags.some(candidate => candidate.tag === t));
    if (known.length) setActiveTags(known);
  }, []);

  // Keep the URL in step with the filters, without adding history entries.
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category !== ALL) params.set("cat", category);
    if (group !== ALL) params.set("group", group);
    if (activeTags.length) params.set("tag", activeTags.join(","));

    const search = params.toString();
    history.replaceState(
      history.state,
      "",
      search
        ? `${window.location.pathname}?${search}`
        : window.location.pathname
    );
  }, [query, category, group, activeTags]);

  const fuse = useMemo(
    () =>
      new Fuse(posts, {
        keys: [
          { name: "title", weight: 2 },
          { name: "description", weight: 1 },
          { name: "subcategory", weight: 1 },
          { name: "tagSlugs", weight: 1 },
        ],
        minMatchCharLength: 2,
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [posts]
  );

  const results = useMemo(() => {
    const searching = query.trim().length > 1;
    const searched = searching
      ? fuse.search(query.trim()).map(result => result.item)
      : posts;

    const filtered = searched.filter(post => {
      if (category !== ALL && post.categoryKey !== category) return false;
      if (group !== ALL && post.subcategory !== group) return false;
      // Several tags narrow the list: a post must carry all of them.
      return activeTags.every(tag => post.tagSlugs.includes(tag));
    });

    // Fuse already orders by relevance; only re-sort when not searching.
    if (searching) return filtered;

    return [...filtered].sort((a, b) =>
      sort === "newest" ? b.timestamp - a.timestamp : a.timestamp - b.timestamp
    );
  }, [query, category, group, activeTags, sort, fuse, posts]);

  const toggleTag = (tag: string) =>
    setActiveTags(current =>
      current.includes(tag)
        ? current.filter(value => value !== tag)
        : [...current, tag]
    );

  const isFiltered =
    query.length > 0 ||
    category !== ALL ||
    group !== ALL ||
    activeTags.length > 0;

  const reset = () => {
    setQuery("");
    setCategory(ALL);
    setGroup(ALL);
    setActiveTags([]);
  };

  const visibleTags = showAllTags ? tags : tags.slice(0, tagLimit);
  const totalPosts = posts.length;

  // Only one pill row is ever shown: sections on /posts, groups in a section.
  const pills: { id: string; label: string; count: number }[] =
    categories.length > 1
      ? categories.map(({ key, short, count }) => ({
          id: key,
          label: short,
          count,
        }))
      : subcategories.length > 1
        ? subcategories.map(({ name, count }) => ({
            id: name,
            label: name,
            count,
          }))
        : [];
  const pillsAreSections = categories.length > 1;
  const activePill = pillsAreSections ? category : group;
  const setActivePill = (id: string) =>
    pillsAreSections
      ? setCategory(id === category ? ALL : id)
      : setGroup(id === group ? ALL : id);

  return (
    <div>
      {/* ===== Search ===== */}
      <label className="relative block">
        <span className="absolute inset-y-0 left-0 flex items-center">
          <span className="font-mono text-sm text-skin-accent">/</span>
        </span>
        <input
          className="block w-full border-0 border-b border-skin-line bg-transparent py-2 pl-5 pr-3 font-mono text-sm text-skin-base placeholder:text-skin-muted focus:border-skin-accent focus:outline-none"
          placeholder="search posts..."
          type="search"
          name="search"
          value={query}
          onChange={(e: FormEvent<HTMLInputElement>) =>
            setQuery(e.currentTarget.value)
          }
          autoComplete="off"
        />
      </label>

      {/* ===== Section / group pills ===== */}
      {pills.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => (pillsAreSections ? setCategory(ALL) : setGroup(ALL))}
            className={`pill ${activePill === ALL ? "pill-active" : ""}`}
            aria-pressed={activePill === ALL}
          >
            all <span className="pill-count">{totalPosts}</span>
          </button>
          {pills.map(({ id, label, count }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActivePill(id)}
              className={`pill ${activePill === id ? "pill-active" : ""}`}
              aria-pressed={activePill === id}
            >
              {label} <span className="pill-count">{count}</span>
            </button>
          ))}
        </div>
      )}

      {/* ===== Tag filter ===== */}
      <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
        <span className="font-mono text-xs uppercase tracking-widest text-skin-muted">
          tags
        </span>
        {visibleTags.map(({ tag, tagName, count }) => {
          const active = activeTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              aria-pressed={active}
              className={`font-mono text-xs underline-offset-2 ${
                active
                  ? "font-semibold text-skin-accent underline decoration-skin-accent"
                  : "text-skin-muted decoration-skin-line hover:text-skin-accent hover:underline"
              }`}
            >
              #{tagName}
              <span className="opacity-60"> {count}</span>
            </button>
          );
        })}
        {tags.length > tagLimit && (
          <button
            type="button"
            onClick={() => setShowAllTags(value => !value)}
            className="more-link !text-xs"
          >
            {showAllTags ? "show less" : `+${tags.length - tagLimit} more`}
          </button>
        )}
      </div>

      {/* ===== Result bar ===== */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-skin-line pb-2 font-mono text-xs text-skin-muted">
        <p>
          {results.length} of {totalPosts} post{totalPosts === 1 ? "" : "s"}
          {isFiltered && (
            <button
              type="button"
              onClick={reset}
              className="ml-3 text-skin-accent hover:underline"
            >
              reset
            </button>
          )}
        </p>
        <button
          type="button"
          onClick={() =>
            setSort(value => (value === "newest" ? "oldest" : "newest"))
          }
          className="text-skin-accent hover:underline"
          title="Toggle sort order"
        >
          {sort === "newest" ? "newest first" : "oldest first"}
        </button>
      </div>

      {/* ===== Results ===== */}
      {results.length === 0 ? (
        <p className="py-10 text-center font-mono text-sm text-skin-muted">
          Nothing matched those filters.{" "}
          <button
            type="button"
            onClick={reset}
            className="text-skin-accent hover:underline"
          >
            reset
          </button>
        </p>
      ) : (
        <ul className="divide-y divide-skin-line p-0">
          {results.map(post => (
            <PostCard
              key={post.slug}
              href={`/posts/${post.slug}/`}
              frontmatter={post.data}
              categoryLabel={pillsAreSections ? post.categoryLabel : undefined}
              subcategoryLabel={post.subcategory}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
