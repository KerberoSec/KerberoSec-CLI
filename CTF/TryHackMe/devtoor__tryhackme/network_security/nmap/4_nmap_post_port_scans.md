# Nmap Post Port Scans

[Nmap Post Port Scans Room](https://tryhackme.com/room/nmap04)

Learn how to leverage Nmap for service and OS detection, use Nmap Scripting Engine (NSE), and save the results.

| Option | Meaning |
| :----: | :----: |
| `-sV` | determine service/version info on open ports |
| `-sV --version-light` | try the most likely probes (`2`) |
| `-sV --version-all` | try all available probes (`9`) |
| `-O` | detect OS |
| `--traceroute` | run traceroute to target |
| `--script=<SCRIPTS>` | Nmap scripts to run |
| `-sC` or `--script=default` | run default scripts |
| `-A` | equivalent to `-sV -O -sC --traceroute` |
| `-oN` | save output in normal format |
| `-oG` | save output in grepable format |
| `-oX` | save output in XML format |
| `-oA` | save output in normal, XML and Grepable formats |

| Script Category | Description |
| :----: | :----: |
| `auth` | Authentication related scripts |
| `broadcast` | Discover hosts by sending broadcast messages |
| `brute` | Performs brute-force password auditing against logins |
| `default` | Default scripts, same as `-sC` |
| `discovery` | Retrieve accessible information, such as database tables and DNS names |
| `dos` | Detects servers vulnerable to Denial of Service (DoS) |
| `exploit` | Attempts to exploit various vulnerable services |
| `external` | Checks using a third-party service, such as Geoplugin and Virustotal |
| `fuzzer` | Launch fuzzing attacks |
| `intrusive` | Intrusive scripts such as brute-force attacks and exploitation |
| `malware` | Scans for backdoors |
| `safe` | Safe scripts that won’t crash the target |
| `version` | Retrieve service versions |
| `vuln` | Checks for vulnerabilities or exploit vulnerable services |
