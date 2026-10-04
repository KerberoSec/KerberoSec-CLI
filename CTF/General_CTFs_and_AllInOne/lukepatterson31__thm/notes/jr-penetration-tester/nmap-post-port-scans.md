# Nmap Post Port Scans

### Service Detection

`nmap -sV --version-intensity <0-9> <TARGET-IP>`

Using `-sV` forces Nmap to proceed with the 3-way TCP handshake and establish a connection.

### OS Detection and Traceroute

**OS Detection**

`nmap -sS -O <TARGET-IP>`

Needs at least 1 open and 1 closed port and is not 100% accurate

**Traceroute**

Add `--traceroute` to append a traceroute to the scan results

### Nmap Scripting Engine

| Script Category | Description                                                            |
|-----------------|------------------------------------------------------------------------|
| auth            | Authentication related scripts                                         |
| broadcast       | Discover hosts by sending broadcast messages                           |
| brute           | Performs brute-force password auditing against logins                  |
| default         | Default scripts, same as `-sC`                                         |
| discovery       | Retrieve accessible information, such as database tables and DNS names |
| dos             | Detects servers vulnerable to Denial of Service (DoS)                  |
| exploit         | Attempts to exploit various vulnerable services                        |
| external        | Checks using a third-party service, such as Geoplugin and Virustotal   |
| fuzzer          | Launch fuzzing attacks                                                 |
| intrusive       | Intrusive scripts such as brute-force attacks and exploitation         |
| malware         | Scans for backdoors                                                    |
| safe            | Safe scripts that won’t crash the target                               |
| version         | Retrieve service versions                                              |
| vuln            | Checks for vulnerabilities or exploit vulnerable services              |

`nmap --script=<SCRIPT> <TARGET-IP>`
`nmap --script "<SCRIPT>" <TARGET-IP>`

### Saving the Output

- Normal: `oN`

- Greppable: `-oG`

- XML: `-oX`

- All: `-oA` 
