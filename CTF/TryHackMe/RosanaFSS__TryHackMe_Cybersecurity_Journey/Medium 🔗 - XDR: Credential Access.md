<h1 align="center">XDR: Credential Access</h1>
<p align="center"><img width="80px" src="https://github.com/user-attachments/assets/566c97cf-ebc9-4118-a79a-b9e94a7044a4"><br>
2025, September 29<br> Hey there, fellow lifelong learner! I´m <a href="https://www.linkedin.com/in/rosanafssantos/">Rosana</a>,<br>
and I’m excited to join you on this adventure, part of my <code>511</code>-day-streak in<a href="https://tryhackme.com"> TryHackMe</a>.<br>
<em>earn about techniques attackers use to steal account credentials.</em>.<br>
Access it <a href="https://tryhackme.com/room/xdrcredentialaccess"</a>here.<br>
<img width="1200px" src="https://github.com/user-attachments/assets/3625e6e3-6656-4fb6-81fe-f4756b65d14c"></p>

<h2 align="center">Task 1 . Introduction</h2>

<p>Threat actors need credentials to gain unauthorised access to systems, elevate privileges, and move laterally within the environment while appearing as legitimate users.<br>

In this room, we will explore techniques attackers employ to acquire authentication credentials, including usernames, passwords, tokens, or keys, which provide access to systems, applications, or networks.</p>

<h3>Learning Objectives</h3>
<p>After completing this room, you will be able to understand the following:<br>

- What are credential access tactics<br>
- Discuss various attack techniques and how they can be mitigated<br>
- Review incidents related to a malicious credential access on the Microsoft Defender XDR portal<br>
- Explain how to mitigate and respond to a credential access using Microsoft Defender XDR</p>

<h3>Prerequisites</h3>
<p>It's recommended that you have completed the following rooms:<br>
  
- The <a href="https://tryhackme.com/room/xdrintroduction">XDR Introduction</a> room<br>
- The <a href="https://tryhackme.com/room/mitre">MITRE</a> room</p>

<p><em>Answer the question below</em></p>

<p>1.1. Let´s go!<br>
<code>No answer needed</code></p>

<h2 align="center">Task 2 . What is Credential Access</h2>
<br>

<p><em>Answer the questions below</em></p>

<p>2.1. After a successful credential access tactic, can attackers blend in with legitimate users? (Yea/Nay)<br>
<code>Yea</code></p>

<br>
<p>2.2. What is the process of extracting credentials from system memory called?<br>
<code>Credential Dumping</code></p>

<br>
<p>2.3. Credential access can lead to privilege escalation, lateral movement, and?<br>
<code>Persistence</code></p>

<br>
<h2 align="center">Task 3 . Technique: Brute Force</h2>
<br>

<p><em>Answer the questions below</em></p>

<p>3.1. What factor increases the time required to crack a password exponentially?<br>
<code>password complexity</code></p>

<br>
<p>3.2. What should be implemented to mitigate automated multiple login attempts?<br>
<code>account lockout policies</code></p>

<br>
<h2 align="center">Task 4 . Technique: Credential Dumping</h2>
<br>

<p><em>Answer the questions below</em></p>

<p>4.1. As security admins, what control can be implemented to prevent the use of dumped credentials?<br>
<code>multi-factor authentication</code></p>

<br>
<p>4.2. What database do attackers target during NTDS dumping?<br>
<code>NTDS.dir</code></p>

<br>
<h2 align="center">Task 5 . Lab: Detect and Investigate Using Defender XDR</h2>
<h3>Lab Scenario</h3>
<p>The security team has received multiple alerts regarding failed sign-in attempts and a suspicious login from an unfamiliar IP. Your task is to investigate a potential password spray attack, identify the affected account(s), and gather some info to pass on to senior analysts.

Note: To follow through, you can use the lab credentials and URL below:</p>

<h6 align="center"><img width="400px" src="https://github.com/user-attachments/assets/6ae5b818-08e5-4c25-982f-f0c42477b548"><br>This image and all the theoretical content of the present article is TryHackMe´s property.<br></h6>

<p>Note: The incidents shown in this task might differ from the ones in the lab.</p>

<p><strong>Password Spray Attack</strong><br>

