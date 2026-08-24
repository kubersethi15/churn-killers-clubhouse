# LinkedIn profile conversion audit

**Captured:** 24 August 2026

**Scope:** Kuber Sethi's signed-in public profile. No viewer identities were inspected or recorded.

## Current conversion surfaces

- Headline: `AI First CS Strategist | Turning churn signals into revenue | Churn Is Dead newsletter`.
- Premium custom button: `View my newsletter` with the tracked `linkedin / profile / always_on / premium_button` URL.
- Profile views displayed by LinkedIn: 1,530.
- Search appearances displayed by LinkedIn: 133.
- Premium custom-button engagements in the seven-day content dashboard: 1.

The headline and custom button make the publication visible. The remaining profile does not carry that promise through.

## About-section gap

The About section describes Kuber's CS work, AI operating system, and CS Analyzer. It does not explain what Churn Is Dead publishes, who it is for, or why someone should subscribe.

Add this factual line at the beginning, without changing the rest of Kuber's existing profile claims:

> I publish Churn Is Dead every Tuesday: evidence-led operating systems and downloadable playbooks for CS leaders who want decisions, not theatre. View my newsletter above.

This is a profile conversion statement, not an editorial first-person experience claim.

## Featured-section gap

The current Featured order is:

1. AI-agent role post, activity `7472913435949694977`.
2. Customer Success courses post, activity `7464940935794290688`.
3. QBR framework comment-gate post, activity `7420731405036580864`.
4. Retention-signals infographic post, activity `7422541541107417088`.
5. Raw `https://churnisdead.com/` link card.

The owned destination is last and untracked. A profile visitor must move past four posts before seeing it.

Two featured posts also contain claims that are not supported by the repository's evidence or author-experience ledgers:

- the AI-agent post says more than 2,000 CS leaders read Churn Is Dead every Tuesday;
- the retention-signals post says ten signals tripled retention and one metric cuts churn by half below fourteen days.

Do not use these claims in future Churn Is Dead assets. Unfeature both posts. This does not require deleting the underlying LinkedIn posts.

## Pre-baseline change set

Apply before CID-001 starts, then keep the profile unchanged through 1 September:

1. Add the factual Churn Is Dead line to the beginning of About.
2. Put the Churn Is Dead link card first in Featured.
3. Replace its raw URL with:

   `https://churnisdead.com/?utm_source=linkedin&utm_medium=featured&utm_campaign=always_on&utm_content=newsletter_home`

4. Unfeature activity `7472913435949694977` and activity `7422541541107417088`.
5. Keep the courses and QBR posts only if the remaining claims are Kuber-authored and acceptable. Do not treat them as evidence for newsletter editorial claims.
6. Leave the Premium custom button unchanged.

## Measurement

Report the Featured link independently as `linkedin / featured / always_on / newsletter_home`.

The profile and Featured links are stable distribution infrastructure, not the CID-001 controlled launch variable. Do not change them during the baseline. Compare their tagged visits and acquired subscribers descriptively; do not infer that placement caused a difference without enough evidence.
