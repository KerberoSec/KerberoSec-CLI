# Astley Offset

**Category:** OSINT | **Difficulty:** 300pts | **Flag:** `IIITL{d1dnt_r1ckr0113d_y0u_h4rD}`

## TL;DR

Base64-decode two lines to get lat/lon offsets. Add them to the filming location of the 1987 Rick Astley "Never Gonna Give You Up" video to land on IIIT Lucknow's campus. Then find the flag in a since-reverted Wikipedia edit that lived for exactly 36 seconds: because on Wikipedia, even "changes that never happened" exist forever in the revision history.

## What We're Given

A single file: `always_gonna_take_me_down.txt` (the filename alone is a clue). Its contents:

```
-LTI0LjcxMTc3OA==
+ODEuMjQzMzUw
```

Two lines. One starts with `-`, one with `+`. They look like base64: each line has that distinctive `=` padding on the end. The challenge description hints at Rick Astley (the title is "Astley Offset") and includes this cryptic note about where to find the answer: **"over open Internet (where changes occur before even it happens)"**. That second part will cause significant pain. More on that later.

## Initial Recon

First things first: decode those base64 strings. The `+` and `-` prefixes aren't base64 characters, so we strip them before decoding:

```bash
echo "LTI0LjcxMTc3OA==" | base64 -d   # → -24.711778
echo "ODEuMjQzMzUw" | base64 -d        # → +81.243350
```

So the file contains coordinate offsets: **−24.711778** (latitude) and **+81.243350** (longitude). The `+`/`-` prefixes on the raw lines were just sign indicators telling us which is which: nice little touch.

Now the challenge title makes sense: "Astley Offset" = Rick Astley + coordinate offsets. We need to find a reference point associated with Rick Astley, then apply these offsets to get the destination.

## The Vulnerability / Trick

This challenge has two distinct tricks stacked on top of each other:

**Trick 1: Geocoding a music video**

The phrase "Astley" points squarely at Rick Astley and his legendary 1987 music video for "Never Gonna Give You Up" (yes, the rickroll one). The offset file is even named `always_gonna_take_me_down.txt`: they're really committing to the bit. The question is: where was it filmed?

Some OSINT digging (or just knowing your rickroll lore) reveals it was shot at the **Harrow Club, 187 Freston Road, London W10**. Looking up that address gives us coordinates: **51.5132°N, −0.2200°E**.

Now apply the offsets:
- Latitude: 51.5132 − 24.711778 = **26.8014°N**
- Longitude: −0.2200 + 81.243350 = **81.0234°E**

Dropping those coordinates into any map puts us squarely on the **IIIT Lucknow campus** in India. A quick Overpass API query confirms there's actually mapped campus data there. Great: we know where we are.

**Trick 2: Wikipedia's "permanent impermanence"**

This is the clever part. The challenge hint says: "over open Internet (where changes occur before even it happens)."

Read that phrase carefully. "Changes occur *before* they happen": meaning something that was changed, but then un-changed. Something that was modified and then reverted. The change existed, but now technically "never happened."

On **Wikipedia**, every edit: including reverted vandalism, test edits, and anything else that gets undone: lives forever in the **revision history**. A page might look clean and professional right now, but buried in its history could be an edit that appeared for 10 seconds in 2019 and was immediately rolled back. That edit still exists. It still happened, even though it "didn't happen."

The "changes occur before even it happens" phrasing is pointing at Wikipedia revisions: the change (the edit) exists even before the stable version of the page "knows" it happened (because it was reverted). Cute wordplay.

## Building the Exploit

**Step 1: Find the reference point**

