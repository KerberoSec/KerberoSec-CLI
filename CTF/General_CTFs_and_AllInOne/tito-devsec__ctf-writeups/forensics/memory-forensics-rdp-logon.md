# CTF Write-up: Memory Forensics: RDP Logon

**Category:** Forensics / Memory Forensics
**Challenge Source:** tcraCyber champion 2026
**Write-up Author:** TitoDevsec (T1t0D3v$3c)

## Challenge Summary
The objective was to identify the earliest Remote Desktop Protocol (RDP) logon time from a provided Windows Security event log (`EVTX`).

## Solution
1.  **Format Conversion:** Convert the `EVTX` file to `XML` for easier parsing.
    ```bash
    # Example using a standard tool
    evtx_dump security.evtx > security.xml
    ```
2.  **Event Filtering:** Search for specific event IDs and logon types related to RDP.
    *   **Event ID 4624:** An account was successfully logged on.
    *   **LogonType 10:** RemoteInteractive (RDP).
3.  **Data Extraction:** Use a script or manual search to find the earliest occurrence of these parameters.
    *   **SystemTime:** `2026-01-28 17:12:57`
    *   **User:** `champ26`
    *   **IP:** `192.168.153.1`
4.  **Formatting:** Format the timestamp as required by the challenge.

## Lessons Learned
*   **Event ID Knowledge:** Understanding Windows Event IDs (e.g., 4624 for logon, 4625 for failure) is crucial for forensic investigations.
*   **Logon Types:** Distinguishing between local (Type 2), network (Type 3), and RDP (Type 10) logons helps narrow down the investigation.
*   **Automation:** Using Python or PowerShell to parse large XML logs is much faster and more accurate than manual searching.

## Flag
`tzcert{2026:01:28:17:12:57}`
