# Public AI-policy Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hide confirmed full-AI-ban CTFs from Flagwatch's public calendar while retaining autonomous-solver-only and unverified events.

**Architecture:** Filter current, non-conflicting `human_only` records at the public snapshot boundary. Keep the private database unchanged, and explain the public rule in static calendar copy.

**Tech Stack:** Python 3.13, Pydantic, pytest, vanilla HTML, Playwright, axe.

## Global Constraints

- `ai_native`, `ai_assisted`, and `unknown` remain public.
- Current, non-conflicting `human_only` is private and omitted from the public snapshot.
- Stale or conflicting retained policy is public as unverified, even when its last policy value was `human_only`.
- Unknown, conflicting, or stale policy never triggers an alert.
- Discord delivery, reminder scheduling, licensing, and publication stay disabled.

---

### Task 1: Public snapshot visibility rule

**Files:**
- Modify: `tests/test_public_snapshot.py`
- Modify: `src/flagwatch/public_snapshot.py`

**Interfaces:**
- Consumes: `Database.list_events()` and `AiPolicy`.
- Produces: `build_public_snapshot(database, generated_at)` with confirmed current `human_only` events omitted.

- [ ] **Step 1: Write the failing test**

Add a test that stores AI-assisted, confirmed human-only, unknown, stale human-only, and conflicting human-only events, then asserts that only the confirmed current human-only key is omitted.

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `uv run pytest tests/test_public_snapshot.py::test_public_snapshot_omits_confirmed_full_ai_bans -q`

Expected: FAIL because the existing snapshot includes every stored event.

- [ ] **Step 3: Add the minimal filter**

Filter a record only when its policy is `AiPolicy.HUMAN_ONLY`, its analysis is current, and its evidence is not conflicting.

- [ ] **Step 4: Run the focused and full tests**

Run: `uv run pytest tests/test_public_snapshot.py -q`

Expected: all snapshot tests pass.

### Task 2: Public explanation and documentation

**Files:**
- Modify: `site/index.html`
- Modify: `README.md`
- Modify: `docs/superpowers/specs/2026-08-14-flagwatch-calendar-azure-design.md`

**Interfaces:**
- Consumes: the snapshot visibility rule from Task 1.
- Produces: accurate public copy and maintained architecture documentation.

- [ ] **Step 1: Add the calendar policy note**

Place this text near the calendar heading: `Events with a confirmed ban on all AI use are omitted. Unverified rules never trigger alerts.`

- [ ] **Step 2: Update maintained docs**

Replace claims that every event remains public. State that the private operator data retains omitted events for evidence and correction.

- [ ] **Step 3: Run browser and accessibility checks**

Run: `uv run pytest tests/browser -q`

Expected: all browser tests pass with no axe violations.

### Task 3: Full verification

**Files:**
- Verify only.

**Interfaces:**
- Consumes: Tasks 1 and 2.
- Produces: release evidence for the isolated branch.

- [ ] **Step 1: Run all checks**

Run: `uv run pytest -q`

Run: `uv run ruff check .`

Run: `uv run ruff format --check .`

Run: `uv run mypy --strict src`

Expected: every command exits 0.
