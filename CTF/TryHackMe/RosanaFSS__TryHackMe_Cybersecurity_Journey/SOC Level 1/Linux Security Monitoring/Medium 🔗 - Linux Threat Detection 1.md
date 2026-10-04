<h1 align="center">Linux Threat Detection 1</h1>
<p align="center"><img width="80px" src="https://github.com/user-attachments/assets/803fb236-7bce-49fb-9b5e-de67215a10c3"><br>
2025, September 24<br> Hey there, fellow lifelong learner! I´m <a href="https://www.linkedin.com/in/rosanafssantos/">Rosana</a>,<br>
and I’m excited to join you on this adventure, part of my <code>506</code>-day-streak in<a href="https://tryhackme.com"> TryHackMe</a>.<br>
<em>Explore how attackers break into Linux systems and how you can detect this in logs</em>.<br>
Access it <a href="https://tryhackme.com/room/linuxthreatdetection1">here</a>.<br>
<img width="1200px" src="https://github.com/user-attachments/assets/90d19a9c-3ab0-4ed9-a441-c80d1bb7de2c"></p>

<h2 align="center">Task 1 . Introduction</h2>
<br>

<p><em>Answer the question below</em></p>

<p>1.1. I´m ready to start!<br>
<code>No answer needed</code></p>

<h2 align="center">Task 2 . Initial Access via SSH</h2>
<br>

<p><em>Answer the questions below</em></p>

<p>2.1. When did the ubuntu user log in via SSH for the first time?Answer Example: 2023-09-16.<br>
<code>2024-10-22</code></p>

<p>2.2. Did the ubuntu user use SSH keys instead of a password for the above found date? (Yea/Nay)<br>
<code>Yea</code></p>

<h2 align="center">Task 3 . Detecting SSH Attacks</h2>
<br>

<p><em>Answer the questions below</em></p>

<p>3.1. When did the SSH password brute force start? Answer Format: 2023-09-15.<br>
<code>2025-08-21</code></p>

```bash
$ grep "Failed password for" auth.log | sed -E 's/^([^ ]+ [^ ]+ [^ ]+) .*Failed password for (invalid user )?([^ ]+) from ([^ ]+).*/\1 Failed password for \3 \4/'
```

<img width="1324" height="458" alt="image" src="https://github.com/user-attachments/assets/00f13c1e-353c-49f1-8e9e-40f993f6f495" />

<br>
<br>

<p align="center"><em>commands practiced</em></p>

```bash
$ grep "Failed password for" auth.log | awk '{print $(NF-5), $NF}' | sort | uniq
```

```bash
$ cat auth.log | grep -E 'Failed password for'
```

```bash
$ cat auth.log | grep sshd | grep -E 'Accepted'
```

<br>
<br>
<p>3.2. Which four users did the botnet attempt to breach? Answer Format: Separate by a comma, in alphabetical order.<br>
<code>root, roy, sol, user</code></p>

<img width="1100" height="116" alt="image" src="https://github.com/user-attachments/assets/a72e8b98-8868-45fb-9066-02a81b88dfd2" />

<br>
<br>
<p>3.3. Finally, which IP managed to breach the root user?<br>
<code>91.224.92.79</code></p>

```bash
$ grep -E 'Accepted password for root' auth.log | wc -l
1
```

```bash
ubuntu@thm-vm:/var/log$ grep -E 'Accepted password for root' auth.log
2025-08-21T17:10:08.113644+00:00 thm-vm sshd[16876]: Accepted password for root from 91.224.92.79 port 51555 ssh2
```

<img width="1304" height="145" alt="image" src="https://github.com/user-attachments/assets/c1f7fca9-722a-4b10-91e6-0c5e40854a37" />

<br>
<br>

```bash
ubuntu@thm-vm:/var/log$ cat auth.log | grep sshd | grep -E 'Accepted'
```

<img width="1147" height="348" alt="image" src="https://github.com/user-attachments/assets/32567add-f12e-4c05-bf9f-a2ad7f1ea27b" />

