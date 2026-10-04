<h1 align="center">Alert Triage With Elastic</h1>
<p align="center">2025, October 25  &nbsp; .  &nbsp; Hey! I´m <a href="https://www.linkedin.com/in/rosanafssantos/">Rosana</a>, and I’m excited to join you on this adventure on my <code>537</code>-day-streak in<a href="https://tryhackme.com"> TryHackMe</a>.<br>Investigate alerts with Elastic by analyzing logs and spotting threats. &nbsp;&nbsp;Access it <a href="https://tryhackme.com/room/alerttriagewithelastic">here</a>.<br><br><img width="1200px" src="https://github.com/user-attachments/assets/0acc0c41-4ab2-4dc2-925a-1d4c9ff3602d"></p>

<h2>Task 1 . Introduction</h2>
<p>As a Security Operations Center (SOC) analyst, you aim to investigate alerts and escalate incidents with clear evidence to support your findings. In this guided-challenge room, you'll use Kibana (part of the Elastic Stack) to perform alert triage and initial investigations, analyzing suspicious activity on an IIS and Windows server. You’ll explore potential indicators of compromise (IoCs) and collect evidence by correlating events across multiple log sources to gain a deeper understanding of the attack.</p>

<h3>Objectives</h3>
<p>
  
- Use Kibana to analyze common security logs<br>
- Learn how to identify key indicators of compromise<br>
- Correlate events across multiple log sources<br>
- Uncover the breach through a series of SOC alerts</p>

<h3>Prerequisites</h3>
<p>

- Check out <a href="https://tryhackme.com/room/investigatingwithelk101">Investigating with ELK 101</a> to build a foundation for working with the Elastic Stack<br>
- Complete <a href="https://tryhackme.com/room/logsfundamentals">Log Fundamentals</a> to understand log structure and formatting<br>
- Cover <a href="https://tryhackme.com/room/windowsloggingforsoc">Windows Logging for SOC</a> for an overview of important event IDs<br>
- Go over <a href="https://tryhackme.com/room/sysmon">Sysmon</a> for event IDs to detect attacker activity</p>

<h3>Machine Access</h3>
<p>Click the Start Machine button below. Please give Elastic five minutes to start and access the dashboard with this link: https://LAB_WEB_URL.p.thmlabs.com/</p>

<p><em>Answer the question below</em></p>

<p>1.1. I understand the learning objectives and am ready to investigate with Elastic!<br>
<code>No answer needed</code></p>

<br>
<h2>Task 2 . Scenario Briefing</h2>

<p><em>Answer the questions below</em></p>

<p>2.1. How many logs are available for analysis within the entire time range?<br>
<code>1467</code></p>

<img width="1211" height="502" alt="image" src="https://github.com/user-attachments/assets/4576fafb-215b-453f-b6fb-0e8cd0cee006" />

<p>2.2. What is the field value for the client.ip in the weblogs index?<br>
<code>203.0.113.55</code></p>

<img width="1213" height="567" alt="image" src="https://github.com/user-attachments/assets/967223b0-8304-4608-9c74-dbd794b6e03d" />

<br>
<h2>Task 3 . Investigating Web Attacks</h2>

<p><em>Answer the questions below</em></p>

<p>3.1. How many POST requests did the IP address 203.0.113.55 make to proxyLogon.ecp?<br>
<code>3</code></p>

```bash
_index:weblogs and client.ip:203.0.113.55 and http.request.method:POST
```

<img width="1217" height="560" alt="image" src="https://github.com/user-attachments/assets/f7383fa6-c40d-4bae-b767-a6da2325d52f" />

<br>
<p>3.2. Which user.agent paired with the IP address 203.0.113.55 made the POST requests?<br>
<code>python-requests/2.25.1</code></p>

```bash
_index:weblogs and client.ip:203.0.113.55 and http.request.method:POST
```

<img width="1212" height="565" alt="image" src="https://github.com/user-attachments/assets/829fa868-458e-4eb8-be46-4d986fdaefd0" />

