// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';

import { protect } from './integrations/protect';
import { isProtectedPath } from './src/lib/protected';

// MDX bodies are a stream of nodes. Group consecutive prose into its own paper
// sheet and leave Card/LooseCard elements as separate sheets, so two cards are
// two pieces of paper with cork between them.
// Random fasteners for an auto-grouped prose sheet, using the site's pin tokens.
const PIN_COLORS = ['red', 'blue', 'green', 'yellow'];
function prosePins() {
  /** @param {string} prefix */
  const one = (prefix) => {
    if (Math.random() < 0.5) {
      const tackHead = [
        'radial-gradient(circle at 33% 24%,var(--pin-highlight) 0%,var(--pin-highlight) 6%,transparent 30%)',
        'radial-gradient(circle at 50% 50%,transparent 66%,color-mix(in srgb,var(--pin-metal-light) 55%,transparent) 88%,color-mix(in srgb,var(--pin-metal-dark) 45%,transparent) 100%)',
        'conic-gradient(from 205deg,var(--pin-metal-dark),var(--pin-metal-light) 15%,var(--pin-metal) 33%,var(--pin-metal-dark) 51%,var(--pin-metal-light) 71%,var(--pin-metal) 87%,var(--pin-metal-dark))',
      ].join(',');
      return `${prefix}-size:var(--pin-size-tack);${prefix}-head:${tackHead};${prefix}-ring:var(--pin-rim);${prefix}-shadow:var(--pin-shadow-tack)`;
    }
    const color = PIN_COLORS[Math.floor(Math.random() * PIN_COLORS.length)];
    return `${prefix}-size:var(--pin-size-pushpin);${prefix}-head:radial-gradient(circle at 30% 23%,var(--pin-highlight) 0%,var(--pin-highlight) 8%,transparent 26%),radial-gradient(circle at 40% 34%,color-mix(in srgb,var(--pin-highlight) 45%,transparent) 0%,transparent 50%),radial-gradient(circle at 38% 30%,color-mix(in srgb,var(--pin-${color}) 55%,var(--paper)) 0%,var(--pin-${color}) 52%,var(--pin-${color}-dark) 100%);${prefix}-ring:var(--pin-${color}-dark);${prefix}-shadow:var(--pin-shadow-pushpin)`;
  };
  return `${one('--pin')};${one('--pin-b')}`;
}

const separateSheets = {
  name: 'separate-mdx-sheets',
  /** @type {number} */
  sheetIndex: 0,
  before() {
    this.sheetIndex = 0;
  },
  /** @param {any} root @param {any} ctx */
  after(root, ctx) {
    const cards = new Set(['Card', 'EntryCard', 'LooseCard', 'EntryFooter']);
    const file = String(ctx.fileURL?.pathname ?? 'page').split('/').pop() ?? 'page';
    const slug = file.replace(/\.mdx?$/i, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    /** @type {any[]} */
    let group = [];
    const flush = () => {
      if (!group.length) return;
      const nodes = [...group];
      const index = this.sheetIndex++;
      ctx.replaceNode(nodes[0], {
        type: 'element',
        tagName: 'div',
        properties: {
          className: ['mdx-sheet', 'sheet', 'pin', 'pin--corners'],
          style: `--vt-name: vt-${slug}-sheet-${index};view-transition-class: vt vt-d${(index % 4) + 1};${prosePins()}`,
        },
        children: nodes,
      });
      for (const node of nodes.slice(1)) ctx.removeNode(node);
      group = [];
    };
    for (const node of [...root.children]) {
      if ((node.type === 'text' || node.type === 'raw') && !String(node.value ?? '').trim()) {
        continue;
      }
      if (node.type === 'mdxjsEsm') {
        flush();
        continue;
      }
      if (node.type === 'mdxJsxFlowElement' && cards.has(node.name)) {
        flush();
        continue;
      }
      group.push(node);
    }
    flush();
  },
};

export default defineConfig({
  site: 'https://brainvat.xyz',

  // HTML-aware whitespace handling: keeps a single space between inline
  // elements, which 'jsx' mode (the v7 default) would strip.
  compressHTML: true,

  integrations: [
    mdx({ processor: satteri({ hastPlugins: [separateSheets] }) }),
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
