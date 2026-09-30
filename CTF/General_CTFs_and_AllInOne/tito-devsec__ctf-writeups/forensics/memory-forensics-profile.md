# CTF Write-up: Memory Forensics: Profile Identification

**Category:** Forensics / Memory Forensics
**Challenge Source:** tcraCyber champion 2026
**Write-up Author:** TitoDevsec (T1t0D3v$3c)

## Challenge Summary
The challenge provided a raw Windows memory image (`me.mem`). The goal was to identify the correct Volatility 2 profile for the image.

## Solution
1.  **Initial Triage:** Use `file me.mem` to confirm it's a memory dump.
2.  **Metadata Extraction (Volatility 3):** Volatility 3 doesn't require a profile. Use it to get OS info.
    ```bash
    vol -f me.mem windows.info
    ```
    *   **Kernel Version:** 6.1 (Windows 7 / Server 2008 R2)
    *   **Build Number:** 7601 (Service Pack 1)
    *   **Architecture:** 64-bit
3.  **Profile Suggestion (Volatility 2):** Use the `imageinfo` plugin in Volatility 2.
    ```bash
    vol.py -f me.mem imageinfo
    ```
    The suggested profile was `Win7SP1x64`.
4.  **Validation:** Test the profile by running a plugin like `pslist`.
    ```bash
    vol.py -f me.mem --profile=Win7SP1x64 pslist
    ```
    The output showed a coherent list of processes, confirming the profile is correct.

## Lessons Learned
*   **Volatility 3 vs 2:** Volatility 3 is excellent for initial triage as it's profile-agnostic. Volatility 2 is still useful for specific plugins but requires the correct profile.
*   **Hypothesis Testing:** Treat profile identification as a forensic hypothesis. Gather evidence (OS version, build, architecture) and validate it by running plugins.

## Flag
`Win7SP1x64`
