# Flagwatch permanent availability, history, and intelligence implementation plan

> **For Codex:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task by task.

**Goal:** Keep the public calendar responsive 24/7, retain the prior month of CTFs, and publish evidence-backed event and rules intelligence.

**Architecture:** Preserve the existing Static Web App and Flex Consumption Function, add one always-ready HTTP instance, make the API and browser serve last-good data during transient failures, widen and chunk the CTFtime import range, and enrich each event with cached DeepSeek V4 Pro claims that pass exact-evidence validation.

**Tech Stack:** Python 3.13, Pydantic, httpx, Azure Functions Flex Consumption, Azure Blob Storage, vanilla HTML/CSS/JavaScript, pytest, Playwright, axe.

---

### Task 1: Lock the new contracts in failing tests

**Files:**
- Modify: `tests/test_config.py`
- Modify: `tests/test_ctftime.py`
- Modify: `tests/test_sync.py`
- Modify: `tests/test_llm_validation.py`
- Modify: `tests/test_public_snapshot.py`
- Modify: `tests/test_function_app.py`
- Modify: `tests/test_azure_artifacts.py`
- Modify: `tests/browser/conftest.py`
- Modify: `tests/browser/test_public_calendar.py`
- Modify: `tests/fixtures/public_snapshot.json`

Add tests for a 31-day lookback, bounded CTFtime windowing and deduplication, strict sourced intelligence validation, content-hash reuse, public history cutoff, in-process API fallback, browser retry and saved snapshot behavior, visible past events and sourced intelligence, and the Azure always-ready contract. Run the targeted tests and record the expected failures.

### Task 2: Add the history range

**Files:**
- Modify: `src/flagwatch/config.py`
- Modify: `src/flagwatch/cli.py`
- Modify: `src/flagwatch/sync.py`
- Modify: `src/flagwatch/sources/ctftime.py`
- Modify: `src/flagwatch/public_snapshot.py`

Add `ctftime_lookback_days` with a 31-day default. Query from the lookback boundary through the lookahead boundary. Split CTFtime calls into bounded windows, merge duplicate events by key, and filter the public snapshot at the exact history cutoff.

### Task 3: Add evidence-backed event intelligence

**Files:**
- Modify: `src/flagwatch/domain.py`
- Modify: `src/flagwatch/analysis/llm.py`
- Modify: `src/flagwatch/cli.py`
- Modify: `src/flagwatch/sync.py`
- Modify: `src/flagwatch/public_snapshot.py`

Define bounded intelligence claim and result models. Request strict DeepSeek output from public source documents, validate every quote against its declared URL, normalize generated text, and discard unsupported claims. Fingerprint normalized source documents and reuse prior verified intelligence when the source fingerprint is unchanged. Preserve last-good claims on fetch or model failures.

### Task 4: Make reads resilient

**Files:**
- Modify: `azure-functions/function_app.py`
- Modify: `site/app.js`
- Modify: `site/index.html`
- Modify: `site/app.css`

Enable configured AI use in the timer Function. Cache the last successfully downloaded public snapshot in the warm worker and serve it on a later Blob failure. Add bounded browser retries and a versioned last-good localStorage record. State clearly when saved data is being shown. Render completed-event markers and grouped evidence-backed intelligence.

### Task 5: Make the permanent Azure settings reproducible

**Files:**
- Modify: `scripts/deploy-azure.ps1`
- Modify: `azure-functions/local.settings.example.json`
- Modify: `.env.example`
- Modify: `README.md`

Set the 31-day lookback, DeepSeek V4 Pro model, and one always-ready HTTP instance without committing a credential. Keep the API key in Azure configuration. Restrict CORS to the Static Web App origin and both approved calendar domains. Verify the live Function scale configuration after applying it.

### Task 6: Verify the release remotely

Run formatting, lint, type checks, unit tests, and the complete Playwright suite on the isolated Azure development VM. Render the public calendar at desktop and mobile widths and inspect the screenshots. Run automated accessibility checks on every public page and fix critical or serious findings.

### Task 7: Cut over shared production with rollback ready

Snapshot `state/flagwatch.db` and `public/events.json`, record the current Function deployment package, then apply always-ready capacity and deploy the verified Function and site artifacts. Configure the DeepSeek credential without printing or committing it. Trigger one initial enrichment sweep and retain the previous snapshot until the new one is complete.

### Task 8: Prove the live contract and clean up

Verify the Function origin, Static Web App origin, and `calendar.kernelkittens.team` repeatedly. Confirm August 2026 includes finished events, open several event dossiers, verify source links and exact quotes, confirm the API timestamp advances, inspect Azure scale settings, and run the public accessibility audit. Push the verified source, update durable notes, delete the temporary development resource group, and prove every task-owned Azure resource is gone.
