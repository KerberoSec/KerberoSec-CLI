# OmniCTF: Fear (OSINT) Writeup

**Challenge:** Fear **Author:** Masquerade **Category:** OSINT

### The Setup

We were given a prompt about a site that "doesn't live on the internet you already know." A helpful hint from the organizers pointed us toward a specific username: **`Maaasquerade`** (note the three 'a's), who was hanging out in the "darknest parts of the web."

This immediately screamed Dark Web / Tor network.

### Step 1: Hitting the Dark Web

Since the hint mentioned a forum-like setting where the user "posted a message," we headed over to Dread, which is essentially the Reddit of the dark web.

Sure enough, looking up `/u/Maaasquerade` led us straight to a brand new account with exactly one post on Dread (`dreadytognbh7m5nlmqsogzzlxjy75iuxkulewbhxcorupbqahact2yd.onion`).

The post read:

> "HelloHello traveler here is it sloppygwgsq5iv6vepvk5egkg4zboldkph2okox4dndngx2wwp3bdjid :D . It is a fun game of choice (Just a message only the smartest will crack it...Are you up for the challenge???)."

<img width="1380" height="297" alt="image" src="https://github.com/user-attachments/assets/4da0cd28-1de7-45f2-92f3-025aebf4d5ec" />

### Step 2: The Next Onion

The string `sloppygwgsq5iv6vepvk5egkg4zboldkph2okox4dndngx2wwp3bdjid` standing on its own was a dead giveaway for a Tor hidden service (a v3 `.onion` address without the extension).

We booted up the Tor browser and navigated over to: `[http://sloppygwgsq5iv6vepvk5egkg4zboldkph2okox4dndngx2wwp3bdjid.onion](http://sloppygwgsq5iv6vepvk5egkg4zboldkph2okox4dndngx2wwp3bdjid.onion)`

### Step 3: Flipping the Flag

The site served up a slick, hacker-themed terminal page with an "intercepted signal" message. The payload dump was right there:

<img width="984" height="346" alt="image" src="https://github.com/user-attachments/assets/90e359ab-bf22-4cd5-ba35-d9c1735c0159" />

Plaintext

```
// payload dump: integrity check failed
}beWeht_dnu0rA_gn1kruL_3ulb_alb_alB{FTCINMO 
something has been lurking here for a while. read it the way it was written: backwards.
```

The hint on the site gave away the final step. We just needed to take that string and reverse it character by character.

Reversing `}beWeht_dnu0rA_gn1kruL_3ulb_alb_alB{FTCINMO` gave us our final answer.

### The Flag

`OMNICTF{Bla_bla_blu3_Lurk1ng_Ar0und_theWeb}`