<br>
<p>3.3. How many logs contain the cmd= query parameter in the url.path field?<br>
<code>20</code></p>

```bash
_index:weblogs and client.ip:203.0.113.55 and http.request.method:GET and errorEE.aspx
```

<img width="1212" height="568" alt="image" src="https://github.com/user-attachments/assets/16ac19d4-62a7-46a5-99f8-c23280efdc5b" />

```bash
_index:weblogs and client.ip:203.0.113.55 and http.request.method:GET and cmd=
```

<img width="1210" height="566" alt="image" src="https://github.com/user-attachments/assets/8af53116-7e9d-4041-a7ed-465718aa8d58" />

<br>
<p>3.4. Which command was run utilizing errorEE.aspx on Jul 20, 2025 @ 04:45:50.000?<br>
<code>hostname</code></p>

```bash
_index:weblogs and client.ip:203.0.113.55 and http.request.method:GET and  errorEE.aspx
```

<img width="1214" height="657" alt="image" src="https://github.com/user-attachments/assets/e3db578b-ee34-4ad5-b671-b5b3f7616ea5" />

<br>
<h2>Task 4 . Uncovering Account Activity</h2>

<p><em>Answer the questions below</em></p>

<p>4.1. What is the winlog.record_id of the Administrator 4624 logon event?<br>
<code>17166</code></p>

```bash
@timestamp >= "2025-07-20T05:11:22" and winlog.event_id:4624 and host.name:winserv2019.some.corp and winlog.event_data.TargetUserName:"Administrator" 
```

<img width="1214" height="251" alt="image" src="https://github.com/user-attachments/assets/af519efd-97f5-4049-830f-b6b1fa1cb974" />

<br>
<p>4.2. What is the process.pid of the Sysmon 1 event that occurred on Jul 20, 2025 @ 05:11:27.996?<br>
<code>17166</code></p>

```bash
@timestamp >= "2025-07-20T05:11:22" and winlog.event_id:1 and user.name:"Administrator"
```

<img width="1212" height="658" alt="image" src="https://github.com/user-attachments/assets/bfbdb7f4-8c80-42b7-b967-d24cb6db1032" />

<br>
<p>4.3. What is the winlog.event_id for the new user account being created?<br>
<code>4720</code></p>

```bash
@timestamp >= "2025-07-20T05:13:10.000" and winlog.channel:Security and winlog.task:User Account Management
```

<img width="1209" height="725" alt="image" src="https://github.com/user-attachments/assets/744b54cb-5e40-4d21-a352-10a07b5ebcf8" />

<br>
<p>4.4. What is the name of the new user account?<br>
<code>svc_backup</code></p>

```bash
@timestamp >= "2025-07-20T05:13:10.000" and winlog.channel:Security and winlog.task:User Account Management
```
<img width="1212" height="725" alt="image" src="https://github.com/user-attachments/assets/28b4416f-d3bd-46a2-a95c-c79a29776577" />

<br>
<h2>Task 5 . Exposing Command Execution</h2>

<p><em>Answer the questions below</em></p>

<p>5.1.What command does the attacker use to add the new account to the "Remote Desktop Users" group?<br>
<code>net localgroup Administrators svc_backup /add</code></p>

```bash
@timestamp >= "2025-07-20T05:13:10.000" and winlog.channel:Security and winlog.task:User Account Management
```

<img width="1207" height="714" alt="image" src="https://github.com/user-attachments/assets/c15f5369-7e3f-46c6-8835-ff50dfc98d65" />

<br>
<p>5.2. What is the winlog.record_id of the 4732 Security event when the attacker adds the user to the Administrator group?<br>
<code>17254</code></p>

```bash
@timestamp >= "2025-07-20T05:13:15" and (winlog.event_id:4732)
```

<img width="1214" height="379" alt="image" src="https://github.com/user-attachments/assets/6b2c083e-15bb-4f7f-8a24-515595f95405" />

