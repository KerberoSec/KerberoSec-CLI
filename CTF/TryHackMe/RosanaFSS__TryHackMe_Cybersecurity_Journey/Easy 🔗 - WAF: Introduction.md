<h1 align="center">WAF: Introduction</h1>
<p align="center">2025, November 19  &nbsp; .  &nbsp; Hey! I´m <a href="https://www.linkedin.com/in/rosanafssantos/">Rosana</a>, and I’m excited to join you on this adventure on my <code>2</code>-day-streak in<a href="https://tryhackme.com"> TryHackMe</a>.<br>Learn about Web Application Firewalls and what differentiates them from other types of firewalls. &nbsp;&nbsp;Access it <a href="https://tryhackme.com/room/wafintroduction">here</a>.<br><br><img width="1200px" src="https://github.com/user-attachments/assets/dcb4f702-2081-4403-8a6b-8813ffb16edd"></p>

<h2>Task 1 . Introduction</h2>
<p>You begin your penetration test expecting a hardened web application, only to compromise it with a simple SQL injection. How? The Web Application Firewall (WAF) was absent, misconfigured, or bypassed. Despite being a staple of modern security architecture, WAFs are often misunderstood: they are usually treated as magic shields when, in fact, they are complex systems with strengths, limitations, and blind spots.</p>

<p><em>Answer the question below</em></p>

<p>1.1. <em>What does WAF stand for?</em><br>
<code>Web Application Firewall</code></p>

<br>
<h2>Task 2 . VM: WAF Control</h2>

<p><em>Answer the question below</em></p>

<p>2.1. <em>Using Firefox on the AttackBox, confirm that you can access the web page at http://MACHINE_IP.</em><br>
<code>Web Application Firewall</code></p>

<img width="1023" height="185" alt="image" src="https://github.com/user-attachments/assets/9460725a-068a-4b36-8ad3-ae11c1e8c000" />

<br>
<p>2.2. <em>Using the provided credentials, confirm that you can log in to the dashboard at http://MACHINE_IP:7000 using the credentials provided in this task.</em><br>
<code>Web Application Firewall</code></p>

<img width="1057" height="521" alt="image" src="https://github.com/user-attachments/assets/c0697a0c-03ae-4a75-858f-c615d37121b2" />

<br>
<h2>Task 3 . Firewalls Refresher</h2>

<p><em>Answer the questions below</em></p>

<p>3.1. <em>Which flag can attackers misuse to bypass a stateless firewall?</em><br>
<code>ACK</code></p>

<p>3.2. <em>What type of firewall tracks active connections?</em><br>
<code>stateful</code></p>

<br>
<h2>Task 4 . Web Application Firewall</h2>

<p><em>Answer the questions below</em></p>

<p>4.1. <em>What do you call mitigating vulnerabilities without source code changes?</em><br>
<code>Layer 7</code></p>

<p>4.2. <em>What type of firewall tracks active connections?</em><br>
<code>Virtual Pathing</code></p>

<p>4.3. <em>What HTTP status code do you get if you attempt an SQLi against http://xx.xx.xx.xx?</em><br>
<code>403 Forbidden</code></p>

<img width="1118" height="347" alt="image" src="https://github.com/user-attachments/assets/4f80d6d8-7bdb-4ce5-a3cc-c85854090d24" />

<br>

<img width="1120" height="322" alt="image" src="https://github.com/user-attachments/assets/210d54b4-2f5f-4560-8405-d07dd0d70b8b" />

<br>
<h2>Task 5 . Signature vs Behavioural Detections</h2>

<p><em>Answer the questions below</em></p>

<p>5.1. <em>Which detection method uses known attack patterns?</em><br>
<code>signature-based</code></p>

<br>
<p>5.2. <em>What kind of attacks can behavioural detection catch that signature-based cannot?</em><br>
<code>zero-day</code></p>

<br>
<h2>Task 6 . Introduction to Rules</h2>

<p><em>Answer the questions below</em></p>

<p>6.1. <em>Which library does OWASP CRS use to detect SQLi?</em><br>
<code>libinjection</code></p>

<br>
<p>6.2. <em>What transformation handles double URL encoding?</em><br>
<code>urldecodeuni</code></p>

<br>
<p>6.3. <em>What score is increased when a critical rule triggers?</em><br>
<code>anomaly score</code></p>

<br>
<p>6.4. <em>Log in to the dashboard at http://xx.xx.xx.xx:7000. Under Attack Control, click Critical Attack, locate the attack that triggered rule 932160 at 2025-11-12 15:38:00. What is the URI that triggered this rule? You need to click View to see the request details.</em><br>
<code>/?parameter=../../../etc/passwd</code></p>

<img width="1249" height="836" alt="image" src="https://github.com/user-attachments/assets/ad63b096-7f77-465f-9218-eacd8cd23800" />

<br>

<img width="1114" height="432" alt="image" src="https://github.com/user-attachments/assets/79a97999-8939-4a76-bf84-3e01ee6c110c" />

<br>

<img width="1115" height="240" alt="image" src="https://github.com/user-attachments/assets/ec8e20ff-a183-4fe0-b063-d24e5325fa51" />

<br>

<img width="1230" height="385" alt="image" src="https://github.com/user-attachments/assets/75424d30-5db2-425b-b025-73a2ef5ed662" />

<br>

<img width="1227" height="212" alt="image" src="https://github.com/user-attachments/assets/a67eccd8-1b17-41ba-abb0-f7eb6943a650" />

<br>
<h2>Task 7 . Limitations of WAFs</h2>

<p><em>Answer the question below</em></p>

<p>7.1. <em>What prevents WAFs from inspecting traffic if not terminated at the WAF?</em><br>
<code>encryption</code></p>

