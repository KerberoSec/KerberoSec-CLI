# TryHackMe: Overheard at Breakfast

**Platform:** [TryHackMe](https://tryhackme.com/room/overheard-at-breakfast)
**Event:** Hacker Holidays: Day 6
**Difficulty:** Easy
**Category:** OSINT / Social Media / Hashing
**Time to Complete:** ~10 minutes
**Tools Used:** Gemini (AI search), Linux CLI (`sha256sum`), Gravatar, hashes.com

---

## The Scene

The breakfast terrace at the Byte Lotus Hotel. Clinking cutlery, the hiss of an espresso machine, and one guest who lingered a moment too long at the wrong table.

When the occupant stepped away for a refill, a screenshot was taken: a fragment of a conversation that was never meant to be seen. Somewhere inside it is enough to track down an account that Lambo went to some effort to keep hidden.

---

## The Conversation

The task file contains a screenshot of a chat between two users. Reading it carefully, and @0xMia was explicit that skimming would not cut it: one participant, **Lambo**, drops a series of revealing details while apparently explaining a tool to someone else:

- The tool is **free**
- It **links all your profiles** in one place
- It is **email-based**
- The name **starts with G**

Taken individually, none of these clues are conclusive. Together, they point to exactly one service.

---

## Step 1: Identifying the Tool

Rather than guessing, I fed the relevant section of the conversation directly into Gemini and asked what tool was being described.

![Gemini correctly identifying the tool as Gravatar](https://github.com/SamarthBadola/Technical-Writeups/blob/ddd72050998139c1ae1b2c5e26d8b4a89ba436f7/Assets/Overhead-at-Breakfast/Grav.png)

The answer came back immediately: **Gravatar**: Globally Recognized Avatar. It is a free profile service tied to an email address that allows users to link verified social accounts, websites and handles. It is used widely across developer platforms, WordPress installations and comment systems, often without users realising their profile is publicly discoverable.

The OSINT-relevant detail about Gravatar: profiles are not searched by username. They are found by hashing an email address and appending that hash to `https://gravatar.com/`. Two hash formats work: MD5 (legacy) and SHA-256 (current).

---

## Step 2: Extracting the Email

This is easy enough, the mail is explicitly stated in the conversation image. In case, you can't find it (honestly, how?). this is lambo's mail:
```lambobytelotushotel@gmail.com```

---

## Step 3: Hashing the Email

With the email in hand, the SHA-256 hash is generated directly on the Linux command line:

```bash
echo -n "lambobytelotushotel@gmail.com" | sha256sum
```

The `-n` flag is important. Without it, `echo` appends a newline character to the string before hashing, producing a different hash: one that would not match the Gravatar profile.

The output is a 64-character hex string. That string becomes the profile URL:

```
https://gravatar.com/<sha256-hash-here>
```

---

## Step 4: The Gravatar Profile

Loading that URL surfaces Lambo's hidden profile.

![Lambo's Gravatar profile showing the bio and prize string](https://github.com/SamarthBadola/Technical-Writeups/blob/ddd72050998139c1ae1b2c5e26d8b4a89ba436f7/Assets/Overhead-at-Breakfast/lamboProfile.png)

The profile name reads **Lambo**, location **Byte Lotus Hotel**, and the bio contains a pointed message: *"Funny thing about email hashes, they follow you places you didn't expect. Glad you found the right corner of the internet! Here is your prize:"*

Below that message sits a long alphanumeric string. The bio's reference to email hashes: combined with the mixed-case letters and numbers: suggested this was itself a hash encoding the flag rather than the flag in plaintext.

---

## Step 5: Cracking the Hash

The string was submitted to **hashes.com** for identification and decryption. The platform identified the hash type and returned the plaintext value immediately.

**Flag:** *[redacted per TryHackMe guidelines]*

---

## The Full Chain

| Step | Action | Result |
|------|--------|--------|
| 1 | Read the conversation carefully | Identified Gravatar as the target service |
| 2 | Extracted the email address from the chat | Input for hashing |
| 3 | `echo -n "email" \| sha256sum` | SHA-256 hash of the email |
| 4 | Appended hash to `https://gravatar.com/` | Lambo's hidden profile |
| 5 | Submitted profile string to hashes.com | Plaintext flag |

---

## Key Takeaways

**OSINT is reading, not just searching.** The entire room was solvable from a single screenshot. Every tool used after that: Gemini, `sha256sum`, hashes.com: was just execution. The investigation lived or died on how carefully the conversation was read.

**Gravatar is a real OSINT surface.** Because profiles are tied to email addresses rather than chosen usernames, anyone who knows a target's email can discover their Gravatar profile regardless of what display name or handle the target chose. Developers who use the same email across WordPress, GitHub and forum registrations may not realise their linked accounts are publicly visible via a single hash lookup.

**The `-n` flag in `echo` matters.** Hashing `lambobytelotushotel@gmail.com` and hashing `lambobytelotushotel@gmail.com\n` produce entirely different outputs. Any hash mismatch when querying Gravatar is worth checking against this first before assuming the email is wrong.

**When a bio references the mechanism used to find it, read the rest of the bio very carefully.** Lambo's profile confirmed you had arrived via the correct method and then immediately handed over the next puzzle piece. The confirmation and the payload were in the same sentence.

---

## Answer

| Question | Answer |
|----------|--------|
| What is the flag? | *[redacted per TryHackMe guidelines]* |

---

*Writeup by Samarth Badola: [TryHackMe Profile](https://tryhackme.com/p/samarthbadola)*
*Room: [Overheard at Breakfast](https://tryhackme.com/room/overheard-at-breakfast): Hacker Holidays Day 6*
