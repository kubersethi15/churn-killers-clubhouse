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

/** Normalize an address for delivered/pending comparison. */
export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

/**
 * Per-recipient idempotency: exclude anyone already delivered this issue.
 *
 * This is the real guard against re-sending when the list changes between runs.
 * A content-addressed batch key only dedupes a byte-identical batch; if one
 * subscriber leaves, batch boundaries shift for everyone after them and their
 * batches get fresh keys. Filtering against the set of already-delivered
 * addresses (from newsletter_send_log) means a recipient who has the issue is
 * never re-sent, however the remaining batches are re-packed.
 */
export const selectPendingRecipients = <T extends { email: string }>(
  subscribers: T[],
  deliveredEmails: Set<string>,
): T[] => subscribers.filter(subscriber => !deliveredEmails.has(normalizeEmail(subscriber.email)));

/** Split an ordered list into fixed-size batches. */
export const planBatches = <T>(items: T[], batchSize: number): T[][] => {
  const size = Math.max(1, Math.floor(batchSize));
  const batches: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    batches.push(items.slice(index, index + size));
  }
  return batches;
};

/**
 * Bound a production run without changing the deterministic recipient order.
 * A later run starts from the remaining recipients because the send log removes
 * everyone already delivered. This lets operators pause between tranches and
 * inspect provider health without risking duplicate mail.
 */
export const limitRecipientsForRun = <T>(
  recipients: T[],
  maxRecipients?: number | null,
): { recipients: T[]; remaining: number } => {
  if (maxRecipients == null) return { recipients, remaining: 0 };
  const limit = Math.max(1, Math.floor(maxRecipients));
  return {
    recipients: recipients.slice(0, limit),
    remaining: Math.max(0, recipients.length - limit),
  };
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
 * Advance the sequential send pointer only when the issue is fully delivered to
 * every currently active recipient AND that fact is durably recorded.
 *
 * - `transientBatchFailures`: a batch that threw leaves recipients unsent, so
 *   the pointer must hold and the next run retries them (invalid addresses are
 *   permanent and are counted separately, not here).
 * - `sendLogPersisted`: if the per-recipient send log did not persist, the next
 *   run cannot tell who was delivered, so advancing would strand or double-send
 *   recipients. Hold the pointer and surface the failure instead.
 */
export const shouldAdvanceLastSent = (
  input: {
    transientBatchFailures: number;
    sendLogPersisted: boolean;
    pendingAfterRun?: number;
  },
): boolean =>
  input.transientBatchFailures === 0 &&
  input.sendLogPersisted &&
  (input.pendingAfterRun ?? 0) === 0;
