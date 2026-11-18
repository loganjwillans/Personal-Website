/**
 * Single source of truth for anything that appears in more than one place.
 * Edit here, not in the templates.
 */

export const site = {
  url: 'https://brainvat.xyz',
  name: 'Logan Willans',
  role: 'Product Designer',
  employer: 'IntelAgree',
  title: 'Logan Willans â€” Product Designer',
  description:
    'Logan Willans is a product designer at IntelAgree, working on contract management software. Case studies, field notes and generative projects.',
  email: 'design@brainvat.xyz',
  /** Shown in the footer and on the about page. */
  profiles: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/lwillans/' },
    // TODO: add more profile links (Dribbble, Read.cv, GitHub, â€¦)
  ] as { label: string; href: string }[],
  nav: [
    { label: 'Work', href: '/work' },
    { label: 'Projects', href: '/projects' },
    { label: 'Blog', href: '/blog' },
    { label: 'About', href: '/about' },
  ],
  /** Used by the password gate for people who need access. */
  accessRequestSubject: 'Case study access',
} as const;

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path: string): string {
  return new URL(path, site.url).href;
}
