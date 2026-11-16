const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  // Frontmatter dates are plain calendar dates, parsed as UTC midnight.
  // Formatting in UTC stops them slipping back a day in western timezones.
  timeZone: 'UTC',
});

const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

export function formatDate(value: Date): string {
  return dateFormatter.format(value);
}

export function formatMonth(value: Date): string {
  return shortDateFormatter.format(value);
}

/** Rough reading time from a raw markdown body. */
export function readingTime(body: string): number {
  const words = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#*_>`~\-[\]()]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.round(words / 220));
}

/** "3 min read" */
export function readingLabel(body: string): string {
  return `${readingTime(body)} min read`;
}