We need the precise coordinates of the NGGYU filming location. Wikipedia and various "where was Never Gonna Give You Up filmed" articles confirm it: **Harrow Club, 187 Freston Road, London W10 6QU**. Nominatim (OpenStreetMap's geocoding service) gives us **51.5131892, −0.2199637**.

**Step 2: Apply the offsets**

```
lat: 51.5131892 − 24.711778  = 26.801411°N
lon: −0.2199637 + 81.243350  = 81.023386°E
```

Confirm in Google Maps or OpenStreetMap: yep, that's the IIIT Lucknow campus.

**Step 3: Check Wikipedia revision history**

Navigate to the Wikipedia article for "Indian Institute of Information Technology, Lucknow". We're not looking at the article itself: we're going straight to the **history tab** to look for suspicious edits. The kind of edit someone would make to hide a CTF flag in plain sight and then quickly revert.

The Wikipedia API makes this easy to query programmatically. We're looking for:
- Recent edits with suspicious edit summaries
- Edits that were quickly reverted
- Anything involving users with CTF-adjacent names

Sure enough, there it is:

**Revision 1343485770**: March 14, 2026, by user `Itsojaylicious`. Edit summary: **"flag?"**

It was reverted 36 seconds later. To see what was actually in that edit, we use the Wikipedia compare API: this is how you diff two revisions:

```
https://en.wikipedia.org/w/api.php?action=compare&fromrev=1310564402&torev=1343485770&format=json
```

The diff shows a `<blockquote>` injected into the article body before the gate image:

> **here you go mate:** `IIITL{d1dnt_r1ckr0113d_y0u_h4rD}`

And there's our flag. Gone from the article 36 seconds after it was added. Alive in the revision history forever.

## The Dead Ends (and They Were Plentiful)

The hint "over open Internet (where changes occur before even it happens)" is genuinely ambiguous, and we explored several wrong interpretations before landing on Wikipedia.

**OpenStreetMap notes and tags**: OSM lets you add notes to locations, and there's even a community mapper (`contrapunctus`) who has mapped the IIIT Lucknow campus. Spent a while combing through OSM changesets looking for hidden data. Nothing. The "changes occur" phrasing could absolutely describe OSM edits, but there was nothing useful there.

**Panoramax**: OSM has a street-level imagery service called Panoramax (think open-source Street View). There are photos tagged to the IIIT Lucknow area. We pulled two of them: `menu1.jpg` and `menu2.jpg`: which turned out to be completely mundane photos of an Amul cafe menu stall on campus. We checked them for steganography out of desperation. They were just menus.

*[Image: Panoramax dead-end: menu1.jpg from the Amul stall near IIIT Lucknow campus]*

That's a cafe menu. Not a flag. We stared at it for longer than we should have.

**Windy / webcam services**: "Changes that happen in real time over the open internet" could describe weather data or live webcams. Nope.

**Wikimapia**: A community-edited map overlay on satellite imagery. Changes happen live, anyone can edit. Checked the IIIT Lucknow area. Nothing.

The pivot to Wikipedia came from thinking more carefully about the "before even it happens" part. OSM edits, once published, are "happening." Weather data is "happening." But a *reverted* Wikipedia edit is the change that technically *un-happened*: it existed, then ceased to exist from the article's perspective, yet remains accessible. That's the angle.

## Running It

Once we identified the Wikipedia revision, grabbing the flag is just a URL:

```bash
curl "https://en.wikipedia.org/w/api.php?action=compare&fromrev=1310564402&torev=1343485770&format=json" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['compare']['*'])" \
  | grep -o 'IIITL{[^}]*}'
```

Output:
```
IIITL{d1dnt_r1ckr0113d_y0u_h4rD}
```

The flag itself is a pun: `d1dnt_r1ckr0113d_y0u`: didn't rickrolled you. Because this whole challenge was, in fact, a very elaborate rickroll. We were never gonna find that flag the easy way.

## Key Takeaways

**On the coordinate puzzle:** When a challenge name references a specific person or cultural artifact, the filming/event location of their most famous work is a classic OSINT anchor point. Google "where was [X] filmed" is a legitimate solve step.

**On Wikipedia revision history:** Wikipedia is one of the few open internet platforms where *deleted* content is still publicly accessible. Every revision is stored permanently and queryable via the MediaWiki API (`action=compare`). The pattern of "quickly-reverted edit with suspicious summary" is worth checking in CTF OSINT challenges that involve notable entities with Wikipedia articles.

**The API to remember:**
```
https://en.wikipedia.org/w/api.php?action=compare&fromrev=<old>&torev=<new>&format=json
```

**On the hint interpretation:** "Where changes occur before even it happens" is pointing at information that exists in a pre-final, technically-reverted state. Wikipedia revision history is the canonical example of this: edits that were undone still exist. If you see similarly worded hints in future challenges, think: version history, git commits, web archives, or revision-tracked platforms.

**The Panoramax detour** cost real time. Lesson: when exploring a physical location on OSM/Panoramax, be skeptical of any images that look like mundane real-world photos. CTF organizers don't hide flags in photos of chai stall menus.
