# Nmap Visualizer

An interactive browser-based tool that visualizes how Nmap scans work: packet flow, flag behavior, and NSE script output: without touching a real network.

## Usage

Open `nmap_visualizer.html` in any modern browser. No server, no dependencies, no install.

1. Pick a scan type from the left panel
2. Toggle any flags or NSE scripts
3. Adjust the speed slider
4. Hit **Run ↗** and watch the packet flow

The command bar at the top updates in real time and shows the exact `nmap` command being simulated.

## Scan Types Covered

| Flag | Scan | Notes |
|------|------|-------|
| `-sS` | SYN Stealth | Half-open, never completes handshake |
| `-sT` | TCP Connect | Full 3-way handshake via `connect()` |
| `-sU` | UDP | Probe + ICMP unreachable on closed ports |
| `-sA` | TCP ACK | Firewall rule mapping |
| `-sW` | TCP Window | Window size-based open/closed inference |
| `-sN` | NULL | No flags set: silence = open |
| `-sF` | FIN | FIN only: RST = closed, silence = open |
| `-sX` | XMAS | FIN+PSH+URG: same logic as NULL/FIN |
| `-sM` | Maimon | FIN+ACK: works on some BSD stacks |
| `-sI` | Idle/Zombie | Blind scan via IPID side-channel |
| `-sY` | SCTP INIT | SCTP equivalent of SYN scan |
| `-sO` | IP Protocol | Probes for supported IP protocols |

## Flags & NSE Scripts

Covers host discovery (`-Pn`, `-PE`, `--traceroute`), timing (`-T0` through `-T5`), service/OS detection (`-sV`, `-O`, `-A`), evasion (`-f`, `-D`, `--spoof-mac`, `--badsum`), output formats, and 12 NSE scripts including:

- `smb-vuln-ms17-010` (EternalBlue)
- `ssl-heartbleed`
- `dns-zone-transfer`
- `http-enum`, `ftp-anon`, `ssh-brute`, `mysql-empty-password`

## Packet Log

Every packet exchange is logged in the scrollable table at the bottom: direction, TCP flags, port, and state. NSE and OS detection results append after the scan completes.

## Notes

- This is a **simulation** for learning purposes. No real packets are sent.
- Supports light and dark mode via `prefers-color-scheme`.
- Tested in Chrome, Firefox, and Safari.
