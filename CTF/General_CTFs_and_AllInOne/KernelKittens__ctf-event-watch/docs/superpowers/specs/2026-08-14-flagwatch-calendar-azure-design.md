# Flagwatch public calendar design

## Product

Flagwatch is a public read-only month calendar for upcoming CTFs. The calendar is the whole product surface. It has no login, settings page, alert history, notification controls, or public sync action.

## Calendar

- Open on the visitor's current month.
- Keep a conventional Sunday-first, six-row month grid.
- Provide previous month, next month, and Today controls.
- Put CTF names and local start times directly in each date cell.
- Render multi-day CTFs on every date they occupy.
- Collapse crowded dates behind a keyboard-accessible `+N more` control.
- Preserve the selected month in the URL.
- Use a compact phone layout with date cells, event markers, and a selected-day list.

Clicking a CTF opens a dialog over the calendar on desktop and a bottom sheet on phones. The URL gains the event key so the same detail can be linked directly. Escape and clicking the backdrop close the detail.

## Event details

The detail view shows:

- exact start and finish in the selected timezone;
- duration and online or onsite status;
- team maximum, division, event format, and schedule mode;
- prizes, registration status, categories, CTFtime weight, organizers, and participant count when known;
- AI status, explanation, exact evidence quote, and source link;
- official event link, CTFtime link, and single-event ICS download.

Unknown values remain visible as `Unknown`. Events with a confirmed `human_only` policy are omitted from the public snapshot and calendar. AI-native, AI-assisted, unknown, conflicting, and stale events remain visible. Unknown, conflicting, and stale events cannot trigger alerts.

## Timezone

On the first visit, JavaScript reads the browser's IANA timezone. This is more accurate than IP geolocation when a visitor uses a VPN and does not send location data to another provider. The site asks the visitor to confirm the detected timezone or change it. A timezone button stays in the top-right corner. The choice is stored in local storage. Without JavaScript, the page falls back to America/Chicago.

## Visual direction

Use the approved clean-month direction. The surface is dark navy with thin grid lines, square corners, restrained cyan and amber status colors, and compact tabular labels. Cyan means AI allowed. Amber means unknown or stale. Text always accompanies color.

## Azure architecture

- Azure Static Web Apps Free serves the HTML, CSS, JavaScript, and icons.
- An Azure Functions Flex Consumption app runs Python 3.13.
- An anonymous read-only HTTP function returns the current public event snapshot.
- A timer function refreshes CTFtime and official rules every six hours.
- Azure Blob Storage holds the SQLite working database and the public JSON snapshot.
- Managed identity grants the Function App access to the private blob container.
- A separate `rg-flagwatch-web-prod` resource group in Central US isolates the site from the existing CTF bot resources.
- A $10 monthly Azure budget alert covers the new resource group.

No notification delivery is deployed in this release. Existing notification code remains local and dormant.

## Safety and failure behavior

- Official source URLs retain SSRF and response-size protections.
- Source text remains untrusted data.
- Unknown, conflicting, or stale AI policy stays fail-closed.
- Confirmed `human_only` events remain in private operator data for evidence and correction but never enter the public snapshot.
- A failed refresh leaves the last successful snapshot online and marks affected evidence stale.
- The public API exposes event facts and cited public evidence only. It never returns secrets, raw model responses, source payloads, sync failures, or notification configuration.
- Function and storage credentials stay in managed identity or ignored local deployment state.

## Accessibility and verification

- WCAG 2.2 AA minimum.
- Skip link, landmarks, real buttons, visible focus, native dialog semantics, Escape support, and reduced-motion handling.
- Month navigation, event selection, timezone confirmation, and details work by keyboard.
- Browser tests cover desktop and 320 px layouts, timezone selection, direct links, dialog behavior, and every public page with axe.
- Deployment is complete only after the live Azure URL returns the expected calendar, public API data, and accessibility results.
