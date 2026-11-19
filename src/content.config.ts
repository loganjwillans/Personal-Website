import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** Optional card-preview overrides. Defaults keep the current card appearance. */
const preview = z.object({
  title: z.string().optional(),
  summary: z.string().optional(),
  image: z.string().optional(),
  showImage: z.boolean().default(true),
  showMeta: z.boolean().default(true),
  showTags: z.boolean().default(true),
  showBadge: z.boolean().default(true),
});

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
    preview: preview.optional(),
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
    preview: preview.optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    year: z.number().int(),
    tags: z.array(z.string()).default([]),
    /** Any kind of project: code, research, paper, personal, and so on. */
    kind: z.string().default('Project'),
    /** Interactive sketch under /public — only for projects that have one. */
    sketch: z.string().optional(),
    /** Cover image; also the still used for an interactive sketch. */
    poster: z.string().optional(),
    order: z.number().default(50),
    preview: preview.optional(),
  }),
});

const pages = defineCollection({
  loader: glob({ base: './src/content/pages', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    eyebrow: z.string().default('About'),
  }),
});

export const collections = { work, blog, projects, pages };
