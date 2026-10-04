### CPTS / HTB Penetration Tester Path <br>
### Active Directory Enumeration & Attacks: Password Spraying Overview <br>
<mark>hook it up with a &#x2B50; if this helps.</mark> <br>
🐦: @<a href="https://x.com/st8less">**st8less**</a>

<br>
<br>

---

### Password Spraying Overview

Spray = one common password across many users (the inverse of brute force). Reduces lockouts but doesn't eliminate them: `must` know or guess the lockout policy.

Visualization:

| Attack | Username | Password |
|---|---|---|
| 1 | bob.smith@inlanefreight.local | Welcome1 |
| 1 | john.doe@inlanefreight.local | Welcome1 |
| 1 | jane.doe@inlanefreight.local | Welcome1 |
| DELAY |||
| 2 | bob.smith@inlanefreight.local | Passw0rd |
| 2 | john.doe@inlanefreight.local | Passw0rd |
| 2 | jane.doe@inlanefreight.local | Passw0rd |

Common policy: 5 bad attempts → 30-min auto-unlock. Internal access usually lets you pull the policy directly. Without it, send 1-2 sprays max with hours between.

Real-world examples:

| Scenario | Path |
|---|---|
| 1 | Combined `jsmith.txt` + LinkedIn names → Kerbrute userenum → spray `Welcome1` → 2 hits → BloodHound → DA. |
| 2 | PDF metadata revealed `F9L8` GUID username scheme → bash generated 1,679,616 perms → Kerbrute enumed every user → spray → RBCD + Shadow Credentials → domain takeover. |

Bash to generate 4-char A-Z + 0-9 GUIDs:

```diff
+ #!/bin/bash
+ for x in {{A..Z},{0..9}}{{A..Z},{0..9}}{{A..Z},{0..9}}{{A..Z},{0..9}}; do echo $x; done
```
