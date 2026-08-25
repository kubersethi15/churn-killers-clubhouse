import assert from "node:assert/strict";
import test from "node:test";

import {
  batchIdempotencyKey,
  orderSubscribersForSend,
  planBatches,
  shouldAdvanceLastSent,
} from "./sendPlan.ts";

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

test("last_sent advances only when no batch transiently failed", () => {
  assert.equal(shouldAdvanceLastSent(0), true);
  assert.equal(shouldAdvanceLastSent(1), false);
  assert.equal(shouldAdvanceLastSent(3), false);
});
