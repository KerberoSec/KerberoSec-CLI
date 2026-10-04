# 11: Shadow of the Panther

> **ZeroDay Heist 2026 · CyberHX**

---

## Challenge Info

| Field | Value |
|---|---|
| **Category** | OSINT |
| **Points** | 100 |
| **Difficulty** | Medium |
| **Solved At** | June 6, 2026: 3:40 AM |
| **Files** | `blackpanter_jungle.jpg`, `star_metal_shard.jpg`, `royal_mask_archive.jpg`, `talona_city_skyline.jpg` |

---

## Description

> The courier "Amara N'Kalo" vanished while transporting star-metal from the kingdom of Nyota. Four images were found at the scene. Follow the trail.

A multi-stage OSINT challenge built around a fictional courier who left clues across image metadata and a GitHub repository. Three flag fragments are hidden across different locations: README, deleted git history, and a disallowed robots.txt path.

---

## Approach

### Step 1: Extract EXIF Metadata from All 4 Images

The first move in any OSINT image challenge:

```bash
$ exiftool *.jpg
```

**Results:**

| Image | Key Metadata |
|---|---|
| `blackpanter_jungle.jpg` | `Comment: "The courier trusted code more than memory: amara-nkalo"` |
| `talona_city_skyline.jpg` | `Comment: "Look where robots are warned."` `Description: "Crawlers were told not to enter the silent path."` |
| `star_metal_shard.jpg` | `Comment: "TXT remembers what HTML hides."` `Description: "The final whisper is not on the page, but around the domain."` |
| `royal_mask_archive.jpg` | `Comment: "Check the deleted patrol route."` `Description: "History remembers what was removed."` |

Each image provides a different clue. Together, they form a complete roadmap.

### Step 2: Pivot to GitHub

The most direct clue: `"The courier trusted code more than memory: amara-nkalo"`

Username `amara-nkalo` → search GitHub:

```
https://github.com/amara-nkalo
```

Found: one public repository named **`royal-ledger`** (description: "Courier records from Talona archives").

---

### Fragment 1: README.md (Plaintext)

Navigate to:

```
https://github.com/amara-nkalo/royal-ledger/blob/main/README.md
```

The README contains a plaintext line:

```
The first fragment: CTF{panther_
```

**Fragment 1:** `CTF{panther_`

---

### Fragment 2: Deleted File in Git History

Clue from `royal_mask_archive.jpg`:
- `"Check the deleted patrol route."`
- `"History remembers what was removed."`

→ Git history contains deleted files that are still recoverable.

```bash
# Clone the repo
$ git clone https://github.com/amara-nkalo/royal-ledger
$ cd royal-ledger

# View all commits
$ git log --all --oneline

# Output:
# 5f12ba75 Delete patrol-route.txt
# edebd459 Update patrol-route.txt
# 4f02b35c Create patrol-route.txt   ← recover from here
```

Recover the file from the creation commit:

```bash
$ git show 4f02b35c:patrol-route.txt

# Output:
# Talona East Gate
# Archive Tower
# Second fragment: trails_
```

**Fragment 2:** `trails_`

---

### Fragment 3: robots.txt → Disallowed Path

Clues from `talona_city_skyline.jpg`:
- `"Look where robots are warned."` → robots.txt
- `"Crawlers were told not to enter the silent path."` → a Disallow entry

Also from `star_metal_shard.jpg`:
- `"TXT remembers what HTML hides."` → the .txt file holds the path, not the HTML page
- `"The final whisper is not on the page, but around the domain."` → GitHub Pages

The repo has a GitHub Pages site. Check its robots.txt:

```
https://amara-nkalo.github.io/royal-ledger/robots.txt
```

Contents:
```
User-agent: *
Disallow: /silent-claw
```

Visit the disallowed path:

```
https://amara-nkalo.github.io/royal-ledger/silent-claw
# or
https://amara-nkalo.github.io/royal-ledger/silent-claw.html
```

Page content: `Third Fragment: never_fade}`

**Fragment 3:** `never_fade}`

---

### Step 6: Assemble the Flag

```
CTF{panther_  +  trails_  +  never_fade}
         ↓
CTF{panther_trails_never_fade}
```

---

## Solution Map

```
4 JPG files
  └─► exiftool → metadata clues
        │
        ├─► "amara-nkalo" → GitHub profile
        │     ├─► README.md → Fragment 1: CTF{panther_
        │     └─► git log → deleted file → Fragment 2: trails_
        │
        └─► "robots are warned" → robots.txt
              └─► Disallow: /silent-claw → Fragment 3: never_fade}

CTF{panther_trails_never_fade}
```

---

## Key OSINT Techniques Used

| Technique | Application |
|---|---|
| EXIF metadata extraction | Initial pivot points from images |
| Username OSINT | `amara-nkalo` → GitHub |
| Git history recovery | Deleted file via `git show <commit>` |
| robots.txt enumeration | Hidden path discovery |
| GitHub Pages | Web-accessible content from a repo |

---

## Tools Used

| Tool | Purpose |
|---|---|
| `exiftool` | Metadata extraction from 4 images |
| `git log --all` | Full commit history including deletions |
| `git show <hash>:path` | Recover deleted file at a specific commit |
| Browser | GitHub, GitHub Pages, robots.txt |

---

## What I Learned

1. **EXIF metadata is a pivot point, not just a destination**: each image's metadata pointed to the next step, not the final answer.
2. **Git history is permanent**: deleting a file in git doesn't remove it from history. `git log --all` and `git show` recover anything that was ever committed.
3. **robots.txt `Disallow` entries are OSINT goldmines**: they tell you exactly where the interesting content is.
4. **Fragment-based flags require patience**: you must find all pieces before the flag makes sense. Don't submit partial fragments.

---

## Flag

```
CTF{panther_trails_never_fade}
```
