import assert from "node:assert/strict";
import test from "node:test";

import {
  batchIdempotencyKey,
  normalizeEmail,
  orderSubscribersForSend,
  planBatches,
  selectPendingRecipients,
  shouldAdvanceLastSent,
} from "./sendPlan.ts";

test("email normalization is stable for delivery-log keys", () => {
  assert.equal(normalizeEmail("  Reader@Example.COM "), "reader@example.com");
});

test("recipient ordering is deterministic regardless of DB return order", () => {
  const a = [{ id: "c" }, { id: "a" }, { id: "b" }];
  const b = [{ id: "b" }, { id: "c" }, { id: "a" }];
  assert.deepEqual(orderSubscribersForSend(a).map(s => s.id), ["a", "b", "c"]);
  assert.deepEqual(orderSubscribersForSend(a), orderSubscribersForSend(b));
});

test("ordering does not mutate the input", () => {
  const input = [{ id: "b" }, { id: "a" }];
  orderSubscribersForSend(input);
  assert.deepEqual(input.map(s => s.id), ["b", "a"]);
});

test("planBatches splits an ordered list into fixed-size batches", () => {
  const items = [1, 2, 3, 4, 5];
  assert.deepEqual(planBatches(items, 2), [[1, 2], [3, 4], [5]]);
  assert.deepEqual(planBatches([], 100), []);
  // A degenerate batch size never yields empty batches or an infinite loop.
  assert.deepEqual(planBatches(items, 0), [[1], [2], [3], [4], [5]]);
});

test("the same batch membership yields the same idempotency key in any order", async () => {
  const first = await batchIdempotencyKey("issue-1", ["s3", "s1", "s2"]);
  const second = await batchIdempotencyKey("issue-1", ["s1", "s2", "s3"]);
  assert.equal(first, second);
});

test("a changed batch membership yields a different idempotency key", async () => {
  const original = await batchIdempotencyKey("issue-1", ["s1", "s2", "s3"]);
  const removed = await batchIdempotencyKey("issue-1", ["s1", "s2"]);
  const added = await batchIdempotencyKey("issue-1", ["s1", "s2", "s3", "s4"]);
  assert.notEqual(original, removed);
  assert.notEqual(original, added);
});

test("idempotency keys are scoped to the newsletter", async () => {
  const one = await batchIdempotencyKey("issue-1", ["s1", "s2"]);
  const two = await batchIdempotencyKey("issue-2", ["s1", "s2"]);
  assert.notEqual(one, two);
  assert.match(one, /^newsletter-issue-1-[0-9a-f]{32}$/);
});

test("pending recipients exclude anyone already delivered, case-insensitively", () => {
  const subscribers = [
    { id: "1", email: "A@x.com" },
    { id: "2", email: "b@x.com" },
  ];
  const delivered = new Set(["a@x.com"]);
  assert.deepEqual(selectPendingRecipients(subscribers, delivered).map(s => s.id), ["2"]);
  // No delivered set yet: everyone is pending (first send).
  assert.equal(selectPendingRecipients(subscribers, new Set()).length, 2);
});

test("partial success + list change: delivered recipients are never re-sent", () => {
  // Run 1: five active subscribers. The batch holding s1..s3 succeeded and was
  // recorded; the batch holding s4,s5 threw, so those two were not recorded.
  const deliveredInRun1 = new Set(["s1@x.com", "s2@x.com", "s3@x.com"]);

  // Between runs the list changes: s2 unsubscribes, s6 signs up. With a batch
  // size of 2 the batch boundaries shift for everyone after s2 — exactly the
  // case a content-addressed batch key does NOT protect against.
  const run2Active = [
    { id: "s1", email: "s1@x.com" },
    { id: "s3", email: "s3@x.com" },
    { id: "s4", email: "s4@x.com" },
    { id: "s5", email: "s5@x.com" },
    { id: "s6", email: "s6@x.com" },
  ];

  const pending = selectPendingRecipients(
    orderSubscribersForSend(run2Active),
    deliveredInRun1,
  );

  // s1 and s3 already have it and must not be re-sent despite the reshuffle;
  // s4 and s5 (the failed batch) are retried; s6 (new) is included; s2 is gone.
  assert.deepEqual(pending.map(s => s.id), ["s4", "s5", "s6"]);
  const batches = planBatches(pending, 2);
  assert.deepEqual(batches.map(b => b.map(s => s.id)), [["s4", "s5"], ["s6"]]);
});

test("last_sent advances only when no batch failed AND the send log persisted", () => {
  assert.equal(shouldAdvanceLastSent({ transientBatchFailures: 0, sendLogPersisted: true }), true);
  assert.equal(shouldAdvanceLastSent({ transientBatchFailures: 1, sendLogPersisted: true }), false);
  assert.equal(shouldAdvanceLastSent({ transientBatchFailures: 0, sendLogPersisted: false }), false);
  assert.equal(shouldAdvanceLastSent({ transientBatchFailures: 2, sendLogPersisted: false }), false);
});
