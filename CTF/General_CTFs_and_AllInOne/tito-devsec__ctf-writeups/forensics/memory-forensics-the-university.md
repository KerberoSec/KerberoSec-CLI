# CTF Write-up: Memory Forensics: The University

**Category:** Forensics / Memory Forensics
**Challenge Source:** tcraCyber champion 2026
**Write-up Author:** TitoDevsec (T1t0D3v$3c)

## Challenge Summary
The objective was to determine which university a user was most likely studying at, based on their activity history in a Windows memory image (`me.mem`).

## Solution
1.  **Initial Domain Discovery:** Search for academic domains (`.ac.tz`) in the memory image using `strings`.
    ```bash
    strings -e l me.mem | grep -i ".ac.tz" | sort -u
    ```
2.  **Discovery:** Numerous references to `https://www.tia.ac.tz` were found, including student-related subdomains:
    *   `sms.tia.ac.tz` (Students Information System)
    *   `lms.tia.ac.tz` (Learning Management System)
    *   `oas.tia.ac.tz` (Online Application System)
    *   `sims.tia.ac.tz` (Online Registration)
3.  **History Correlation:** An Internet Explorer history entry was found for the user `champ26` (SID `S-1-5-21-...-1000`):
    *   `ehistory://{SID}/https://www.tia.ac.tz/`
4.  **Differentiating Content:** Other university names (e.g., Sharda University, Mount Kenya University) were found only as image filenames under TIA's `/wp-content/uploads/` directory, suggesting they were just logos on TIA's website.
5.  **Conclusion:** The user was actively logging into and using multiple student portals for the **Tanzania Institute of Accountancy (TIA)**.

## Lessons Learned
*   **Activity History:** Browser history and cached URLs are the best indicators of a user's identity and affiliations in memory forensics.
*   **Contextual Reasoning:** Distinguishing between embedded content (logos) and active usage (login portals) is crucial for accurate identification.
*   **Domain Analysis:** Subdomains like `lms`, `sms`, and `sims` are strong indicators of an institutional relationship.

## Flag
`tzcert{TIA}`
