# CTF Write-up: MISMATCH

**Category:** OSINT
**Challenge Source:** tcraCyber champion 2026
**Write-up Author:** TitoDevsec (T1t0D3v$3c)

## Challenge Summary
The objective was to identify a specific vehicle registration plate number involved in a legal dispute in Tanzania due to a clerical discrepancy.

## Solution
1.  **Initial Research:** Based on names identified (e.g., Frank Zebaza), a targeted search for legal proceedings was conducted.
2.  **Targeted Query:** Used the query: `kesi ya madai namba 28992 ya mwaka 2024 iliyofunguliwa na Frank Zebaza dhidi ya UDA Rapid Transport`.
3.  **Source Identification:** Found the official court judgment on **TanzLII** (Tanzania Legal Information Institute).
4.  **Data Extraction:**
    *   Insurance records listed the vehicle as `T132DGW`.
    *   Traffic proceedings and the actual accident record listed the vehicle as `T132DGV`.
5.  **Conclusion:** The court ruled the discrepancy was clerical. The "mismatched" plate number `T132DGV` was the flag.

## Lessons Learned
*   **Official Repositories:** Legal and government databases (like TanzLII) are goldmines for verified information.
*   **Document Parsing:** Carefully reading through transcripts can reveal technical details that differ from official summaries.
*   **Search Operators:** Using specific case numbers and names helps filter out noise from social media and news.

## Flag
`tzcert{T132DGV}`
