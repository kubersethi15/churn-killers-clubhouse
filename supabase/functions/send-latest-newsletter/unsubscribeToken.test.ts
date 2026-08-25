import assert from "node:assert/strict";
import test from "node:test";

import { createUnsubscribeToken, verifyUnsubscribeToken } from "./unsubscribeToken.ts";

// This module is the single source of truth for the unsubscribe-token contract.
// send-latest-newsletter and send-welcome-email sign tokens with
// createUnsubscribeToken; unsubscribe-newsletter authenticates them with
// verifyUnsubscribeToken. If the two ever disagree, every unsubscribe link in
// the wild silently breaks and readers mark the mail as spam instead. These
// tests lock the wire format and the accept/reject rules so a future edit to
// the signing string, the base64url encoding, or the secret cannot drift the
// signer and verifier apart without failing the build.

const SUBSCRIBER_ID = "00000000-0000-4000-8000-000000000000";
const SECRET = "test-secret-value";

test("a freshly signed token verifies back to its subscriber id", async () => {
  const token = await createUnsubscribeToken(SUBSCRIBER_ID, SECRET);
  assert.equal(await verifyUnsubscribeToken(token, SECRET), SUBSCRIBER_ID);
});

test("the wire format is pinned (golden vector)", async () => {
  // Locks the exact token bytes. Any change to the signing message,
  // hash, or base64url encoding must update this vector deliberately.
  const token = await createUnsubscribeToken(SUBSCRIBER_ID, SECRET);
  assert.equal(
    token,
    "00000000-0000-4000-8000-000000000000.b5nh2LiIOCtSKE5WpF_cp_BP4Gp1SBmSGqBTeBqo9oY",
  );
});

test("a token signed with a different secret is rejected", async () => {
  const token = await createUnsubscribeToken(SUBSCRIBER_ID, SECRET);
  assert.equal(await verifyUnsubscribeToken(token, "a-different-secret"), null);
});

test("a tampered signature is rejected", async () => {
  const token = await createUnsubscribeToken(SUBSCRIBER_ID, SECRET);
  const [id, signature] = token.split(".");
  const flippedLastChar = signature.slice(0, -1) + (signature.endsWith("A") ? "B" : "A");
  assert.equal(await verifyUnsubscribeToken(`${id}.${flippedLastChar}`, SECRET), null);
});

test("a token with a swapped subscriber id is rejected", async () => {
  const token = await createUnsubscribeToken(SUBSCRIBER_ID, SECRET);
  const signature = token.split(".")[1];
  const otherId = "11111111-1111-4111-8111-111111111111";
  assert.equal(await verifyUnsubscribeToken(`${otherId}.${signature}`, SECRET), null);
});

test("malformed tokens are rejected without throwing", async () => {
  assert.equal(await verifyUnsubscribeToken("", SECRET), null);
  assert.equal(await verifyUnsubscribeToken("no-separator", SECRET), null);
  assert.equal(await verifyUnsubscribeToken(`${SUBSCRIBER_ID}.`, SECRET), null);
  assert.equal(await verifyUnsubscribeToken(`.signatureonly`, SECRET), null);
});

test("a non-uuid subscriber id is rejected even with a valid signature shape", async () => {
  // Guards the id shape check so the verifier cannot be coaxed into signing
  // and returning an arbitrary non-subscriber string.
  const notAUuid = "not-a-uuid";
  const token = await createUnsubscribeToken(notAUuid, SECRET);
  assert.equal(await verifyUnsubscribeToken(token, SECRET), null);
});
