```
oooooooooo.                           .                        
`888'   `Y8b                        .o8                        
 888     888 oooo d8b oooo  oooo  .o888oo oooo  oooo   .oooo.o 
 888oooo888' `888""8P `888  `888    888   `888  `888  d88(  "8 
 888    `88b  888      888   888    888    888   888  `"Y88b.  
 888    .88P  888      888   888    888 .  888   888  o.  )88b 
o888bood8P'  d888b     `V88V"V8P'   "888"  `V88V"V8P' 8""888P' 
```
In this very easy Sherlock, we will familiarize ourselves with Unix *auth.log* and *wtmp*
logs. We'll explore a scenario where a Confluence server was brute-forced via its SSH
service. After gaining access to the server, the attacker performed additional
activities, which we can track using *auth.log*. Although *auth.log* is primarily used
for brute-force analysis, we will delve into the full potential of this artifact in our
investigation, including aspects of privilege escalation, persistence, and even some
visibility into command execution. [^1]

Task 1
-----------------------------------------------------------------------------------------
**Analyze the auth.log. What is the IP address used by the attacker to carry out a brute
force attack?**

After downloading the `Brutus.zip` file, we try to `unzip` it but get an error message,
that both the `auth.log` and `wtmp` files could not be uncompressed due to method 99.
This tells us that the file was archived using AES, for which `7z x` extraction is
favorable. And indeed, with the 7-Zip extraction, we are able to see all the two files
and a `utmp.py` script.

Next, we browse the system log file `auth.log` which records all authentication and
security-related events. Here, we discover a repeated pattern of a failed login attempt
from the attacker's IP address to different ports via SSH. The listed behavior is common
for a brute force attack because there are many attempts from the same IP address and
username `svc_account`, often within the same second.

Task 2
-----------------------------------------------------------------------------------------
**The bruteforce attempts were successful and the attacker gained access to an account on
the server. What is the username of the account?**

Finally, after many attempts, the attacker switches from the `svc_account` to a valid
user account that is bound to exist on any Linux machine. Yet, again they fail with a
few wrong passwords, until at *March 6, 6:31:40 am* they are able to log in successfully.
After that, they are given full control through a remote shell and we can observe a few
more failed attempts.

Task 3
-----------------------------------------------------------------------------------------
**Identify the UTC timestamp when the attacker logged in manually to the server and
established a terminal session to carry out their objectives. The login time will be
different than the authentication time, and can be found in the wtmp artifact.**

Since, we are already given the hint to check `wmtp` artifacts, we open it with the
`TZ=UTC last -F -f wtmp` command in UTC timezone. In here, we can observe the first
manual connection from the attacker's IP address to the server which varies slightly
from the `auth.log` entry because some session initialization had to happen first.

Later, we have also discovered the helper script `utmp.py` given to us in the *Brutus*
archive. With it, we could have also read the binary log file `wtmp` record by record.
It could have helped us to decode each field and output it in human-readable format.

Task 4
-----------------------------------------------------------------------------------------
**SSH login sessions are tracked and assigned a session number upon login. What is the
session number assigned to the attacker's session for the user account from Question 2?**

From the previous task, we have found out the exact timestamp, for which the attacker
could log in to the server with the user account. Now, we scroll down to the timestamp of
the event in the `auth.log` file and observe a *system-logind* logging entry which tells
us the number of the session that was created for the user.

Task 5
-----------------------------------------------------------------------------------------
**The attacker added a new user as part of their persistence strategy on the server and
gave this new user account higher privileges. What is the name of this account?**

Right after the session from the previous task was created, we can discover a `useradd`
event with the new account name. This user is added to the sensitive `/etc/group` and
`/etc/gshadow` group files, thus enabling privileged group management.

Task 6
-----------------------------------------------------------------------------------------
**What is the MITRE ATT&CK sub-technique ID used for persistence by creating a new
account?**

The attacker has created a new account after initial access as part of the persistence
strategy. So, we navigate the official *MITRE Adversarial Tactics, Techniques, and Common
Knowledge* website [^2] and search for the term "Create Account". From a list of sub-
categories we can now choose, whether it was a local, domain or cloud account. Since the
adversary has created only a local account with the `useradd` command, we have found our
sub-technique [^3] featuring mitigation and detection strategies.

Task 7
-----------------------------------------------------------------------------------------
**What time did the attacker's first SSH session end according to auth.log?**

In the `auth.log` authentication logging file, we have already kept record of the SSH
login session number from task four. In order, to find the detach event from this
session, we can now search for the session with the number and find another
*system-logind* logging entry which tells us that the session was removed. We keep track
of the timestamp for this task.

Task 8
-----------------------------------------------------------------------------------------
**The attacker logged into their backdoor account and utilized their higher privileges to
download a script. What is the full command executed using sudo?**

A few lines down the first SSH session detachment, the adversary logs in as the new user
account and prints the contents of the sensitive `/etc/shadow` file with `cat`. But, what
is more interesting to us in this context is happening a few lines below this event.
The adversary is downloading a potentially malicious script from a GitHub domain and
executing it.

[^1]: https://app.hackthebox.com/sherlocks/Brutus?tab=play_sherlock
[^2]: https://attack.mitre.org/
[^3]: https://attack.mitre.org/techniques/T1136/001/
