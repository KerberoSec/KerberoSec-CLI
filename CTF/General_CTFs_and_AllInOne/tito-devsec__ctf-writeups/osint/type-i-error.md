# CTF Write-up: Type I Error

**Category:** OSINT / GEOINT
**Challenge Source:** tcraCyber champion 2026
**Write-up Author:** TitoDevsec (T1t0D3v$3c)

## Challenge Summary
The objective was to verify a rumored fire outbreak in Dar es Salaam on 9 December 2025 and report the institutional location (latitude/longitude) of the incident.

## Solution
1.  **Verification Source:** Use the **NASA FIRMS** (Fire Information for Resource Management System) map to check for active-fire/thermal anomaly detections on the target date.
2.  **Methodology:**
    *   Open NASA FIRMS map: `https://firms.modaps.eosdis.nasa.gov/map/`
    *   Set date to `2025-12-09` (1-day window).
    *   Enable **VIIRS 375 m** detections (NOAA-20 / NOAA-21).
    *   Navigate to Dar es Salaam, Tanzania.
3.  **Analysis:** Three VIIRS detections were identified. Two were in rural/semi-rural contexts (likely vegetation burning). One detection aligned with an urban/institutional area.
4.  **Identification:** The urban detection was located at `(-6.66217, 39.16608)` in the Tegeta/Wazo Hill area, near mapped infrastructure (e.g., Rabininsia Memorial Hospital).
5.  **Formatting:** Round the coordinates to three decimal places as required: `(-6.662, 39.166)`.

## Lessons Learned
*   **Satellite Data:** NASA FIRMS is a powerful, authoritative source for verifying fire-related incidents globally.
*   **GEOINT Context:** Using basemaps (urban vs. rural) is essential for differentiating between incidental fires (like trash or vegetation burning) and significant institutional incidents.
*   **Coordinate Normalization:** Always pay attention to the required precision (e.g., three decimal places) when reporting coordinates in CTFs.

## Flag
`tzcert{-6.662,39.166}`
