import { defineConfig } from "astro/config";
import remarkBreaks from "remark-breaks";

export default defineConfig({
  output: "static",
  markdown: {
    remarkPlugins: [remarkBreaks],
  },
  build: {
    format: "file",
  },
});
