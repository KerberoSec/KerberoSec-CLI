# CTF Write-up: Tanzania to the World

**Category:** OSINT
**Challenge Source:** tcraCyber champion 2026
**Write-up Author:** TitoDevsec (T1t0D3v$3c)

## Challenge Summary
The challenge provided a phone number `+1 (816) 531-2624` and stated it belonged to a Tanzania-born individual who worked on a famous sci-fi film. The goal was to find the domain owned by the antagonist of that film.

## Solution
1.  **Phone Lookup:** The number `+1 (816) 531-2624` is linked to **Harold O'Neal**, a musician and composer.
2.  **Biography Check:** Harold O'Neal was born in **Arusha, Tanzania**.
3.  **Film Correlation:** He worked on the production/music for the sci-fi film **Tomorrowland (2015)**.
4.  **Antagonist Identification:** The main antagonist of *Tomorrowland* is **David Nix**, played by actor **Hugh Laurie**.
5.  **Domain Discovery:** Hugh Laurie (also a musician) owns the domain **hughlaurieblues.com**.

## Lessons Learned
*   **Pivot Points:** A single piece of information (phone number) can lead to a person, then to their work, then to a related entity (film antagonist), and finally to the target (domain).
*   **LLM Assistance:** Large Language Models can be highly effective at connecting disparate facts that are well-documented in their training data.
*   **Verification:** Always manually verify the links in the chain (e.g., confirming the birth place and film credits) to ensure accuracy.

## Flag
`tzcert{hughlaurieblues.com}`
