<h1 align="center">Detecting Web Attacks</h1>
<p align="center"><img width="80px" src="https://github.com/user-attachments/assets/2853c6b1-d7b4-4790-b6f6-edfc1ab6b464"><br>
2025, September 11<br> Hey there, fellow lifelong learner! I´m <a href="https://www.linkedin.com/in/rosanafssantos/">Rosana</a>,<br>
and I’m excited to join you on this adventure, part of my <code>493</code>-day-streak in<a href="https://tryhackme.com"> TryHackMe</a>.<br>
<em>Explore web attacks and detection methods through log and network traffic analysis</em>.<br>
Access it <a href="https://tryhackme.com/room/detectingwebattacks"</a>here.<br>
<img width="1200px" src="https://github.com/user-attachments/assets/d9dccee2-9a05-4361-a714-949ccdebe2c3"></p>

<h2>Task 1 . Introduction</h2>
<p>Web attacks are among the most common ways attackers gain entry into target systems. Public-facing websites and web applications often sit in front of databases and other infrastructure, which are appealing targets for attackers. In this room, you’ll learn how to identify these threats using practical detection methods and industry-standard tools.</p>

<h3>Objectives</h3>
<p>
  
- Learn common client-side and server-side attack types<br>
- Understand the benefits and limitations of log-based detection<br>
- Explore network traffic: based detection methods<br>
- Understand how and why Web Application Firewalls are used<br>
- Practice identifying common web attacks using the methods covered</p>

<h3>Prerequisites</h3>
<p>Web attacks encompass a wide range of techniques. In this room, you will cover a brief overview of several common attacks before learning how to detect them. To get the most out of the exercises, you should have a foundational understanding of these attack types and some familiarity with analyzing logs and packet captures.<br>

- <a href="https://tryhackme.com/room/owasptop102021">OWASP Top 10</a> covers the ten most critical web security risks<br>
- Complete <a href="https://tryhackme.com/room/introtologanalysis">Intro to Log Analysis</a> for an overview of logs and useful indicators<br>
- <a href="https://tryhackme.com/room/wiresharkthebasics">Wireshark : The Basics</a> provides a great introduction to packet capture analysis</p>

<h3>Set up your virtual environement</h3>
<p>To successfully complete this room, you'll need to set up your virtual environment. This involves starting the Target Machine, ensuring you're equipped with the necessary tools and access to tackle the challenges ahead.<br>
<p>[ Start Machine ]</p>

<p><em>Answer the question below</em></p>

<p>1.1. I understand the learning objectives and am ready to learn about detecting web attacks!<br>
<code>No answwer needed</code></p>

```bash
:~/DetectingWebAttacks# nmap xx.xxx.xx.xxx
...
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
5901/tcp open  vnc-1
```

<br>
<h2>Task 2 . Client-Side Attacks</h2>
<br>

<p><em>Answer the questions below</em></p>

<p>2.1. What class of attacks relies on exploiting the user's behavior or device?<br>
<code>Cient-Side</code></p>

<p>2.2. What is the most common client-side attack?<br>
<code>XSS</code></p>

<h2>Task 3 . Server-Side Attacks</h2>
<br>

<p><em>Answer the questions below</em></p>

<p>3.1. What class of attacks relies on exploiting vulnerabilities within web servers?<br>
<code>Server-Side</code></p>

<p>3.2.Which server-side attack lets attackers abuse forms to dump database contents?<br>
<code>SQLi</code></p>

<h2>Task 4 . Log-Based Detection</h2>
<br>

<p><em>Answer the questions below</em></p>

<p>4.1. What is the attacker´s User-Agent performing the directory fuzz?<br>
<code>FFUF v2.1.0</code></p>

<img width="1074" height="229" alt="image" src="https://github.com/user-attachments/assets/c9adddeb-f166-40a4-b1d4-7bb30866bd78" />

<br>
<br>
<p>4.2. What is the name of the page on which the attacker performs a brute-force attack?<br>
<code>/login.php</code></p>

<img width="1075" height="379" alt="image" src="https://github.com/user-attachments/assets/d816791c-c679-41fc-b31d-84d45e90d96f" />

<br>
<br>
<p>4.3. What is the complete, decoded SQLi payload the attacker uses on the <code>/changeusername.php</code>code> form?<br>
<code>%' OR '1'='1</code></p>

<img width="1073" height="631" alt="image" src="https://github.com/user-attachments/assets/a64e947f-d5d1-4dd6-afda-43cab005807d" />

<br>
<br>

<img width="1360" height="185" alt="image" src="https://github.com/user-attachments/assets/de3fab31-181f-4183-ad0e-28930f54c543" />

<br>
<br>
<h2>Task . 5 Network-Based Detection</h2>
<br>

<p><em>Answer the questions below</em></p>

<p>5.1. What is the attacker´s User-Agent performing the directory fuzz?<br>
<code>astrongpassword123</code></p>

