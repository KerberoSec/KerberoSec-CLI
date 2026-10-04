# Nmap Host Discovery Cheatsheet

|   Scan Type       |          Example command          |
|-------------------|-----------------------------------|
|      ARP Scan     | `sudo nmap -PR -sn MACHINE_IP/24` |
|   ICMP Echo scan  | `sudo nmap -PE -sn MACHINE_IP/24` |
|   ICMP Timestamp  | `sudo nmap -PP -sn MACHINE_IP/24` |
| ICMP Address Mask | `sudo nmap -PM -sn MACHINE_IP/24` |
| TCP SYN Ping scan | `sudo nmap -PS -sn MACHINE_IP/24` |
| TCP ACK Ping scan | `sudo nmap -PA -sn MACHINE_IP/24` |
|   UDP Ping scan   | `sudo nmap -PU -sn MACHINE_IP/24` |

| Option |          Purpose          |
|--------|---------------------------|
|  `-n`  |       no DNS lookup       |
|  `-R`  | reverse-DNS for all hosts |
|  `-sn` |    host discovery only    |