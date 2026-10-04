# Capture the Ops CTF '24 🥇

**Result:** 1st Place  
**Organizers:** VRGD Club & GDG Club, Amity University  
**Format:** Jeopardy-style CTF  
**Duration:** ~6 hours  
**Team:** Solo

---

## Competition Overview

Capture the Ops was a cybersecurity CTF organized at Amity University covering web exploitation, cryptography, digital forensics, OSINT, and network analysis. This was part of a tech fest event where teams competed to capture flags hidden in various challenge environments.

---

## Challenges Solved

| # | Challenge | Category | Points | Flag |
|---|---|---|---|---|
| 1 | Flag Hunter | Web | 200 | `CTF{h1dd3n_in_h3ad3rs}` |
| 2 | Caesar's Secret | Crypto | 100 | `CTF{r0t13_is_t00_3asy}` |
| 3 | Hidden in Plain Sight | Forensics | 300 | `CTF{st3g0_ftw_2024}` |

---

## Challenge Writeups

- [Web: Flag Hunter](./web-flag-hunter.md)
- [Crypto: Caesar's Secret](./crypto-caesar-break.md)
- [Forensics: Hidden in Plain Sight](./forensics-hidden-data.md)

---

## Strategy

- Started with the cryptography challenge (quickest points, no environment setup)
- Moved to web exploitation: enumerated thoroughly before attempting any injection
- Finished with forensics: most time-intensive, but highest points
- Documented every dead end to avoid revisiting failed approaches

---

## Lessons Learned

- Always check HTTP response headers: flags are sometimes hidden in `X-Custom-Header` fields
- Frequency analysis is fast for classical ciphers; don't brute-force what you can analyze
- `binwalk -e` is the first thing to run on any suspicious binary/image in forensics
