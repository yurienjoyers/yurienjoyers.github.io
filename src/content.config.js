import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";

const posts = defineCollection({
  loader: glob({
    base: "./src/content/posts",
    pattern: "**/*.md",
  }),
  schema: z.object({
    title: z.string(),
    date: z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.date()]),
  }),
});

export const collections = {
  posts,
};
