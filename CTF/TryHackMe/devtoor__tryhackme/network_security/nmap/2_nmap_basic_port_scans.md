# Nmap Basic Port Scans

[Nmap Basic Port Scans Room](https://tryhackme.com/room/nmap02)

Learn in-depth how nmap TCP connect scan, TCP SYN port scan, and UDP port scan work.

| Port Scan Type | Example Command |
| :----: | :----: |
| TCP Connect Scan | `nmap -sT <MACHINE_IP>` |
| TCP SYN Scan | `sudo nmap -sS <MACHINE_IP>` |
| UDP Scan | `sudo nmap -sU <MACHINE_IP>` |

>: These scan types should get you started discovering running TCP and UDP services on a target host.

| Option | Purpose |
| :----: | :----: |
| `-p-` | all ports |
| `-p1-1023` | scan ports 1 to 1023 |
| `-F` | 100 most common ports |
| `-r` | scan ports in consecutive order |
| `-T<0-5>` | -T0 being the slowest and T5 the fastest |
| `--max-rate 50` | rate <= 50 packets/sec |
| `--min-rate 15` | rate >= 15 packets/sec |
| `--min-parallelism 100` | at least 100 probes in parallel |

>: `-T4` is often used during CTFs and when learning to scan on practice targets, whereas `-T1` is often used during real engagements where stealth is more important.
