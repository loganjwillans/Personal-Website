import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';
import type { AstroIntegration } from 'astro';

import { encryptHtml } from '../src/lib/crypto';
import { getProtectedEntries } from '../src/lib/protected';

const TEMPLATE_PATTERN = /<template[^>]*data-protected-source[^>]*>([\s\S]*?)<\/template>/;
const NOT_CONFIGURED = `<div class="protected__unconfigured" role="status">
  <p><strong>This case study isn't published yet.</strong></p>
  <p>The password for it hasn't been configured for this build, so its content was withheld.</p>
</div>`;

/**
 * Encrypts the body of every protected case study after the site is built.
 *
 * The page template renders the article inside a <template data-protected-source>.
 * Here that element is swapped for a JSON payload of AES-GCM ciphertext, so the
 * published HTML never contains the plaintext. The browser decrypts it once the
 * visitor supplies the password.
 */
export function protect(): AstroIntegration {
  let root = process.cwd();

  return {
    name: 'brainvat-protect',
    hooks: {
      'astro:config:setup': ({ config }) => {
        root = fileURLToPath(config.root);
      },

      'astro:build:done': async ({ dir, logger }) => {
        const entries = getProtectedEntries();
        if (entries.length === 0) return;

        const mode = process.env.NODE_ENV === 'development' ? 'development' : 'production';
        const env = { ...loadEnv(mode, root, ''), ...process.env };

        for (const entry of entries) {
          const htmlPath = join(fileURLToPath(dir), 'work', entry.id, 'index.html');
          if (!existsSync(htmlPath)) {
            logger.warn(`Protected page for "${entry.id}" was not found. Skipping.`);
            continue;
          }

          const html = await readFile(htmlPath, 'utf8');
          const match = TEMPLATE_PATTERN.exec(html);
          if (!match) {
            logger.warn(`No protected region found in "${entry.id}". Is the layout using <ProtectedContent>?`);
            continue;
          }

          const password = env[entry.passwordEnv];

          if (!password) {
            logger.warn(
              `Missing ${entry.passwordEnv}. The body of "${entry.id}" was withheld from this build. ` +
                `Add it to .env locally, or as a repository secret for deploys.`,
            );
            await writeFile(
              htmlPath,
              html.replace(TEMPLATE_PATTERN, NOT_CONFIGURED),
              'utf8',
            );
            continue;
          }

          const payload = await encryptHtml(match[1].trim(), password);
          const script = `<script type="application/json" id="protected-payload">${JSON.stringify(payload)}</script>`;

          const next = html.replace(TEMPLATE_PATTERN, script);
          if (/<template[^>]*data-protected-source/.test(next)) {
            throw new Error(`Plaintext for "${entry.id}" survived encryption. Aborting the build.`);
          }

          await writeFile(htmlPath, next, 'utf8');
          logger.info(`Encrypted case study "${entry.id}" (${entry.passwordEnv}).`);
        }
      },
    },
  };
}
