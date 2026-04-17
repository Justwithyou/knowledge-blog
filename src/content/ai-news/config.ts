import { defineCollection, z } from "astro:content";

const aiNewsCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    published: z.date(),
    description: z.string().optional().default(""),
    source: z.string(),
    sourceUrl: z.string().url(),
    tags: z.array(z.string()).optional().default([]),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = {
  "ai-news": aiNewsCollection,
};