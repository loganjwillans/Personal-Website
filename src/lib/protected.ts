/**
 * Reads the `work` collection's frontmatter on disk so that both the Astro
 * config (sitemap filter) and the protection integration agree on which case
 * studies are locked. Kept dependency-free on purpose: it runs in the config
 * bundler, before Astro itself has loaded any content.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { envNameForId } from './slug';

const WORK_DIR = fileURLToPath(new URL('../content/work/', import.meta.url));

export interface ProtectedEntry {
  /** Collection id, which is the file name without its extension. */
  id: string;
  /** Environment variable holding the password. */
  passwordEnv: string;
}

function readFrontmatter(file: string): string {
  const raw = readFileSync(file, 'utf8');
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw);
  return match?.[1] ?? '';
}

export function getProtectedEntries(): ProtectedEntry[] {
  if (!existsSync(WORK_DIR)) return [];

  return readdirSync(WORK_DIR)
    .filter((file) => /\.(md|mdx)$/i.test(file))
    .flatMap((file) => {
      const frontmatter = readFrontmatter(join(WORK_DIR, file));
      if (!/^protected:\s*true\s*$/m.test(frontmatter)) return [];

      const id = file.replace(/\.(md|mdx)$/i, '');
      const override = /^passwordEnv:\s*['"]?([A-Z0-9_]+)['"]?\s*$/m.exec(frontmatter)?.[1];
      return [{ id, passwordEnv: override ?? envNameForId(id) }];
    });
}

/** Used by the sitemap integration, which passes absolute page URLs. */
export function isProtectedPath(page: string): boolean {
  let pathname: string;
  try {
    pathname = new URL(page).pathname;
  } catch {
    pathname = page;
  }

  const normalised = pathname.replace(/\/+$/, '');
  return getProtectedEntries().some(({ id }) => normalised === `/work/${id}`);
}
