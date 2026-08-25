#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(
  resolve(here, "../src/components/newsletter/NewsletterContent.tsx"),
  "utf8",
);

assert.match(
  source,
  /eventName: "share_intent", resourceId: "article:linkedin"/,
  "opening the LinkedIn composer must be an intent, not a completed share",
);
assert.match(
  source,
  /await navigator\.clipboard\.writeText\(referralCopyUrl\);[\s\S]*eventName: "content_share"/,
  "copy-link completion must be recorded only after the clipboard write succeeds",
);
assert.match(
  source,
  /onClick=\{trackArticleResourceOpen\}/,
  "rendered article links must participate in resource-open tracking",
);
assert.match(
  source,
  /\^\\\/pdfs\\\/\[\^\/\]\+\\\.pdf\$/,
  "only exact same-origin PDF resources should be counted from article content",
);
assert.match(
  source,
  /eventName: "resource_open", resourceId: `pdf:\$\{filename\}`/,
  "article PDF clicks must emit a resource_open event",
);

console.log("newsletter growth semantics contract passed");
