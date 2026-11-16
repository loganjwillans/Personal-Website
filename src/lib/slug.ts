/** `my-case-study` → `MY_CASE_STUDY` */
export function envNameForId(id: string): string {
  return `CASE_STUDY_PASSWORD_${id.replace(/[^a-zA-Z0-9]+/g, '_').toUpperCase()}`;
}
