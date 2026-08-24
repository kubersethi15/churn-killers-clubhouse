# Google Search Console baseline

**Verified:** 24 August 2026

**Property:** `https://churnisdead.com/`

**Performance window:** 22 May to 21 August 2026

**Search type:** Web

**Data handling:** aggregate counts and public URLs only; no screenshots or identity data

## Executive baseline

| Metric | Value |
|---|---:|
| Total clicks | 18 |
| Total impressions | 246 |
| Average CTR | 7.3% |
| Average position | 12.4 |
| Indexed pages | 16 |
| Crawled, currently not indexed | 2 |
| Sitemap status | Success |
| Sitemap discovered pages | 62 |

The headline CTR is dominated by the homepage: 16 of 18 clicks came from `/`. The useful constraint is not average position alone. Google reported performance for only 16 URLs, and most archive pages have not accumulated enough query evidence to support title, consolidation, or ranking claims.

## Page performance

| Public URL | Clicks | Impressions | CTR | Position |
|---|---:|---:|---:|---:|
| `/` | 16 | 76 | 21.1% | 10.8 |
| `/newsletter/cs-platform-org-chart-you-cant-edit` | 1 | 25 | 4.0% | 16.4 |
| `/newsletter/csm-promoted-to-babysitter-agent-supervisor` | 1 | 14 | 7.1% | 14.4 |
| `/newsletters` | 0 | 57 | 0% | 6.3 |
| `/playbook` | 0 | 52 | 0% | 8.1 |
| `/newsletter/ai-didnt-kill-customer-success` | 0 | 45 | 0% | 6.8 |
| `/newsletter/ai-wont-fix-customer-experience` | 0 | 15 | 0% | 4.5 |
| `/newsletter/onboarding-only-renewal-you-control` | 0 | 14 | 0% | 19.8 |
| `/newsletter/cs-teams-courage-problem` | 0 | 11 | 0% | 4.9 |
| `/newsletter/expansion-recession-not-retention-problem` | 0 | 11 | 0% | 23.1 |
| `/newsletter/renewal-cliff-data-intelligence-blind-spot` | 0 | 6 | 0% | 12.0 |
| `/start` | 0 | 5 | 0% | 16.0 |
| `/ai-exposure-score` | 0 | 3 | 0% | 2.0 |
| `/cs-analyzer` | 0 | 2 | 0% | 2.0 |
| `/newsletter/your-health-score-wont-save-you` | 0 | 1 | 0% | 7.0 |
| `/newsletter/renewal-clause-lawyers-wrote-cs-forgot` | 0 | 1 | 0% | 11.0 |

Rows are the complete page table shown for this three-month window, not a sample. Page-level impressions are not additive to the property total because Google can count more than one property URL in an impression and applies aggregation and privacy rules differently by dimension. Use each row as its own baseline, not as a reconciliation table.

## Query evidence

- Search Console returned only 13 query rows for the property in the window.
- The only query row with a click was `totango catalyst`: one click from two impressions. It is not evidence of Churn Is Dead's intended CS problem-led discovery.
- The branded query `kuber sethi` produced ten impressions and no clicks.
- No reported CS problem query exceeded 13 impressions.
- An explicit `Queries containing: health score` filter returned zero clicks and zero impressions. Google therefore provides no current query evidence for selecting a canonical winner among the five health-score issue pages.

Sparse queries can be withheld or partially reported by Search Console. Zero in the filtered report means there is no usable evidence in this surface and window, not proof that nobody searched the phrase.

## Indexing and sitemap evidence

The Page Indexing report, last updated 21 August 2026, showed 16 indexed pages and two pages under `Crawled - currently not indexed`:

| URL | Last crawled |
|---|---|
| `/newsletter/customer-predictability-revolution` | 4 June 2026 |
| `/newsletter/onboarding-is-the-first-revenue-moment` | 19 March 2026 |

The complete indexed-page example table contained:

| Indexed URL | Last crawled |
|---|---|
| `/` | 20 August 2026 |
| `/playbook` | 15 August 2026 |
| `/newsletter/ai-didnt-kill-customer-success` | 12 August 2026 |
| `/start` | 11 August 2026 |
| `/newsletter/renewal-cliff-data-intelligence-blind-spot` | 20 July 2026 |
| `/newsletter/onboarding-only-renewal-you-control` | 18 July 2026 |
| `/newsletter/expansion-recession-not-retention-problem` | 18 July 2026 |
| `/newsletter/cs-platform-org-chart-you-cant-edit` | 18 July 2026 |
| `/newsletter/renewal-clause-lawyers-wrote-cs-forgot` | 17 July 2026 |
| `/newsletter/the-expansion-moment-hiding-in-plain-sight` | 10 July 2026 |
| `/newsletters` | 5 July 2026 |
| `/newsletter/their-timeline-not-yours` | 17 June 2026 |
| `/newsletter/csm-promoted-to-babysitter-agent-supervisor` | 17 June 2026 |
| `/newsletter/cs-teams-courage-problem` | 17 June 2026 |
| `/newsletter/your-health-score-wont-save-you` | 17 June 2026 |
| `/newsletter/ai-wont-fix-customer-experience` | 23 May 2026 |

The submitted `/sitemap.xml` was submitted and last read on 24 August 2026 with `Success` status and 62 discovered pages. The indexing report predates that sitemap read, so its 18 known-page total should not be compared directly with 62 discovered pages as if both were measured at the same time.

## Decisions

1. **Do not consolidate the health-score archive yet.** There is no query evidence selecting a winner. Keep the curated hub and the five issue URLs intact through the recrawl window.
2. **Do not declare the internal-link graph successful yet.** Review indexed-page count from 7 September 2026, at least two weeks after the merged graph and successful sitemap read.
3. **Treat `/newsletters`, `/playbook`, and `ai-didnt-kill-customer-success` as CTR candidates, not proven failures.** Each has at least 20 impressions and zero clicks, but recent crawlability and metadata changes need a clean observation window. Review on 21 September before changing one surface at a time.
4. **Recheck the two crawled-not-indexed pages first.** They now have sitemap and internal-link support. If they remain excluded after the recrawl window, inspect the live canonical, rendered content, duplication and Google-selected canonical before requesting validation.
5. **Optimize for indexed, qualified entrances before publishing more search pages.** The current bottleneck is archive discovery and useful search demand, not a shortage of URLs.

## Review schedule

| Date | Decision |
|---|---|
| 7 September 2026 | Compare indexed and crawled-not-indexed counts; verify whether the internal-link graph and fresh sitemap expanded known/indexed coverage. |
| 21 September 2026 | Re-run the three-month page and query tables; choose at most one CTR test if a page still has at least 20 impressions and no clicks. |
| After any health-score query reaches 20 impressions | Identify Google-selected page by query, then decide whether consolidation, clearer differentiation, or no change is warranted. |

## Stop and integrity rules

- Do not infer rankings from local crawls.
- Do not use individual searcher data, screenshots, or raw exports in the repository.
- Do not call a CTR winner below the written evidence threshold.
- Do not redirect an archive issue solely because its title resembles another issue.
