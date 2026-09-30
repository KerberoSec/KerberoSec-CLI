# 01: Sanity Check

> **ZeroDay Heist 2026 · CyberHX**

---

## Challenge Info

| Field | Value |
|---|---|
| **Category** | Sanity |
| **Points** | 30 |
| **Difficulty** | Beginner |
| **Solved At** | June 6, 2026: 7:37 AM |

---

## Description

> Join the official event resources and prove you're in the right place.

A classic sanity check: the first challenge of every CTF, designed to confirm you've joined the official community and know your way around the competition environment.

---

## Approach

### Step 1: Join the Official Discord Server

The challenge description hinted at the event's official communication channels. Every sanity challenge hides its flag in the most obvious place: the organizer's Discord server.

Common hiding spots to check:
- `#announcements` channel
- `#rules` or `#welcome` channels
- Pinned messages in any channel
- Organizer / bot profiles and bios

### Step 2: Find the User `CYBxM0nk`

Browsing the member list revealed the organizer account **CYBxM0nk**. Clicking the profile opened the user card, which displayed the flag directly in the bio/about section.

No exploitation, no decoding: the flag was sitting in plaintext, waiting to be read.

### Step 3: Copy the Flag

```
ZeroDayHeist{welcome_to_the_heist}
```

---

## What I Learned

Sanity checks exist to get you warmed up and to ensure you're plugged into the event ecosystem. They also reward participants who read everything carefully. The flag was never hidden: it was just in a place most people wouldn't think to look immediately.

**Lesson:** Always join every official channel (Discord, Telegram, etc.) the moment a CTF starts. Sanity flags are free points that expire when someone else grabs them first on a per-solve leaderboard.

---

## Flag

```
ZeroDayHeist{welcome_to_the_heist}
```
