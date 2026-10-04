# Flagwatch scan signal design

## Goal

Make the public calendar show what Flagwatch actually read, repair false successful scans on JavaScript-only sites, and preserve the rule that Discord alerts require current official evidence.

## Scanner

- Keep CTFtime as the event source.
- Read the official homepage, useful metadata, same-origin rule links, and bounded same-origin sitemap entries.
- Reject empty JavaScript shells as successful source reads.
- Keep raw fetch errors private. Publish only safe states: `read`, `limited`, `failed`, or `not_checked`.
- A failed optional rule page does not discard useful current homepage evidence.
- A failed homepage retains the last facts as stale.
- Missing AI rules remain `unknown`. Silence never becomes permission.
- Paid model fallback and outbound delivery remain disabled in Azure.

## Public contract

Each event adds source status, a short safe explanation, checked-page counts, rule-page counts, and the latest check time. The snapshot adds aggregate source and confirmed-policy counts. New fields are additive so old clients remain valid during rollout.

## Website

Keep the approved dark month calendar. Add a compact scan strip with last refresh, event count, sources read, sources needing recheck, and confirmed AI policies. Event details show a short scan ledger explaining the CTFtime import, official-source result, rules discovery, and alert decision.

Use cyan only for current confirmed AI-compatible events. Use amber for unverified, limited, conflicting, or stale evidence. Every state includes text.

## Discord

Replace plain reminder text with one compact embed. It shows reminder stage, title, start time, duration, team maximum, AI policy, exact evidence, and buttons for the event and calendar. Mentions remain disabled. The card is sent only for the existing eligible policies and stages.

## Verification and rollout

- Unit tests cover readable metadata, empty shells, sitemap discovery, partial scans, stale retention, public aggregates, and schema compatibility.
- Browser tests cover the scan strip, event ledger, keyboard access, mobile layout, and axe.
- Bot tests cover embed structure, bounded content, URL buttons, nonce dedupe, and disabled mentions.
- Deploy the bot compatibility update first, then the Function and static site.
- Verify the live API, calendar, accessibility, bot readiness, and neighboring Discord workspace state.
