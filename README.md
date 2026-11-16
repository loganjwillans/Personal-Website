# brainvat.xyz

Portfolio for Logan Willans — product design case studies, generative experiments, and a blog.
Astro, static output, deployed to GitHub Pages on a custom domain.

## Commands

| Command | Does |
| --- | --- |
| `npm run dev` | Local dev server at `localhost:4321` |
| `npm run build` | Builds to `dist/` (this is what CI runs) |
| `npm run preview` | Serves the built site — use this to check the password gate |
| `npm run check` | Type-check Astro components and content schemas |

## Structure

```
src/config.ts              Name, role, email, links, nav — edit this first
src/styles/tokens.css      Colour, type, spacing — the brand goes here
src/content/work/          Case studies (MDX)
src/content/blog/          Posts (MDX)
src/content/experiments/   Experiment write-ups (MD)
src/pages/                 Routes
src/components/            UI, including case-study/ building blocks
public/experiments/        p5 sketches (one folder each)
integrations/protect.ts    Encrypts protected case studies at build time
```

## Adding content

### A case study

Create `src/content/work/my-case-study.mdx` with frontmatter:

```yaml
---
title: Making X better
summary: One sentence a recruiter could repeat.
role: Product Designer
year: 2026
client: IntelAgree        # optional
duration: 6 months        # optional
team: 2 designers, 5 engineers
tags: [Enterprise UX, Research]
cover: /images/work/my-case-study.svg
coverAlt: What the cover shows
featured: true            # show on the home page
order: 3                  # sort position
---
```

Then write the body in MDX. Three components are available out of the box:

```mdx
import Figure from '@/components/case-study/Figure.astro';
import Decision from '@/components/case-study/Decision.astro';
import MetricGrid from '@/components/case-study/MetricGrid.astro';

<Decision title="What you decided" tradeoff="What it cost">
  Why you decided it.
</Decision>

<Figure src="/images/work/detail.svg" alt="…" caption="…" />

<MetricGrid items={[{ value: '41%', label: 'faster', note: 'median' }]} />
```

### A protected case study

Add two lines to the frontmatter:

```yaml
protected: true
# passwordEnv: CASE_STUDY_PASSWORD_SOMETHING   # optional override
```

The password comes from an environment variable named after the file:
`my-case-study.mdx` → `CASE_STUDY_PASSWORD_MY_CASE_STUDY`.

- Locally: put it in `.env` (gitignored). `.env.example` shows the shape.
- On deploy: add a repository secret with the same name.

**What protection actually does.** The rendered body is encrypted with AES-256-GCM, using a key
derived from the password with PBKDF2 (210k iterations). Only ciphertext is published; the browser
decrypts it after the password check. There is no hash to bypass and the content is not in the HTML.

**What it does not do.** It is not confidentiality. The markdown source still lives in the
repository, and anything you publish may still be covered by an NDA. Clear the work with your
employer before adding it. If a study is genuinely sensitive, keep it off the public internet.

If a password is missing at build time, the page builds with its body withheld and a warning is
logged — the plaintext is never published unencrypted.

### A blog post

`src/content/blog/my-post.mdx` with `title`, `description`, `pubDate`, optional `tags` and
`updatedDate`. Set `draft: true` to keep it out of production builds.

### An experiment

1. Create `public/experiments/my-sketch/` with `sketch.html` and `sketch.js`. p5 lives once at
   `public/experiments/vendor/p5.min.js`, so sketches share it. Keep the runner named
   `sketch.html` — an `index.html` there would collide with the experiment's page route.
2. Export a poster frame as SVG or PNG next to them.
3. Create `src/content/experiments/my-sketch.md` pointing at both.

The canvas does not load until the visitor presses play, and the iframe is removed when they stop.

## Deploying

1. Push this repo to GitHub.
2. Settings → Pages → Source: **GitHub Actions**.
3. Settings → Pages → Custom domain: `brainvat.xyz`.
4. Add the password secret under Settings → Secrets and variables → Actions.
5. DNS at the registrar:

| Type | Name | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| AAAA | @ | 2606:50c0:8000::153 |
| AAAA | @ | 2606:50c0:8001::153 |
| AAAA | @ | 2606:50c0:8002::153 |
| AAAA | @ | 2606:50c0:8003::153 |
| CNAME | www | `loganwillans.github.io` |

Tick **Enforce HTTPS** once the certificate is issued.

`public/CNAME` holds the domain, so the setting survives every deploy.

## Before launch

- [ ] Replace the two sample case studies in `src/content/work/` (they are marked
      `placeholder: true`, which shows a warning banner — remove the flag or delete the files).
- [ ] Replace the three sample posts in `src/content/blog/`.
- [ ] Add profile links in `src/config.ts` (`TODO`).
- [ ] Fill in the `TODO` notes on the about page.
- [ ] Change the demo password in `.env` and the repository secret.
- [ ] Drop real brand values into `src/styles/tokens.css` (`--font-display`, `--accent`, …).
- [ ] Replace `public/og-default.png` with a proper share image.