<br>
<h2>Task 8 . Conclusion</h2>
<p>Web Application Firewalls are not silver bullets. They are complex tools designed to mitigate known vulnerabilities, enforce virtual patching, and filter malicious traffic; however, they can do so within certain technical and operational boundaries.<br>

In this room, we’ve seen that WAFs are the result of firewalls evolving from simple stateless filters to deep-inspection engines capable of parsing HTTP traffic, detecting anomalies, and blocking entire classes of attacks, such as SQLi and XSS. However, their effectiveness depends on well-crafted rules, proper deployment, and a clear understanding of their limitations. A WAF cannot fix faulty business logic, making it blind to IDOR, privilege escalation, or even form value manipulation. It is powerless against encrypted and client-side traffic. Furthermore, poorly configured WAFs can introduce new attack surfaces, from rule injection to exposed management interfaces.<br>

A WAF is best used as part of a defence in depth, not a replacement for secure coding. Unfortunately, if the underlying application is flawed, no amount of filtering will make it truly secure.</p>

<p><em>Answer the question below</em></p>

<p>8.1. <em>What principle should guide WAF use in a defence strategy?</em><br>
<code>Defence in Depth</code></p>

<br>
<br>
<h1 align="center">Completed</h1>
<p align="center"><img width="1200px" src="https://github.com/user-attachments/assets/1bdaedb7-bbbf-4f74-bda8-a367aa28f2f1"><br>
                  <img width="1200px" src="https://github.com/user-attachments/assets/876bf227-6ff6-4b2e-893d-4d2c836825ef"></p>

<h1 align="center">My TryHackMe Journey ・ 2025, November</h1>

<div align="center"><h6>

| Date   | Room                                  |Streak   |All Time<br>Global|All Time<br>Brazil|Monthly<br>Global|Monthly<br>Brazil|Points|Rooms<br>Completed|Badges|
|:------:|:--------------------------------------|--------:|------------:|------------:|------------:|------------:|------------:|------------:|------------:|
|19      |Easy 🔗: WAF: Introduction            |   2    |      91ˢᵗ    |     3ʳᵈ    |     737ᵗʰ   |      7ᵗʰ     |    133,348  |    1,026    |    80     |
|19      |Easy 🔗: Django: CVE-2025-64459       | 2      |      93ʳᵈ    |     3ʳᵈ    |     877ᵗʰ   |      8ᵗʰ     |    133,224  |    1,025    |    80     |
|18      |Easy 🔗: OWASP Top 10 2025: Insecure Data Handling| 1        |      93ʳᵈ    |     3ʳᵈ    |     894ᵗʰ   |      8ᵗʰ     |    132,207  |    1,024    |    80     |
|18      |Easy 🔗: OWASP Top 10 2025: Application Design Failures| 1   |      93ʳᵈ    |     3ʳᵈ    |     927ᵗʰ   |      8ᵗʰ     |    132,183  |    1,023    |    80     |
|18      |Easy 🔗: OWASP Top 10 2025: IAAA Failures| 1   |      93ʳᵈ    |     3ʳᵈ    |     971ˢᵗ   |      8ᵗʰ     |    132,151  |    1,022    |    80     |
|14      |Hard 🚩: Shock and Silence            |   1    |      94ᵗʰ    |     4ᵗʰ    |     749ᵗʰ   |      7ᵗʰ     |    133,095  |    1,021    |    80     |
|14      |Easy 🔗: Input Manipulation & Prompt Injection| 1 |   95ᵗʰ    |     4ᵗʰ    |   1,290ᵗʰ   |     12ⁿᵈ     |    132,822  |    1,020    |    80     |
|14      |Hard 🚩: CRM Snatch                   |   1    |      95ᵗʰ    |     4ᵗʰ    |   1,526ᵗʰ   |     12ⁿᵈ     |          -  |    1,019    |    80     |
|8       |Easy 🔗: Living of the Land Attacks   |   1    |      91ˢᵗ    |     4ᵗʰ    |   1,759ᵗʰ   |     17ᵗʰ     |    132,642  |    1,018    |    80     |
|8       |Hard 🚩: Lost in RAMslation           |   1    |      91ˢᵗ    |     4ᵗʰ    |   2,547ᵗʰ   |     25ᵗʰ     |    132,580  |    1,017    |    80     |
|8       |Easy 🔗: MITRE                        |   1    |       -      |     4ᵗʰ    |      -      |      -       |          -  |       -     |    80     |

</h6></div><br>

<p align="center">Global All Time:     91ˢᵗ<br><img width="250px" src="https://github.com/user-attachments/assets/4bcaa3f7-7584-4708-b081-0608ef564663"><br>
                                              <img width="1200px" src="https://github.com/user-attachments/assets/b0a12ec4-b8b9-45ed-ac31-763f51f5aae5"><br><br>
                  Brazil All Time:      3ʳᵈ<br><img width="1200px" src="https://github.com/user-attachments/assets/8c969041-aaf2-4a52-be21-003ed5ff372a"><br><br>
                  Global monthly:     737ᵗʰ<br><img width="1200px" src="https://github.com/user-attachments/assets/d32a5e24-522c-4222-a9c2-f08ce1327ffc"><br><br>
                  Brazil monthly:       7ᵗʰ<br><img width="1200px" src="https://github.com/user-attachments/assets/2c582668-8a5e-4256-a84c-59a9b4e91d65"></p>

<h1 align="center">Thanks for coming!</h1>
<p align="center">Follow me on <a href="https://medium.com/@RosanaFS">Medium</a>, here on <a href="https://github.com/RosanaFSS/TryHackMe">GitHub</a>, and on <a href="https://www.linkedin.com/in/rosanafssantos/">LinkedIN</a>.</p>
