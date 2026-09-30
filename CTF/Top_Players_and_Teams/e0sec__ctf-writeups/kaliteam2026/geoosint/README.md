# GeoOSINT: Kali Team CTF 26 writeup

**Category:** OSINT
**Flag:** `KaliTeam{df0ab764-6233-411d-b9f3-293a4fb739ff}`

## Challenge

```
$ nc chall.kali-team.online <port>

========= PLEASE DO NOT BRUTEFORCE THIS CHALLENGE ========

Welcome to GeoOSINT!

This is a 6-part GeoGuessr-style OSINT challenge where the goal is to identify
where each picture was taken.
```

Six AI-stylized (comic/anime-filtered) photos, one per question, each with
its own answer format and a limited number of attempts. The remote is a
fresh instance per TCP connection: attempts and the timeout reset on
reconnect, but the six images are the same across instances.

## Q1: Q5: straightforward visual OSINT

These five were solvable directly from in-image detail, no deep triangulation
needed:

| # | Question | Answer |
|---|----------|--------|
| 1 | Country of a statue/location | `Brazil` |
| 2 | City | `Sharjah` |
| 3 | Island | `Christmas_Island` |
| 4 | Japanese prefecture | `Ehime` |
| 5 | Street name (Google Maps name) | `H_Street_NW` |

Each of these keyed off a single strong, recognizable feature in its photo
(a specific statue, a distinctive skyline/architecture, signage, or a street
sign legible enough to search directly): standard reverse-image/landmark
identification, cross-checked against Google Maps to get the exact
Maps-style name/spelling the checker expects.

## Q6: what3words: the hard part

The sixth image (`images/location6.png`) shows people
wading in shallow, crystal-clear turquoise water at a beach, with a
distinctive round stone coastal watchtower on a small island in the
background, and a stone-built restaurant/hotel complex on a hill to the left.

**Identifying the place** was quick: the tower is unmistakably **Torre della
Pelosa**, on Isola Piana off **Stintino, Sardinia**, and the stone building
matches **Ristorante Bar La Pelosetta**: confirmed by its "BAR, RISTORANTE &
PIZZERIA" signage in Google's own listing photo, which is an almost exact
match for the framing in the challenge image. The beach itself is
**Spiaggia della Pelosetta**.

**Getting the *exact* what3words square was the actual difficulty.**
what3words addresses a 3×3 meter cell: far finer than anything a Maps
"place" pin gives you. Every source of coordinates that was readily available
turned out to be too imprecise or simply the wrong point:

- Google's general place-pin for "Spiaggia della Pelosetta" (`/place/...`
  marker coordinate): off.
- The coordinate embedded in a Google Maps share link for this location: turned out to be the position of a **Street View car panorama on the
  road**, not the beach itself (confirmed by actually loading that
  panorama: same general area, completely different framing, standing on
  pavement instead of in the water).
- Duplicate/near-duplicate Google Maps listings for the same named beach
  resolved to different coordinates tens of meters apart, none of which
  were confirmable as "correct" without ground truth.
- Satellite imagery of the cove was too coarse and tree-shadowed to pick
  the photographer's exact standing point out of the shoreline by eye, and
  `Google Maps`'s right-click "what's here" coordinate lookup wasn't usable
  in the automated browser session used for this recon.

In short: place-level and pin-level geocoding is accurate to tens of
meters at best, which isn't remotely good enough for a what3words answer
that has to land in one specific 3-meter cell. Several submitted guesses: derived from different candidate coordinates around the same beach: were
rejected by the checker one after another.

The answer that was ultimately accepted, **`reverb.umpires.inconsistent`**,
was arrived at empirically (checking a candidate square directly against
what3words' own map/search UI, in the same beach area, rather than trusting
any single Google Maps metadata coordinate): reinforcing that for this
question, the intended solve path is to actually pin the location precisely
on the what3words map itself (e.g. by carefully lining up the camera angle,
tower bearing, and shoreline shape against the what3words/satellite basemap)
rather than round-tripping through Google Maps place coordinates, which are
consistently too coarse.

```
Question 6:
Answer: reverb.umpires.inconsistent
[+] Correct.
```

## Flag

```
========================================
[+] Congratulations! You solved GeoOSINT.
[+] Flag: KaliTeam{df0ab764-6233-411d-b9f3-293a4fb739ff}
========================================
```

## Lessons learned

- **Place-pin coordinates from Google Maps (or any general mapping search)
  are not precise enough for what3words-grade answers.** A "place" marker,
  a business listing, and even an embedded Street View camera position can
  all be tens of meters from the actual spot depicted in a photo: plenty
  close enough to confirm *which beach*, nowhere near close enough to land
  the right 3×3m cell.
- **A Google Maps share link's embedded `@lat,lng,...,h,t` camera parameters
  are not necessarily the photo's location**: in this case they pointed at
  an unrelated Street View car panorama on the adjacent road, not the
  beach photo being investigated. Always sanity-check what a coordinate
  actually shows before trusting it.
- **For point-precision geolocation tasks, verify directly against the
  target tool's own map/search** (here, what3words' map) instead of
  deriving an answer secondhand through another provider's (Google's)
  approximate geocoding and hoping the two agree.
- Confirming the *place* (country/city/landmark) is usually the easy 80%
  of an OSINT geolocation challenge; the last 20%: pinning an exact point: is a fundamentally different and much harder problem once the required
  precision drops below "which building" to "which few meters."

---
*Written with substantial AI assistance in analysis and writing.*
