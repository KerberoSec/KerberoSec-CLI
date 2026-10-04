---
type: resource-note
status: done
created: 2026-02-15
updated: 2026-03-12
tags: [security-writeup, tryhackme, event, web, crypto]
source: TryHackMe: Love at First Breach 2026: When Hearts Collide
platform: tryhackme
room: Love at First Breach 2026: When Hearts Collide
slug: when-hearts-collide
path: TryHackMe/90-events/love-at-first-breach-2026/when-hearts-collide.md
topic: 90-events
domain: [web, crypto]
skills: [http-traffic-inspection, hash-functions, docker-tooling]
artifacts: [lab-notes, pattern-card]
sanitized: true
---

# Love at First Breach 2026: When Hearts Collide

## Summary

* The web app (“Matchmaker”) claims it pairs you with a dog by comparing the **MD5 hash** of your uploaded photo against dog snapshots.
* The upload flow hits a single endpoint (`POST /upload`). After uploading, the page shows whether a match exists.
* The core weakness is using **MD5 equality as an identity / matching primitive**. Because MD5 is collision-prone, you can craft two *different* files that share the same MD5.
* Practical exploit in this lab: generate two distinct JPEGs with the same MD5, upload the first (no match), then upload the second (hash matches what the app already saw) → the app reports a “match” and reveals the flag (visible after scrolling).

## Key Concepts

### Representation vs security decision

* A **hash** is a deterministic “fingerprint” of data. If the data changes, the hash usually changes.
* A security bug happens when a system treats a hash as a **unique identity** (e.g., “if hashes match, these files must be the same / trusted / already in our database”).

### MD5 (Message Digest 5)

* MD5 outputs a **128-bit** digest (often shown as 32 hex characters).
* In this room, the app’s story explicitly says it compares your photo’s **MD5** to dog snapshots.

### Collision (碰撞)

* A **collision** means two different files produce the same hash.
* If an app relies on “hash equality ⇒ same file” as logic, a collision can be used as a bypass.

* Invitation card provides the app URL (sanitize as `TARGET_URL`).
* Matchmaker page: “How we pair humans with dogs” explains MD5-based matching.
* Browser DevTools shows `POST TARGET_URL/upload` when uploading an image.
* Terminal shows a Docker-based MD5 collision workflow producing `collision1.jpg` and `collision2.jpg` with identical `md5sum`.

## Pattern Cards

### Pattern 1: Hash-as-Identity Anti-Pattern (把哈希当身份证)

* Symptom: “We check if your file already exists by MD5/SHA1” or “matching uses MD5 equality”.
* Risk: collision ⇒ attacker can make *different* content pass as “already seen / matching / trusted”.
* Lab signal: the UI literally advertises MD5 matching.

### Pattern 2: Observe the upload pipeline first

* Tooling: DevTools Network tab.
* What to look for: endpoint path (`/upload`), request method (POST), and whether the server returns a filename/token/hash.

### Pattern 3: Collision with a fixed prefix

* For image formats, you often need to preserve a valid header.
* A “prefix file” technique keeps the beginning of the output file consistent enough to remain a valid JPEG.

## Command Cookbook

> Use placeholders and keep this scoped to the lab VM.

### 3.1 Generate two colliding JPEGs via Docker

```bash
# 1) Pull the collision generator image
docker pull brimstone/fastcoll

# 2) Generate two outputs that share the same MD5
# --prefixfile keeps the JPEG header/structure compatible
docker run --rm -it \
  -v "$PWD:/work" -w /work -u "$UID:$GID" \
  brimstone/fastcoll \
  --prefixfile dog.jpg -o collision1.jpg collision2.jpg
```

### 3.2 Verify the collision

```bash
md5sum collision1.jpg
md5sum collision2.jpg
# Expect: SAME_HASH_VALUE  collision1.jpg
#         SAME_HASH_VALUE  collision2.jpg
```

### 3.3 Trigger the app logic

* Upload `collision1.jpg` → typically “no match”.
* Upload `collision2.jpg` → the app treats it as an identical fingerprint and reports a match; the flag appears on the page (scroll down).

## Evidence

* `assets/invite.png`: “My Dearest Hacker … access the web app here: TARGET_URL”.
* `assets/matchmaker-home.png`: landing page + upload box.
* `assets/how-it-works.png`: text explicitly saying matching is done by comparing your photo’s MD5 hash.
* `assets/network-upload.png`: DevTools shows `POST TARGET_URL/upload`.
* `assets/fastcoll-doc.png`: Docker usage for `brimstone/fastcoll`.
* `assets/terminal-fastcoll.png`: collision generation running.
* `assets/terminal-md5sum.png`: identical md5sum for `collision1.jpg` and `collision2.jpg`.

## Takeaways

* You can often solve “toy crypto” web labs by reading the UI copy literally; here it directly tells you the matching primitive (MD5).
* Network tab + one upload is enough to discover the functional API surface (`POST /upload`).
* Any system where user-controlled content is accepted and then compared by **MD5 equality** is structurally unsafe.

## 6) Recommendations (inference; general hardening)

* Don’t use MD5 for security decisions (identity, integrity, deduplication under adversarial input).
* Prefer collision-resistant hashes (e.g., SHA-256) for integrity *and* still avoid using “hash equality” as an authorization/match decision.
* Use server-side random IDs for uploaded objects; treat hashes as metadata, not identity.
