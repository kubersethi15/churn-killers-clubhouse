import assert from "node:assert/strict";
import test from "node:test";

import { isWelcomeEligible, welcomeCutoffIso, WELCOME_CLAIM_WINDOW_MS } from "./welcomeEligibility.ts";

const now = new Date("2026-08-25T06:00:00.000Z");

test("only a recent active subscriber with no prior welcome is eligible", () => {
  assert.equal(isWelcomeEligible({
    subscribed: true,
    created_at: new Date(now.getTime() - 30_000).toISOString(),
    welcome_email_sent_at: null,
  }, now), true);
});

test("an old subscriber cannot be used to trigger a pending welcome", () => {
  assert.equal(isWelcomeEligible({
    subscribed: true,
    created_at: new Date(now.getTime() - WELCOME_CLAIM_WINDOW_MS - 1).toISOString(),
    welcome_email_sent_at: null,
  }, now), false);
});

test("inactive, already-welcomed, malformed and missing records are ineligible", () => {
  assert.equal(isWelcomeEligible({ subscribed: false, created_at: now.toISOString(), welcome_email_sent_at: null }, now), false);
  assert.equal(isWelcomeEligible({ subscribed: true, created_at: now.toISOString(), welcome_email_sent_at: now.toISOString() }, now), false);
  assert.equal(isWelcomeEligible({ subscribed: true, created_at: "not-a-date", welcome_email_sent_at: null }, now), false);
  assert.equal(isWelcomeEligible(null, now), false);
});

test("small future clock skew is accepted but a fabricated future record is not", () => {
  assert.equal(isWelcomeEligible({
    subscribed: true,
    created_at: new Date(now.getTime() + 30_000).toISOString(),
    welcome_email_sent_at: null,
  }, now), true);
  assert.equal(isWelcomeEligible({
    subscribed: true,
    created_at: new Date(now.getTime() + 60_001).toISOString(),
    welcome_email_sent_at: null,
  }, now), false);
});

test("the database cutoff uses the same fifteen-minute contract", () => {
  assert.equal(welcomeCutoffIso(now), "2026-08-25T05:45:00.000Z");
});
