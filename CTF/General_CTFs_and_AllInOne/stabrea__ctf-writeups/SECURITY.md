# Security Policy

## Reporting a Vulnerability

If you discover a security issue related to this repository, please report it responsibly. **Do not open a public GitHub issue for security vulnerabilities.**

**Email:** [bishitaofik@gmail.com](mailto:bishitaofik@gmail.com)

Include in your report:

- A description of the issue and its potential impact
- The affected writeup(s) or script(s)
- Steps to reproduce, if applicable

## Response Timeline

| Action                     | Timeframe       |
|----------------------------|-----------------|
| Acknowledgment of report   | 48 hours        |
| Initial assessment         | 5 business days |
| Resolution                 | 15 days         |

Credit will be given to reporters unless anonymity is requested.

## Scope

The following are **in scope** for security reports:

- Exploit scripts in `scripts/` that contain unintended vulnerabilities (e.g., command injection in helper tools)
- Accidentally included secrets, credentials, API keys, or flags from live infrastructure
- Malicious content injected into writeup files or scripts (supply chain concerns)
- Dependencies in helper scripts with known CVEs

The following are **out of scope**:

- The vulnerability techniques described in the writeups themselves (that is their entire purpose)
- CTF platform vulnerabilities (report those to the respective CTF organizers)
- Theoretical improvements to exploit techniques documented here

## Responsible Disclosure of Writeup Content

All writeups in this repository document challenges from **completed CTF competitions** or **purpose-built practice environments**. No writeup targets live production systems. If you believe any content inadvertently discloses a vulnerability in a live system, please contact us immediately so we can review and redact if necessary.

## Educational Purpose

This repository exists for **educational purposes only**. The techniques documented here should only be applied in authorized environments (CTF competitions, personal labs, or with explicit written permission). The maintainers do not condone unauthorized use of any technique described in these writeups.
