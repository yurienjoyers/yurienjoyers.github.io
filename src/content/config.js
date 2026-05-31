import { defineCollection, z } from "astro:content";

const posts = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.date()]),
  }),
});

export const collections = {
  posts,
};
