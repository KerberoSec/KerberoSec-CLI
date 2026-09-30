# CTF Write-up: Memory Forensics: Suspicious Process

**Category:** Forensics / Memory Forensics
**Challenge Source:** tcraCyber champion 2026
**Write-up Author:** TitoDevsec (T1t0D3v$3c)

## Challenge Summary
The challenge involved identifying a suspicious process in a Windows memory image (`me.mem`) and determining the likely attacker's IP address and connecting port.

## Vulnerability Analysis
### What was wrong?
A legitimate system process, `spoolsv.exe` (Print Spooler service), was observed making an outbound network connection to an unusual high port. This is a classic indicator of a process being compromised or used as a proxy for malicious activity.

## Solution
1.  **Process Triage:** Use Volatility 3's `windows.pstree` to get an overview of running processes.
    ```bash
    vol -f me.mem windows.pstree
    ```
2.  **Network Analysis:** Use `windows.netscan` to list all network connections from the memory image.
    ```bash
    vol -f me.mem windows.netscan > netscan.txt
    ```
3.  **Filtering:** Filter for established connections and look for unusual activity.
    ```bash
    grep -i "ESTABLISHED" netscan.txt
    ```
4.  **Identification:** A connection owned by `spoolsv.exe` was found:
    *   **Remote IP:** `192.168.153.132`
    *   **Remote Port:** `4567`
    *   **Process:** `spoolsv.exe`
5.  **Conclusion:** The Print Spooler service should not be making outbound connections to port 4567. This is the attacker's endpoint.

## Code Comparison

### Vulnerable State
A compromised system process making outbound connections:
*   **Process:** `spoolsv.exe`
*   **Action:** `connect(192.168.153.132, 4567)`

### Secure State
Implement host-based firewalls and endpoint detection and response (EDR) to block or alert on unusual outbound connections from critical system processes.
```bash
# Example: Windows Firewall rule to block outbound from spoolsv.exe
New-NetFirewallRule -DisplayName "Block Spooler Outbound" -Direction Outbound -Program "C:\Windows\System32\spoolsv.exe" -Action Block
```

## Lessons Learned
*   **Baseline Knowledge:** Knowing what "normal" looks like (e.g., `spoolsv.exe` shouldn't be talking to the internet) is key to spotting anomalies.
*   **Network Triage:** `netscan` is one of the most powerful plugins for identifying active compromises in memory.
*   **Process Injection:** Attackers often inject code into legitimate processes to hide their activity.

## Flag
`tzcert{192.168.153.132:4567}`
