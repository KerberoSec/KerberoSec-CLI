# CTF Write-up: WiFi Forensics

**Category:** Forensics / Wireless
**Challenge Source:** tcraCyber champion 2026
**Write-up Author:** TitoDevsec (T1t0D3v$3c)

## Challenge Summary
The challenge provided a set of files related to a WiFi capture, including a `.cap` file containing a WPA2 handshake. The hint stated: "The password of the wifi is related to the name of the access point."

## Vulnerability Analysis
### What was wrong?
The WiFi network used a weak, predictable password based on the SSID (Service Set Identifier). This makes the network vulnerable to targeted dictionary attacks.

## Solution
1.  **Reconnaissance:** Analyze the provided `.csv` file to identify target APs. The AP "D-Link" (BSSID: `36:1F:5C:4C:B1:D5`) was identified as the target.
2.  **Handshake Verification:** Confirm the presence of a valid 4-way handshake in the `.cap` file.
    ```bash
    aircrack-ng 4wh-01.cap
    ```
3.  **Wordlist Generation:** Based on the hint, create a custom wordlist using the base string "dlink" with transformations (mirrored, reversed, etc.) using `crunch`.
    ```bash
    # Example transformations
    crunch 10 10 -t dlinkknild > dlink_list.txt
    ```
4.  **Cracking:** Run `aircrack-ng` with the custom wordlist.
    ```bash
    aircrack-ng -w dlink_list.txt -b 36:1F:5C:4C:B1:D5 4wh-01.cap
    ```
    The password was found to be `dlinkknild`.

## Code Comparison

### Vulnerable Configuration
Using a password derived from the SSID:
*   **SSID:** D-Link
*   **Password:** dlinkknild

### Secure Configuration
Use a strong, random passphrase that is at least 12-16 characters long and includes a mix of character types.
*   **SSID:** Secure_Network_Alpha
*   **Password:** `k9#fL2!mPq8*zXvR`

## Lessons Learned
*   **Predictable Passwords:** Never use passwords that can be easily guessed or derived from public information like the SSID.
*   **Targeted Wordlists:** In CTFs and real-world assessments, custom wordlists based on context are often more effective than generic ones.
*   **WPA2 Vulnerability:** WPA2-PSK is vulnerable to offline dictionary attacks if a handshake is captured. Upgrading to WPA3 provides better protection.

## Flag
`tzcert{dlinkknild}`
