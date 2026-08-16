// Notion-style tag palette (same hex values Notion itself uses for tag
// backgrounds). Deterministic: hashing the tag string picks the color, so
// the same tag always renders the same color everywhere on the site.
const PALETTE = [
  { light: "bg-[#ffe2dd]", dark: "dark:bg-[#6e3630]" }, // red
  { light: "bg-[#fadec9]", dark: "dark:bg-[#854c1d]" }, // orange
  { light: "bg-[#f9e4bc]", dark: "dark:bg-[#835e33]" }, // yellow
  { light: "bg-[#dbeddb]", dark: "dark:bg-[#2b593f]" }, // green
  { light: "bg-[#d3e5ef]", dark: "dark:bg-[#28456c]" }, // blue
  { light: "bg-[#e8deee]", dark: "dark:bg-[#492f64]" }, // purple
  { light: "bg-[#f5e0e9]", dark: "dark:bg-[#69314c]" }, // pink
  { light: "bg-[#eee0da]", dark: "dark:bg-[#603b2c]" }, // brown
  { light: "bg-[#e3e2e0]", dark: "dark:bg-[#5a5a5a]" }, // gray
] as const;

const hashString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const getTagColor = (tag: string) => PALETTE[hashString(tag) % PALETTE.length];

export default getTagColor;
