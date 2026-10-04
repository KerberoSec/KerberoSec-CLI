---
title: Active Directory Explained: Fine Tuning Controls for Privileged Accounts
date: 2024-12-24
categories: [Active Directory, Security Controls, Windows, Network, Hardening]
tags: [active directory,security,controls,security controls,hardening,windows,network]
comments: true
---

_image credit: Iperius_

Highly privileged accounts (Domain Admins, Administrators, Enterprise Admins,
etc.) are the ultimate goal for every threat actor or hacker out there. These accounts
are sought after because they have unrestricted access and are used to perform
administrative tasks within an Active Directory (AD) environment.

By default, [Microsoft](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/security-best-practices/appendix-f--securing-domain-admins-groups-in-active-directory) 
makes the Domain Admins group a member of the local administrator group on all domain-joined 
servers and workstations. While this default configuration offers significant administrative 
convenience (i.e, troubleshooting & support, centralized control, etc), it also poses security 
risks to both domain and local environments.

Additionally, it increases the attack surface for compromising the domain if any of
these highly privileged accounts access a workstation through local logon, remote
logon or run as, because the credentials for these accounts will be stored on the
workstation.

➡️ [Read more here...](https://blog.cyberplural.com/active-directory-explained-part-4-fine-tuning-controls-for-privileged-accounts/)

