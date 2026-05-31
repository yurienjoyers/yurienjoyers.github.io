import { existsSync, readdirSync } from "node:fs";
import { basename, extname } from "node:path";
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

function getCarouselUrl(filename) {
  return basename(filename, extname(filename)).replace(/[⁄∕／]/g, "/");
}

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
    .map((entry) => {
      const url = getCarouselUrl(entry.name);

      return {
        src: `/carousel/${entry.name}`,
        label: url,
        url,
      };
    });
}
