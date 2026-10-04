# Source and attribution policy

Flagwatch collects public CTF schedule, rules, registration, and aggregate platform information. It is designed to show its work instead of presenting model guesses as facts.

## Sources

Supported inputs are:

- The official CTFtime API, when an operator explicitly enables it
- Organizer-published ICS and JSON feeds
- Official organizer calendars and event pages
- Official event and rules pages
- Public CTFd and rCTF API data

CTFtime is optional. Flagwatch does not crawl CTFtime pages or bypass its access controls.

## Organizer-page discovery

The watch-page connector starts from an operator-configured public URL. It reads schema.org Event JSON-LD and up to the configured number of same-origin event links. It rejects embedded credentials, private or loopback destinations, cross-origin crawl expansion, oversized responses, and redirect chains that leave the allowed public destination.

Flagwatch does not solve CAPTCHAs, use authenticated browser sessions, evade anti-bot controls, or continue through a login wall. Operators should disable a source when its owner does not permit automated access.

## Evidence and conflicts

Each event keeps source references with the source name, kind, URL, record ID, and collection time. Rules intelligence includes an exact quote and the page that contained it. A model claim is discarded if the quote cannot be found in the fetched text.

When sources disagree, Flagwatch records both values and both source URLs. The lower-precedence official source supplies the displayed value. Safety-relevant conflicts suppress alerts until reviewed or resolved by newer evidence.

## Public and private data

The public snapshot may include event schedule, public rules, public source citations, challenge counts, visible solve totals, public scoreboard size, participant totals, and category counts.

It must not include player identities, private solves, team membership, email addresses, flags, challenge secrets, admin data, bot credentials, webhook URLs, API tokens, or private Discord telemetry. Private CTF operations belong in a separate private service and repository.

## Retention and availability

The default window includes events that overlap the previous 31 days and next 90 days. A source outage does not erase the current public snapshot. Stale or incomplete evidence stays labeled and cannot trigger alerts.
