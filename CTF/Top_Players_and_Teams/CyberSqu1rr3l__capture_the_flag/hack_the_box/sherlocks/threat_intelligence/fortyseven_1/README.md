```
888888  dP"Yb  88""Yb 888888 Yb  dP .dP"Y8 888888 Yb    dP 888888 88b 88            .d 
88__   dP   Yb 88__dP   88    YbdP  `Ybo." 88__    Yb  dP  88__   88Yb88 ________ .d88 
88""   Yb   dP 88"Yb    88     8P   o.`Y8b 88""     YbdP   88""   88 Y88 """"""""   88 
88      YbodP  88  Yb   88    dP    8bodP' 888888    YP    888888 88  Y8            88 
```
An APT group is using *Hajj*-themed phishing lures to target and steal WhatsApp data
from government and diplomatic officials. Our team has gathered fragmented intelligence
from public cybersecurity vendor reports, blog posts, and internal security alerts.
Your task is to build a comprehensive profile of the threat actor responsible. [^1]

Task 1
----------------------------------------------------------------------------------------
**What is the primary name of the APT group described in the SecureList report?**

In the SecureList [^2] blog article, we are informed about the highly active *Advanced
Persistent Threat* (APT) group that was discovered in 2023. It's main targeting domain
lies in government entities and foreign affairs sectors in the Asia-Pacific region.

Task 2
----------------------------------------------------------------------------------------
**Since which year has this group's attack activity been dated back to?**

In "Unveiling the Past and Present of APT-K-47 Weapon: Asyncshell" [^4] by Knownsec 404
team's analysis, we are informed in the *overview* how far attack activities date back
to and that the team originated in the South Asian region.

Task 3
----------------------------------------------------------------------------------------
**What is the name of the first malicious exported entry function?**

The group uses a custom backdoor that communicates via *Office Remote Procedure Call*
(ORPCBackdoor). According to the Knownsec 404 team's analysis [^3] of the ORPCBackdoor
sample functions, there are two malicious entries of the backdoor.

Task 4
----------------------------------------------------------------------------------------
**The previously mentioned backdoor checks for a file before creating persistence.
What is the name of the file?**

Task 5
----------------------------------------------------------------------------------------
**The use of the backdoor links the APT to another well-known South Asian APT group.
What is the name of this group?**

Task 6
----------------------------------------------------------------------------------------
**The APT group we are currently investigating has consistently used and updated another
backdoor since 2023, with its C2 communication evolving from TCP to HTTPS. What is the
name of this tool?**

Task 7
----------------------------------------------------------------------------------------
**To evade sandbox analysis, the MemLoader HidenDesk tool checks the number of active
processes before running. What is the minimum number of processes required for it to
proceed?**

Task 8
----------------------------------------------------------------------------------------
**The MemLoader HidenDesk tool creates a covert environment for its activities by
creating and switching to a specific environment. What is the name of this hidden
desktop?**

Task 9
----------------------------------------------------------------------------------------
**The MemLoader HidenDesk tool achieves persistence by placing a shortcut in the
autostart folder to ensure it runs after a system reboot. What is the MITRE ATT&CK ID
for the 'Registry Run Keys / Startup Folder' technique?**

Task 10
----------------------------------------------------------------------------------------
**The actor uses several custom exfiltration tools targeting WhatsApp. What is the name
of the tool that recursively searches specific directories, including the `Desktop` and
`Downloads` folders?**

Task 11
----------------------------------------------------------------------------------------
**Kaspersky's analysis highlights the actor's heavy use of scripts for execution and
deploying payloads. What is the MITRE ATT&CK ID for the `PowerShell` technique?**

Task 12
----------------------------------------------------------------------------------------
**In their early attack chains, Mysterious Elephant used a downloader that was
previously associated with the Origami Elephant group. What was the name of this
downloader?**

Task 13
----------------------------------------------------------------------------------------
**In a January 2024 campaign delivering an Asyncshell payload, which CVE was exploited
in the malicious archive file?**

Task 14
----------------------------------------------------------------------------------------
**What is the MD5 hash of the ChromeStealer Exfiltrator sample named `WhatsAppOB.exe`**?

Task 15
----------------------------------------------------------------------------------------
**The intelligence describes multiple custom tools designed to upload stolen data to the
actor's servers. According to the MITRE ATT&CK framework, what is the ID for the
*Exfiltration Over C2 Channel* technique?**

[^1]: https://app.hackthebox.com/sherlocks/FortySeven-1?tab=play_sherlock
[^2]: https://securelist.com/mysterious-elephant-apt-ttps-and-tools/117596/
[^3]: https://medium.com/@knownsec404team/apt-k-47-mysterious-elephant-a-new-apt-organization-in-south-asia-5c66f954477
[^4]: https://medium.com/@knownsec404team/unveiling-the-past-and-present-of-apt-k-47-weapon-asyncshell-5a98f75c2d68
