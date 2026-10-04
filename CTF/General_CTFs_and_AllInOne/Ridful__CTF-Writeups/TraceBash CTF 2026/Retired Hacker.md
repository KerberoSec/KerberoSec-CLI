# TRACEBASH CTF 2026: Retired Hacker

**Category:** OSINT  
**Flag:** TBCTF{Piața_Gheorghe_Domășneanu}

---

## Challenge

> A leaked chat screenshot reveals an individual who walked away from the hacking scene. Investigate the person and identify the tram station where they got off on May 7, 2026.

---

## Step 1: Chat Screenshot → Komoot Profile

The provided image (`chat.jpeg`) shows a Discord conversation where user **"JJ ^_^"** mentions leaving the hacking scene for hiking and cycling, and shares their Komoot profile:

```
https://www.komoot.com/user/5667624959835
```

---

## Step 2: Komoot → GitHub

Visiting the Komoot profile reveals the target's real name: **Jim Lee**: along with a bio about being an ex-hacker turned outdoorsman. The profile links out to a GitHub account:

```
https://github.com/jiml33t
```

---

## Step 3: GitHub → Email via Commit Metadata

The repository `jiml33t/jiml33t` has an initial commit. GitHub `.patch` files expose Git author metadata even when nothing else is visible. Fetching the patch:

```bash
curl -sL https://github.com/jiml33t/jiml33t/commit/<SHA>.patch | head -20
```

Output reveals:

```
From: jimleepro1-cell <jimleepro1@gmail.com>
Date: Thu, 16 Apr 2026 03:27:19 -0400
```

**Email:** `jimleepro1@gmail.com`

---

## Step 4: Username Enumeration → Threads

With the username `jiml33t` in hand, running it through **whatsmyname** surfaces an active **Threads** account (`@jiml33t`). The tool returns a document result showing:

> _JimLee (@jiml33t) · May 7, 2026 at 6:34 AM. Just finished my last run before the big day, hopping on the tram for my…_

The post thumbnail shows a roadside photo with a billboard clearly reading **IRIGAȚII.RO**.

This confirms the May 7, 2026 date directly from the post timestamp.

---

## Step 5: Image Geolocation → Timișoara

Searching for **IRIGAȚII.RO** reveals it is a Romanian irrigation company located at:

```
Calea Stan Vidrighin (formerly Calea Buziașului) 13
Timișoara, Romania
```

Their own website describes the location as being **"at the end of tramway line 4."**

**City: Timișoara**

---

## Step 6: "French Supermarket" → Auchan

The Threads post mentions hopping on the tram to reach a "favourite French supermarket." **Auchan** is a French retail chain with a store at Calea Buziașului 11: directly next to the IRIGAȚII.RO location.

---

## Step 7: Tram Station

Tram line 4 in Timișoara runs:

```
Calea Torontalului (Ciocanul) ↔ Piața Gh. Domășneanu (AEM)
```

The terminus at the Auchan/IRIGAȚII.RO end of the line is **Piața Gheorghe Domășneanu**. Bus routes serving the same area also list the stop as **"Piața Gheorghe Domășneanu (Auchan)"**, confirming this is where he got off.

---

## Flag

```
TBCTF{Piața_Gheorghe_Domășneanu}
```

---

## Key Takeaways

- **Reused usernames** (`jiml33t`) across Komoot, GitHub, and Threads made the trail easy to follow.
- **Git commit `.patch` files** expose author email even on empty-looking repositories.
- **A single billboard in a photo** was enough to identify the city, street, and transit stop.
- **whatsmyname** surfaced the Threads account, and the indexed post result showed the exact date (May 7, 2026) without even needing to open the profile.
