# Delivery

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Easy |
| **IP Address** | 10.10.10.222 |
| **Status** | Retired |

## Overview
Delivery is an easy-rated Linux box built around the "TicketTrick" technique against an osTicket helpdesk instance. An unauthenticated user can abuse the support ticket workflow to obtain a temporary company email address, which in turn is usable to self-register on the box's internal MatterMost instance. Chat history leaked on MatterMost reveals a shared/reused password pattern and a set of internal credentials, giving a foothold via SSH. From there, a MySQL database backing MatterMost holds an admin password hash which cracks to a reused root password, and a root-owned cron job (`/root/mail.sh`) combined with weak `sudo`/file permissions provides the path to full root.

## Reconnaissance
An initial `nmap` scan (`nmap -sC -sV`) against `10.10.10.222` (hostname `delivery.htb`) showed only two open TCP ports:

```
22/tcp open  ssh     OpenSSH 7.9p1 Debian 10+deb10u2 (protocol 2.0)
80/tcp open  http    nginx 1.14.2
```

The web root on port 80 displayed a generic "Welcome" page. Further enumeration/browsing of the site revealed a helpdesk (osTicket) application, and a separate service was found running on port **8065**: a MatterMost instance reachable at `@delivery.htb`, which required a valid `@delivery.htb` mail address to register.

## Enumeration
Registering on MatterMost required an email at the `delivery.htb` domain. The osTicket support portal on port 80 allows anyone to open a new ticket, and osTicket auto-generates a unique, disposable reply-to address of the form `<ticket-id>@delivery.htb` (the **TicketTrick**) for use in the ticket thread. This disposable address can be used as a "real" mailbox: any message sent to it appears back in the ticket thread, effectively giving an attacker a working inbox on the internal domain without needing real credentials.

Using this trick, a ticket was opened to obtain an address (e.g. `9948449@delivery.htb`), and that address was used to complete MatterMost registration with an external email such as `shorida2@gmail.com`/`6902131@delivery.htb`, creating the account `shoridalulz` with password `Lol123456!`.

## Foothold
After joining MatterMost, the internal "Internal" team channel exposed conversation history between staff. From this chat:
- A shared/reused password pattern of `PleaseSubscribe!` (with likely numeric/case variants) was disclosed as an internal access password.
- Direct credentials for the mail user were leaked: `maildeliverer:Youve_G0t_Mail!`.

The `maildeliverer` credentials were used to log in over SSH, providing an initial low-privileged shell on the box.

## Privilege Escalation
Enumerating the host, the installed `sudo` version was **1.8.27**, and a system user `mattermost` existed corresponding to the locally running chat application. A root-owned cron job was present:

```
* * * * * root /root/mail.sh
```

MatterMost's configuration exposed local MySQL credentials (`mmuser:Crack_The_MM_Admin_PW`) for the `mattermost` database on `127.0.0.1:3306`. Querying the `Users` table returned the MatterMost admin (`root`) account's bcrypt password hash:

```
$2a$10$VM6EeymRxJ29r8Wjkr8Dtev0O.1STWb4.4ScG.anuu7v0EFJwgjjO
```

The hash was cracked offline using `hashcat` with rule-based mangling against the known `PleaseSubscribe!` password pattern (see the [4ARMED hashcat rule-based attack blog](https://www.4armed.com/blog/hashcat-rule-based-attack/) for the technique used to build candidate variants):

```
hashcat -m 3200 -r /usr/share/hashcat/rules/best64.rule lul.hash list
```

This recovered the password `PleaseSubscribe!21`, which was reused as the actual **root** system password (a classic case of admin credential reuse between the chat application and the OS account). Switching to root (`su root`) with this password completed the privilege escalation chain and allowed reading `/root/root.txt`.

## Lessons Learned
- Support-ticket "reply-to" auto-generated addresses can be abused as a throwaway internal mailbox (TicketTrick) to bypass domain-restricted registration on internal apps.
- Internal chat tools often leak sensitive operational details (shared passwords, service credentials) to any user who can join a public/internal channel.
- Password reuse between an application's database admin account and the underlying OS root account turns a minor application compromise into full system compromise.
- Rule-based hashcat attacks are effective when a known "base" password with likely variants (e.g. appended numbers, punctuation) has already been observed.

## Tools & References
- `nmap` for service discovery.
- MatterMost web client for internal channel enumeration.
- `hashcat` (mode 3200, `best64.rule`) for cracking the bcrypt admin hash.
- osTicket TicketTrick technique: https://sysdream.com/news/lab/2019-01-08-ticket-trick-how-anyone-could-create-account-on-your-org-idp/
- Hashcat rule-based attack reference: https://www.4armed.com/blog/hashcat-rule-based-attack/
- `lulz.html` and `test` were unrelated scratch/test files left in the working directory during manual testing: deleted as clutter, no attack-relevant content.
