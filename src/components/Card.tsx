import { LOCALE } from "@config";
import { slugifyStr } from "@utils/slugify";
import getTagColor from "@utils/getTagColor";
import type { CollectionEntry } from "astro:content";

export interface Props {
  href?: string;
  frontmatter: CollectionEntry<"blog">["data"];
}

export default function Card({ href, frontmatter }: Props) {
  const { title, pubDatetime, description, tags } = frontmatter;

  const date = new Date(pubDatetime).toLocaleDateString(LOCALE.langTag, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <li className="m-0 flex max-w-full list-none flex-col gap-1.5">
      <time
        dateTime={new Date(pubDatetime).toISOString()}
        className="block min-w-[120px] text-xs text-skin-accent/90"
      >
        {date}
      </time>
      <h2>
        <a
          href={href}
          style={{ viewTransitionName: slugifyStr(title) }}
          className="inline-block text-xl font-semibold decoration-dashed underline-offset-4 hover:underline"
        >
          {title}
        </a>
      </h2>
      <p className="line-clamp-3 block text-skin-base opacity-70">
        {description}
      </p>
      {tags.length > 0 && (
        <div className="mb-4 mt-1 flex flex-wrap items-center gap-1.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mr-1 inline-block h-4 w-4 fill-skin-base opacity-70"
            viewBox="0 0 24 24"
          >
            <path d="m21.41 11.58-9-9A2 2 0 0 0 11 2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 .59 1.42l9 9A2 2 0 0 0 13 22a2 2 0 0 0 1.41-.59l7-7A2 2 0 0 0 22 13a2 2 0 0 0-.59-1.42M13 20l-9-9V4h7l9 9M6.5 5A1.5 1.5 0 1 1 5 6.5A1.5 1.5 0 0 1 6.5 5" />
          </svg>
          {tags.map(tagName => {
            const tag = slugifyStr(tagName);
            const color = getTagColor(tag);
            return (
              <a
                key={tag}
                href={`/tags/${tag}/`}
                className={`inline-block rounded-md px-1 text-sm text-neutral-800 dark:text-neutral-100 ${color.light} ${color.dark}`}
              >
                {tagName}
              </a>
            );
          })}
        </div>
      )}
    </li>
  );
}
