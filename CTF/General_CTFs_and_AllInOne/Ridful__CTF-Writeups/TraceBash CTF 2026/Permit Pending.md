# Permit Pending: Writeup

**Event:** TRACEBASH CTF **Category:** OSINT · **Points:** 225 · **Author:** CYB3RFY **Flag:** `TBCTF{120033169}`

## Challenge

We're given a photo of a building under renovation and told it had an interior renovation permit for its **3rd and 4th floors**, filed under an **LLC** owner. The goal is to find the official public permit record and recover the **9-digit Job Filing Number**.

## Recon: reading the photo

The image is AI-composited, but it carries several planted text clues:

- A carved stone sign: **"No. 210-216 CHELSEA ART BUILDING"**
- A green street sign: **"W 25 St"** and **"Ave of the Americas"** (6th Avenue)
- A **"ONE WAY"** sign

The natural first move is to chase the carved sign. "210-216 Chelsea Art Building" resolves cleanly to **210 Eleventh Avenue** (the Chelsea Arts Building, BIN 1012378, Block 696 / Lot 65), an 11-story 1911 building on the corner of W 25th St: confirmed against the NYC Landmarks Preservation Commission's West Chelsea Historic District report, which lists it as "210-218 Eleventh Avenue (aka 564-568 West 25th Street)." The building is owned through LLC entities (Onbar / ABS Partners), which fits the "LLC owner" detail.

It looks like a lock. It isn't.

## The trap

Pulling the **complete** public DOB record for 210 Eleventh Avenue: both the legacy BIS _Job Application Filings_ and _DOB NOW: Build_ datasets, filtered by **BIN 1012378**: returns roughly 90 filings. Every interior renovation is on the **1st, 2nd, 6th, 10th, or 11th floor**. There is **no 3rd-and-4th-floor job anywhere** in the record.

Since a CTF flag has to be a real, retrievable permit, the absence is the tell: the carved "Chelsea Art Building / 210-216" sign is the **red herring**. The reliable locator is the _genuine_ street signage: **W 25th St + Ave of the Americas (6th Ave)**: which points to a building between 6th and 7th Avenues, not out at Eleventh Avenue.

## Finding the permit

Searching the NYC DOB _Job Application Filings_ dataset for interior-renovation jobs whose description mentions the **3rd and 4th floor**, and intersecting with **W 25th St near 6th Ave** + **LLC owner**, yields exactly one match:

|Field|Value|
|---|---|
|Job #|**120033169**|
|Address|130 West 25th Street, Manhattan|
|BIN|1014989|
|Owner|**25 BUILDING ASSOCIATES LLC**|
|Job Type|A2 (interior renovation)|
|Status|Signed Off|
|Description|"PROPOSE INTERIOR RENOVATION TO THE 3RD AND 4TH FLOOR, NO CHANGE TO USE EGRESS OR OCCUPANCY"|

**130 West 25th Street** is a 12-story, 1910 pre-war loft building in the Chelsea arts district, sitting on W 25th just off Ave of the Americas: matching the two real street signs in the photo. The filing satisfies all three challenge constraints at once: interior renovation, 3rd **and** 4th floors, LLC owner, and the Job Filing Number is a clean 9 digits, the BIS format the flag expects.

## Flag

```
TBCTF{120033169}
```

## Takeaways

- **Don't stop at the most prominent clue.** The carved address sign was engineered to send solvers to a plausible, well-documented building that has no matching permit.
- **Absence of evidence is evidence.** Pulling the _full_ permit history for the decoy building and finding zero 3rd/4th-floor jobs is what confirms it's the wrong target.
- **Separate genuine signal from AI artifacts.** The real street signs (W 25th St + 6th Ave), not the decorative stone, were the locator that actually resolved the puzzle.
- **Match on structured facts, not flavor text.** "3rd and 4th floor + A2 + owner ending in LLC" uniquely identifies the record across the whole DOB dataset.