- Click the <strong>Incidents & alert</strong> dropdown and select Incidents<br><br>
- On the incidents screen, modify the time range to 6 months<br><br>
- Find the incident with the name <strong>Multi-stage incident involving Execution & Lateral movement on one endpoint reported by multiple sources</strong> (Incident Id: 68), and click the toggle icon to open the dropdown menu. If the sidebar opens, click the X to close it.<br><br>
- Scroll down to find the alert for <strong>password spraying</strong>. To see more information about this alert, scroll down to the sidebar.<br><br>
- Click on <strong>Open alert page</strong> to begin the investigation.<br>On the new screen, the following can be seen:<br>1. The device involved<br>2. The user account involved<br>3. The time of each execution or event<br>4. The event/process names. You can click on each event to see the script on the sidebar<br>5. Details of the password spraying attack<br><br>
- Click on the Alert timeline to see our specific alert details.<br><br><br>To investigate this alert, in addition to the device and user account details, we can see the following details:<br>- The date and time this script was executed<br>- The severity of this alert (Medium)<br>- The event, <strong>powershell.exe executed a script</strong>br>- The content of the script can be copied for further forensic investigations<br><br>
- Click the <strong>PowerShell.exe executed a script</strong> dropdown for more details.<br><br><br>You can copy the command from the command line to analyse its full content. As you may have noticed, a script was executed. Additionally, if you click on the alert name <strong>Password spraying</strong> on the side pane, a list of evidence for forensic purposes and a detailed description of the alert appear.<br><br><br>After investigation and information gathering, this alert is considered a malicious event. The following can be done to mitigate the threat and prevent further escalation.<br>- We can run an antivirus scan<br>- Restrict applications from executing on this machine<br>- Start Microsoft Defender XDR automated investigation<br>- Start a live response session to access the affected machine for manual intervention remotely<br>- Isolate the device to prevent lateral movement or the attacker from gaining access to other devices<br><br><br>For further investigation, security admins can leverage KQL to find more suspicious activities on the affected device by clicking on <strong>Go hunt</strong>.<br><br><br>On the advanced hunting screen, you can modify the timestamp for broader coverage, then click <strong>Run query</strong to view the result. This query searches for the top 100 usual events on the specified machine across different tables.</p>

<p><em>Answer the questions below</em></p>

<p>5.1. What do you click to go to the advanced hunting page of a specific device from the alert page?<br>
<code>Go hunt</code></p>

<br>
<p>5.2. What is the name of the PowerShell script that was executed?<br>
<code>******.***</code></p>

<img width="1917" height="723" alt="image" src="https://github.com/user-attachments/assets/015d89c8-c38a-47bd-bdf1-e65767f4c02e" />

<br>
<br>
<br>

<img width="1888" height="891" alt="image" src="https://github.com/user-attachments/assets/d1961f19-21fb-47a5-a85e-0547bcc59592" />

<br>
<br>
<br>

<img width="1913" height="824" alt="image" src="https://github.com/user-attachments/assets/5cf21d90-e0dc-472a-9429-7420ba44d463" />

<br>
<br>
<br>

<img width="1895" height="860" alt="image" src="https://github.com/user-attachments/assets/721bb82d-abb1-4c6e-b098-c086d1159579" />

<br>
<br>
<br>

<img width="1909" height="866" alt="image" src="https://github.com/user-attachments/assets/6f115643-aef5-4207-b7c0-37a7e2023492" />

<br>
<br>
<br>

<img width="1903" height="879" alt="image" src="https://github.com/user-attachments/assets/73cf9a13-1c29-4539-9e28-e63ce7568723" />

<br>
<br>
<br>
<h2 align="center">Task 6 . XDR: Prevent, Detect and Investigate using Defender XDR</h2>
<br>

<p><em>Answer the questions below</em></p>

<p>6.1. Which ASR rule will prevent the delivery of initial payloads that often include credential dumping tools?<br>
<code>Block executable content from email client and webmail</code></p>

<br>
<p>6.2. Which defender for Office 365 policy will block access to websites hosting malicious scripts or executables?<br>
<code>Safe Links</code></p>

<br>
<p>6.3. What should be configured to protect the Local Security Authority Subsystem Service from attackers and stop credential dumping memory?<br>
<code>Credential Guard</code></p>

<h2 align="center">Task 7 . Conclusion</h2>
<p>In this room, we discussed credential access attack tactics and Microsoft Defender XDR's comprehensive approach to securing an organisation's digital environment through a layered defence strategy, ensuring enhanced protection against threat actors maliciously accessing credentials.<br>

Specifically, we explored the following topics:<br>

