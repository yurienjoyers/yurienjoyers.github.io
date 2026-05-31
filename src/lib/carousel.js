import { existsSync, readdirSync } from "node:fs";
import { extname } from "node:path";
import { fileURLToPath } from "node:url";

const IMAGE_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".svg",
]);
const CAROUSEL_DIR = fileURLToPath(
  new URL("../../public/carousel", import.meta.url),
);

export function getCarouselItems() {
  if (!existsSync(CAROUSEL_DIR)) {
    return [];
  }

  return readdirSync(CAROUSEL_DIR, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() &&
        IMAGE_EXTENSIONS.has(extname(entry.name).toLowerCase()),
    )
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((entry) => ({
      src: `/carousel/${entry.name}`,
      label: entry.name.replace(/\.[^.]+$/, ""),
    }));
}
