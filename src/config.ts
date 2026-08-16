import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://hakaii59.github.io/", // replace this with your deployed domain
  author: "hakai's blog",
  profile: "https://hakaii59.github.io/",
  desc: "Personal blog documenting CTF writeups, HackTheBox machines, and cyber security explorations.",
  title: "hakai's blog",
  ogImage: "hakai.jpg",
  lightAndDarkMode: false,
  postPerIndex: 4,
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

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/hakaii59",
    linkTitle: `hakaii59 (Giáp Thanh Hữu)`,
    active: true,
  },
  // {
  //   name: "Discord",
  //   href: "https://discord.gg/hYthhnGVdN",
  //   linkTitle: `${SITE.title} on Discord`,
  //   active: true,
  // },
  // {
  //   name: "Instagram",
  //   href: "https://instagram.com/csec.iitb",
  //   linkTitle: `${SITE.title} on Instagram`,
  //   active: true,
  // },
  {
    name: "Mail",
    href: "mailto:huugiapthanh@gmail.com",
    linkTitle: `Send an email to ${SITE.title}`,
    active: false,
  },
  //{
  //  name: "X",
  //  href: "https://github.com/satnaing/astro-paper",
  //  linkTitle: `${SITE.title} on X`,
  //  active: false,
  //},
  //{
  //  name: "Twitch",
  //  href: "https://github.com/satnaing/astro-paper",
  //  linkTitle: `${SITE.title} on Twitch`,
  //  active: false,
  //},
  //{
  //  name: "YouTube",
  //  href: "https://github.com/satnaing/astro-paper",
  //  linkTitle: `${SITE.title} on YouTube`,
  //  active: false,
  //},
  //{
  //  name: "WhatsApp",
  //  href: "https://github.com/satnaing/astro-paper",
  //  linkTitle: `${SITE.title} on WhatsApp`,
  //  active: false,
  //},
  //{
  //  name: "Snapchat",
  //  href: "https://github.com/satnaing/astro-paper",
  //  linkTitle: `${SITE.title} on Snapchat`,
  //  active: false,
  //},
  //{
  //  name: "Pinterest",
  //  href: "https://github.com/satnaing/astro-paper",
  //  linkTitle: `${SITE.title} on Pinterest`,
  //  active: false,
  //},
  //{
  //  name: "TikTok",
  //  href: "https://github.com/satnaing/astro-paper",
  //  linkTitle: `${SITE.title} on TikTok`,
  //  active: false,
  //},
  //{
  //  name: "CodePen",
  //  href: "https://github.com/satnaing/astro-paper",
  //  linkTitle: `${SITE.title} on CodePen`,
  //  active: false,
  //},
  //{
  //  name: "Discord",
  //  href: "https://github.com/satnaing/astro-paper",
  //  linkTitle: `${SITE.title} on Discord`,
  //  active: false,
  //},
  //{
  //  name: "GitLab",
  //  href: "https://github.com/satnaing/astro-paper",
  //  linkTitle: `${SITE.title} on GitLab`,
  //  active: false,
  //},
  //{
  //  name: "Reddit",
  //  href: "https://github.com/satnaing/astro-paper",
  //  linkTitle: `${SITE.title} on Reddit`,
  //  active: false,
  //},
  //{
  //  name: "Skype",
  //  href: "https://github.com/satnaing/astro-paper",
  //  linkTitle: `${SITE.title} on Skype`,
  //  active: false,
  //},
  //{
  //  name: "Steam",
  //  href: "https://github.com/satnaing/astro-paper",
  //  linkTitle: `${SITE.title} on Steam`,
  //  active: false,
  //},
  //{
  //  name: "Telegram",
  //  href: "https://github.com/satnaing/astro-paper",
  //  linkTitle: `${SITE.title} on Telegram`,
  //  active: false,
  //},
  //{
  //  name: "Mastodon",
  //  href: "https://github.com/satnaing/astro-paper",
  //  linkTitle: `${SITE.title} on Mastodon`,
  //  active: false,
  //},
];
