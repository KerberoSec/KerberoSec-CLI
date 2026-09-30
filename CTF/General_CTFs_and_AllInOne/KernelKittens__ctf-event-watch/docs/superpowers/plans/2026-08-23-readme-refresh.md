# Flagwatch README Refresh Implementation Plan

> **For agentic workers:** Follow each task in order. Keep private Litterbox details out of this repository.

**Goal:** Replace the flat Flagwatch README with a polished, evidence-backed public project page and add the sanitized Kernel Kittens open-source banner.

**Architecture:** Documentation-only change. The README points to existing code, guides, screenshots, and the live deployment. No runtime behavior changes.

**Tech stack:** GitHub Markdown, Mermaid, PNG assets, Docker Compose documentation, GitHub private vulnerability reporting.

## Global constraints

- Work in an isolated Azure environment.
- Preserve the public/private repository boundary.
- Do not invent badges, uptime claims, maintainership claims, or security guarantees.
- Use plain ASCII punctuation in user-facing copy.
- Keep the supplied banner's pixels unchanged.

### Task 1: Record the approved README design

**Files:**

- Create: `docs/superpowers/specs/2026-08-23-readme-refresh-design.md`

**Steps:**

1. Add the approved audience, structure, trust claims, visual rules, and acceptance criteria.
2. Scan the document for private coordinates and prohibited punctuation.
3. Commit with `docs: record README refresh design`.

### Task 2: Record the implementation plan

**Files:**

- Create: `docs/superpowers/plans/2026-08-23-readme-refresh.md`

**Steps:**

1. Add exact files, validation commands, publication steps, and rollback boundary.
2. Verify every referenced repository path exists or is created by this plan.
3. Commit with `docs: plan README refresh`.

### Task 3: Add the public banner and rewrite the README

**Files:**

- Create: `assets/branding/kernel-kittens-github-1280x400.png`
- Modify: `README.md`

**Steps:**

1. Copy the sanitized banner without re-encoding it.
2. Add the banner, plain product statement, evidence-backed badges, live demo, and a current public month-calendar screenshot.
3. Add the capability table and collection flow.
4. Add exact Docker quick-start commands.
5. Add connector precedence, collection limits, model replacement, and LiteLLM details.
6. Add white-label configuration, API boundary, native development, documentation, contribution, security, and license sections.
7. Confirm that no private Discord, Azure, CTFd, player, or Litterbox coordinate appears.
8. Commit with `docs: overhaul public README`.

### Task 4: Validate the documentation

**Files:**

- Verify: `README.md`
- Verify: `docs/superpowers/specs/2026-08-23-readme-refresh-design.md`
- Verify: `docs/superpowers/plans/2026-08-23-readme-refresh.md`
- Verify: `assets/branding/kernel-kittens-github-1280x400.png`

**Steps:**

1. Run Markdown lint on the changed Markdown files.
2. Check README external links and every relative link.
3. Verify the banner is a 1280 by 400 PNG and compare its digest with the supplied sanitized source.
4. Scan changed text for em dashes, en dashes, smart quotes, private coordinates, and banned filler.
5. Run `git diff --check` and inspect the complete branch diff.
6. Request an independent review and fix every important finding.

### Task 5: Publish and verify GitHub

**Files:**

- Publication only.

**Steps:**

1. Push the documentation branch and open a pull request against `main`.
2. Enable GitHub private vulnerability reporting before publishing its README link.
3. Confirm the pull request is mergeable and review the rendered diff.
4. Merge without rewriting unrelated history.
5. Fetch the final README, banner, screenshot, live calendar, configured production API, and private reporting setting from their public URLs.
6. If publication fails, leave `main` unchanged and retain the branch for diagnosis.
