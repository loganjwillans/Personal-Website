# brainvat.xyz

Portfolio for Logan Willans — product design case studies, projects, and a blog.
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
src/content/projects/      Project write-ups (MDX)
src/content/pages/         Standalone pages (MDX), e.g. About
src/pages/                 Routes
src/components/            UI, including case-study/ building blocks
public/projects/           project images (one folder each)
integrations/protect.ts    Encrypts protected case studies at build time
```

## Adding content

### A work entry (case study)

Create `src/content/work/my-case-study.mdx`. The filename becomes the URL: `/work/my-case-study/`.
Start with frontmatter:

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
order: 3                  # lower numbers first
---
```

`title` and `summary` appear on the work card and in the hero; `role`, `year`, `client`, `duration`
and `team` fill the facts row. `cover` is optional — put the image in `public/images/work/`. Set
`featured: true` to show the study in the home page's Selected work section; `order` controls its
position there and on `/work`.

Then write the body in MDX. Consecutive prose is grouped onto its own paper sheet automatically;
each `Card` or `LooseCard` becomes a separate sheet with cork between it and the previous one. The
same section-component set is registered for **all** entry types — case studies, projects and blog
posts — so no local imports are needed in any of them:

| Component | Use | Options |
| --- | --- | --- |
| `Card` / `EntryCard` | A section pinned onto the main paper sheet | `title`, `label`, `color`, `pins`, `name` |
| `LooseCard` | A separate paper sheet with a cork gap around it | `title`, `label`, `color`, `pins`, `name` |
| `Callout` | A titled aside with a coloured label strip and optional closing line | `label`, `title`, `text`, `color`, `foot` |
| `Figure` | Pinned image with a caption | `src`, `alt`, `caption`, `width`, `height` |
| `LightboxImage` / `ZoomImage` | Image printed on the sheet that zooms on click | `src`, `alt`, `caption`, `width`, `height` |
| `CodeBlock` | Syntax-highlighted code printed on the sheet | `code`, `language`, `title` |
| `EntryFooter` | Closing paper card with text and a link button | `href`, `label`, `name` |
| `MetricGrid` | Outcomes as sticky notes | `items` (`value`, `label`, `note`) |
| `Quote` | Pull quote with optional attribution | `attribution` |

```mdx
<Card title="Findings" label="Step 1" pins="pushpin">
  A section of prose, a list, or anything else you want on a separate sheet.
</Card>

<Callout label="Decision" title="What you decided" tone="green" foot="What it cost">
  Why you decided it.
</Callout>

<Figure src="/images/work/detail.svg" alt="…" caption="…" />

<LightboxImage src="/images/work/detail.svg" alt="…" caption="Click the image to zoom." />

<CodeBlock
  title="example.js"
  language="js"
  code={`function draw() {
  background(0);
}`}
/>

<MetricGrid items={[{ value: '41%', label: 'faster', note: 'median' }]} />

<Quote attribution="A colleague">A line worth pulling out.</Quote>
```

You can define as many cards as you need in one entry, and nest any of the other components inside
them. The card just wraps the content; the components inside keep their own styling:

```mdx
<Card title="The evidence" name="evidence">
  Intro paragraph on the sheet.

  <MetricGrid items={[{ value: '41%', label: 'faster', note: 'median' }]} />

  <Callout label="Caveat" tone="blue">What the number does not tell us.</Callout>
</Card>

<LooseCard title="A separate sheet" color="cream">
  <Figure src="/images/work/detail.svg" alt="…" caption="…" />

  <Quote attribution="A reviewer">A line worth pulling out.</Quote>
</LooseCard>
```

Both card components default to a white sheet and accept `color` (`paper`, `cream`, `blush`,
`green`, `blue`, `yellow`), `pins` (`random`, `tack` or `pushpin`) and `name` (a stable transition
id when two cards share a title). `pins="random"` is the default and picks a fresh pair of
fasteners for each card at build time; a fixed kind pins both corners the same way. Prose sheets
get their own random pair automatically. `Card` stays pinned on the main paper; `LooseCard` is a
separate sheet with space before and after it. Cards are flat — there is no tilt option — so the text stays easy to
read.

`Callout` is the single aside component: set `title`, pass body text as `text` or slot content, pick
`color` (`green`, `blue`, `yellow`, `blush`, `paper`), and use `foot` for a closing line such as a
trade-off. Decisions are simply callouts with `label="Decision"`; `tone` still works as an alias for
`color`.

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

