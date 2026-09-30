---

platform: tryhackme
room: "ROOM_TITLE"
slug: room-slug-kebab-case
path: "PATH_OR_SERIES_NAME"      # e.g., LinuxFundamentals / Network-Fundamentals / AoC 2025
topic: "00-foundations"          # one of: 00-foundations, 10-web, 20-linux, 30-windows, 40-networking, 50-crypto, 60-forensics, 70-cloud, 80-blue-team, 90-events
domain: ["linux"]                # choose 1-2 from TAGS.md Domain tags
skills: ["enum", "files-perms"]  # choose 2-5 from TAGS.md Skill tags
artifacts: ["lab-notes"]         # optional: concept-notes / cookbook / lab-notes / pattern-card / room-notes
status: "wip"                    # todo | wip | done
date: 2026-01-08
---

# ROOM_TITLE (TryHackMe)

<!-- Delete the guidance block below after using the template. -->
## Quick use

1. Fill front matter with canonical values from `TryHackMe/_meta/TAGS.md`.
2. Use public-safe placeholders such as `TARGET_IP`, `USER_A`, `example.com`, and `API_KEY_REDACTED`.
3. Prefer reusable patterns and reasoning over raw command history.
4. Run `SANITIZATION_CHECKLIST.md` before publishing the note.

## 0) Summary (2-5 bullets)

Keep this section short and high-signal. A reader should understand the room in under 30 seconds.

* **What this room trains:** ...
* **Main concepts:** ...
* **What I will reuse elsewhere:** ...

## 1) Key Concepts (plain language)

Explain the core ideas in plain language, not as a replay of task prompts.

* Concept A: ...
* Concept B: ...
* Pitfall: ...

## 2) Pattern Cards (generalizable)

Keep only patterns that transfer cleanly to other labs or real troubleshooting.

### Pattern 1: When I see X, I do Y

* **Signal:** ...
* **Hypothesis:** ...
* **Checks (minimal):**

  * `command ...`
  * `command ...`
* **Expected output:** ...
* **Next step decision:** ...

### Pattern 2: Common mistake & fix

* **Mistake:** ...
* **Why it happens:** ...
* **Fix:** ...

## 3) Command Cookbook (only what I actually used)

> Keep commands reproducible. Use placeholders and keep only the commands that mattered.

```bash
export T=TARGET_IP
# example:
# nmap -sS -sV -sC -p 22,80 -oA scans/tcp_targeted $T
```

* Notes:

  * Why this command: ...
  * What to look for: ...

## 4) Evidence (sanitized)

Keep this section evidence-shaped, but sanitize anything that should not be published.

* Screenshots/outputs stored under `assets/` (optional)
* Remove usernames, tokens, real domains/IPs

## 5) Takeaways (transfer learning)

End with what will change in your future workflow, not just what happened in this room.

* **1 thing I would do faster next time:** ...
* **1 check I keep forgetting:** ...
* **1 reference worth re-reading:** ...

## 6) References

Prefer official docs, vendor docs, standards, or the room itself.

* Official docs / vendor docs / standards
* Room link (optional)
