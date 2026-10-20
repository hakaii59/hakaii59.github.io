import type socialIcons from "@assets/socialIcons";

export type Site = {
  website: string;
  author: string;
  profile: string;
  desc: string;
  title: string;
  ogImage?: string;
  lightAndDarkMode: boolean;
  postPerIndex: number;
  postPerPage: number;
  scheduledPostMargin: number;
  showArchives?: boolean;
  editPost?: {
    url?: URL["href"];
    text?: string;
    appendFilePath?: boolean;
  };
};

export type SocialObjects = {
  name: keyof typeof socialIcons;
  href: string;
  active: boolean;
  linkTitle: string;
}[];

/** The profile card shown on the home page. */
export type Profile = {
  name: string;
  handle: string;
  avatar: string;
  /** Optional wide image shown above the intro; empty string hides it. */
  banner?: string;
  role: string;
  contacts: { label: string; href: string }[];
};

/**
 * A top-level section of the blog. `key` is its URL segment (/<key>/), what
 * the `category` frontmatter field stores, and what filter pills pass around;
 * `match` lists content-directory segments so a post written without an
 * explicit `category` still lands somewhere sensible.
 */
export type Category = {
  key: string;
  /** Page heading, e.g. "HackTheBox". */
  label: string;
  /** Compact form for post rows and pills, e.g. "HTB". */
  short: string;
  blurb: string;
  match: string[];
};

export type NavLink = {
  label: string;
  href: string;
  /** Matches Header's `activeNav` prop so the current page is underlined. */
  key?: string;
};
