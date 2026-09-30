# Online Over-Sharer

**Category:** OSINT
**Target:** `jenna_and_blue` on Instagram

## TL;DR

Jenna posts a lot about her dog. Like, a lot. Turns out "a lot" is exactly the vulnerability class this challenge is testing: her security questions can basically all be answered by scrolling her feed for five minutes.

## The Approach

Instead of trying to brute-force anything, I just went full stalker-with-good-intentions and read through `jenna_and_blue`'s posts like a normal nosy person would. Between the captions, hashtags, and photo timestamps, pretty much every "security" question had already been answered publicly, sometimes multiple times over.

## What I Found

**Post 1: puppy photo, dated 5/18/2018** Caption spells it all out in a numbered list (thanks Jenna):

- Blue is a **basset hound**
- Blue has **2 brothers**
- Blue is watching her graduation in **June** from **grandma's house**
- `#classof2026`

**Post 2: campus view** A shot looking out over a Mission Revival: style building (tower with arched windows, red tile roof), confirming grad year `#2026`. The building itself took a bit more digging: landed on **Kenna Hall** based on the tower architecture matching that cluster of buildings near the Mission Gardens.

**Post 3: Blue looking sad** Confirms `#classof2026` again for good measure, plus the general "Blue's Clues" connection that pointed at the voice-actor question (Magenta → **Koyalee Chanda**).

## Answers

|Question|Answer|
|---|---|
|Username|jenna_and_blue|
|Breed of first dog|Basset hound|
|When are you graduating (mm/yyyy)|06/2026|
|Total number of siblings your dog has|2|
|Building with favorite view of campus|Kenna Hall|
|Where dog will watch graduation from|Grandma's house|
|Voice actor of the pink friend (Magenta)|Koyalee Chanda|

## Flag

```
bronco{0v3r5h4r1n6_m4k3s_m3_8lu3}
```
