### CPTS / HTB Penetration Tester Path <br>
### Active Directory Enumeration & Attacks: Access Control List (ACL) Abuse Primer <br>
<mark>hook it up with a &#x2B50; if this helps.</mark> <br>
🐦: @<a href="https://x.com/st8less">**st8less**</a>

<br>
<br>

---

### Access Control List (ACL) Abuse Primer

ACL = list defining who can access an object and at what level. Each entry = ACE.

Two ACL types:

| Type | Purpose |
|---|---|
| `DACL` | Discretionary: grants/denies access to security principals |
| `SACL` | System: generates audit logs on access attempts |

ACE types:

| ACE | Description |
|---|---|
| `Access denied` | Explicit deny in DACL |
| `Access allowed` | Explicit allow in DACL |
| `System audit` | Triggers audit log on access (SACL) |

Each ACE has 4 components:
1. SID of the principal
2. ACE type flag (denied / allowed / audit)
3. Inheritance flags
4. Access mask (32-bit)

ACLs evaluate top-to-bottom, stopping on first deny.

<br>

---

<br>

### Why ACEs Matter

Vuln scanners can't detect ACL misconfigs. They go unaudited for years in large/complex envs. Common Active Directory abuses (all enumerable in BloodHound, all abusable with PowerView):

| ACE | PowerView Abuse |
|---|---|
| `ForceChangePassword` | `Set-DomainUserPassword` |
| `Add Members` | `Add-DomainGroupMember` |
| `GenericAll` | `Set-DomainUserPassword` / `Add-DomainGroupMember` |
| `GenericWrite` | `Set-DomainObject` |
| `WriteOwner` | `Set-DomainObjectOwner` |
| `WriteDACL` | `Add-DomainObjectACL` |
| `AllExtendedRights` | `Set-DomainUserPassword` / `Add-DomainGroupMember` |
| `AddSelf` | `Add-DomainGroupMember` |

Module focus on 4 ACEs:

| ACE | Use |
|---|---|
| `ForceChangePassword` | Reset target's password without knowing the current one |
| `GenericWrite` | Write to non-protected attrs: set SPN for Kerberoast on user, add member on group, RBCD on computer |
| `AddSelf` | Add yourself to allowed groups |
| `GenericAll` | Full control: modify groups, force pw, targeted Kerberoast, read LAPS on computer |

Common attack scenarios:

| Attack | Description |
|---|---|
| `Help Desk pw reset perms` | Compromise IT account → reset higher-priv user pw |
| `Group mgmt rights` | Compromise account that can edit group members → add yourself to a privileged built-in or custom group |
| `Excessive user rights` | Legacy / accidental ACEs from app installs (e.g., Exchange) |

Some ACL abuse is "destructive" (changing user passwords). Get written client approval before performing, document everything, revert/clean up.

<br>

---

<br>

### ACL Abuse Primer Exercise

---

### Question 1:
What type of ACL defines which security principals are granted or denied access to an object? (one word)

&#x1F6A9; found **DACL**.

---

### Question 2:
Which ACE entry can be leveraged to perform a targeted Kerberoasting attack?

&#x1F6A9; found **GenericAll**.
