import assert from "node:assert/strict";
import test from "node:test";

import { buildNewsletterPayload, cleanSubjectLine } from "./emailSender.ts";

test("subscriber payload is individually addressed and includes both bodies and one-click headers", () => {
  const [payload] = buildNewsletterPayload([{
    subscriberId: "subscriber-1",
    email: "reader@example.com",
    subject: "  A useful\nsubject  ",
    html: "<p>Useful issue</p>",
    text: "Useful issue",
    unsubscribeUrl: "https://example.com/unsubscribe?token=signed",
    newsletterId: "issue-1",
    newsletterSlug: "useful-issue",
    variantLabel: "single",
  }], 0);

  assert.deepEqual(payload.to, ["reader@example.com"]);
  assert.equal(payload.subject, "A useful subject");
  assert.equal(payload.text, "Useful issue");
  assert.equal(payload.headers["List-Unsubscribe"], "<https://example.com/unsubscribe?token=signed>");
  assert.equal(payload.headers["List-Unsubscribe-Post"], "List-Unsubscribe=One-Click");
  assert.equal(payload.reply_to, "hello@churnisdead.com");
});

test("subject cleaning removes header injection without rewriting the copy", () => {
  assert.equal(cleanSubjectLine("First line\r\nBcc: someone@example.com"), "First line Bcc: someone@example.com");
});
