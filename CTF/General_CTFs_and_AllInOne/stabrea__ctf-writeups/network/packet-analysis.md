# Network Forensics: Hidden in Plain Sight

| Field | Value |
|-------|-------|
| **Category** | Network Forensics |
| **Difficulty** | Easy |
| **Points** | 150 |
| **Flag** | `CTF{pl41nt3xt_cr3ds_4r3_d34d}` |
| **Tools** | Wireshark, tshark, tcpdump |

## Challenge Description

> "We captured some network traffic on a suspicious segment. Something sensitive was transmitted in the clear. Find it."
>
> Provided: `capture.pcap` (42 MB packet capture file)

## Initial Analysis

Start by getting an overview of the capture file: protocol distribution, endpoints, and time range:

```bash
# Summary statistics
capinfos capture.pcap

# Protocol hierarchy
tshark -r capture.pcap -q -z io,phs
```

The protocol hierarchy showed a mix of traffic: TCP, HTTP, FTP, DNS, TLS, and ICMP. The presence of HTTP and FTP traffic is immediately interesting: both transmit data in plaintext.

```bash
# List unique endpoints
tshark -r capture.pcap -q -z endpoints,tcp
```

Two servers stood out: `192.168.1.100` (web server, port 80) and `192.168.1.200` (FTP server, port 21).

## Step 1: HTTP Traffic Analysis

Filter for HTTP requests to see what the user was doing:

```bash
tshark -r capture.pcap -Y "http.request" -T fields \
  -e frame.time -e ip.src -e http.request.method -e http.host -e http.request.uri
```

Output included several GET requests and one interesting POST:

```
POST /login HTTP/1.1
Host: 192.168.1.100
Content-Type: application/x-www-form-urlencoded

username=jsmith&password=Summer2024!
```

Credentials found, but this was not the flag. I noted them and continued investigating.

## Step 2: FTP Traffic Analysis

FTP transmits credentials in cleartext by design. Filter for FTP commands:

```bash
tshark -r capture.pcap -Y "ftp.request.command" -T fields \
  -e frame.time -e ip.src -e ftp.request.command -e ftp.request.arg
```

```
USER admin
PASS CTF{pl41nt3xt_cr3ds_4r3_d34d}
RETR confidential_report.pdf
QUIT
```

The FTP password is the flag: `CTF{pl41nt3xt_cr3ds_4r3_d34d}`

## Step 3: Following TCP Streams

For a more complete picture, Wireshark's "Follow TCP Stream" feature reconstructs the full conversation. In the GUI:

1. Filter: `ftp`
2. Right-click any FTP packet > Follow > TCP Stream

This shows the complete FTP session including server banners, authentication, and file transfer commands.

The same can be done on the command line:

```bash
# Find the TCP stream index for FTP
tshark -r capture.pcap -Y "tcp.port == 21" -T fields -e tcp.stream | sort -u

# Follow the stream (e.g., stream 7)
tshark -r capture.pcap -q -z follow,tcp,ascii,7
```

## Step 4: Extracting Transferred Files

The FTP data transfer uses a separate connection. To extract the transferred file:

```bash
# Filter FTP-DATA
tshark -r capture.pcap -Y "ftp-data" -T fields -e ftp-data.setup-frame

# Export with Wireshark: File > Export Objects > FTP-DATA
```

The `confidential_report.pdf` contained internal company data: a secondary finding that compounds the severity of the credential exposure.

## Underlying Vulnerability

FTP and HTTP transmit all data: including credentials: as plaintext. Any attacker with network access (via ARP spoofing, compromised switch, rogue WiFi, or ISP-level access) can passively capture this traffic. This is not a theoretical risk; tools like Wireshark, tcpdump, and ettercap make it trivial.

## Defense and Mitigation

**Encrypt everything in transit.** There is no legitimate reason to use plaintext protocols on modern networks.

- **Replace FTP with SFTP or SCP**: Both use SSH for encrypted file transfer.
  ```bash
  # Instead of: ftp server.example.com
  sftp admin@server.example.com
  ```
- **Replace HTTP with HTTPS**: Enforce TLS on all web services. Use HSTS headers to prevent downgrade attacks.
  ```
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  ```
- **Network segmentation**: Limit the blast radius of a network compromise by isolating sensitive services.
- **VPN for remote access**: All remote connections should go through an encrypted tunnel.
- **Monitor for plaintext protocols**: IDS rules can alert when FTP, Telnet, or HTTP traffic appears on internal networks.
- **Credential rotation**: If plaintext credentials may have been exposed, rotate them immediately.

## References

- [Wireshark User Guide](https://www.wireshark.org/docs/wsug_html/)
- [tshark Documentation](https://www.wireshark.org/docs/man-pages/tshark.html)
- [OWASP Transport Layer Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html)
