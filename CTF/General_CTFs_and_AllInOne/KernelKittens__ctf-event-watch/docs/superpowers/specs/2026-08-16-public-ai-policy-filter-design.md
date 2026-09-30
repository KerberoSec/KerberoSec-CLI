# Flagwatch public AI-policy filter

## Goal

The public calendar must omit CTFs whose verified rules prohibit all AI-assisted challenge work. CTFs that ban only autonomous solvers remain eligible. Events with missing or conflicting AI rules remain visible as unverified, but they cannot trigger a Discord alert.

## Boundary

Apply the visibility rule while building the public snapshot. The private database and operator dashboard keep every imported event and its evidence so a bad classification can be audited and corrected.

The public snapshot includes these policies:

- `ai_native`
- `ai_assisted`
- `unknown`, including conflicting or stale analysis

It excludes current, non-conflicting `human_only` findings. A stale or conflicting retained `human_only` finding is public as unverified because it is no longer a confirmed current ban.

This pass does not enable Discord, add reminder scheduling, publish the repository, or add an MIT license.

## Calendar copy

Add a short note above the calendar: "Events with a confirmed ban on all AI use are omitted. Unverified rules never trigger alerts."

## Verification

- A focused snapshot test proves confirmed `human_only` events are absent while AI-assisted, unknown, stale, and conflicting events remain.
- The full Python test suite, Ruff, formatting check, and strict mypy pass.
- Browser tests and the accessibility audit cover the changed public page.

## Failure behavior

Unknown, conflicting, and stale rules fail closed for alerts without emptying the public calendar. A confirmed full AI ban never reaches the public API, so the browser cannot accidentally render it.
