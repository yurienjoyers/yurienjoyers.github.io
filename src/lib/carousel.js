import { existsSync, readdirSync } from "node:fs";
import { basename, extname } from "node:path";
import { fileURLToPath } from "node:url";

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

  return readdirSync(CAROUSEL_DIR, { withFileTypes: true }).map((entry) => {
    const url = getCarouselUrl(entry.name);

    return {
      src: `/carousel/${entry.name}`,
      label: url,
      url,
    };
  });
}
