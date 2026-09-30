```
 __     __   __     __   __   __     ______   ______        ______     __   __     __         __  __    
/\ \   /\ "-.\ \   /\ \ / /  /\ \   /\__  _\ /\  ___\      /\  __ \   /\ "-.\ \   /\ \       /\ \_\ \   
\ \ \  \ \ \-.  \  \ \ \'/   \ \ \  \/_/\ \/ \ \  __\      \ \ \/\ \  \ \ \-.  \  \ \ \____  \ \____ \  
 \ \_\  \ \_\\"\_\  \ \__|    \ \_\    \ \_\  \ \_____\     \ \_____\  \ \_\\"\_\  \ \_____\  \/\_____\ 
  \/_/   \/_/ \/_/   \/_/      \/_/     \/_/   \/_____/      \/_____/   \/_/ \/_/   \/_____/   \/_____/ 
```
In this room, we extract insight from a set of flagged artefacts, and distil the
information into usable threat intelligence. [^1]

What is the name of the file identified with the flagged SHA256 hash?
-----------------------------------------------------------------------------------------
Upon starting the target machine, we launch the *TryDetectThis2.0* application which
appears to be a VirusTotal clone. In here, we can search or analyse suspicious files,
domains, IPs and URLs. So, we start by entering the flagged SHA256 hash from the task
description into the search bar. In the file report, we are now prompted with the *name
of the file* in the center of the overview.

What is the file type associated with the flagged SHA256 hash?
-----------------------------------------------------------------------------------------
Besides the name of the file, directly below it, we can also discover the type of the
executable.

What are the execution parents of the flagged hash? List the names chronologically, using
a comma as a separator and note down the hashes.
-----------------------------------------------------------------------------------------
By browsing the *Relations* tab of the file report we can further discover two *Execution
Parents*, a Powershell and Win32 EXE and we note down the names separated by a comma.

What is the name of the file being dropped? Note down the hash value.
-----------------------------------------------------------------------------------------
Right below this information, we also discover a dropped file with an unknown file type.

Research the second hash in question 3 and list the four malicious dropped files in the
order they appear from up to down, separated by commas.
-----------------------------------------------------------------------------------------
For this research, we want to copy the hash as it is listed below the file type and name
for the Win32 EXE in the Execution Parents and search for it. Then, we have a look at the
Relations tab again and notice 20 dropped files. However, out of the 20 dropped files
there are only four files that were flagged as malicious from threat detection vendors.

Analyse the files related to the flagged IP. What is the malware family that links these
files?
-----------------------------------------------------------------------------------------
First, we copy the flagged IP address from the task description after removing the
defanging characters. On the first attempt, we move to the Relations tab and copy all the
communicating files' hashes to then search for them in the VirusTotal instance but cannot
find any result. Then, we also look at the comments from the community and discover the
*Indicator of Compromise* (IOC) context which is the classified malware family name.
Further, we discover the "malpedia" keyword and a quick Google search reveals more
information about this type of malware. [^2]

What is the title of the original report where these flagged indicators are mentioned?
Use Google to find the report.
-----------------------------------------------------------------------------------------
In the comment that was used for the previous task as well, we clearly see a title of an
article [^3] that reports the flagged indicators of hijacked Discord invites.

Which tool did the attackers use to steal cookies from Google Chrome?
-----------------------------------------------------------------------------------------
Upon reading the report mentioned above, we find out the name of the adapted tool that
attackers use to steal cookies from new Chromium browser versions and thus bypass
Chrome's *App Bound Encryption* (ABE).

Which phishing technique did the attackers use? Use the report to answer.
-----------------------------------------------------------------------------------------
By reading the multi-stage payload delivery paragraph in the blog article, we find out
how the phishing was performed using hijacked Discord invites and the phishing technique.

What is the name of the platform that was used to redirect a user to malicious servers?
-----------------------------------------------------------------------------------------
Reading the report, will inform us about the name of the platform that was used to lure
victims into clicking onto redirects to malicious servers which host a phishing website.

[^1]: https://tryhackme.com/room/invite-only
[^2]: https://malpedia.caad.fkie.fraunhofer.de/details/win.asyncrat
[^3]: https://research.checkpoint.com/2025/from-trust-to-threat-hijacked-discord-invites-used-for-multi-stage-malware-delivery/
