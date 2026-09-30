# Branded Calendar And Discord Alert Signup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put Flagwatch on `calendar.kitsunetechnologies.org`, make AI rules the primary event verdict, and add a public Discord calendar channel with opt-in role pings.

**Architecture:** Keep the existing Azure site, Function, and Litterbox bot. Add one Caddy reverse-proxy host, one managed Discord role, a narrow public-calendar permission profile, button-based role updates, and role-only mentions on already eligible reminders.

**Tech Stack:** Static HTML/CSS/JavaScript, Python browser tests, TypeScript, discord.js, Vitest, Azure Static Web Apps and Functions, Caddy JSON.

## Global Constraints

- Missing, stale, conflicting, or human-only AI rules never trigger Discord reminders.
- The alert role stays non-mentionable to ordinary members.
- Discord mutations target only the registered calendar channel and new managed alert role.
- No unrelated role, channel, category, message, permission, or production route is deleted.
- User-facing copy uses ASCII punctuation and Moo's voice rules.
- The public site meets WCAG 2.2 AA plus the Kitsune accessibility standard.
- Shared Caddy changes use a live-file patch, backup, validate, health checks, rollback, and delayed recheck.

---

### Task 1: Promote AI rules in the event dialog

**Files:**
- Modify: `site/app.js`
- Modify: `site/app.css`
- Test: `tests/browser/test_public_calendar.py`

**Interfaces:**
- Consumes: existing public event fields `ai_policy`, `ai_policy_reason`, `ai_policy_evidence`, `ai_policy_source`, `analysis_stale`, `ai_policy_conflicting`, and `source_checked_at`.
- Produces: the first event-detail section with class `policy-verdict`, a visible `.policy-status`, and an in-card official rules link.

- [ ] **Step 1: Write failing browser assertions**

```python
page.locator("button.event-chip").first.click()
verdict = page.locator("#event-detail-body > .policy-verdict")
expect(verdict).to_be_visible()
expect(verdict.locator(".policy-status")).to_contain_text("Verified")
expect(verdict.get_by_role("link", name="Read official AI rules")).to_have_attribute(
    "href", "https://example.test/rules"
)
```

Add unknown, stale, and human-only fixtures. Assert that each shows `No Discord alert` and that no source button exists when no safe source URL is present.

- [ ] **Step 2: Run the focused test and confirm the old banner fails the new contract**

Run: `uv run pytest tests/browser/test_public_calendar.py -q`

Expected: failure because `.policy-verdict`, `.policy-status`, and the in-card source action do not exist.

- [ ] **Step 3: Implement the verdict renderer**

```javascript
function policyVerdict(event) {
  const confirmed = policyIsConfirmed(event);
  const eligible = confirmed && ["ai_native", "ai_assisted"].includes(event.ai_policy);
  const source = event.ai_policy_source
    ? `<a class="policy-source" href="${escapeHtml(event.ai_policy_source)}" target="_blank" rel="noopener noreferrer">Read official AI rules</a>`
    : "";
  return `<section class="policy-verdict ${policyClass(event)}" aria-labelledby="ai-rules-title">
    <div class="policy-heading"><p class="eyebrow">AI rules</p><span class="policy-status">${confirmed ? "Verified" : "Needs recheck"}</span></div>
    <h3 id="ai-rules-title">${escapeHtml(policyLabel(event))}</h3>
    <p>${escapeHtml(display(event.ai_policy_reason, "No published AI rule was found."))}</p>
    ${event.ai_policy_evidence ? `<blockquote>${escapeHtml(event.ai_policy_evidence)}</blockquote>` : ""}
    <div class="policy-actions">${source}<strong>${eligible ? "Subscribed members can be pinged" : "No Discord alert"}</strong></div>
  </section>`;
}
```

Place `policyVerdict(event)` before the source ledger. Add responsive, focus-visible, contrast, and high-contrast styles without color-only status.

- [ ] **Step 4: Run browser and static verification**

Run: `uv run pytest tests/browser/test_public_calendar.py tests/test_web.py -q`

Expected: all selected tests pass at desktop and 320 px, including axe and keyboard cases.

- [ ] **Step 5: Commit**

```text
feat: make AI rules the primary event verdict
```

### Task 2: Add the managed calendar alert role and public channel profile

**Files:**
- Modify: `src/workspace/manifest.ts`
- Modify: `src/discord/rest-workspace.ts`
- Modify: `src/discord/manifest.ts`
- Test: `test/workspace-planner.test.ts`
- Test: `test/rest-workspace.test.ts`
- Test: `test/managed-resources.test.ts`

