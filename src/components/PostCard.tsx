import { LOCALE } from "@config";
import { slugifyStr } from "@utils/slugify";
import type { CollectionEntry } from "astro:content";

export interface Props {
  href: string;
  frontmatter: CollectionEntry<"blog">["data"];
  /** Section label, e.g. "HTB". Omitted on a section page, where it is implied. */
  categoryLabel?: string;
  /** Group inside the section, e.g. "Machine" or "K17 CTF 2026". */
  subcategoryLabel?: string;
}

/**
 * One row in a post list: date, labels, title, teaser, tags. Used by the home
 * page, section pages, the post explorer, search results, tag pages and the
 * archive, so every listing on the site reads the same way.
 */
export default function PostCard({
  href,
  frontmatter,
  categoryLabel,
  subcategoryLabel,
}: Props) {
  const { title, pubDatetime, modDatetime, description, tags } = frontmatter;

  const datetime = new Date(modDatetime ?? pubDatetime);
  const date = datetime.toLocaleDateString(LOCALE.langTag, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const labels = [categoryLabel, subcategoryLabel].filter(Boolean) as string[];

  return (
    <li className="list-none py-5">
      <div className="flex flex-wrap items-center gap-x-2 font-mono text-xs text-skin-muted">
        <time dateTime={datetime.toISOString()}>{date}</time>
        {labels.map(label => (
          <span key={label} className="flex items-center gap-x-2">
            <span aria-hidden="true">&middot;</span>
            <span className="text-skin-accent-2">{label}</span>
          </span>
        ))}
      </div>

      <h3 className="mt-1 text-lg font-semibold leading-snug">
        <a
          href={href}
          style={{ viewTransitionName: slugifyStr(title) }}
          className="underline decoration-transparent underline-offset-4 transition hover:text-skin-accent hover:decoration-skin-accent"
        >
          {title}
        </a>
      </h3>

      <p className="mt-1 text-sm text-skin-muted">{description}</p>

      {tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
          {tags.map(tagName => (
            <a
              key={tagName}
              href={`/tags/${slugifyStr(tagName)}/`}
              className="tag-link"
              aria-label={`View all posts tagged ${tagName}`}
            >
              #{tagName}
            </a>
          ))}
        </div>
      )}
    </li>
  );
}
