<h1 align="center">SOC Simulator &nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp; <a href="https://tryhackme.com/soc-sim/scenarios?scenario=blackcat"> BlackCat</a></h1>
<p align="center"><img width="590px" src="https://github.com/user-attachments/assets/ef21c670-e8d2-4e5c-9209-8aae1dc7218b"><br>
If you find it helpful, consider coming back for research.<br><p align="center"><a href="https://github.com/RosanaFSS"><img src="https://img.shields.io/github/followers/RosanaFSS?label=Follow&style=for-the-badge&logo=github&color=24292e" alt="Follow Rosana on GitHub"></a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<img src="https://img.shields.io/badge/COMPLETED-2026%2C%20JAN%2023-444444?style=for-the-badge&logo=calendar-check" alt="Completion Date"> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <a href="https://www.linkedin.com/in/rosanafssantos/"><img src="https://img.shields.io/badge/Connect-LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="Connect on LinkedIn"></a></p>

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [Overview](#1) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [Objectives](#2) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [Methodology](#3) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [Documentation](#4)  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [Practice](#5)

<br>
<br>
<h2>Overview<a id='1'></a></h2>
<p>BlackCat claims to have breached your company and posted proof on their leak site. As the SOC analyst on call, it’s your job to investigate. Follow the trail, uncover what happened, and confirm how deep the compromise goes before time runs out.</p>

<br>
<br>
<h2>Objectives<a id='2'></a></h2>
<p>

- Identify and correlate attacker activity from leaked credentials to ransomware deployment.<br>
- Classify and escalate alerts appropriately using the THM SOC Rulebook.<br>
- Determine how the attacker moved laterally and established persistence.<br>
- Identify which accounts, machines, and data were affected during the attack.<br>
- See what the attackers leaked.</p>

<br>
<br>
<h2>Methodology<a id='3'></a></h2>
<p>
  
- Step 1<br><strong>Find all the true positives</strong><br>To complete a Scenario, find all the True Positive alerts. Keep triaging alerts until you've closed them all!<br><br>
- Step 2<br><strong>Read the documentation</strong><br>Before diving into the triage, take a moment to review the provided documentation. This will give you essential context and strategies for investigation.<br><br>
- Step 3<br><strong>Investigate the alert queue</strong><br>Your journey starts in the alert queue. Investigate each alert, and prioritise what seems most critical. Understanding the types of alerts can help you manage your time effectively.<br><br>
- Step 4<br><strong>Take ownership of an alert</strong><br>Click on an alert to take ownership. This action starts the timer for MTTR, so act fast! Use this to strategise how you spend time on each alert.<br><br>
- Step 5<br><strong>Deep dive with the SIEM & VM</strong><br>Use the SIEM to search logs and investigate indicators. The VM is there for deeper analysis. Combine these tools to verify what’s real and what’s a false alarm.<br><br>
- Step 6<br><strong>Write your findings as a report</strong><br>For each alert, determine whether it's a true positive or a false positive. Clearly document your findings, analysis, and actions taken. Submit the report when you're confident in your conclusions: accurate and well-written reports will earn you more points!<br><br>
- Step 7<br><strong>Analyse your performance</strong><br>After completing the scenario, dive into your wrap-up report to see how you performed. You’ll receive detailed feedback on your MTTR, points scored, the number of closed alerts, and personalised AI insights to enhance your future reporting.</p>

<br>
<br>
<br>
<h2>Documentation<a id='4'></a></h2>
<h3>SOC Handover Notes</h3>

<img width="1845" height="847" alt="image" src="https://github.com/user-attachments/assets/24784e3b-663c-4a6c-b34c-64b41c5378ab" />

<h3>Company Information</h3>

<img width="1631" height="619" alt="image" src="https://github.com/user-attachments/assets/00d510fe-a3d6-42d8-a3fb-3ebcb354a436" />

<h3>Asset Inventory</h3>

<img width="1875" height="558" alt="image" src="https://github.com/user-attachments/assets/69c3f948-dace-4445-aeec-f37723306f9b" />

<br>
<h2>Practice<a id='5'></a></h2>
<h3>Alerts´s Summary</h3>

<div align="left"><h6>

|ID<br><br><br>|Severity<br><br><br>|Alert rule<br><br><br>                    |Type<br><br><br>        |Classification<br><br><br>       |Score<br><br><code>1035</code>|Value<br><br><code>1335</code>|
|:----|:---------|:------------------------------------------------------|:-------------------|:-----------------------|----:|----:|
|1056 |Medium    |Multiple Failed SSH Logins                             |Initial Access         | True Positive| 115 | 130 |
|1057 |Medium    |Suspicious Access Patterns                             |Enumeration            | True Positive | 100 | 125 |
|1060 |Medium    |Suspicious Access Patterns                             |Impact                 | False Positive| -10  | 10 |
|1062 |Critical  |Suspicious Scheduled Task Creation                     |Execution              | True Positive  | 110 | 150 |
|1059 |Critical  |Suspicious SFTP Server Spawned via Bash                |Exfiltration           | True Positive  | 105 | 130 |
|1063 |Critical  |Suspicious Scheduled Task Creation                     |Execution              | True Positive  | 105 | 150 |
|1064 |Critical  |Suspicious Scheduled Task Creation                     |Execution              | True Positive | 110 | 150 |
|1055 |Medium    |Possible Credential Leak Detected from External Source |Credential Access      | True Positive | 105 | 115 |
|1065 |Critical  |Suspicious Scheduled Task Creation                     |Network Authentication | True Positive | 105 | 150 |
|1058 |High      |Failed Sudo Authentication                             |Privilege Escalation   | True Positive | 75 | 110 |
|1061 |Critical  |Company Mentioned on Dark Web Leak Site                |Impact                 | True Positive | 115 | 115 |

</h6></div>

<br>
<br>

<br>
<h1 align="center">SOC Simulator Scenario Completed</h1>

<p align="center"><img width="600px" src="https://github.com/user-attachments/assets/69d1d76d-e533-4c6c-b60c-5905d2b8ce19"><br>
                  <img width="600px" src="https://github.com/user-attachments/assets/dac8e6b3-7b3d-4738-8eaf-cc6c4dadcfd6"><br>
                  <img width="600px" src="https://github.com/user-attachments/assets/39e8ca00-4b09-468b-a83b-17129b161145"></p>

                  
<h1 align="center">My TryHackMe Journey ・ 2026, January</h1>

<div align="center"><h6>

| Date<br><br>   | Room <br><br> |Streak<br><br>   |Global<br>All Time|Brazil<br>All Time|Global<br>Monthly|Brazil<br>Monthly|Points<br><br>|Rooms<br>Completed|Badges<br><br>|
|:------:|:--------------------------------------|:--------:|:------------:|:------------:|:------------:|:------------:|:------------:|:------------:|:------------:|
|23     |Medium ⚙️: BlackCat                  |22 |     79ᵗʰ  |     3ʳᵈ    |      104ᵗʰ   |        2ⁿᵈ     |    142,189  |    1,072    |    88     |
|22     |Hard 🚩: Azure: Tapper               |21 |     82ⁿᵈ  |     3ʳᵈ    |      176ᵗʰ   |        2ⁿᵈ     |    141,154  |    1,072    |    88     |
|22     |Easy ⚙️: Hidden Hooks                |21 |     82ⁿᵈ  |     3ʳᵈ    |      189ᵗʰ   |        3ʳᵈ     |    141,059  |    1,071    |    88     |
|22     |Medium 🔗: ret2libc                  |21 |     82ⁿᵈ  |     3ʳᵈ    |      193ʳᵈ   |        3ʳᵈ     |    140,979  |    1,071    |    88     |
|20     |Easy 🔗: MS Entra ID: Hybrid Identities|19|    82ⁿᵈ  |     3ʳᵈ    |      184ᵗʰ   |        2ⁿᵈ     |    140,971  |    1,069    |    88     |
|19     |Easy ⚙️: Upload and Conquer          |18 |     81ˢᵗ  |     3ʳᵈ    |      181ˢᵗ   |        2ⁿᵈ     |    140,859  |    1,068    |    88     |
|18     |Easy 🔗: MS Entra ID: Identities     |17 |     83ʳᵈ  |     3ʳᵈ    |      341ˢᵗ   |        3ʳᵈ     |    139,864  |    1,068    |    88     |
|18     |Easy ⚙️: APT28: Initial Access       |17 |     84ᵗʰ  |     3ʳᵈ    |      341ˢᵗ   |        3ʳᵈ     |    139,752  |    1,067    |    88     |
|18     |Easy ⚙️: Hidden Hooks                |17 |           |     3ʳᵈ    |              |                |             |    1,067    |    88     |
|17     |Easy 🔗: MS Entra ID: Introduction   |17 |     83ʳᵈ  |     3ʳᵈ    |      359ᵗʰ   |        3ʳᵈ     |    139,657  |    1,067    |    88     |
|17     |Easy ⚙️: APT28: Credential Access    |17 |           |     3ʳᵈ    |              |                |             |    1,067    |    88     |
|17     |Medium ⚙️: Open Door                 |17 |           |     3ʳᵈ    |              |                |             |     1,067   |    88     |
|17     |Easy 🔗: Offensive Security Intro    |16 |     87ᵗʰ  |     3ʳᵈ    |      504ᵗʰ   |        5ᵗʰ     |    139,099  |    1,067    |    88     |
|16     |Hard 🚩: Spring                      |15 |     87ᵗʰ  |     3ʳᵈ    |      540ᵗʰ   |        4ᵗʰ     |    138,942  |    1,066    |    87     |
|14     |Insane 🚩: Scheme Catcher            |13 |     87ᵗʰ  |     3ʳᵈ    |      534ᵗʰ   |        5ᵗʰ     |    138,822  |    1,065    |    87     |
|13     |Hard 🚩: Breachblocker Unlocker      |12 |     86ᵗʰ  |     3ʳᵈ    |      526ᵗʰ   |        5ᵗʰ     |    138,732  |    1,064    |    87     |
|11     |Medium 🚩: Azure: Eyes Wide Shut     |10 |     86ᵗʰ  |     3ʳᵈ    |      558ᵗʰ   |        5ᵗʰ     |    138,450  |    1,063    |    86     |
|8      |Medium ⚙️: Phishing Unfolding        | 7 |     86ᵗʰ  |     3ʳᵈ    |      508ᵗʰ   |        4ᵗʰ     |    138,372  |    1,062    |    84     |
|8      |Easy ⚙️: Introduction to Phishing    | 7 |     96ᵗʰ  |     3ʳᵈ    |    2,479ᵗʰ   |       32ⁿᵈ     |    137,117  |    1,062    |    84     |
|8      |Medium 🔗: KaffeeSec: SoMeSINT      | 7 |     98ᵗʰ  |     3ʳᵈ    |    2,847ᵗʰ   |       38ᵗʰ     |    137,052  |    1,062    |    84     |
|7      |Hard 🚩: Hack Back                   | 6 |     98ᵗʰ  |     3ʳᵈ    |    2,798ᵗʰ   |       37ᵗʰ     |    136,908  |    1,061    |    84     |
|7      |Hard 🚩: Dead End?                   | 6 |     99ᵗʰ  |     3ʳᵈ    |    2,924ᵗʰ   |       37ᵗʰ     |    136,788  |    1,060    |    84     |
|6      |Easy 🔗: Linux Strength Training     | 5 |     98ᵗʰ  |     3ʳᵈ    |    3,172ⁿᵈ   |       47ᵗʰ     |    136,608  |    1,059    |    84     |
|4      |Medium 🚩: JVM Reverse Engineering   | 3 |     96ᵗʰ  |     3ʳᵈ    |    3,031ˢᵗ   |       46ᵗʰ     |    136,450  |    1,058    |    84     |
|3      |Medium 🚩: Carrotbane of My Existence| 2 |     96ᵗʰ  |     3ʳᵈ    |    3,468ᵗʰ   |       49ᵗʰ     |    136,150  |    1,057    |    84     |
|2      |Easy 🔗: Learn Rust                  | 1 |     96ᵗʰ  |     3ʳᵈ    |    5,152ⁿᵈ   |       67ᵗʰ     |    136,030  |    1,056    |    84     |

</h6></div><br>

<p align="center">Global All Time:     79ᵗʰ<br><img width="250px" src="https://github.com/user-attachments/assets/e4999065-e83d-40ab-9c9d-3d7c679016ec"<br>
                                              <img width="1200px" src="https://github.com/user-attachments/assets/692f5de2-9c9f-40c9-be3f-8e0a750e067c"><br><br>
                  Brazil All Time:      3ʳᵈ<br><img width="1200px" src="https://github.com/user-attachments/assets/2822b3ba-d22e-492a-bacf-740ed59be1ce"><br><br>
                  Global monthly:     104ᵗʰ<br><img width="1200px" src="https://github.com/user-attachments/assets/3141b866-570a-4afc-9648-42aafe785e42"><br><br>
                  Brazil monthly:       2ⁿᵈ<br><img width="1200px" src="https://github.com/user-attachments/assets/f46cca22-f249-48fe-8867-b563c54c55f6"></p>

<h1 align="center">Thanks for coming!</h1>
<p align="center">Follow me on <a href="https://medium.com/@RosanaFS">Medium</a>, here on <a href="https://github.com/RosanaFSS/TryHackMe">GitHub</a>, and on <a href="https://www.linkedin.com/in/rosanafssantos/">LinkedIN</a>.</p>
