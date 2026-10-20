import { LOCALE, SITE } from "@config";
import type { CollectionEntry } from "astro:content";

interface DatetimesProps {
  pubDatetime: string | Date;
  modDatetime: string | Date | undefined | null;
}

interface EditPostProps {
  editPost?: CollectionEntry<"blog">["data"]["editPost"];
  postId?: CollectionEntry<"blog">["id"];
}

interface Props extends DatetimesProps, EditPostProps {
  size?: "sm" | "lg";
  className?: string;
}

/**
 * The byline under a post title: published (or updated) date, and on post
 * pages the "suggest changes" link.
 */
export default function Datetime({
  pubDatetime,
  modDatetime,
  size = "sm",
  className = "",
  editPost,
  postId,
}: Props) {
  const updated = Boolean(modDatetime && modDatetime > pubDatetime);

  return (
    <div
      className={`flex flex-wrap items-center gap-x-2 font-mono text-xs text-skin-muted ${className}`.trim()}
    >
      <span>{updated ? "Updated" : "Published"}</span>
      <FormattedDatetime pubDatetime={pubDatetime} modDatetime={modDatetime} />
      {size === "lg" && <EditPost editPost={editPost} postId={postId} />}
    </div>
  );
}

const FormattedDatetime = ({ pubDatetime, modDatetime }: DatetimesProps) => {
  const myDatetime = new Date(
    modDatetime && modDatetime > pubDatetime ? modDatetime : pubDatetime
  );

  const date = myDatetime.toLocaleDateString(LOCALE.langTag, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return <time dateTime={myDatetime.toISOString()}>{date}</time>;
};

const EditPost = ({ editPost, postId }: EditPostProps) => {
  let editPostUrl = editPost?.url ?? SITE?.editPost?.url ?? "";
  const showEditPost = !editPost?.disabled && editPostUrl.length > 0;
  const appendFilePath =
    editPost?.appendFilePath ?? SITE?.editPost?.appendFilePath ?? false;
  if (appendFilePath && postId) {
    editPostUrl += `/${postId}`;
  }
  const editPostText = editPost?.text ?? SITE?.editPost?.text ?? "Edit";

  return (
    showEditPost && (
      <>
        <span aria-hidden="true">&middot;</span>
        <a
          className="text-skin-accent hover:underline"
          href={editPostUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          {editPostText}
        </a>
      </>
    )
  );
};
