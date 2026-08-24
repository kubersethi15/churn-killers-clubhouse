import assert from "node:assert/strict";
import { mergePlaybookManifest, type PlaybookRecord } from "../src/utils/playbookManifest.ts";

const card = (path: string, slug: string | null): PlaybookRecord => ({
  id: path,
  title: path,
  description: "curated description",
  pdf_path: path,
  notion_link: "https://notion.example/tool",
  newsletter_slug: slug,
  newsletter_title: slug,
  published_date: "2025-01-01T00:00:00Z",
});

const current = [
  card("/pdfs/survival.pdf", null),
  card("/pdfs/predictability.pdf", "stale-article"),
  card("/pdfs/qbr.pdf", null),
];
const archive = [
  { ...card("/pdfs/survival.pdf", "survival-article"), newsletter_title: "Survival" },
  { ...card("/pdfs/predictability.pdf", "correct-article"), newsletter_title: "Correct" },
  { ...card("/pdfs/qbr.pdf", null), newsletter_title: null, published_date: null },
  card("/pdfs/archive-only.pdf", "archive-article"),
];

const merged = mergePlaybookManifest(current, archive);
const byPath = new Map(merged.map((item) => [item.pdf_path, item]));

assert.equal(byPath.get("/pdfs/survival.pdf")?.newsletter_slug, "survival-article");
assert.equal(byPath.get("/pdfs/predictability.pdf")?.newsletter_slug, "correct-article");
assert.equal(byPath.get("/pdfs/qbr.pdf")?.newsletter_slug, null);
assert.equal(byPath.get("/pdfs/qbr.pdf")?.published_date, "2025-01-01T00:00:00Z");
assert.equal(byPath.get("/pdfs/archive-only.pdf")?.newsletter_slug, "archive-article");
assert.equal(byPath.get("/pdfs/survival.pdf")?.description, "curated description");
assert.equal(byPath.get("/pdfs/survival.pdf")?.notion_link, "https://notion.example/tool");
assert.equal(merged.length, 4);

console.log("Playbook manifest merge: ok");