<img width="1389" height="443" alt="image" src="https://github.com/user-attachments/assets/063d3dee-4b96-40cb-8a4f-53ba4699316a" />

<br>
<br>
<p>5.2.What is the flag the attacker found in the database using SQLi?<br>
<code>THM{dumped_the_db}</code></p>

<img width="1378" height="439" alt="image" src="https://github.com/user-attachments/assets/bdc75f1e-66d0-4002-a71e-9736c58d8393" />

<br>
<br>

<img width="1379" height="572" alt="image" src="https://github.com/user-attachments/assets/446ad857-7e02-43ab-8430-367e5bff24de" />

<br>
<br>

<img width="1391" height="557" alt="image" src="https://github.com/user-attachments/assets/4974af9c-4a9d-44a3-8e43-9a8792aec7c1" />

<br>
<br>
<h2>Task 6 . Web Application Firewall</h2>

<h3>Rules</h3>

<h3>Integrating Known Indicators and Threat Intelligence</h3>

<p><em>Answer the questions below</em></p>

<p>6.1. What do WAFs inspect and filter?<br>
<code>Web requests</code></p>

<p>6.2. Create a custom firewall rule to block any <code>User-Agent</code> that matches "<code>BotTHM</code>". Hint: <em> Syntax: IF field-name CONTAINS value THEN action</em><br>
<code>IF User-Agent CONTAINS "BotTHM" THEN block</code></p>

<img width="1367" height="292" alt="image" src="https://github.com/user-attachments/assets/471f201c-2e23-4d9c-b855-b84df9ca039b" />

<br>
<br>

<img width="1364" height="318" alt="image" src="https://github.com/user-attachments/assets/7be1b71c-9e7b-4a8e-a485-d952c31f33b5" />

<br>
<br>

<img width="1362" height="287" alt="image" src="https://github.com/user-attachments/assets/7180b38e-7b88-41a9-bd31-b2656109707f" />

<br>
<br>
<h2>Task 7 . </h2>
<p>In this room, you learned about detecting web attacks, starting with a refresher on common client-side and server-side attacks. You then covered log-based analysis, followed by network traffic analysis, in order to understand common indicators and how to spot them as an analyst. Finally, we explored Web Application Firewalls and the rules used to defend against malicious web requests. By applying correlation across these sources, you can move beyond isolated alerts and develop a more well-rounded approach to detecting and responding to web attacks.</p>

<p><em>Answer the question below</em><br>

<p>7.1. Complete the room and continue on your cyber learning journey!</p>  
<code>No answer needed</code></p>

<br>
<br>
<h2 align="center">Completed</h2>
<p align="center"><img width="1200px" src="https://github.com/user-attachments/assets/bb707b0e-1862-43ef-a19c-dbc6aa4c5fc9"><br>
                  <img width="1200px" src="https://github.com/user-attachments/assets/996aa049-47ff-437a-96b3-8a44aec9d4ce"></p>

<h2 align="center">My TryHackMe Journey ・ 2025, September</h2>

<div align="center"><h6>