Create `src/content/blog/my-post.mdx`. The filename becomes the URL: `/blog/my-post/`.

```yaml
---
title: A clear, specific headline
description: One or two sentences used on the blog card and in the page head.
pubDate: 2026-05-14
updatedDate: 2026-06-02   # optional
tags: [Design systems, Process]
draft: false              # true keeps it out of the site
---
```

Notes:

- `pubDate` drives the newest-first order. Posts are listed 10 per page at `/blog`, with Previous /
  Next links to `/blog/2` and beyond.
- `tags` create both the pill filters on the blog listing and the per-tag pages at
  `/blog/tags/<tag>/`. Keep tag spelling consistent across posts.
- Reading time is calculated from the body, so there is nothing to set for it.
- Set `draft: true` while writing; drafts are excluded from collection queries and never published.

Write the body in Markdown or MDX. All the section components above work here too — no imports
needed. Blog posts end with an `<EntryFooter>` in the MDX; there is no built-in footer on the page
any more, so each post chooses its own closing text and link.

### A project

Projects are deliberately general — code, research, papers, personal projects. Create
`src/content/projects/my-project.mdx` (MDX, so cards can be used in the body) with frontmatter:

```yaml
title: My Project
description: One-line summary shown on the card and in the page head.
year: 2026
tags: [Research]
kind: Research          # any label: Code, Research, Paper, Personal…
poster: /projects/my-project/poster.svg   # optional cover image
sketch: /projects/my-project/sketch.html  # optional interactive sketch
links:                  # optional external links (repo, paper, demo…)
  - label: Read the paper
    href: https://example.com/paper
order: 1                # lower numbers first
```

`title`, `description`, `kind`, `year` and `tags` appear on the card and in the page hero. The
filename becomes the URL (`/projects/my-project/`), and `order` sets the position on `/projects` and
in the home page's Projects section.

The `/projects` listing shows six projects per page with Previous / Next links to `/projects/2` and
beyond. A search field and tag filters sit in a paper card below the hero; both filter the cards on
the current page in place, and tags come from each entry's `tags` array.

Notes:

- `sketch` and `poster` are both optional. A project with neither still renders as a normal card
  and write-up. A lone `poster` renders as a plain cover image.
- Links belong in the MDX body via `<EntryFooter>`, not in frontmatter.
- Put project images under `public/projects/<slug>/`. If you add an interactive sketch, keep the
  runner named `sketch.html` there — an `index.html` would collide with the page route. The canvas
  does not load until the visitor presses play, and the iframe is removed when they stop.
- Use `<Card>` or `<LooseCard>` in the body to section longer write-ups (see above).
- See `src/content/projects/` for complete examples: `attention-residue` is research,
  `interface-as-evidence` is a paper, `reading-desk` is personal, and `contract-toolkit` is code.

### A standalone page

Pages whose body should use the same components live in `src/content/pages/`. `about.mdx` supplies
`title`, `description` and `eyebrow` for the hero; the matching route (`src/pages/about.astro`)
renders that hero and the MDX body with the shared component set. Add `src/content/pages/<name>.mdx`
plus a small route that calls `getEntry('pages', '<name>')` and `render(entry)` to do the same for a
new page.

### Card previews

All three card components read an optional `preview` object from the entry's frontmatter. It lets
you change what a card shows on the home page or a landing page without touching the entry's title
or description used on the page itself:

```yaml
preview:
  title: A shorter card title   # optional override
  summary: One line for cards   # optional override
  image: /images/foo.svg        # overrides cover (work) or poster (projects)
  showImage: true
  showMeta: true                # year / kind / client
  showTags: true
  showBadge: true               # protected badge on work cards
```

Every flag defaults to the card's current behaviour, so entries without `preview` render exactly as
before. `showTags: false` hides the tag chips on the card but the entry still participates in tag
filtering on the landing page.

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

- [ ] Replace the two sample case studies in `src/content/work/`.
- [ ] Replace the three sample posts in `src/content/blog/`.
- [ ] Replace the four sample projects in `src/content/projects/`; their links use `example.com`.
- [ ] Add profile links in `src/config.ts` (`TODO`).
- [ ] Fill in the `TODO` notes on the about page.
- [ ] Change the demo password in `.env` and the repository secret.
- [ ] Drop real brand values into `src/styles/tokens.css` (`--font-display`, `--accent`, …).
- [ ] Replace `public/og-default.png` with a proper share image.
