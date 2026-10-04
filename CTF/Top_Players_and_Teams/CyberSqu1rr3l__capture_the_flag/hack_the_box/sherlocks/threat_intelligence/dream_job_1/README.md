```
:::::::::  :::::::::  ::::::::::     :::     ::::    ::::       ::::::::::: ::::::::  :::::::::         :::   
:+:    :+: :+:    :+: :+:          :+: :+:   +:+:+: :+:+:+          :+:    :+:    :+: :+:    :+:      :+:+:   
+:+    +:+ +:+    +:+ +:+         +:+   +:+  +:+ +:+:+ +:+          +:+    +:+    +:+ +:+    +:+        +:+   
+#+    +:+ +#++:++#:  +#++:++#   +#++:++#++: +#+  +:+  +#+          +#+    +#+    +:+ +#++:++#+         +#+   
+#+    +#+ +#+    +#+ +#+        +#+     +#+ +#+       +#+          +#+    +#+    +#+ +#+    +#+        +#+   
#+#    #+# #+#    #+# #+#        #+#     #+# #+#       #+#      #+# #+#    #+#    #+# #+#    #+#        #+#   
#########  ###    ### ########## ###     ### ###       ###       #####      ########  #########       #######
```
You are a junior threat intelligence analyst at a Cybersecurity firm. You have been
tasked with investigating a Cyber espionage campaign known as Operation Dream Job.
The goal is to gather crucial information about this operation. [^1]

Task 1
-----------------------------------------------------------------------------------------
**Who conducted Operation Dream Job?**

At first, we download the archived file and upon extracting the only text file from it,
we are prompted with three hashes. This leads us to enter them in the VirusTotal search
bar, where we are informed about their malicious nature. [^2] Here, we can already
discover the `lazarus.doc` in the information and get suspicious that this might be a
file sponsored by the North Korean state. And indeed, by searching for the name of the
phishing campaign "Salary_Lockheed_Martin_job_opportunities_confidential" in a search
engine, we are prompted with several articles on operation dream job's malware analysis.
For example, in a news article [^3], we are informed about the fake Lockheed Martin job
offering phishing campaign, as it was conducted by the state-sponsored, North
Korean hacking group. This hacking group has been famous in the past for the notorious
*WannaCry* ransomware outbreak, million-dollar Bangladesh bank heist and Sony breach, to
name a few. [^4]

Task 2
-----------------------------------------------------------------------------------------
**When was this operation first observed?**

Finally, we search for *Operation Dream Job* directly in a search engine, and discover
a *MITRE ATT&CK* campaign entry. [^5]

Task 3
-----------------------------------------------------------------------------------------
**There are 2 campaigns associated with Operation Dream Job. One is Operation North
Star, what is the other?**

In the previous campaign entry, we can directly see the first seen date, as well as the
associated campaign descriptions.

Task 4
-----------------------------------------------------------------------------------------
**During Operation Dream Job, there were the two system binaries used for proxy
execution. One was `Regsvr32`, what was the other?**

In the campaign description, we search for the `Regsvr32` binary and discover it along
with another system binary proxy execution of malware in the form of a *Dynamic Link
Library* (DLL) file.

Task 5
-----------------------------------------------------------------------------------------
**What lateral movement technique did the adversary use?**

For that, we want to open the *ATT&CK Navigation Layers* [^6] for the Operation Dream
Job attack in a separate tab. In here, we can move to the *Lateral Movement* techniques
and find out phishing sub-category that was used on the organization.

Task 6
-----------------------------------------------------------------------------------------
**What is the technique ID for the previous answer?**

By hovering over the lateral movement technique in the navigation layers, we can find out
the ATT&CK technique ID.

Task 7
-----------------------------------------------------------------------------------------
**What Remote Access Trojan did the Lazarus Group use in Operation Dream Job?**

