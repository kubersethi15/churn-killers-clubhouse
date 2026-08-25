import assert from "node:assert/strict";
import test from "node:test";

import {
  extractEmailTeaser,
  generateNewsletterEmailTemplate,
  generateNewsletterTextTemplate,
  htmlToPlainText,
  replacePlaceholders,
  trackedIssueUrl,
} from "./emailTemplate.ts";

const content = [
  '<p style="margin-bottom:16px">Product friction rarely enters the roadmap as a clean decision.</p>',
  '<p style="margin-bottom:16px">It arrives as a screenshot in Slack. Product asks for evidence. CS hears delay.</p>',
  '<p style="margin-bottom:16px">Then the request joins a backlog with no agreed decision and no honest expectation for the customer.</p>',
  '<h2 style="font-size:22px">What sprint planning contributes</h2>',
  '<p>The rest of the article belongs on the canonical website.</p>',
].join("");

test("the HTML email has one editorial action and the required utility links", () => {
  const html = generateNewsletterEmailTemplate(
    "Your backlog & the customer",
    "August 25, 2026",
    "8 min read",
    "A clear answer for CS <and> Product.",
    content,
    "product-friction",
    "Operations",
    "PO Box 123, Sydney NSW 2000, Australia",
  );

  assert.match(html, /Read the issue and get the playbook/);
  assert.equal((html.match(/utm_content=read_issue/g) ?? []).length, 1);
  assert.doesNotMatch(html, /Share on LinkedIn|Starter Kit|Continue Reading|→/);
  assert.match(html, /href="{{unsubscribe_url}}"/);
  assert.match(html, /Past issues/);
  assert.match(html, /PO Box 123, Sydney NSW 2000, Australia/);
  assert.match(html, /A clear answer for CS &lt;and&gt; Product\./);
  assert.match(html, /Your backlog &amp; the customer/);
});

test("the plain-text alternative carries the same hook, route, reply invitation and unsubscribe", () => {
  const text = generateNewsletterTextTemplate(
    "Your backlog is not a customer commitment",
    "A 30-minute review for an honest next answer.",
    content,
    "product-friction",
    "PO Box 123, Sydney NSW 2000, Australia",
  );

  assert.match(text, /^CHURN IS DEAD/m);
  assert.match(text, /Product friction rarely enters/);
  assert.match(text, /utm_content=read_issue/);
  assert.match(text, /Reply to this email/);
  assert.match(text, /Churn Is Dead, PO Box 123, Sydney NSW 2000, Australia/);
  assert.match(text, /Unsubscribe: {{unsubscribe_url}}/);
  assert.doesNotMatch(text, /<[^>]+>/);
});

test("the controlled preheader is concise and does not leak later article copy", () => {
  const teaser = extractEmailTeaser(content, "A useful answer for a busy CS leader.");
  assert.equal(teaser.preheader, "A useful answer for a busy CS leader.");
  assert.doesNotMatch(teaser.bodyText, /rest of the article/);
  assert.ok(teaser.bodyText.length < 720);
});

test("HTML conversion and placeholders stay deterministic", () => {
  assert.equal(htmlToPlainText("<p>CS &amp; Product</p><p>One&nbsp;answer.</p>"), "CS & Product\nOne answer.");
  assert.equal(
    replacePlaceholders("Unsubscribe: {{unsubscribe_url}}", { unsubscribe_url: "https://example.com/u?token=abc" }),
    "Unsubscribe: https://example.com/u?token=abc",
  );
  assert.equal(
    trackedIssueUrl("product-friction"),
    "https://churnisdead.com/newsletter/product-friction?utm_source=newsletter&utm_medium=email&utm_campaign=product-friction&utm_content=read_issue",
  );
});