- An overview of credential access attack tactics<br>
- Brute force technique<br>
- Credential dumping technique<br>
- Investigating a credential access incident<br>
- Discussed detection, prevention and mitigation techniques with Microsoft Defender XDR</p>

<p><em>Answer the question below</em></p>

<p>7.1. I can investigate and mitigate a credential access attack when I see one!<br>
<code>No answer needed</code></p>

<br>
<br>

<h1 align="center">Completed</h1>
<p align="center"><img width="1200px" src="https://github.com/user-attachments/assets/c61f6130-e007-43ed-90b4-fc0ceae02aa0"><br>
                  <img width="1200px" src="https://github.com/user-attachments/assets/0f62ec2e-5395-4d18-a404-f2387f90a4fa"></p>

<h1 align="center">My TryHackMe Journey ・ 2025, September</h1>

<div align="center"><h6>

| Date   | Room                                  |Streak   |All Time<br>Global|All Time<br>Brazil|Monthly<br>Global|Monthly<br>Brazil|Points|Rooms<br>Completed|Badges|
|:------:|:--------------------------------------|--------:|------------:|------------:|------------:|------------:|------------:|------------:|------------:|
|29      |Medium 🔗: <strong>XDR: Credential Access</strong> | 511| 109ᵗʰ |    4ᵗʰ     |     211ˢᵗ    |     5ᵗʰ    | 127,880  |    981    |    76     |
|29      |Medium 🚩: XDR: Operation Global Dagger| 511   |     109ᵗʰ    |      4ᵗʰ     |     217ᵗʰ    |     5ᵗʰ    | 127,784  |    980    |    76     |
|28      |Hard 🚩: Sea Surfer, in progress      | 510    |     -        |      4ᵗʰ     |     -        |     -      | -        |    979    |    76     |
|28      |Medium 🔗: Windows PrivEsc Arena, in progress|510 | -         |      4ᵗʰ     |     -        |     -      | -        |    979    |    76     |
|27      |Medium 🚩: Backtrack                  | 509    |     109ᵗʰ    |      4ᵗʰ     |     318ᵗʰ    |     5ᵗʰ    | 127,334  |    979    |    76     |
|26      |Medium 🚩: ContainMe                  | 508    |     109ᵗʰ    |      4ᵗʰ     |     301ˢᵗ    |     5ᵗʰ    | 127,304  |    978    |    76     |
|26      |Medium 🚩: Sequence                   | 508    |     110ᵗʰ    |      4ᵗʰ     |     301ˢᵗ    |     5ᵗʰ    | 127,274  |    977    |    76     |
|25      |Medium 🔗: Introduction to Honeypots  | 507    |     109ᵗʰ    |      4ᵗʰ     |     305ᵗʰ    |     5ᵗʰ    | 127,214  |    976    |    76     |
|25      |Medium 🔗: Windows x64 Assembly       | 507    |     109ᵗʰ    |      4ᵗʰ     |     303ʳᵈ    |     5ᵗʰ    | 127,110  |    975    |    76     | 
|25      |Easy 🔗: Network Secuity Essentials   | 507    |     112ⁿᵈ    |      4ᵗʰ     |     302ⁿᵈ    |     5ᵗʰ    | 126,990  |    974    |    76     | 
|24      |Medium 🔗: Linux Threat Detection 1   | 506    |     110ᵗʰ    |      4ᵗʰ     |     330ᵗʰ    |     5ᵗʰ    | 126,894  |    973    |    76     | 
|24      |Hard 🚩: Iron Corp                    | 506    |     111ˢᵗ    |      4ᵗʰ     |     363ʳᵈ    |     5ᵗʰ    | 126,768  |    972    |    76     |    
|23      |Medium 🔗: Intro to Credential Harvesting|505  |     109ᵗʰ    |      4ᵗʰ     |     346ᵗʰ    |     5ᵗʰ    | 126,768  |    971    |    76     |    
|22      |                                        | 504   |              |      4ᵗʰ     |              |             |         |            |    76     |    
|21      |                                        | 503   |              |      4ᵗʰ     |              |             |         |            |    76     |    
|20      |                                        | 502   |              |      4ᵗʰ     |              |             |         |            |    76     |    
|19      |                                        | 501   |              |      4ᵗʰ     |              |             |         |            |    76     |        
|18      |Easy 🔗: Detecting Web DDos           | 500    |     106ᵗʰ    |      4ᵗʰ     |     312ⁿᵈ    |     4ᵗʰ    | 126,674  |    970    |    76     |
|17      |Medium 🔗: DLL Hijacking              | 499    |     106ᵗʰ    |      4ᵗʰ     |     348ᵗʰ    |     7ᵗʰ    | 126,554  |    969    |    75     |
|17      |Medium 🔗: The Docker Rodeo           | 499    |     106ᵗʰ    |      4ᵗʰ     |     346ᵗʰ    |     7ᵗʰ    | 126,546  |    968    |    75     |
|17      |Easy 🔗: Linux Logging for SOC        | 499    |     106ᵗʰ    |      4ᵗʰ     |     345ᵗʰ    |     7ᵗʰ    | 126,538  |    967    |    74     |
|16      |Hard 🚩: TryHack3M: TriCipher Summit  | 498    |     107ᵗʰ    |      4ᵗʰ     |     364ᵗʰ    |     7ᵗʰ    | 126,420  |    966    |    74     |
|16      |Easy 🔗: Chaining Vulnerabilities     | 498    |     108ᵗʰ    |      5ᵗʰ     |     365ᵗʰ    |     7ᵗʰ    | 126,420  |    965    |    74     |
|15      |Medium 🔗: AppSec IR                  | 497    |     108ᵗʰ    |      5ᵗʰ     |     352ⁿᵈ    |     7ᵗʰ    | 126,404  |    964    |    74     |
|14      |Hard 🚩: Misguided Ghosts, in progress| 496    |     108ᵗʰ    |      5ᵗʰ     |     389ᵗʰ    |     6ᵗʰ    | 126,300  |    963    |    74     |
|14      |Hard 🚩: VulnNet: Endgame             | 496    |     108ᵗʰ    |      5ᵗʰ     |     394ᵗʰ    |     6ᵗʰ    | 126,270  |    963    |    74     |
|13      |Hard 🚩: Royal Router                 | 495    |     107ᵗʰ    |      5ᵗʰ     |     388ᵗʰ    |     6ᵗʰ    | 126,160  |    962    |    74     |
|13      |Medium 🚩: Void Execution             | 495    |     107ᵗʰ    |      5ᵗʰ     |     383ʳᵈ    |     6ᵗʰ    | 126,120  |    961    |    73     |
|12      |Easy 🚩: Invite Only                  | 494    |     110ᵗʰ    |      5ᵗʰ     |     352ⁿᵈ    |     6ᵗʰ    | 126,056  |    960    |    73     |
|12      |Medium 🚩: Devie                      | 494    |     110ᵗʰ    |      5ᵗʰ     |     607ᵗʰ    |     9ᵗʰ    | 125,606  |    959    |    73     |
|11      |Medium 🚩: Backtrack, in progress     | 493    |     110ᵗʰ    |      5ᵗʰ     |     629ᵗʰ    |     9ᵗʰ    | 125,516  |    958    |    73     |
|11      |Easy 🔗: Detecting Web Attacks        | 493    |     110ᵗʰ    |      5ᵗʰ     |     629ᵗʰ    |     9ᵗʰ    | 125,516  |    958    |    73     |
|10      |Easy 🔗: Attacking ICS Plant #1       | 492    |     110ᵗʰ    |      5ᵗʰ     |     675ᵗʰ    |     9ᵗʰ    | 125,428  |    957    |    73     |
|10      |Easy 🔗: SOC Role in Blue Team        | 492    |     110ᵗʰ    |      5ᵗʰ     |     664ᵗʰ    |     9ᵗʰ    | 125,292  |    956    |    73     |
|9       |Hard 🚩: Python Playground            | 491    |     111ˢᵗ    |      5ᵗʰ     |     693ʳᵈ    |     9ᵗʰ    | 125,236  |    955    |    73     |
|9       |Hard 🚩: Borderlands                  | 491    |     111ˢᵗ    |      5ᵗʰ     |     713ʳᵈ    |    10ᵗʰ    | 125,146  |    954    |    73     |
|9       |Medium 🚩: Forgotten Implant          | 491    |     112ⁿᵈ    |      5ᵗʰ     |     660ᵗʰ    |    10ᵗʰ    | 125,016  |    953    |    73     |
|8       |Easy 🔗: Web Enumeration              | 490    |     112ⁿᵈ    |      5ᵗʰ     |     663ʳᵈ    |    10ᵗʰ    | 124,986  |    952    |    73     |
|8       |Easy 🔗: iOS: Forensics               | 490    |     113ʳᵈ    |      5ᵗʰ     |     548ᵗʰ    |     9ᵗʰ    | 124,850  |    951    |    73     |
|7       |Medium 🚩: VulnNet: Active            | 489    |     114ᵗʰ    |      5ᵗʰ     |     542ⁿᵈ    |     9ᵗʰ    | 124,746  |    950    |    73     |
|7       |Medium 🚩: pyLon                      | 489    |     114ᵗʰ    |      5ᵗʰ     |     535ᵗʰ    |     9ᵗʰ    | 124,716  |    949    |    73     |
|7       |Medium 🚩: Pressed                    | 489    |     113ʳᵈ    |      5ᵗʰ     |     508ᵗʰ    |     9ᵗʰ    | 124,886  |    948    |    73     |
|6       |Easy 🚩: Classic Passwd               | 488    |     114ᵗʰ    |      5ᵗʰ     |     683ʳᵈ    |    12ⁿᵈ    | 124,476  |    947    |    73     |
|6       |Medium 🚩: toc2                       | 488    |     114ᵗʰ    |      5ᵗʰ     |     695ᵗʰ    |    12ⁿᵈ    | 124,446  |    946    |    73     |
|6       |Hard 🚩: Extract                      | 488    |     114ᵗʰ    |      5ᵗʰ     |     716ᵗʰ    |    13ʳᵈ    | 124,386  |    945    |    73     |
|6       |Medium 🚩: Plotted-EMR                | 488    |     114ᵗʰ    |      5ᵗʰ     |     844ᵗʰ    |    12ⁿᵈ    | 124,326  |    944    |    73     |
|5       |Medium 🚩: Inferno                    | 487    |     114ᵗʰ    |      5ᵗʰ     |     758ᵗʰ    |    12ⁿᵈ    | 124,236  |    943    |    73     |
|5       |Easy 🔗: Psycho Break                 | 487    |     115ᵗʰ    |      5ᵗʰ     |     724ᵗʰ    |    10ᵗʰ    | 124,152  |    942    |    73     |
|4       |Medium 🚩: Cold VVars                 | 486    |     113ʳᵈ    |      5ᵗʰ     |     579ᵗʰ    |    10ᵗʰ    | 124,048  |    941    |    73     |
|4       |Medium 🔗: IP and Domain Threat Intel | 486    |     113ʳᵈ    |	     5ᵗʰ    |     579ᵗʰ     |    10ᵗʰ    | 124,018  |   940     |    73     |
|3       |Easy 🔗: Malware Classification       | 485    |     112ⁿᵈ    |      5ᵗʰ     |     714ᵗʰ    |    13ʳᵈ    | 123,882  |    939    |    73     |
|2       |Medium 🔗: Session Forensics          | 484    |     111ˢᵗ    |      5ᵗʰ     |     706ᵗʰ    |    14ᵗʰ    | 123,786  |    938    |    73     |
|1       |Medium 🚩: Voyage                     | 483    |     111ˢᵗ    |      5ᵗʰ     |     849ᵗʰ    |    15ᵗʰ    | 123,636  |    937    |    73     |

