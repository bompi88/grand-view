import { generateKeyBetween, generateNKeysBetween } from 'fractional-indexing';

/**
 * Conflict-free ordering keys. A node's `position` is one of these strings;
 * siblings render sorted lexicographically (ties broken by node id elsewhere).
 *
 * Insert/reorder/move write ONLY the moved node's key — no `$inc` cascade across
 * siblings — which is what makes drag persistence (legacy #91) conflict-free.
 */

/** Key for appending after the last sibling (or the first key if none). */
export function keyForAppend(lastKey: string | null): string {
  return generateKeyBetween(lastKey, null);
}

/** Key for prepending before the first sibling. */
export function keyForPrepend(firstKey: string | null): string {
  return generateKeyBetween(null, firstKey);
}

/** Key strictly between two existing sibling keys (either may be null = open end). */
export function keyBetween(before: string | null, after: string | null): string {
  return generateKeyBetween(before, after);
}

/** N evenly spread keys between two bounds — used by the "normalize positions" op. */
export function keysBetween(
  before: string | null,
  after: string | null,
  count: number,
): string[] {
  return generateNKeysBetween(before, after, count);
}

/** Stable sort comparator: by fractional position, then node id as a deterministic tiebreak. */
export function comparePosition(
  a: { position: string; id: string },
  b: { position: string; id: string },
): number {
  if (a.position < b.position) return -1;
  if (a.position > b.position) return 1;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}
