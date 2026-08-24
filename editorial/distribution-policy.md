# Churn Is Dead distribution policy

The website is the canonical publication. Distribution exists to earn qualified readers, not to create a larger content-production machine.

## Channel roles

- Website: the complete Tuesday issue, evidence, playbook, and permanent canonical URL.
- LinkedIn: the primary discovery channel. Publish one adapted post after the website is live. Use a second post only when it adds a distinct operator insight rather than repeating the launch post.
- LinkedIn Newsletter: run the approved four-edition weekly reactivation block in the existing `Churn is Dead` publication. Each Wednesday edition must be a substantial native adaptation with one tagged canonical link and must replace, not duplicate, the calendar slot. After the block, continue weekly only if aggregate qualified actions or acquired website subscribers justify it; otherwise reduce to monthly.
- Medium: import one or two evergreen issues per month after the canonical version is live. Use Medium's import tool, retain the canonical URL, add the required AI-assistance disclosure, and review formatting manually.
- Communities: share only where the operating problem is already being discussed. Do not broadcast identical copy across groups.

## Approval gate

External copy can be drafted automatically from approved source material, but it cannot publish automatically. `distribution-approval.json` records approval separately for LinkedIn and Medium.

## Attribution convention

Use these campaign parameters on external links:

`utm_source`: `linkedin`, `medium`, or the community hostname

`utm_medium`: `post`, `newsletter`, `article`, or `community`

`utm_campaign`: the canonical issue slug or a short campaign name

`utm_content`: a stable, non-personal label for the specific asset or placement, such as `tuesday_launch`, `follow_up`, or `linkedin_newsletter`

Never put email addresses, names, customer data, or free-text audience descriptions in campaign parameters.

Use one `utm_content` value per published asset. Do not change the label after publication. Compare unique sessions, subscriptions, and useful playbook activity by variant, not raw impressions alone.

## Eight-week growth test

Weeks 1 and 2 establish the page-view, form-view, form-submit, signup, share, and playbook-open baseline.

Weeks 3 and 4 test two LinkedIn openings for the same issue: a hard operating problem and a practical framework. The website CTA and article remain unchanged so the source of lift is knowable.

The active four-edition LinkedIn Newsletter block runs independently under `CID-004` because Kuber explicitly activated the dormant 680-subscriber publication. Medium remains held until the block produces a readout and the selected canonical article is live.

Weeks 7 and 8 keep only the channel and format combinations producing subscriber growth or meaningful playbook use.

Initial operating target: return to at least 20 net new subscribers per month by the end of the test. Recalibrate after two weeks of complete funnel data.
