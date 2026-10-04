# Flagwatch domain, AI rules, and Discord signup design

## Goal

Publish Flagwatch at `calendar.kitsunetechnologies.org`, make the AI rule verdict impossible to miss when an event opens, and let Discord members opt into calendar alerts without joining a challenge category.

## Adopt, fork, or build

- Adopt the existing Azure Static Web App, Azure Function, scanner, and Litterbox managed workspace.
- Add a Caddy route in front of the existing site. Do not create another app or copy of the calendar.
- Extend the existing Discord button and managed-role patterns. Do not add a second bot, external role service, or DM subscription store.

## Public domain

`calendar.kitsunetechnologies.org` is a public Caddy route on pleX. The wildcard DNS record already reaches pleX, so no DNS mutation is required. Caddy proxies the branded host to the existing Azure Static Web App and sends the Azure origin host upstream. The Azure Function accepts the branded site origin in addition to the existing Static Web App origin.

The route follows the shared-infrastructure protocol: broadcast first, snapshot affected and neighboring services, back up the current live JSON, patch the live file idempotently, validate before reload, recheck HTTP and TLS immediately, and recheck the route after about two minutes. Revert automatically if the new host or a neighboring host regresses.

## Event dialog

The first content below the event title is an AI RULES verdict card. It contains:

- a large verdict: AI native, AI assisted, AI-assisted solving prohibited, conflicting rules, needs recheck, or no published AI rule found;
- a short explanation and the exact evidence when available;
- a visible verification badge;
- a direct `Read official AI rules` link inside the card when a safe source URL exists;
- the source check time;
- a blunt alert line: eligible events can ping subscribed members, while stale, missing, conflicting, or human-only rules never ping them.

The source ledger remains below the verdict as supporting detail. The general event metadata follows afterward.

```text
+------------------------------------------------------+
| Event title                                          |
|                                                      |
| AI RULES                           VERIFIED / RECHECK |
| AI-assisted solving prohibited                       |
| Exact official evidence or clear missing-rule text   |
| [Read official AI rules]     No Discord alert         |
+------------------------------------------------------+
| Source check ledger                                  |
| Event schedule, team size, format, and other details |
+------------------------------------------------------+
```

The card keeps existing keyboard, mobile, contrast, reduced-motion, and screen-reader behavior. Status is always communicated in text, not color alone.

## Discord channel and subscriptions

`ctf-calendar` becomes a public top-level channel directly below `ctf-start-here`. It is removed from the operations category, but remains the same managed channel and keeps its message history.

Litterbox creates one managed role named `CTF Calendar Alerts`. The role is not mentionable by ordinary members. The calendar channel grants Litterbox the narrow channel permission required to mention it.

The intro becomes a cyan embed with:

- what appears in the channel;
- the fail-closed AI rule;
- a `Subscribe to alerts` button;
- an `Unsubscribe` button;
- a link to `https://calendar.kitsunetechnologies.org/`.

Buttons return private confirmations. They only add or remove the calendar alert role and do not change CTF workspace access. Leaving the challenge workspace does not remove the independent calendar subscription.

Eligible reminder cards mention only `CTF Calendar Alerts`. `allowed_mentions` contains exactly that role ID. Human-only, unknown, stale, or conflicting events are never published and never pinged.

## Managed workspace migration

The workspace manifest adds `role.calendar`, changes the calendar access profile to `public-calendar`, and removes its category parent. The guarded workspace planner creates only the missing role. A separate bounded migration validates the registered calendar channel ID, updates its parent and position, applies only the expected permission overwrites, and verifies the final live state.

The migration never renames or deletes another role, channel, category, or message. The live snapshot and setup plan hash are checked immediately before mutation.

## Failure behavior

- If the alert role is missing, Flagwatch scheduling stays disabled and logs a bounded configuration error.
- If a member role update fails, the button returns a private failure and does not claim success.
- If Discord rejects the role mention, the operation remains retryable and is not marked complete.
- If the Caddy route or branded-origin CORS check fails, keep the Azure hostname live and revert only the new Caddy route.
- Existing paid AI and unrelated outbound delivery settings remain disabled.

## Verification

- Browser tests cover verdict prominence, source link placement, missing and stale rules, keyboard dialog behavior, 320 px layout, and axe.
- Bot tests cover role creation, public calendar permissions, subscribe and unsubscribe actions, intro controls, exact role-only mentions, old-config disablement, and bounded copy.
- Full Flagwatch tests, Ruff, formatting, mypy, bot tests, typecheck, build, and dependency audit pass before deployment.
- Live checks cover the branded domain, Azure origin, API CORS, both public pages, Discord channel placement, subscription buttons, role mentionability, bot readiness, workspace verification, and absence of unexpected resources.
