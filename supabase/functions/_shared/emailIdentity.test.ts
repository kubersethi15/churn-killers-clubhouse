import { assertEquals, assertMatch } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { EMAIL_IDENTITY } from "./emailIdentity.ts";

Deno.test("all brand email replies route to the live shared inbox", () => {
  assertEquals(EMAIL_IDENTITY.replyTo, "hello@churnisdead.com");
  assertMatch(EMAIL_IDENTITY.newsletterFrom, /<newsletter@churnisdead\.com>$/);
  assertMatch(EMAIL_IDENTITY.kuberFrom, /<newsletter@churnisdead\.com>$/);
});
