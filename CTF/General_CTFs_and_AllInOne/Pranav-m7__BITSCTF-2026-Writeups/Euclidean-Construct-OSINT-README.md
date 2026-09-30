# Euclidean Construct: OSINT Challenge

## Challenge Overview
The challenge provides a clue about a "major event" in Copenhagen in early 2024, mentioning odd geometric constructs ("pyramids resting on 4 balls") erected near an unguarded section of a river. The required flag format is `BITSCTF{xxx.xxx.xxx}`.

---

## Solution Walkthrough

### Step 1: Identifying the Event
The first step to solving this is pinpointing the "travesty" in Copenhagen in early 2024. A quick search reveals this refers to the devastating fire that destroyed the historic **Børsen (Old Stock Exchange)** building on **April 16, 2024**.

*[Image: Screenshot 5]*
*Image: The Børsen fire incident*

---

### Step 2: Locating the Geometric Constructs
The prompt mentions "pyramids resting on 4 balls" overlooking an "unguarded section of the river." Following the Børsen fire, heavy concrete barriers matching this exact description were placed along the **Slotsholmens Kanal** on the street **Børsgade** to secure the scaffolding.

By dropping into Google Maps Street View and setting the timeline to post-April 2024, we can scan the canal side of the street. Sure enough, right in front of a gap in the stone parapet (the unguarded boat stairs), sits the exact concrete pyramid barrier described in the challenge.

*[Image: Screenshot 1]*

*[Image: Screenshot 2]*

*[Image: Screenshot 3]*

---

### Step 3: Decoding the Location
The specific three-part flag format (`///xxx.xxx.xxx`) is the universal signature for **What3Words**, a geocoding system that maps every 3x3 meter square in the world to three random dictionary words.

By taking the exact location of that specific pyramid barrier by the water and plugging it into the What3Words grid, we get our three words: **tickles.cheeks.bend**.

*[Image: Screenshot 4]*

---

## The Flag
```
BITSCTF{tickles.cheeks.bend}
```

---

## Tools Used
- Google Maps Street View
- What3Words

## Category
OSINT

## Difficulty
Medium

---

*Writeup by Pranvvv*
