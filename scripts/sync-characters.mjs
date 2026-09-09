import { readFileSync, writeFileSync, copyFileSync, existsSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

// Keep every visible resident derived from one vector drawing.
// Optional arguments copy the two product mascots into their sibling checkouts.
// node scripts/sync-characters.mjs ../every15min-site ../epicare-site
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const names = ["lyrebird", "bee", "goldie", "otter", "frog"];
const spritePath = join(root, "assets/icons.svg");
let sprite = readFileSync(spritePath, "utf8");
for (const name of names) {
  const svg = readFileSync(
    join(root, "assets/characters", `${name}.svg`),
    "utf8",
  );
  const body = svg
    .replace(/<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    .trim();
  const symbol = `<symbol id="${name}" viewBox="0 0 120 140">\n${body}\n</symbol>`;
  const pattern = new RegExp(`<symbol id="${name}"[\\s\\S]*?<\\/symbol>`);
  if (!pattern.test(sprite))
    throw new Error(`Missing resident symbol: ${name}`);
  sprite = sprite.replace(pattern, symbol);
}
writeFileSync(spritePath, sprite);
copyFileSync(
  join(root, "assets/characters/lyrebird.svg"),
  join(root, "favicon.svg"),
);
for (const [i, name] of ["bee", "goldie"].entries()) {
  const destination = process.argv[i + 2];
  if (!destination) continue;
  const target = resolve(destination);
  if (!existsSync(join(target, "index.html")))
    throw new Error(`Missing product checkout: ${target}`);
  copyFileSync(
    join(root, "assets/characters", `${name}.svg`),
    join(target, "mascot.svg"),
  );
}
const card = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#d0e5dd"/><text x="600" y="135" text-anchor="middle" font-family="Arial,sans-serif" font-size="50" font-weight="600" fill="#294b3e">TokenDance</text>',
  ...names.map((name, index) => {
    const svg = readFileSync(
      join(root, "assets/characters", `${name}.svg`),
      "utf8",
    );
    const body = svg
      .replace(/<svg[^>]*>/, "")
      .replace(/<\/svg>\s*$/, "")
      .trim();
    return `<g transform="translate(${110 + index * 210},220) scale(1.2)">${body}</g>`;
  }),
  '<text x="600" y="494" text-anchor="middle" font-family="Arial,sans-serif" font-size="22" letter-spacing="4" fill="#53675c">LITTLE APPS. A GENTLER EVERYDAY.</text></svg>',
];
writeFileSync(join(root, "assets/characters/social-card.svg"), card.join("\n"));
console.log(
  "Character symbols, favicon and requested product mascots are synchronized.",
);
