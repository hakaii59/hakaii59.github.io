import type {
  Category,
  NavLink,
  Profile,
  Site,
  SocialObjects,
} from "./types";

export const SITE: Site = {
  website: "https://hakaii59.github.io/", // replace this with your deployed domain
  author: "hakai",
  profile: "https://hakaii59.github.io/",
  desc: "Binary exploitation, CTF writeups and HackTheBox walkthroughs — notes from the lab.",
  title: "hakai's blog",
  ogImage: "hakai.jpg",
  lightAndDarkMode: true,
  postPerIndex: 6,
  postPerPage: 5,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  editPost: {
    url: "https://github.com/hakaii59/hakaii59.github.io/edit/main/src/content/blog",
    text: "Suggest Changes",
    appendFilePath: true,
  },
};

export const LOCALE = {
  lang: "en", // html lang code. Set this empty and default will be "en"
  langTag: ["en-EN"], // BCP 47 Language Tags. Set this empty [] to use the environment default
} as const;

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

/** The intro at the top of the home page. */
export const HOME = {
  /** Shown as "$ whoami". */
  heading: "whoami",
  /** Each string is its own paragraph. */
  intro: [
    "Mình là **hakai**, một người chơi CTF ở mảng pwnable và đang học pentest qua các machine trên HackTheBox.",
    "Blog này là chỗ mình ghi lại writeup và những thứ học được dọc đường — heap, stack, blind pwn, một chút AI security, và bất cứ thứ gì mình vừa phá được.",
  ],
  recentHeading: "ls recent/",
  sectionsHeading: "ls sections/",
  tagsHeading: "ls tags/",
};

/** Identity shown in the header, the home intro and the OG metadata. */
export const PROFILE: Profile = {
  name: "Giáp Thanh Hữu",
  handle: "hakai",
  avatar: "/hakai.jpg",
  // Optional wide image above the intro. Drop a file in public/ and point here.
  banner: "",
  role: "CTF player · Binary exploitation",
  /** Shown as a one-line contact row under the intro. */
  contacts: [
    { label: "GitHub", href: "https://github.com/hakaii59" },
    { label: "Email", href: "mailto:huugiapthanh@gmail.com" },
  ],
};

/**
 * The blog's sections. Each one becomes a nav item and a page at /<key>/.
 * `match` entries are matched against the post's path inside
 * src/content/blog, so a new post dropped into an existing folder is
 * categorised without touching its frontmatter.
 */
export const CATEGORIES: Category[] = [
  {
    key: "hackthebox",
    label: "HackTheBox",
    short: "HTB",
    blurb: "Machine walkthroughs and standalone lab challenges.",
    match: ["hackthebox_machine", "hackthebox_challenge", "hackthebox"],
  },
  {
    key: "ctf",
    label: "CTF",
    short: "CTF",
    blurb: "Writeups from competitions, mostly pwnable.",
    match: ["ddcctf", "k17ctf", "vcs", "words_from_the_past", "ctf"],
  },
  {
    key: "research",
    label: "Research",
    short: "Research",
    blurb: "Deeper dives that are not tied to a single challenge.",
    match: ["aisecurity", "research"],
  },
];

/** Fallback category for posts that match nothing above. */
export const UNCATEGORIZED: Category = {
  key: "others",
  label: "Others",
  short: "Others",
  blurb: "Everything that does not fit a box yet.",
  match: [],
};

/**
 * Header navigation: Home, then one item per section, then About.
 * Search lives beside them and is added by the header itself.
 */
export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/", key: "home" },
  ...CATEGORIES.map(({ key, label }) => ({
    label,
    href: `/${key}/`,
    key,
  })),
  { label: "About", href: "/about/", key: "about" },
];

/** Secondary links, shown only in the footer. */
export const FOOTER_LINKS: NavLink[] = [
  { label: "All posts", href: "/posts/", key: "posts" },
  { label: "Tags", href: "/tags/", key: "tags" },
  { label: "Archives", href: "/archives/", key: "archives" },
  { label: "RSS", href: "/rss.xml" },
];

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/hakaii59",
    linkTitle: `hakaii59 (Giáp Thanh Hữu)`,
    active: true,
  },
  {
    name: "Mail",
    href: "mailto:huugiapthanh@gmail.com",
    linkTitle: `Send an email to ${SITE.title}`,
    active: true,
  },
];