<p>5.3. What PowerShell command did the attacker run on Jul 20, 2025 @ 05:16:14.628?<br>
<code>net group "Domain Admins" /domain</code></p>

```bash
@timestamp >= "2025-07-20T05:16:14"  and event.module:powershell and event.code:4104
```

<img width="1211" height="606" alt="image" src="https://github.com/user-attachments/assets/3398b46d-78d0-492a-956a-063cc877e733" />

<p>5.4. What is the name of the archive that the attacker creates using the Rar.exe executable?<br>
<code>finance_it_archive.rar</code></p>

```bash
@timestamp >= "2025-07-20T05:16:14" 
```

<img width="1210" height="724" alt="image" src="https://github.com/user-attachments/assets/d38f0ea5-9638-4774-9c83-29c6a469e9fd" />

<br>
<h2>Task 5 . Conclusion</h2>
<p>In this guided-challenge room, you stepped into the role of a SOC analyst investigating suspicious activity targeting your client, SomeCorp’s infrastructure. Along the way, you learned to utilize the Kibana interface. You explored its features, searched and filtered for both web and Windows logs, identified key indicators of compromise (IOCs), and correlated events across multiple log sources.<br>

Explore the rooms below to further enhance your Elastic knowledge and test your understanding!<br>

- <a href="https://tryhackme.com/room/advancedelkqueries">Advanced ELK Queries</a><br>
- <a href="https://tryhackme.com/room/itsybitsy">ItsyBitsy</a><br>
- <a href="https://tryhackme.com/room/servidae">Servidae</a><br>
- <a href="https://tryhackme.com/room/boogeyman3">Boogeyman 3</a></p>

<p><em>Answer the question below</em></p>

<p>5.1. Escalate your findings and continue on your cyber learning journey!<br>
<code>No answer needed</code></p>

<br>
<br>
<h1 align="center">Completed</h1>
<p align="center"><img width="1200px" src="https://github.com/user-attachments/assets/9ff6c12a-8757-4a9c-a89d-527e65ba3b83"><br>
                  <img width="1200px" src="https://github.com/user-attachments/assets/ceed0eb2-9b04-449a-890c-18896c9dcad0"></p>

<h1 align="center">My TryHackMe Journey ・ 2025, October</h1>

<div align="center"><h6>

