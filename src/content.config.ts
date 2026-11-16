import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const work = defineCollection({
  loader: glob({ base: './src/content/work', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    role: z.string(),
    year: z.number().int(),
    client: z.string().optional(),
    duration: z.string().optional(),
    team: z.string().optional(),
    tags: z.array(z.string()).default([]),
    cover: z.string().optional(),
    coverAlt: z.string().default(''),
    featured: z.boolean().default(false),
    order: z.number().default(50),

    /**
     * Encrypts the case study body at build time. The page shell (title,
     * summary, role, year) stays public so the work is still discoverable.
     */
    protected: z.boolean().default(false),
    /** Defaults to CASE_STUDY_PASSWORD_<SLUG>. */
    passwordEnv: z.string().optional(),

    /** Marks demo copy that must be replaced before launch. */
    placeholder: z.boolean().default(false),
  }),
});

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const experiments = defineCollection({
  loader: glob({ base: './src/content/experiments', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    year: z.number().int(),
    tags: z.array(z.string()).default([]),
    /** Folder under /public/experiments that holds index.html + sketch.js */
    sketch: z.string(),
    poster: z.string(),
    source: z.string().optional(),
    order: z.number().default(50),
  }),
});

export const collections = { work, blog, experiments };