**Interfaces:**
- Produces: managed key `role.calendar`, access profile `public-calendar`, and component IDs `ctf:calendar:subscribe` and `ctf:calendar:unsubscribe`.
- Consumes: the existing registry schema and guarded create-only planner.

- [ ] **Step 1: Add failing manifest and permission tests**

```typescript
expect(workspaceManifest).toContainEqual({
  key: "role.calendar",
  kind: "role",
  name: "CTF Calendar Alerts",
  mentionable: false,
});
expect(calendarSpec).toMatchObject({ access: "public-calendar", parentKey: undefined });
expect(calendarOverwrites.find((item) => item.type === 1)?.allow)
  .toBe((normal | PermissionFlagsBits.ManageChannels | PermissionFlagsBits.ManageMessages | PermissionFlagsBits.MentionEveryone).toString());
```

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `npm test -- --run test/workspace-planner.test.ts test/rest-workspace.test.ts test/managed-resources.test.ts`

Expected: failure because the role, access profile, and permission are absent.

- [ ] **Step 3: Implement the manifest and permission profile**

Add `role.calendar` before the category resources. Change the calendar channel to no parent and `public-calendar`. Return public read-only overwrites plus the bot overwrite with `MentionEveryone`. Keep the role itself non-mentionable.

- [ ] **Step 4: Run focused tests**

Run: `npm test -- --run test/workspace-planner.test.ts test/rest-workspace.test.ts test/managed-resources.test.ts`

Expected: all selected tests pass and the planner reports exactly one create for `role.calendar` against the current managed snapshot fixture.

- [ ] **Step 5: Commit**

```text
feat: add managed calendar alert role
```

### Task 3: Add subscribe controls and role-only reminder pings

**Files:**
- Modify: `src/discord/interactions.ts`
- Modify: `src/discord/router.ts`
- Modify: `src/flagwatch/runtime.ts`
- Modify: `src/flagwatch/publisher.ts`
- Modify: `src/flagwatch/scheduler.ts`
- Test: `test/roles.test.ts`
- Test: `test/flagwatch-publisher.test.ts`
- Test: `test/flagwatch-runtime.test.ts`
- Test: `test/flagwatch-scheduler.test.ts`

**Interfaces:**
- Produces: `handleCalendarSubscription(action, member, roleId)`, a cyan intro embed with two buttons, and reminder payloads that mention one registered role.
- Consumes: `managedResources.roles.calendar`, the current channel ID, and the existing fail-closed eligibility scheduler.

- [ ] **Step 1: Add failing subscription and payload tests**

```typescript
expect(await handleCalendarSubscription("subscribe", member, calendarRoleId))
  .toBe("Calendar alerts are on. You will only be pinged for events with current official AI rules.");
expect(member.roles).toContain(calendarRoleId);
expect(reminder.content).toBe(`<@&${calendarRoleId}>`);
expect(reminder.allowed_mentions).toEqual({
  parse: [], users: [], roles: [calendarRoleId], replied_user: false,
});
```

Assert that unknown, stale, conflicting, and human-only fixtures publish nothing. Assert startup returns `null` when either the channel or role is absent.

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `npm test -- --run test/roles.test.ts test/flagwatch-publisher.test.ts test/flagwatch-runtime.test.ts test/flagwatch-scheduler.test.ts`

Expected: failure because the subscription actions, role lookup, buttons, and role mention are absent.

- [ ] **Step 3: Implement subscription updates**

```typescript
export async function handleCalendarSubscription(
  action: "subscribe" | "unsubscribe",
  member: MemberRoleAdapter,
  calendarRoleId: string,
) {
  if (action === "subscribe") {
    if (!member.hasRole(calendarRoleId)) await member.addRole(calendarRoleId);
    return "Calendar alerts are on. You will only be pinged for events with current official AI rules.";
  }
  if (member.hasRole(calendarRoleId)) await member.removeRole(calendarRoleId);
  return "Calendar alerts are off.";
}
```

Route only the two exact custom IDs. Resolve the role from the current managed registry immediately before applying it.

- [ ] **Step 4: Implement intro updates and reminder mentions**

The intro embed uses footer marker `litterbox-flagwatch-calendar-v2`, two role buttons, and the branded calendar link. Extend the sender with `patch`. When the stored intro operation has a message ID, update that exact bot-authored message once per process startup. New reminder messages set `content` to the role mention and allow only that role ID.

- [ ] **Step 5: Run focused and full bot verification**

Run: `npm test -- --run test/roles.test.ts test/flagwatch-publisher.test.ts test/flagwatch-runtime.test.ts test/flagwatch-scheduler.test.ts`