<br>
<br>
<h2 align="center">Task 4 . Initial Access Via Services</h2>
<br>

<p><em>Answer the questions below</em></p>

<p>4.1. What is the path to the Python file the attacker attempted to open?<br>
<code>/opt/trypingme/main.py</code></p>

```bash
$ grep -E 10.14.105.255 access.log
```

<img width="1280" height="183" alt="image" src="https://github.com/user-attachments/assets/c4d4f1fd-a12d-46b3-a36d-559b95a97753" />

<br>
<br>
<p>4.2. Looking inside the opened file, what's the flag you see there?<br>
<code>THM{****************}</code></p>

```bash
$ grep -E THM main.py
```

<img width="1045" height="129" alt="image" src="https://github.com/user-attachments/assets/041a1b9a-2ba7-4c22-a587-cbf59ef99a67" />

<br>
<br>
<h2 align="center">Task 5 . Detecting Service Breach</h2>
<br>

<p><em>Answer the questions below</em></p>

<p>5.1. What is the PPID of the suspicious whoami command?<br>
<code>****</code></p>

```bash
ubuntu@thm-vm:/var/log/audit$ ausearch -i -x whoami
...
type=SYSCALL msg=audit(08/26/25 xx:xx:xx.xxx:xxx) : arch=x86_64 syscall=execve success=yes exit=0 a0=0x57c312f7e650 a1=0x57c312f7e5d8 a2=0x57c312f7e5e8 a3=0x8 items=2 ppid=**** pid=---- auid=unset uid=ubuntu gid=ubuntu euid=ubuntu suid=ubuntu fsuid=ubuntu egid=ubuntu sgid=ubuntu fsgid=ubuntu tty=(none) ses=unset comm=whoami exe=/usr/bin/whoami subj=unconfined key=exec 
```

```bash
ubuntu@thm-vm:/var/log/audit$ ausearch -i --ppid ****
```

<p>5.2. Moving up the tree, what is the PID of the TryPingMe app?<br>
<code>***</code></p>

```bash
ubuntu@thm-vm:/var/log/audit$ ausearch -p ****
...
type=SYSCALL msg=audit(1756238989.738:156): arch=c000003e syscall=59 success=yes exit=0 a0=7ef5401797b0 a1=7ef53e636870 a2=7ffeb1260660 a3=8 items=2 ppid=___ pid=**** auid=4294967295 uid=1000 gid=1000 euid=1000 suid=1000 fsuid=1000 egid=1000 sgid=1000 fsgid=1000 tty=(none) ses=4294967295 comm="sh" exe="/usr/bin/dash" subj=unconfined key="exec"
```

<p>5.3. Which program did the attacker use to open a reverse shell?<br>
<code>******</code></p>

```bash
ubuntu@thm-vm:/var/log/audit$ ausearch -i --ppid ***
```

<h2 align="center">Task 6 . Advanced Initial Access</h2>
<br>

<p><em>Answer the questions below</em></p>

<p>6.1. Which Initial Access technique is likely used if a trusted app suddenly runs malicious commands?<br>
<code>Supply Chain Compromise</code></p>

<p>6.2.Which detection method can you use to detect a variety of Initial Access techniques?<br>
<code>process tree analysis</code></p>

<h2 align="center">Task 7 . Conclusion</h2>
<p>Great job exploring the Initial Access techniques and an especially complex topic: the process tree analysis! While it may seem hard to apply, you will happily use it on a daily basis with some practice and a more convenient SIEM interface. Using the system log sources and auditd, you learned to identify how attacks start and are now ready to learn how they continue!</p>
<h3>Key Takeways</h3>
<p>

- Attacks on SSH are widespread, but they are easy to detect via authentication logs<br>
- Exposed services are always a risk since they can lead to a whole Linux compromise<br>
- Check out the Bulletproof Penguin room to learn how to harden and secure Linux servers<br>
- While phishing is not common on Linux, human-led and supply attacks are still possible<br>
- Process tree analysis is your best approach in identifying the Initial Access techniques</p>

<p><em>Answer the question below</em></p>

