---
name: osint
description: OSINT CTF: username/email/domain/IP investigations, wayback, public records, metadata
---

# OSINT CTF

Start from the clue exactly as given. The "target" is what's written in the challenge description; do not expand scope beyond it.

## Workflow

1. Identify the pivot points in the clue: username, email, domain, IP, hash, phone, image, location, handle, repository, key fingerprint.
2. For each pivot, enumerate the chain of plausible platforms (github, reddit, twitter/X, linkedin, instagram, keybase, pastebin, telegram, discord, emailrep-style, haveibeenpwned-style, whois, crt.sh, wayback, robtex, virustotal passives, linkedin, github).
3. Pull the layers; each layer feeds the next.

## Techniques by pivot

**Username / handle**
- Cross-platform enumeration: check major services with predictable URL patterns.
- Look at: account creation dates, posting history, linked pages in bios, same-handle-breach appearances in public dump indexes.

**Email**
- Emailrep-style lookups, haveibeenpwned for breach context, public gravatar (md5 hash of lowercase email).
- Git commit search: `git log --all --pretty=full | grep <email>` on relevant repos; `gh search commits <email>` via web.

**Domain / IP**
- Passive DNS, crt.sh for subdomains, whois history, wayback for site history, robtex-style DNS graphing.

**Image**
- EXIF already covered in forensics; reverse image search; geolocation from background clues; Purple-Team-style maps knowledge.

**Code / repo**
- Search unique strings/keys. Public repo history: deleted commits (wayback on github), dangling blobs, `git fsck --lost-found`, chase keys and tokens.

**Hash**
- Pre-image via public rainbow tables / crackstation-style; crack locally with john against rockyou when offline.

**Phone / person**
- Carrier lookup, public records where lawful, social graph lookup by name and location.

## Deep dives (load on demand)

`osint-geolocation` (reverse image/geo), `osint-social` (Twitter/X, Tumblr...), `osint-web` (dorking/DNS/whois/wayback).

## Discipline

- Document sources in the writeup: URL + what it returned.
- Do NOT create accounts to contact humans; passive only. Read-only access to public data.
- A flag is only submitted after it matches the platform format AND the chain that produced it is recorded.
