# Nmap Port Scan Cheatsheet

|  Port Scan Type  |       Example Command       |
|------------------|-----------------------------|
| TCP Connect Scan | `nmap -sT 10.10.72.90`      |
|   TCP SYN Scan   | `sudo nmap -sS 10.10.72.90` |
|     UDP Scan     | `sudo nmap -sU 10.10.72.90` |

|         Option        |            Purpose              |
|-----------------------|---------------------------------|
|         `-p-`         |            all ports            |
|      `-p1-1023`       |      scan ports 1 to 1023       |
|         `-F`          |      100 most common ports      |
|         `-r`          | scan ports in consecutive order |
|        `-T<0-5>`      |    -T0 slowest to T5 fastest    |
|     `--max-rate n`    |      rate <= n packets/sec      |
|     `--min-rate n`    |      rate >= n packets/sec      |
| `--min-parallelism n` |  at least n probes in parallel  |
| `--max-parallelism n` |   at most n probes in parallel  |