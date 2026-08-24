# CG-18 delayed canonical syndication operating plan

**Owner:** Codex  
**Status:** prepared; no external publication  
**Canonical home:** `https://churnisdead.com/newsletter/<slug>`

## Decision

Use Medium selectively through its import flow, after the website article is
live and after the active four-edition LinkedIn Newsletter block has produced
its readout. Medium documents that the import flow backdates the copy and adds a
canonical link to the original. The website therefore remains the original and
the Medium version remains useful in-platform.

Official policy evidence:

- Medium import and automatic canonical treatment:
  https://help.medium.com/hc/en-us/articles/214550207-Importing-a-post-to-Medium
- Medium manual canonical setting:
  https://help.medium.com/hc/en-us/articles/360033930293-Set-a-canonical-link
- DEV cross-posting and canonical URL support:
  https://dev.to/help/writing-editing-scheduling

LinkedIn Newsletter is already an active, separately attributed native
distribution block. It is not an additional CG-18 test. DEV is held until a
genuinely technical CS/AI workflow issue fits its audience; general CS essays
will not be sprayed there merely because canonical support exists.

## Selected website originals

### MED-001 — Product Friction Review

- Website canonical: `stealing-sprint-planning-from-engineering`
- Website publication: 25 August 2026 at 08:00 UTC
- Canonical-age gate: 8 September 2026 at 08:00 UTC
- Experiment-isolation gate: after CID-004 closes on 23 September 2026
- Planned manual Medium import: 24 September 2026 at 08:00 UTC
- Reader route: the Product Friction Review article and tool

### MED-002 — Renewal Evidence Packet

- Website canonical: `renewal-evidence-packet`
- Website publication: 1 September 2026 at 08:00 UTC
- Canonical-age gate: 15 September 2026 at 08:00 UTC
- Experiment-isolation gate: after CID-004 closes on 23 September 2026
- Planned only after MED-001's first 14-day read: 8 October 2026 at 08:00 UTC
- Reader route: the Renewal Evidence Packet article and tool

## Manual publication gate

For every Medium import:

1. confirm the website route returns HTTP 200;
2. confirm the rendered page names the exact website URL as canonical;
3. confirm the issue's `distribution-approval.json` records Medium approval;
4. use Medium's Import a story flow with the website URL;
5. manually check headings, source links, tool link, disclosure, and free-access
   status;
6. add the registered tracked footer link;
7. publish only with Kuber's action-time confirmation in the signed-in Medium
   session;
8. inspect the live Medium source for the exact canonical before recording it as
   published.

Medium was signed out when this route was prepared on 24 August. No login,
draft, or publication was attempted.

## Measurement and decision rule

Report unique tagged visits, qualified-action sessions, resource opens,
acquired subscribers, and current-active status. Do not call a winner below 20
unique tagged visits. Keep selective Medium syndication only if a post produces
an acquired subscriber, meaningful tool use, or a credible new collaboration.
After three imports with none of those signals, stop the surface rather than
increase volume.

The first import is reviewed after 14 days. MED-002 remains prepared but cannot
publish before that read. Website and LinkedIn results stay separate by source,
medium, campaign, and content labels.

