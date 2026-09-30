# 13: What Hashtag? (IxEdge Forge)

> **ZeroDay Heist 2026 · CyberHX**

---

## Challenge Info

| Field | Value |
|---|---|
| **Category** | OSINT |
| **Points** | 143 |
| **Difficulty** | Easy |
| **Solved At** | June 6, 2026: 7:41 AM |
| **Flag Format** | `0day-Heist{#...}` |

---

## Description

> Every company loves their identity, so thus our Organizers 💀💀📛📛
>
> What hashtag is mentioned in every post of IxEdge Forge's Social Media Channels?

A social media OSINT challenge: identify a recurring hashtag used consistently across all posts of the company IxEdge Forge.

---

## Approach

### Step 1: Identify the Target

The challenge names the target directly: **IxEdge Forge**. This is the company whose social media must be investigated.

The description hints at brand identity: companies use consistent hashtags across all posts as part of their branding strategy. The hashtag is likely their own brand name.

### Step 2: Platform Search

Search for "IxEdge Forge" across major social media platforms:

```
Platforms to check (priority order for CTF OSINT):
1. Instagram: visual brand-heavy, hashtag-rich
2. Twitter/X: frequent posting, hashtag culture
3. LinkedIn: professional presence
4. Facebook: business pages
5. YouTube: video descriptions
```

**Finding:** IxEdge Forge maintains an active **Instagram account**.

### Step 3: Review Posts for Consistent Hashtag

Browse multiple posts on the IxEdge Forge Instagram account. Examine the caption/hashtag section of each post.

**Observation:** Every single post includes the hashtag `#ixedgeforge` without exception.

This is a common branding practice: companies always include their own name as a hashtag in every post for discoverability and brand identity. In this CTF, it's also the flag.

### Step 4: Verify Across Posts

Cross-check at least 3-5 posts to confirm the hashtag appears in all of them. Consistency = confidence.

```
Post 1: ... #ixedgeforge ✓
Post 2: ... #ixedgeforge ✓
Post 3: ... #ixedgeforge ✓
Post 4: ... #ixedgeforge ✓
```

### Step 5: Construct the Flag

```
Flag format: 0day-Heist{#...}
Hashtag found: #ixedgeforge

Flag: 0day-Heist{#ixedgeforge}
```

---

## Social Media OSINT Methodology

For any challenge involving social media brand investigation:

```
1. Search the brand name on every major platform
2. Identify active accounts (look for profile photos, follower counts, recent posts)
3. Check account bio / about section first (sanity check)
4. Scroll through posts looking for patterns:
   - Repeated hashtags
   - Repeated phrases / taglines
   - Pinned posts with special content
5. Check post metadata if accessible
6. Check comments and replies
```

### Finding Social Accounts Efficiently

```bash
# Google dork approach
site:instagram.com "IxEdge Forge"
site:twitter.com "IxEdge Forge"
site:linkedin.com/company "IxEdge Forge"

# Direct URL attempts
instagram.com/ixedgeforge
twitter.com/ixedgeforge
```

---

## Why Companies Use Brand Hashtags

Every professional brand uses a consistent hashtag strategy:
- **Brand hashtag** (`#ixedgeforge`): always included, makes all their content searchable
- **Campaign hashtags**: temporary, tied to a specific promotion
- **Community hashtags**: industry-wide tags for discoverability

The challenge exploits this predictable behaviour: if a company uses a hashtag in *every* post, it's almost certainly their own brand name.

---

## Tools Used

- Google Search
- Instagram (web browser)
- Browser (no special tools needed)

---

## What I Learned

1. **Company brand hashtags = brand name**: this is almost always true. If a company uses a hashtag in every post, it's `#companyname`.
2. **Instagram is the most hashtag-dense platform**: for challenges involving hashtags, check Instagram first.
3. **OSINT challenges often have simple answers**: 143 points doesn't mean complex. It means the target is slightly obscure to find.
4. **"Mentioned in every post"** is the key phrase: filter for consistency, not just presence.

---

## Flag

```
0day-Heist{#ixedgeforge}
```
