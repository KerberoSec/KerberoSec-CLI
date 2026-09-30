### CPTS / HTB Penetration Tester Path <br>
### Active Directory Enumeration & Attacks: Scenario <br>
<mark>hook it up with a &#x2B50; if this helps.</mark> <br>
🐦: @<a href="https://x.com/st8less">**st8less**</a>

<br>
<br>

---

### Scenario

Engagement: pentest interns at `CAT-5 Security` running an internal pentest against `Inlanefreight`. Goals: domain enum, credential discovery, lateral movement, privilege escalation, capture DA creds. Final assessment = two internal pentests against Inlanefreight (external breach + internal foothold scenarios).

<br>

---

<br>

### Assessment Scope

In-scope:

| Range/Domain | Description |
|---|---|
| `INLANEFREIGHT.LOCAL` | Customer domain: AD + web services |
| `LOGISTICS.INLANEFREIGHT.LOCAL` | Customer subdomain |
| `FREIGHTLOGISTICS.LOCAL` | Subsidiary, external forest trust with INLANEFREIGHT.LOCAL |
| `172.16.5.0/23` | In-scope internal subnet |

Out of scope:
- Other subdomains of INLANEFREIGHT.LOCAL
- Any subdomains of FREIGHTLOGISTICS.LOCAL
- Phishing / social engineering
- Anything outside the listed targets
- Active attacks against the real-world `inlanefreight.com` site

<br>

---

<br>

### Methods Used

External info gathering = passive only against internet-facing surface: no port scans / active probes against the public site.

Internal testing = simulated untrusted insider perspective. Goals: domain user creds → enum → foothold → lateral/vertical movement → compromise all in-scope domains. No intentional service disruption.

Password testing = captured hashes can be loaded onto offline boxes for cracking and re-use during the engagement. Hashes/cleartext stay on Cat-5 systems only.
