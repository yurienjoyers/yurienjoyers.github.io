import { existsSync, readdirSync } from "node:fs";
import { basename, extname, join } from "node:path";

const CAROUSEL_DIR = join(process.cwd(), "public", "carousel");

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