| Date   | Room                                  |Streak   |All Time<br>Global|All Time<br>Brazil|Monthly<br>Global|Monthly<br>Brazil|Points|Rooms<br>Completed|Badges|
|:------:|:--------------------------------------|--------:|------------:|------------:|------------:|------------:|------------:|------------:|------------:|
|25      |Medium 🔗: Alert Triage With Elastic  | 537    |      88ᵗʰ    |      4ᵗʰ     |     106ᵗʰ    |     2ⁿᵈ    | 132,037 |  1,015    |    79     |
|24      |                                       |  536   |       87ᵗʰ   |      4ᵗʰ     |      89ᵗʰ    |     2ⁿᵈ    | 131,865  |  1,014    |    79     |
|23      |                                       |  535   |       87ᵗʰ   |      4ᵗʰ     |      89ᵗʰ    |     2ⁿᵈ    | 131,865  |  1,014    |    79     |
|22      |Medium 🚩: DX1: Liberty Island        | 534    |      87ᵗʰ    |      4ᵗʰ     |      87ᵗʰ    |     2ⁿᵈ    | 131,925  |  1,014    |    79     |
|22      |Medium 🔗: Alert Tryage With Splunk   | 534    |      87ᵗʰ    |      4ᵗʰ     |      89ᵗʰ    |     2ⁿᵈ    | 131,865  |  1,013    |    79     |
|21      |Easy 🔗: Cyber Scotland 2021          | 533    |      87ᵗʰ    |      4ᵗʰ     |      87ᵗʰ    |     2ⁿᵈ    | 131,777  |  1,012    |    79     |
|21      |Medium 🔗: Windows PrivEsc            | 533    |      87ᵗʰ    |      4ᵗʰ     |      88ᵗʰ    |     2ⁿᵈ    | 131,737  |  1,011    |    79     |
|20      |Hard 🚩: Enterprise                   | 532    |      87ᵗʰ    |      4ᵗʰ     |      81ˢᵗ    |     2ⁿᵈ    | 131,729  |  1,010    |    79     |
|19      |Hard 🚩: Misguided Ghosts             | 531    |      87ᵗʰ    |      4ᵗʰ     |      77ᵗʰ    |     2ⁿᵈ    | 131,661  |  1,009    |    79     |
|18      |Hard 🚩: Year of the Pig              | 530    |      89ᵗʰ    |      4ᵗʰ     |      72ⁿᵈ    |     2ⁿᵈ    | 131,531  |  1,008    |    79     |
|18      |Easy 🚩: The Phishing Pond            | 530    |      90ᵗʰ    |      4ᵗʰ     |      74ᵗʰ    |     2ⁿᵈ    | 131,501  |  1,007    |    79     |
|17      |Hard 🚩: Initial Access Pot           | 529    |      90ᵗʰ    |      4ᵗʰ     |      68ᵗʰ    |     2ⁿᵈ    | 131,456  |  1,006    |    79     |
|17      |Medium 🔗: AllSignsPoint2Pwnage       | 529    |      90ᵗʰ    |      4ᵗʰ     |      87ᵗʰ    |     2ⁿᵈ    | 131,186  |  1,005    |    79     |
|16      |Easy 🔗: Network Traffic Basics       | 528    |      90ᵗʰ    |      4ᵗʰ     |      89ᵗʰ    |     2ⁿᵈ    | 131,138  |  1,004    |    79     |
|16      |Medium 🔗: Linux Threat Detection 3   | 528    |      90ᵗʰ    |      4ᵗʰ     |      89ᵗʰ    |     2ⁿᵈ    | 131,066  |  1,003    |    79     |
|13      |Hard 🚩: M4tr1x: Exit Denied          | 525    |      92ⁿᵈ    |      4ᵗʰ     |      76ᵗʰ    |     2ⁿᵈ    | 130,938  |  1,002    |    79     |
|12      |Easy 🔗: Atlas                        | 524    |     101ˢᵗ    |      4ᵗʰ     |     251ˢᵗ    |     3ʳᵈ    | 129,902  |  1,001    |    76     |
|11      |Easy 🔗: Brute Force Heroes           | 523    |     101ˢᵗ    |      4ᵗʰ     |     217ᵗʰ    |     3ʳᵈ    | 129,878  |  1,000    |    76     |
|11      |Hard 🚩: Rocket                       | 523    |     102ⁿᵈ    |      4ᵗʰ     |     211ˢᵗ    |     3ʳᵈ    | 129,870  |    999    |    76     |
|10      |Easy 🚩: Shadow Trace                 | 522    |     101ˢᵗ    |      4ᵗʰ     |     159ᵗʰ    |     3ʳᵈ    | 129,810  |    998    |    76     |
|10      |Easy 🔗: Defensive Security Intro     | 522    |     103ʳᵈ    |      4ᵗʰ     |     357ᵗʰ    |     3ʳᵈ    | 129,405  |    997    |    76     |
|10      |Easy 🔗: 25 Days of Cyber Security, Day 2| 522|      103ʳᵈ    |      4ᵗʰ     |     355ᵗʰ    |     3ʳᵈ    | 129,405  |    996    |    76     |
|9       |Medium 🔗: Linux Threat Detection 2   | 521    |     103ʳᵈ    |      4ᵗʰ     |     326ᵗʰ    |     3ʳᵈ    | 129,373  |    996    |    76     |
|9       |Medium 🚩: WWBuddy                    | 521    |     103ʳᵈ    |      4ᵗʰ     |     390ᵗʰ    |     4ᵗʰ    | 129,293  |    995    |    76     |
|8       |Hard 🚩: Motunui                      | 520    |     103ʳᵈ    |      4ᵗʰ     |     383ʳᵈ    |     4ᵗʰ    | 129,201  |    994    |    76     |
|8       |Easy 🔗: Man-in-the-Middle            | 520    |     103ʳᵈ    |      4ᵗʰ     |     390ᵗʰ    |     4ᵗʰ    | 129,141  |    993    |    76     |
|7       |Medium 🚩: Profiles, in progress      | 519    |              |              |              |            | 129,021  |    992    |    76     |
|6       |Medium 🚩: VulnNet                    | 518    |     105ᵗʰ    |      4ᵗʰ     |     348ᵗʰ    |     5ᵗʰ    | 129,021  |    992    |    76     |
|6       |Easy 🚩: DearQA                       | 518    |     105ᵗʰ    |      4ᵗʰ     |     333ʳᵈ    |     6ᵗʰ    | 128,991  |    991    |    76     |
|5       |Medium 🚩: Frank & Herby try again.....| 517   |     106ᵗʰ    |      4ᵗʰ     |     300ᵗʰ    |     5ᵗʰ    | 128,931  |    990    |    76     |
|4       |Medium 🚩: Frank & Herby make an app  | 516    |     105ᵗʰ    |      4ᵗʰ     |     233ʳᵈ    |     3ʳᵈ    | 128,871  |    989    |    76     |
|4       |Info ℹ️: OverlayFS: CVE-2021-3493    | 516    |     105ᵗʰ    |      4ᵗʰ     |     235ᵗʰ    |     3ʳᵈ    | 128,841  |    988    |    76     |
|3       |Medium 🚩: XDR: Operation Global Dagger2| 515  |     104ᵗʰ    |      4ᵗʰ     |     149ᵗʰ    |     3ʳᵈ    | 128,833  |    987    |    76     |
|3       |Medium 🚩: VulnNet: dotpy             | 515    |     108ᵗʰ    |      4ᵗʰ     |     741ˢᵗ    |    11ˢᵗ    | 128,563  |    986    |    76     |
|2       |Medium 🔗: Data Exfiltration Detection| 514    |     108ᵗʰ    |      4ᵗʰ     |     521ˢᵗ    |     8ᵗʰ    | 128,503  |    985    |    76     |
|1       |Medium 🔗: Network Discovery Detection| 513    |     108ᵗʰ    |      4ᵗʰ     |     875ᵗʰ    |     7ᵗʰ    | 128,407  |    984    |    76     |
|1       |Medium 🚩: Intranet                   | 513    |     108ᵗʰ    |      4ᵗʰ     |    3,357ᵗʰ   |    57ᵗʰ    | 128,335  |    983    |    76     |

