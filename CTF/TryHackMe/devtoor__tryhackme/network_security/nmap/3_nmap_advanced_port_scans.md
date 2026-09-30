# Nmap Advanced Port Scans

[Nmap Advanced Port Scans Room](https://tryhackme.com/room/nmap03)

Learn advanced techniques such as null, FIN, Xmas, and idle (zombie) scans, spoofing, in addition to FW and IDS evasion.

| Port Scan Type | Example Command |
| :----: | :----: |
| TCP Null Scan | `sudo nmap -sN <MACHINE_IP>` |
| TCP FIN Scan | `sudo nmap -sF <MACHINE_IP>` |
| TCP Xmas Scan | `sudo nmap -sX <MACHINE_IP>` |
| TCP Maimon Scan | `sudo nmap -sM <MACHINE_IP>` |
| TCP ACK Scan | `sudo nmap -sA <MACHINE_IP>` |
| TCP Window Scan | `sudo nmap -sW <MACHINE_IP>` |
| Custom TCP Scan | `sudo nmap --scanflags [URG-ACK-PSH-RST-SYN-FIN] <MACHINE_IP>` |
| Spoofed Source IP | `sudo nmap -S <SPOOFED_IP> <MACHINE_IP>` |
| Spoofed MAC Address | `--spoof-mac <SPOOFED_MAC>` |
| Decoy Scan | `nmap -D <DECOY_IP>,<ME> <MACHINE_IP>` |
| Idle (Zombie) Scan | `sudo nmap -sI <ZOMBIE_IP> <MACHINE_IP>` |
| Fragment IP data into 8 bytes | `-f` |
| Fragment IP data into 16 bytes | `-ff` |

>: Scan `-sN`, `-sF` and `-sX`  can be efficient is when scanning a target behind a stateless (non-stateful) firewall. A stateless firewall will check if the incoming packet has the SYN flag set to detect a connection attempt. Using a flag combination that does not match the SYN packet makes it possible to deceive the firewall and reach the system behind it.
>: ACK `-sA` and window `-sW` scans are exposing the firewall rules, not the services.
>: Scan types rely on setting TCP flags in unexpected ways to prompt ports for a reply. Null `-sN`, FIN `-sF`, and Xmas `-sX` scan provoke a response from closed ports, while Maimon `-sM`, ACK `-sA`, and Window `-sW` scans provoke a response from open and closed ports.

| Option | Purpose |
| :----: | :----: |
| `--source-port <PORT_NUM>` | specify source port number |
| `--data-length <NUM>` | append random data to reach given length |
| `--reason` | explains how Nmap made its conclusion |
| `-v` | verbose |
| `-vv` | very verbose |
| `-d` | debugging |
| `-dd` | more details for debugging |
