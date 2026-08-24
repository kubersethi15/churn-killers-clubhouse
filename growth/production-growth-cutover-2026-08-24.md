# Production growth-measurement cutover

**Published:** 24 August 2026  
**Verified production time:** 2026-08-24 05:29:38 UTC  
**Conservative clean-data cutoff:** 2026-08-24 05:30:00 UTC

## Live evidence

Lovable reported `Your website was updated`. A fresh request to the public
custom domain then returned:

- JavaScript asset: `/assets/index-CSg2W4Nx.js`
- deployment ID: `453bc5f7-6547-4ae1-b9cd-ec7e1d52c9df`
- HTTP date: `Mon, 24 Aug 2026 05:29:38 GMT`
- asset ETag: `a108ac93623ef009cadb0f80a3f59115`

The public bundle contains both allowed production host strings,
`churnisdead.com` and `www.churnisdead.com`. The previous public asset did not
contain the host allowlist and inserted directly into `growth_events`.

The public homepage HTML also contains one `data-seo="homepage-jsonld"` block
with the factual `WebSite`, `Organization`, and `Person` graph shipped in PR
#98.

## Measurement decision

No `growth_events` row before `2026-08-24T05:30:00Z` may support a rate, funnel
comparison, demand inference, or monetisation decision. The cutoff is rounded
up from the first verified guarded production response so the boundary cannot
include the earlier unguarded deployment.

Gate 0 requires both:

1. seven complete days after the clean-data cutoff; and
2. CID-001 closed at `2026-09-01T08:14:59Z`.

The earliest trustworthy aggregate read is therefore after the CID-001 close,
not 31 August. Minimum-evidence rules for each experiment continue to apply.

## Remaining corrective work

Claude's BC-01 PR #97 must replace the already-applied 05:10 cutoff with a
later corrective upsert to 05:30, encode both Gate 0 conditions, and add the
production-host regression contract. Do not merge it until those changes pass.