| Date              | Room                                  |Streak   |   All Time<br>Global   |   All Time<br>Brazil   |   Monthly<br>Global   |   Monthly<br>Brazil  | Points   | Rooms<br>Completed     | Badges    |
|:------------------|:--------------------------------------|--------:|:-----------: | :----------: | :---------: | :--------: | :------  | :-------: | :-------: |
| 2025, Sep 11      |Easy 🔗: <code><strong>Detecting Web Attacks</strong></code>| 493| 110ᵗʰ |5ᵗʰ|     629ᵗʰ    |     9ᵗʰ    | 125,516  |    958    |    73     |
| 2025, Sep 10      |Easy 🔗: Attacking ICS Plant #1       | 492    |     110ᵗʰ    |      5ᵗʰ     |     675ᵗʰ    |     9ᵗʰ    | 125,428  |    957    |    73     |
| 2025, Sep 10      |Easy 🔗: SOC Role in Blue Team        | 492    |     110ᵗʰ    |      5ᵗʰ     |     664ᵗʰ    |     9ᵗʰ    | 125,292  |    956    |    73     |
| 2025, Sep 9       |Hard 🚩: Python Playground            | 491    |     111ˢᵗ    |      5ᵗʰ     |     693ʳᵈ    |     9ᵗʰ    | 125,236  |    955    |    73     |
| 2025, Sep 9       |Hard 🚩: Borderlands                  | 491    |     111ˢᵗ    |      5ᵗʰ     |     713ʳᵈ    |    10ᵗʰ    | 125,146  |    954    |    73     |
| 2025, Sep 9       |Medium 🚩: Forgotten Implant          | 491    |     112ⁿᵈ    |      5ᵗʰ     |     660ᵗʰ    |    10ᵗʰ    | 125,016  |    953    |    73     |
| 2025, Sep 8       |Easy 🔗: Web Enumeration              | 490    |     112ⁿᵈ    |      5ᵗʰ     |     663ʳᵈ    |    10ᵗʰ    | 124,986  |    952    |    73     |
| 2025, Sep 8       |Easy 🔗: iOS: Forensics               | 490    |     113ʳᵈ    |      5ᵗʰ     |     548ᵗʰ    |     9ᵗʰ    | 124,850  |    951    |    73     |
| 2025, Sep 7       |Medium 🚩: VulnNet: Active            | 489    |     114ᵗʰ    |      5ᵗʰ     |     542ⁿᵈ    |     9ᵗʰ    | 124,746  |    950    |    73     |
| 2025, Sep 7       |Medium 🚩: pyLon                      | 489    |     114ᵗʰ    |      5ᵗʰ     |     535ᵗʰ    |     9ᵗʰ    | 124,716  |    949    |    73     |
| 2025, Sep 7       |Medium 🚩: Pressed                    | 489    |     113ʳᵈ    |      5ᵗʰ     |     508ᵗʰ    |     9ᵗʰ    | 124,886  |    948    |    73     |
| 2025, Sep 6       |Easy 🚩: Classic Passwd               | 488    |     114ᵗʰ    |      5ᵗʰ     |     683ʳᵈ    |    12ⁿᵈ    | 124,476  |    947    |    73     |
| 2025, Sep 6       |Medium 🚩: toc2                       | 488    |     114ᵗʰ    |      5ᵗʰ     |     695ᵗʰ    |    12ⁿᵈ    | 124,446  |    946    |    73     |
| 2025, Sep 6       |Hard 🚩: Extract                      | 488    |     114ᵗʰ    |      5ᵗʰ     |     716ᵗʰ    |    13ʳᵈ    | 124,386  |    945    |    73     |
| 2025, Sep 6       |Medium 🚩: Plotted-EMR                | 488    |     114ᵗʰ    |      5ᵗʰ     |     844ᵗʰ    |    12ⁿᵈ    | 124,326  |    944    |    73     |
| 2025, Sep 5       |Medium 🚩: Inferno                    | 487    |     114ᵗʰ    |      5ᵗʰ     |     758ᵗʰ    |    12ⁿᵈ    | 124,236  |    943    |    73     |
| 2025, Sep 5       |Easy 🔗: Psycho Break                 | 487    |     115ᵗʰ    |      5ᵗʰ     |     724ᵗʰ    |    10ᵗʰ    | 124,152  |    942    |    73     |
| 2025, Sep 4       |Medium 🚩: Cold VVars                 | 486    |     113ʳᵈ    |      5ᵗʰ     |     579ᵗʰ    |    10ᵗʰ    | 124,048  |    941    |    73     |
| 2025, Sep 4       |Medium 🔗: IP and Domain Threat Intel | 486    |     113ʳᵈ    |	    5ᵗʰ     |     579ᵗʰ    |    10ᵗʰ    | 124,018  |   940   |    73     |
| 2025, Sep 3       |Easy 🔗: Malware Classification       | 485    |     112ⁿᵈ    |      5ᵗʰ     |     714ᵗʰ    |    13ʳᵈ    | 123,882  |    939    |    73     |
| 2025, Sep 2       |Medium 🔗: Session Forencics          | 484    |     111ˢᵗ    |      5ᵗʰ     |     706ᵗʰ    |    14ᵗʰ    | 123,786  |    938    |    73     |
| 2025, Sep 1       |Medium 🚩: Voyage                     | 483    |     111ˢᵗ    |      5ᵗʰ     |     849ᵗʰ    |    15ᵗʰ    | 123,636  |    937    |    73     |

</h6></div><br>

<br>

<p align="center">Global All Time:   110ᵗʰ<br><img width="250px" src="https://github.com/user-attachments/assets/3d636d29-002a-4bf6-861c-dc20ef74f284"><br>
                                              <img width="1200px" src="https://github.com/user-attachments/assets/86ddef5f-5ee7-464c-99e8-f4af1b98a23e"><br><br>
                  Brazil All Time:     5ᵗʰ<br><img width="1200px" src="https://github.com/user-attachments/assets/6205b25e-8891-427b-ba55-5778489b4e3b"><br>
                  Global monthly:    629ᵗʰ<br><img width="1200px" src="https://github.com/user-attachments/assets/b86df1c7-b132-43e7-ab63-895cbf9a5f26"><br>
                  Brazil monthly:      9ᵗʰ<br><img width="1200px" src="https://github.com/user-attachments/assets/4769f84a-eb4a-44b4-ac76-82279bce94b6"><br>

<h2 align="center">Thanks for coming!</h2>
<p align="center">Follow me on <a href="https://medium.com/@RosanaFS">Medium</a>, here on <a href="https://github.com/RosanaFSS/TryHackMe">GitHub</a>, and on <a href="https://www.linkedin.com/in/rosanafssantos/">LinkedIN</a>.</p>  
