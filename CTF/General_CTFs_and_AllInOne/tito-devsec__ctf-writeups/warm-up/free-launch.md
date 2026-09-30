# CTF Write-up: Free Launch

**Category:** Warm Up
**Challenge Source:** tcraCyber champion 2026
**Write-up Author:** TitoDevsec (T1t0D3v$3c)

## Challenge Summary
The challenge provided an audio file named `salamu.mp3`. The goal was to find a hidden flag within the file.

## Solution
1.  **Metadata Inspection:** Use `exiftool` to check for hidden information in the file's metadata.
    ```bash
    exiftool salamu.mp3
    ```
2.  **Discovery:** The `Comment` field in the metadata contained the flag: `tzcert{St3gan0gr@phy_M@d3_51mple_1314353}`.

## Lessons Learned
*   **Check Metadata First:** Always check the metadata of provided files (images, audio, documents) using tools like `exiftool` or `strings`.
*   **Steganography Basics:** Information can be hidden in various parts of a file, including headers, comments, and the data stream itself.

## Flag
`tzcert{St3gan0gr@phy_M@d3_51mple_1314353}`
