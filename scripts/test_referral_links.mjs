#!/usr/bin/env node

import assert from "node:assert/strict";
import { buildSubscriberReferral } from "../src/utils/referralLinks.ts";

const cases = [
  ["/", "homepage"],
  ["/about", "about"],
  ["/ai-exposure-score", "ai-exposure-score"],
  ["/newsletters", "newsletters"],
  ["/playbook", "playbook"],
  ["/start", "start"],
  ["/subscribe", "subscribe"],
  ["/newsletter/renewal-evidence-packet", "renewal-evidence-packet"],
  ["/topics/renewal-risk", "topics-renewal-risk"],
];

for (const [path, expectedCampaign] of cases) {
  const referral = buildSubscriberReferral(path, "Post Signup Hero");
  assert.equal(referral.campaign, expectedCampaign);
  for (const [variant, value] of [
    ["linkedin", referral.linkedinUrl],
    ["copy", referral.copyUrl],
    ["private", referral.privateUrl],
  ]) {
    const url = new URL(value);
    assert.equal(url.pathname, path);
    assert.equal(url.searchParams.get("utm_source"), "subscriber_referral");
    assert.equal(url.searchParams.get("utm_medium"), "share");
    assert.equal(url.searchParams.get("utm_campaign"), expectedCampaign);
    assert.equal(url.searchParams.get("utm_content"), `post-signup-hero_${variant}`);
  }
}

const fallback = buildSubscriberReferral("/admin", "post_signup_admin");
assert.equal(new URL(fallback.privateUrl).pathname, "/");
assert.equal(fallback.campaign, "homepage");

console.log("referral link contract passed");
