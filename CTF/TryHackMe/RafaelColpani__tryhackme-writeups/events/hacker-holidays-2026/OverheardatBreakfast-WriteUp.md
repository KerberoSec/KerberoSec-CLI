> **Platform:** TryHackMe
> **Room:** Overheard at Breakfast
> **Category:** OSINT
> **Tools Used:** Image Inspection, MD5, Base64

# Overheard at Breakfast

**Date:** 2026-08-08

## Description

> The objective of this room is to analyze an online conversation, identify useful personal information, locate a hidden profile, and recover the final flag using OSINT techniques.
>
> **Target:** N/A: OSINT Room

---

# Analyzing the Conversation

The first step was to inspect the provided conversation and identify any information that could be useful for further investigation.

The conversation between **Ponzi** and **Lambo** contained several important clues.

One of the most relevant messages was:

> "I used to use this free tool that let me upload my profile and link other media accounts..."

Lambo also mentioned:

> "Started with a G if I remember correctly."

This was an important clue because **Gravatar** is a service that allows users to associate a profile/avatar with an email address.

The conversation then revealed Lambo's email address:

```text
LambobyteLotushotel@gmail.com
```

--- 

The combination of the email address and the clue about a service starting with G pointed toward Gravatar.

# Identifying the Gravatar Profile

Gravatar identifies profiles using an MD5 hash of the user's normalized email address.

Therefore, I first normalized the email address by converting it to lowercase:

```text
lambobyteLotushotel@gmail.com
```

I then generated the MD5 hash:

```bash
echo -n "lambobyteLotushotel@gmail.com" | tr '[:upper:]' '[:lower:]' | md5sum
```

The resulting hash can be used to locate the corresponding Gravatar profile.

The important OSINT technique here was recognizing that the email address itself was not necessarily the final identifier. Instead, it could be transformed into an MD5 hash and used to locate the associated profile.

# Investigating the Profile

The Gravatar profile contained additional information that was not directly present in the original conversation.

This is the typical OSINT chain used in the room:

```text
Conversation
     │
     ▼
Email Address
     │
     ▼
MD5
     │
     ▼
Gravatar Profile
     │
     ▼
Encoded String
     │
     ▼
Base64 Decode
     │
     ▼
echo -n "<ENCODED_VALUE>" | base64 -d
     │
     ▼
Flag
```