</h6></div><br>

<br>

<p align="center">Global All Time:   109ᵗʰ<br><img width="250px"  src="https://github.com/user-attachments/assets/53fe39b6-148b-4ce1-9418-067a2c559576"><br>
                                              <img width="1200px" src="https://github.com/user-attachments/assets/80a39fe5-5c28-44e7-9d37-cc73b83cc073"><br><br>
                  Brazil All Time:     4ᵗʰ<br><img width="1200px" src="https://github.com/user-attachments/assets/cc79e54d-4450-4734-b7af-c32589b48ae9"><br>
                  Global monthly:    211ˢᵗ<br><img width="1200px" src="https://github.com/user-attachments/assets/5f53fff4-751b-42fc-bbdf-137b403e29a4"><br>
                  Brazil monthly:      5ᵗʰ<br><img width="1200px" src="https://github.com/user-attachments/assets/e62b0e96-8410-431e-94be-db04646b88e2"><br>

<h1 align="center">Thanks for coming!</h1>
<p align="center">Follow me on <a href="https://medium.com/@RosanaFS">Medium</a>, here on <a href="https://github.com/RosanaFSS/TryHackMe">GitHub</a>, and on <a href="https://www.linkedin.com/in/rosanafssantos/">LinkedIN</a>.</p>
