/**
 * Utility helpers for the EzyCourse action node.
 */

/**
 * Strips a trailing slash from a base URL.
 */
export function normalizeBaseUrl(url: string): string {
  return url.replace(/\/$/, '');
}

/**
 * Converts a boolean lesson-completion flag to the integer EzyCourse expects.
 */
export function toEzyCourseInt(value: boolean): number {
  return value ? 1 : 0;
}

/**
 * Parses a comma-separated string of tag IDs into an array of numbers.
 * Non-numeric values are filtered out.
 *
 * @example
 * parseTagIds('1,2,3')      // [1, 2, 3]
 * parseTagIds('1, 2 , abc') // [1, 2]
 */
export function parseTagIds(input: string): number[] {
  return input
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n));
}