</h6></div>

<br>

<p align="center">Global All Time:   88ᵗʰ<br><img width="250px" src="https://github.com/user-attachments/assets/deef3423-1e03-4c3d-b207-dd9131493a3d"><br>
                                              <img width="1200px" src="https://github.com/user-attachments/assets/6902930c-876d-4df7-b8dc-6413dfbe6e3f"><br><br>
                  Brazil All Time:     4ᵗʰ<br><img width="1200px" src="https://github.com/user-attachments/assets/90a66b50-db95-4fad-87de-96ebb0bd7936"><br>
                  Global monthly:    106ᵗʰ<br><img width="1200px" src="https://github.com/user-attachments/assets/37302ad1-bfd4-47ac-9d5b-ecbce2cfedf3"><br>
                  Brazil monthly:      2ⁿᵈ<br><img width="1200px" src="https://github.com/user-attachments/assets/7656a09a-aeb8-42c8-af56-36740437a44f"></p>

<h1 align="center">Thanks for coming!</h1>
<p align="center">Follow me on <a href="https://medium.com/@RosanaFS">Medium</a>, here on <a href="https://github.com/RosanaFSS/TryHackMe">GitHub</a>, and on <a href="https://www.linkedin.com/in/rosanafssantos/">LinkedIN</a>.</p>