Run: `npm test -- --run; npm run typecheck; npm run build; npm audit --omit=dev`

Expected: all tests pass, TypeScript builds, and the production audit reports zero vulnerabilities.

- [ ] **Step 6: Commit**

```text
feat: add opt-in Flagwatch alert pings
```

### Task 4: Add the guarded live Discord migration

**Files:**
- Create: `scripts/migrate-calendar-channel.ts`
- Modify: `scripts/verify-workspace.ts`
- Modify: `package.json`
- Test: `test/calendar-migration.test.ts`

**Interfaces:**
- Produces: pure `planCalendarMigration()` plus `npm run workspace:migrate-calendar`.
- Consumes: registered `role.calendar` and `channel.calendar`, a fresh guild snapshot, an expected plan hash, and the permission builder.

- [ ] **Step 1: Add a failing pure migration test**

```typescript
expect(planCalendarMigration(snapshot, registry)).toEqual({
  channelId: calendarChannelId,
  parentId: null,
  position: 2,
  roleId: calendarRoleId,
  changed: true,
});
```

Add cases for a missing registered ID, wrong live channel name, and already-correct state.

- [ ] **Step 2: Run the test and confirm failure**

Run: `npm test -- --run test/calendar-migration.test.ts`

Expected: failure because the migration module does not exist.

- [ ] **Step 3: Implement the bounded migration**

The script reads current registry and Discord state, refuses unmanaged IDs, checks the supplied current setup plan hash, updates only the calendar channel parent, position, topic, and permission overwrites, then prints a receipt with IDs and counts but no token. It never deletes a resource.

- [ ] **Step 4: Extend workspace verification**

Verify `role.calendar` exists and is non-mentionable, the calendar is top-level at position 2 or higher in the top section, the access profile matches, and the intro has subscription controls.

- [ ] **Step 5: Run focused and full bot verification**

Run: `npm test -- --run test/calendar-migration.test.ts test/workspace-planner.test.ts; npm run typecheck; npm run build`

Expected: all selected tests pass and the build exits zero.

- [ ] **Step 6: Commit**

```text
feat: add guarded calendar channel migration
```

### Task 5: Deploy the branded host and integrated changes

**Files:**
- Modify: live Azure Function CORS setting through the existing deploy path
- Modify: live `/etc/caddy/caddy.json` on pleX through an idempotent remote patch
- Modify: the current Flagwatch and bot deployment artifacts

**Interfaces:**
- Produces: `https://calendar.kitsunetechnologies.org/` and a live Discord signup flow.
- Consumes: the already deployed Azure site and Function, wildcard DNS, and the verified managed Discord registry.

- [ ] **Step 1: Verify isolated worktrees and run baselines**

Create clean worktrees from Flagwatch `main` and bot `feature/ctf-bot-live`. Run the full existing test suites before editing.

- [ ] **Step 2: Deploy bot compatibility first**

Apply the current guarded workspace plan to create only `role.calendar`. Run the calendar migration with the exact current plan hash. Deploy and restart only the verified live bot process on the background desktop.

- [ ] **Step 3: Verify Discord before enabling pings**

Run workspace verification, `/ready`, a read-only channel-position snapshot, and a bot-owned subscription interaction test. Confirm the role is non-mentionable and only Litterbox can ping it.

- [ ] **Step 4: Deploy Flagwatch site and Function changes**

Back up the live database and app settings. Deploy the static site and add `https://calendar.kitsunetechnologies.org` to Function CORS while preserving the existing Azure origin and disabled paid-AI settings.

- [ ] **Step 5: Add the Caddy route with rollback**

Broadcast the shared-infra edit. Snapshot the Azure origin plus at least two neighboring public hosts. Back up the current live Caddy JSON, patch the live file idempotently, validate, reload, and automatically restore the backup if any health check regresses.

- [ ] **Step 6: Run live verification**

Check HTTP 200 and TLS for the branded host, event popup rule prominence, API data, both public pages, Discord channel placement, subscription role behavior, bot readiness, and zero unexpected workspace changes. Run the a11y audit on `/` and `/accessibility`.

- [ ] **Step 7: Delayed shared-infra recheck**

After about two minutes, confirm the Caddy host matcher still exists, the TLS handshake succeeds, the page returns 200, and neighboring hosts retain their pre-change status.

- [ ] **Step 8: Record the live receipt**

Append the route backup, deployment commits, live URLs, workspace counts, test counts, and any remaining limitation to the current Kimi session note and moo-context handoff.
