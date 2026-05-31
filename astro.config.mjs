import { unified } from "@astrojs/markdown-remark";
import { defineConfig } from "astro/config";
import remarkBreaks from "remark-breaks";

export default defineConfig({
  output: "static",
  markdown: {
    processor: unified({
      remarkPlugins: [remarkBreaks],
    }),
  },
  build: {
    format: "directory",
  },
  site: "https://yurienjoyers.github.io",
});
