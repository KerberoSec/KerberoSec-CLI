# HTB Machines: Writeup Repository

HTB Machines are full end-to-end penetration testing exercises, each requiring the practitioner to move through a complete engagement lifecycle: service enumeration, vulnerability identification, initial access, and privilege escalation to root or SYSTEM. Unlike Challenges, which isolate individual techniques, machines demand chaining across multiple services and reasoning under incomplete information. Every machine solved here is documented as a record of how the problem was approached: not as a replication guide.

Writeups are organised by operating system and difficulty tier. Active, non-retired machines are withheld from publication in accordance with HTB platform policy.

---

## Repository Structure

```
2. Machines/
├── 1. Linux/
│   ├── 1. Easy/
│   ├── 2. Medium/
│   ├── 3. Hard/
│   └── 4. Insane/
├── 2. Windows/
│   ├── 1. Easy/
│   ├── 2. Medium/
│   ├── 3. Hard/
│   └── 4. Insane/
└── README.md
```

---

## Difficulty Reference

| Difficulty | Typical Duration | Complexity | Primary Attack Surface |
|---|---|---|---|
| Easy | 1-3 hours | Single vector; well-documented vulnerability class | Exposed web application or network service; common misconfiguration-based privilege escalation |
| Medium | 3-6 hours | Multi-step chain; some scripting or tool adaptation required | Custom application logic; chained vulnerabilities; intermediate privilege escalation paths |
| Hard | 6-12 hours | Research-driven; exploit adaptation; pivoting frequently required | Obscure CVEs; internal services reachable only post-exploitation; complex privilege chains |
| Insane | 12-30+ hours | Novel techniques; custom exploit development; minimal public guidance | Kernel exploitation, advanced binary analysis, deep AD chains, unconventional service interaction |

---

## Writeup Format

Each writeup follows a consistent structure:

- Machine name, OS, IP, and difficulty
- Full Nmap output and initial reconnaissance summary
- Service enumeration notes per discovered port
- Vulnerability identification and exploitation approach
- Privilege escalation path with commands used
- Root or SYSTEM proof
- Post-completion notes: alternative paths identified from community writeup review
- Key takeaway: one technique or pattern worth retaining

---

## Tools Referenced Across Writeups

**Enumeration:** Nmap, Feroxbuster, Gobuster, smbclient, smbmap, enum4linux-ng, CrackMapExec, ldapdomaindump

**Web exploitation:** Burp Suite, SQLMap (post-manual identification), ffuf, wfuzz, nikto

**Exploitation:** Metasploit (CVE confirmation only), custom Python scripts, pwntools, searchsploit

**Credential attacks:** Hashcat, John the Ripper, Kerbrute, Impacket suite, Responder

**Active Directory:** BloodHound, SharpHound, Rubeus, PowerView, Evil-WinRM, Certipy

**Privilege escalation:** LinPEAS, WinPEAS, pspy, GTFOBins reference, PowerSploit

**Pivoting:** Chisel, Ligolo-ng, SSH tunnelling, proxychains

**Binary analysis:** Ghidra, GDB with pwndbg, pwntools, strings, ltrace, strace

---

## Notes

Writeups for active machines are published upon HTB retirement. Difficulty ratings reflect the platform's classification at time of completion: HTB occasionally re-rates machines after community feedback. Where a re-rating occurs after a writeup is published, the original difficulty is noted alongside the current rating.

Post-completion community writeup review is standard practice for every machine. Where an alternative approach is identified that differs meaningfully from the primary solution, it is documented in a dedicated section at the end of the writeup.