<p>7.1. Let´s continue!<br>
<code>No answer needed</code></p>

<br>
<br>
<h1 align="center">Completed</h1>
<p align="center"><img width="1200px" src="https://github.com/user-attachments/assets/86b84eb4-8070-47d9-b433-7239356b16b8"><br>
                  <img width="1200px" src="https://github.com/user-attachments/assets/cd992e2e-9757-4e36-bbec-e8bb7690081a"></p>

<h1 align="center">My TryHackMe Journey ・ 2025, September</h1>

<div align="center"><h6>

| Date   | Room                                  |Streak   |All Time<br>Global|All Time<br>Brazil|Monthly<br>Global|Monthly<br>Brazil|Points|Rooms<br>Completed|Badges|
|:------:|:--------------------------------------|--------:|------------:|------------:|------------:|------------:|------------:|------------:|------------:|
|24      |Medium 🔗: <strong>Linux Threat Detection 1</strong>| 506 | 110ᵗʰ|  4ᵗʰ     |     330ᵗʰ   |     5ᵗʰ     | 126,894  |   973     |   76     | 
|24      |Hard 🚩: Iron Corp                    | 506    |    111ˢᵗ    |      4ᵗʰ     |     363ʳᵈ   |     5ᵗʰ     | 126,768  |   972     |   76     |    
|23      |Medium 🔗: Intro to Credential Harvesting|505 |     109ᵗʰ    |      4ᵗʰ     |     346ᵗʰ   |     5ᵗʰ     | 126,768  |   971     |   76     |    
|22      |                                        | 504   |              |      4ᵗʰ     |             |             |          |           |   76     |    
|21      |                                        | 503   |              |      4ᵗʰ     |             |             |          |           |   76     |    
|20      |                                        | 502   |              |      4ᵗʰ     |             |             |          |           |   76     |    
|19      |                                        | 501   |              |      4ᵗʰ     |             |             |          |           |   76     |        
|18      |Easy 🔗: Detecting Web DDos           | 500    |     106ᵗʰ    |      4ᵗʰ     |     312ⁿᵈ   |     4ᵗʰ    | 126,674  |    970    |    76     |
|17      |Medium 🔗: DLL Hijacking              | 499    |     106ᵗʰ    |      4ᵗʰ     |     348ᵗʰ   |     7ᵗʰ    | 126,554  |    969    |    75     |
|17      |Medium 🔗: The Docker Rodeo           | 499    |     106ᵗʰ    |      4ᵗʰ     |     346ᵗʰ   |     7ᵗʰ    | 126,546  |    968    |    75     |
|17      |Easy 🔗: Linux Logging for SOC        | 499    |     106ᵗʰ    |      4ᵗʰ     |     345ᵗʰ   |     7ᵗʰ    | 126,538  |    967    |    74     |
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

<p align="center">Global All Time:   106ᵗʰ<br><img width="250px"  src="https://github.com/user-attachments/assets/035d4bae-16f3-4da7-b57b-4077e0a63c47"><br>
                                              <img width="1200px" src="https://github.com/user-attachments/assets/5580eea4-6081-4241-80fc-2d4cf18d5856"><br><br>
                  Brazil All Time:     4ᵗʰ<br><img width="1200px" src="https://github.com/user-attachments/assets/2b334c14-f571-4aa5-bd1a-fa0cbc86e36c"><br>
                  Global monthly:    330ᵗʰ<br><img width="1200px" src="https://github.com/user-attachments/assets/17bb71a4-1e52-40b3-a993-bb7df9a3a09a"><br>
                  Brazil monthly:      5ᵗʰ<br><img width="1200px" src="https://github.com/user-attachments/assets/206f4848-19c4-435e-a635-b42721bd921b"><br>

<h1 align="center">Thanks for coming!</h1>
<p align="center">Follow me on <a href="https://medium.com/@RosanaFS">Medium</a>, here on <a href="https://github.com/RosanaFSS/TryHackMe">GitHub</a>, and on <a href="https://www.linkedin.com/in/rosanafssantos/">LinkedIN</a>.</p>
