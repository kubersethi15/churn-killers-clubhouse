import assert from "node:assert/strict";
import test from "node:test";

import { shouldSuppressSubscriber, tagValue } from "./eventUtils.ts";

test("reads current object-shaped Resend tags", () => {
  assert.equal(tagValue({ subscriber_id: "subscriber-1" }, "subscriber_id"), "subscriber-1");
});

test("keeps compatibility with legacy array-shaped tags", () => {
  assert.equal(tagValue([{ name: "newsletter_slug", value: "issue-1" }], "newsletter_slug"), "issue-1");
});

test("suppresses complaints, provider suppressions, and permanent bounces", () => {
  assert.equal(shouldSuppressSubscriber("email.complained"), true);
  assert.equal(shouldSuppressSubscriber("email.suppressed"), true);
  assert.equal(shouldSuppressSubscriber("email.bounced", "Permanent"), true);
  assert.equal(shouldSuppressSubscriber("email.bounced"), true);
});

test("does not unsubscribe readers after a temporary delivery failure", () => {
  // Resend's current webhook payload labels these failures as "Transient".
  assert.equal(shouldSuppressSubscriber("email.bounced", "Transient"), false);
  // Keep the older/general spelling safe as well.
  assert.equal(shouldSuppressSubscriber("email.bounced", "Temporary"), false);
  assert.equal(shouldSuppressSubscriber("email.delivered"), false);
});
