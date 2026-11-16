// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

import { protect } from './integrations/protect';
import { isProtectedPath } from './src/lib/protected';

export default defineConfig({
  site: 'https://brainvat.xyz',

  // HTML-aware whitespace handling: keeps a single space between inline
  // elements, which 'jsx' mode (the v7 default) would strip.
  compressHTML: true,

  integrations: [
    mdx(),
    sitemap({
      // Protected case studies are noindex and stay out of the sitemap.
      filter: (page) => !isProtectedPath(page),
    }),
    protect(),
  ],

  markdown: {
    shikiConfig: { wrap: true },
  },

  devToolbar: { enabled: false },
});
