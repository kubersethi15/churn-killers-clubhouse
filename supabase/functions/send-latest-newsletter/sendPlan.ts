/**
 * Pure planning helpers for the newsletter broadcast.
 *
 * The broadcast must survive two realities: a run can fail partway and be
 * retried, and the subscriber list can change between runs (a bounce webhook
 * flips `subscribed` to false, a new reader signs up). If batch composition or
 * the Resend idempotency key depend on row *position*, a retry maps the same
 * key to a different recipient set and either re-sends or silently skips.
 *
 * These helpers remove that dependency: recipients are ordered deterministically
 * by id, and each batch's idempotency key is derived from the recipients it
 * actually contains, not from its index. Keeping them pure makes the guarantees
 * testable without Supabase or Resend.
 */

/** Stable ascending order by id, independent of the order the DB returned. */
export const orderSubscribersForSend = <T extends { id: string }>(subscribers: T[]): T[] =>
  [...subscribers].sort((left, right) => (left.id < right.id ? -1 : left.id > right.id ? 1 : 0));

/** Split an ordered list into fixed-size batches. */
export const planBatches = <T>(items: T[], batchSize: number): T[][] => {
  const size = Math.max(1, Math.floor(batchSize));
  const batches: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    batches.push(items.slice(index, index + size));
  }
  return batches;
};

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");

/**
 * Content-addressed idempotency key for one batch. Two calls with the same
 * newsletter and the same set of subscriber ids — in any order — produce the
 * same key, so a retry of an unchanged batch is deduplicated by Resend. A batch
 * whose membership changed produces a different key, so newly included
 * recipients are actually sent instead of colliding with a stale cached
 * response for that batch position.
 */
export const batchIdempotencyKey = async (
  newsletterId: string,
  subscriberIds: string[],
): Promise<string> => {
  const canonical = `${newsletterId}:${[...subscriberIds].sort().join(",")}`;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical));
  return `newsletter-${newsletterId}-${toHex(new Uint8Array(digest)).slice(0, 32)}`;
};

/**
 * Advance the sequential send pointer only when no batch failed in a way that
 * leaves recipients unsent. Per-recipient invalid addresses are permanent and
 * do not block advancement; a batch that threw (network or provider error) is
 * transient, so the pointer holds and the next run safely re-sends the issue —
 * safe because the idempotency key above deduplicates the already-delivered
 * recipients.
 */
export const shouldAdvanceLastSent = (transientBatchFailures: number): boolean =>
  transientBatchFailures === 0;