Firstly, we search for the *Remote Access Trojan* (RAT) in the context of Operation Dream
Job and find out about the *ScoringMathTea* RAT that the group had used in a number of
attacks. [^7] This RAT is distributed through two distinct kill chains and implements
multiple layers of obfuscation. [^8] However, this RAT is not the one we want for this
task and instead, we investigate the *Software* section of the MITRE ATT&CK entry some
more. In here, we can find the RAT that was used to deploy open source software and
partly commodity software such as Responder, Wake-On-Lan, and ChromePass to target
infected hosts. As it turns out, this custom RAT includes anti-debugging, sandbox
evasion and encrypted code sections. [^9]

Task 8
-----------------------------------------------------------------------------------------
**What technique did the malware use for execution?**

Again, in the MITRE ATT&CK navigation layers view [^6], we can move to the *Execution*
techniques, and identify how the victim's User-Agent could be obtained and used to
connect to their *Command and Control* (C2) server.

Task 9
-----------------------------------------------------------------------------------------
**What technique did the malware use to avoid detection in a sandbox?**

In the MITRE ATT&CK campaign overview, we search for *Sandbox Evasion* and discver two
such techniques that were employed, with the first one being *System Checks*. The other
one is more sophisticated as it collects time data to detect VMware or similar.

Task 10
-----------------------------------------------------------------------------------------
**To answer the remaining questions, utilize VirusTotal and refer to the IOCs.txt file.
What is the name associated with the first hash provided in the IOC file?**

We have already started a search in VirusTotal on the first file hash before, [^10] and
found out the executable file name for the *Internet Explorer* that it is associated
with.

Task 11
-----------------------------------------------------------------------------------------
**When was the file associated with the second hash in the IOC first created?**

Again, we open VirusTotal but with the second hash, and move to the *Details* tab. In
here, we can discover the *Creation Time*.

Task 12
-----------------------------------------------------------------------------------------
**What is the name of the parent execution file associated with the second hash in the
IOC?**

For this task, we move on to the *Relations* tab and search for the *Executable Parents*.

Task 13
-----------------------------------------------------------------------------------------
**Examine the third hash provided. What is the file name likely used in the campaign that
aligns with the adversary's known tactics?**

This is the file name that already sparked our interest in the first place. We discovered
it in the *Details* tab of the third file hash and it already hints at a phishing
campaign that was about to happen with the lure of a *Lockheed Martin* job opportunity.

Task 14
-----------------------------------------------------------------------------------------
**Which malicious URL in the contacted URLs is used to fetch a secondary .docx file?**

For this task, we succeed by going to the *Relations* tab in the third file hash scan
and search for a contacted URL featuring a request to a *Word Document*, of which there
is only one.

[^1]: https://app.hackthebox.com/sherlocks/Dream%2520Job-1?tab=play_sherlock
[^2]: https://www.virustotal.com/gui/file/0160375e19e606d06f672be6e43f70fa70093d2a30031affd2929a5c446d07c1/details
[^3]: https://www.zdnet.com/article/lazarus-hackers-target-defense-industry-with-fake-lockheed-martin-job-offers/
[^4]: https://en.wikipedia.org/wiki/Lazarus_Group
[^5]: https://attack.mitre.org/campaigns/C0022/
[^6]: https://mitre-attack.github.io/attack-navigator//#layerURL=https%3A%2F%2Fattack.mitre.org%2Fcampaigns%2FC0022%2FC0022-enterprise-layer.json
[^7]: https://www.immersivelabs.com/resources/c7-blog/scoringmathtea-analysis-inside-the-lazarus-groups-flagship-cyber-espionage-malware
[^8]: https://cybersecuritynews.com/lazarus-apt-group-new-scoringmathtea-rat/
[^9]: https://www.clearskysec.com/wp-content/uploads/2020/08/Dream-Job-Campaign.pdf
[^10]: https://www.virustotal.com/gui/file/7bb93be636b332d0a142ff11aedb5bf0ff56deabba3aa02520c85bd99258406f/details
