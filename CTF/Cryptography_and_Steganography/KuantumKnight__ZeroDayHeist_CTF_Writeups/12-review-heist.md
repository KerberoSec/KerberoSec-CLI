# 12: The Review Heist

> **ZeroDay Heist 2026 · CyberHX**

---

## Challenge Info

| Field | Value |
|---|---|
| **Category** | OSINT |
| **Points** | 250 |
| **Difficulty** | Medium |
| **Solved At** | June 6, 2026: 4:20 AM |

---

## Description

> "The best place to hide a secret is where nobody thinks to look."
>
> During reconnaissance, Berlin discovered that CyberHX had once responded to a seemingly harmless public review. The challenge suggested that a hidden message was concealed within that conversation.

A pure OSINT challenge: no files, no tools, just internet research and attention to detail. The flag is hidden inside a Google Review response made by the CTF organiser.

---

## Approach

### Step 1: Parse the Keywords

The description contains three key phrases:

| Phrase | Meaning |
|---|---|
| `"responded to a review"` | A company **replied** to a customer review |
| `"public conversation"` | Visible to anyone on the internet |
| `"hidden message"` | Something embedded in the reply text |

Combined: **Check CyberHX's Google Business Profile → review responses.**

### Step 2: Find CyberHX on Google

```
Search: CyberHX site:google.com OR "CyberHX" reviews
Search: CyberHX CTF cybersecurity
```

Navigate to the Google Business Profile for CyberHX:
- Search "CyberHX" on Google Maps / Google Search
- Click "Reviews" on the business panel

### Step 3: Enumerate All Review Responses

CyberHX (as the business owner) had replied to customer reviews. Read every response carefully: the flag is hidden in the **text of one of these replies**.

Techniques for finding hidden content in reviews:
- Read every character of every response
- Look for unusual capitalisations
- Check for acrostics (first letter of each sentence)
- Look for out-of-place characters or phrases
- Check for embedded strings in parentheses or brackets

One of the responses contained a hidden flag string.

### Step 4: Extract the Flag

Extracting the concealed text from the review response revealed:

```
Zer0d4yH31st{h0p3_y0u_will_W1n_h31st}
```

---

## OSINT Methodology for Review-Based Challenges

When a challenge points to "public reviews" or "business responses":

```
1. Identify the business name (given directly or via clue)
2. Search Google Maps / Google Search for the business
3. Open the Google Business Profile
4. Click → Reviews
5. Look at both customer reviews AND business responses
6. Check all review platforms: Google, Yelp, Trustpilot, G2, Glassdoor
7. Read every character: flags can be embedded anywhere
```

### Why Google Reviews?

Google Reviews are:
- Publicly accessible without an account
- Indexed by Google Search
- Responses written by verified business owners
- Permanent unless deleted by the owner

From an OSINT perspective, they're a perfect hiding place: public, authoritative, and rarely examined in detail.

---

## Related OSINT Sources for Similar Challenges

| Platform | What to Check |
|---|---|
| Google Reviews | Business responses, review text |
| Yelp | Business owner responses |
| Trustpilot | Company replies |
| Glassdoor | Employer responses to reviews |
| App Store / Play Store | Developer responses to app reviews |
| GitHub | Repository descriptions, commit messages, issues |
| LinkedIn | Company posts, employee bios |

---

## Tools Used

- Google Search
- Google Maps / Google Business
- Browser (no special tools needed)

---

## What I Learned

1. **"Hidden in plain sight" is the most elegant CTF technique**: the flag was publicly accessible the entire time, just in a place no one thinks to look.
2. **Business review responses are underexplored OSINT surfaces**: most people only read the review, not the response.
3. **OSINT challenges reward lateral thinking**: keywords in descriptions are not vague, they're precise. "Responded to a review" has one meaning.
4. **No tools needed**: the most satisfying CTF wins sometimes require only a browser and careful reading.

---

## Flag

```
Zer0d4yH31st{h0p3_y0u_will_W1n_h31st}
```
