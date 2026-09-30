---
# Writeup title as it will appear on the site.
title: 'Challenge Name: Full Writeup'

# 1-2 sentence summary (shown on the listing card, in <meta description>, and when shared).
description: 'Short summary of the vulnerability and the solution.'

# Name of the CTF/platform that ran the challenge (shows up as the "Organizer" filter).
event: 'CTF Name'

# Category: must be exactly one of these values (lowercase, English):
# web | pwn | reverse | crypto | forensics | misc | osint | hardware
category: 'web'

# Subcategory: optional, free text. It's the specific vulnerability class within the category
# (shows up grouped by category in the sidebar filter: Web > IDOR, Web > XXE, Pwn > ROP...).
# Use a short, recognizable name: IDOR, XXE, SSTI, JWT, Path Traversal, Buffer Overflow,
# Format String, Heap Exploitation, RSA, etc. Delete this line if it doesn't apply.
subcategory: 'IDOR'

# Difficulty: optional. Delete this line if it doesn't apply.
# easy | medium | hard
difficulty: 'easy'

# Free-form tags (show up as the "Topic" filter and as #hashtags at the bottom of the writeup).
# Use kebab-case: sql-injection, jwt, race-condition, etc.
tags:
  - tag-one
  - tag-two

# Publish date (YYYY-MM-DD format). Sorts the listing and shows up as the "Month" filter.
pubDate: 2026-01-01

# Optional: only include if the writeup gets updated after being published.
# updatedDate: 2026-01-05

# Your name (shown on the card, at the top of the writeup, and in the "Author" filter). Required.
author: 'Your Name'

# true hides the writeup from the site (listing, RSS, sitemap) without deleting the file: # handy for writing incrementally before publishing. Flip to false when you're done.
draft: true
---

> [!NOTE/About the challenge]
> **Platform:** CTF Name
> **Category:** Web · **Difficulty:** Easy · **Points:** 100
> **Vulnerabilities:** list them here, in one sentence
> **Flag:** `FLAG{...}` (or "dynamic: changes on every instance", if that's the case)

A short opening paragraph: who this writeup is for, what the reader will understand by the end.

---

## 1. Context

Explain what the challenge is, what the application/binary/service does, and what the target seems
to offer before any exploitation.

## 2. Recon

How you mapped the target: endpoints, features, available source code, banners, etc. Show real
commands and output in code blocks.

```bash
command-you-ran --with-flags
```

## 3. Finding the vulnerability

The reasoning that led to identifying the flaw. If it makes sense, separate the hypotheses you
tested: including the ones that didn't pan out, which helps readers who are still learning.

> [!TIP/A key insight]
> Use this kind of block to highlight a key insight the reader shouldn't miss. Other types
> available: `[!NOTE]` (supporting info), `[!IMPORTANT]` (crucial point), `[!WARNING]` and
> `[!CAUTION]` (warnings). You can give it a custom title like above (`[!TIP/Title here]`).

## 4. Exploitation

The payload/exploit step by step, with the commands and the result of each step.

```json
{
  "example": "of a payload or API response"
}
```

## 5. Capturing the flag

How the flag was obtained and what the final result looks like (you can redact the real flag and
show only the format, if the platform requires confidentiality).

## 6. Lessons

The general takeaway: the root cause of the vulnerability and how it could have been prevented.

---

_Writeup for the [Challenge Name] challenge ([CTF Name] · Category · Difficulty)._
