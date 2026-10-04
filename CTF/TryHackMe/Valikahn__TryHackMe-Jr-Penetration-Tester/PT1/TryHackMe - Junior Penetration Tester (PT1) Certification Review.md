# Junior Penetration Tester (PT1) Certification Review ![PathwayCompleted](https://img.shields.io/badge/pt1_exam-passed-brightgreen?style=for-the-badge)
![Alt text](https://github.com/Valikahn/TryHackMe-Jr-Penetration-Tester/blob/main/IMAGES/jrpt_exam_review.png?raw=true)  
[![Pathway](https://img.shields.io/badge/Jr_Penetration_Tester_Pathway-100%25-gold)](https://tryhackme.com/path/outline/jrpenetrationtester) ![PT1](https://img.shields.io/badge/PT1_Certification-PASSED-green) ![license](https://img.shields.io/badge/License-CC_BY_4.0-white) [![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/v4l1k4hn) ![GitHub User's stars](https://img.shields.io/github/stars/valikahn?style=flat&logo=github) ![Discord](https://img.shields.io/discord/521382216299839518?style=flat&logo=discord&color=purple)

## Introduction
The [TryHackMe](http://www.tryhackme.com) [Junior Penetration Tester certification](https://tryhackme.com/certification/junior-penetration-tester), commonly referred to as PT1, is a practical certification intended to assess the core abilities required of an aspiring penetration tester. Unlike a conventional multiple-choice examination, PT1 requires candidates to complete a structured penetration test across several connected technical areas and produce professional reports explaining their findings.

PT1 is built around realistic penetration testing scenarios. It evaluates web application security, network security, Active Directory, privilege escalation, offensive security methodology and report writing. Candidates are therefore expected not only to discover vulnerabilities but also to explain their impact and recommend appropriate remediation measures.

I began the Jr Penetration Tester learning path as a beginner. Penetration testing had interested me for a considerable time, and I wanted to develop the practical skills needed to investigate systems, identify security weaknesses and understand how attackers move through an environment.

The learning path gave me a structured starting point and gradually introduced the tools, techniques and methodology used throughout a penetration test.

Completing the pathway required approximately 96 hours of study, followed by around 44 hours spent completing the PT1 examination. The experience was challenging, occasionally frustrating and extremely rewarding.

It tested far more than my ability to remember commands. It required patience, accurate enumeration, logical decision-making, time management and the discipline to document evidence throughout the engagement.

I have added a **Difficulty Scale:** 0/10 rating beside each of the main topics. This is based entirely on my own experience, with 1 meaning easy and 10 meaning extremely difficult. These scores reflect my own experience and should be treated as a personal guide rather than a fixed measure of difficulty. Other learners may find the same topics easier or harder depending on their existing knowledge, practical experience, confidence with the tools and the amount of preparation completed beforehand.

## My Experience with PT1 Certification
The PT1 examination was tough. Some parts felt relatively straightforward, others were genuinely difficult, and then there were moments where I found myself wondering, “What the hell am I doing wrong?” It placed me under real pressure and repeatedly challenged my assumptions. One of the main lessons I learnt was that apparent progress can be misleading.

There were several occasions when I believed I had completed an attack path, only to discover that another layer of testing was still required. It was that familiar “Aha, I’ve got you” moment, followed almost immediately by a firm “Computer says no.” At that point, I had to return to my notes, reassess the available evidence and continue enumerating.

You really cannot do too much enumeration. Reconnaissance is one of the most important parts of the process, so do not rush it or treat it as a box-ticking exercise. Skipping detail at this stage can easily cause problems later. Nmap and RustScan became essential tools for me, and saving their output to files made it much easier to review findings, compare results and make sure nothing important had been missed.

The assessment tests your patients just as much as technical knowledge. The more experience you gain, the more you begin to recognise patterns, question your assumptions and understand when to change direction. Progress often came from staying patient, revisiting earlier findings and refusing to give up when the first approach failed.

When a technique failed, I had to determine whether the issue was caused by:

- An incorrect command
- A misunderstanding of the target
- Incomplete enumeration
- An unsuitable attack path
- Incorrect credentials
- Network restrictions    
- A missing dependency    
- A tool configuration issue    

This process could be frustrating, but it closely reflected the problem-solving mindset required in penetration testing. The reporting component added another layer of complexity. It was necessary to collect sufficient evidence while testing rather than attempting to recreate every step at the end.

The following information needed to be recorded accurately:

- Screenshots
- Commands
- Requests and responses    
- Affected systems    
- Affected users    
- Vulnerability descriptions    
- Attack paths    
- Business impact    
- Severity ratings    
- Remediation advice    

Time management is very important, spending too long on one difficult vulnerability could reduce the time available for other sections. However, moving on too quickly could result in a valid attack path being abandoned prematurely.

Finding the correct balance required judgement, despite the pressure, the examination was extremely rewarding. Passing PT1 demonstrated that the time invested in the learning path had translated into practical ability.

Now, I passed PT1 on my first attempt, although I was quite nervous when submitting my final report because I was unsure whether I had done enough to pass. I have chosen to keep my detailed examination scores private, as the purpose of this review is to focus on the learning journey and overall examination experience rather than compare results. What I am happy to share is that I completed the assessment in 44 hours, 25 minutes and 29 seconds.

More importantly, it revealed both my strengths and the areas where further study is required.

## Exam Breakdown
The PT1 examination is completed within a 48-hour window. The assessment is presented as a complete penetration testing engagement rather than a collection of unrelated capture-the-flag challenges.

Candidates are required to investigate several areas of an environment, identify security vulnerabilities, exploit appropriate attack paths and submit professional reports detailing the work completed.

The assessment is divided into three principal technical areas:

- Web Application Security
- Network Security
- Active Directory

The examination also assesses supporting abilities such as:

- Reconnaissance
- Service enumeration
- Vulnerability identification
- Exploitation
- Privilege escalation
- Credential harvesting
- Lateral movement
- Pivoting and tunnelling
- Evidence collection
- Risk explanation
- Remediation guidance
- Professional report writing

The 48-hour period was generally fair, although it placed considerable pressure on the examination process.

A few additional hours could make a noticeable difference, particularly when candidates must balance technical testing with evidence collection and report preparation. Report writing is time-consuming and can easily catch you out if it is left too late. Time can also disappear quickly when an attack path does not behave as expected or when a finding requires additional verification.

The assessment rewards persistence and methodical testing and there were several occasions where I believed that I had fully understood an area, only to discover that further investigation was required. This was one of the most valuable aspects of the examination because it reinforced the importance of thorough enumeration.

In penetration testing, finding one vulnerability does not necessarily mean that the assessment of that system is complete.

## Web Application Security
#### Difficulty 9/10
Web application security was by far the most difficult part of the Junior Penetration Tester (PT1) Certification and, in my experience, the only section that did not feel junior in difficulty. I encountered numerous blockers and had to return to it several times, often stepping away briefly to reset my thinking before attempting it again. This was not an easy section; it pushed me well beyond my comfort zone and thoroughly tested my technical knowledge, problem-solving abilities, persistence and resilience. This reflected my experience during the learning path, where Burp Suite was the tool I found most challenging to learn.

Burp Suite is extremely capable, but its interface and range of features can initially feel convoluted and at times overwhelming. Understanding how Proxy, Repeater, Intruder and the other modules support different stages of web application testing requires repeated use.

It is not enough to understand the theory behind a vulnerability. Candidates must also recognise how the vulnerability appears within HTTP requests and responses and understand how to manipulate those requests safely.

The Jr Penetration Tester path introduces essential web application concepts, including:

- Content discovery
- HTTP requests and responses
- Modern web application stacks
- Authentication weaknesses
- Session management issues
- Access control vulnerabilities
- SQL injection
- Cross-site scripting
- Server-side request forgery
- Insecure direct object references
- File inclusion
- Command injection
- API testing
- Burp Suite fundamentals

These subjects created a useful foundation, but web application testing remained my weakest area.

In hindsight, I would have completed the dedicated [Web Application Pentesting](https://tryhackme.com/path/outline/webapppentesting) learning path immediately after the Jr Penetration Tester path and before attempting PT1.

The dedicated pathway provides greater depth in areas such as:

- Authentication attacks
- Session security
- JSON Web Token vulnerabilities
- OAuth weaknesses
- Multi-factor authentication bypasses
- Injection attacks
- Advanced server-side vulnerabilities
- Advanced client-side attacks
- Race conditions
- HTTP request smuggling

This additional practice would have improved both my confidence with Burp Suite and my ability to recognise less obvious web application attack paths. The web application assessment taught me that familiarity with individual vulnerability names is not sufficient.

Effective testing requires an understanding of:

- Application logic
- User roles
- Authentication states
- Session behaviour
- Request parameters
- Hidden application functions
- API endpoints
- Trust relationships between application components
- Business processes

Some of the most important weaknesses may appear within normal business processes rather than through an obvious technical error. Although I found this section difficult, it was also one of the most useful parts of the examination because it clearly identified the area where I need the most development.

## Network Security
#### Difficulty 5/10
Network security was an area where I felt considerably more confident. The learning path helped me develop a more structured approach to reconnaissance, service enumeration, vulnerability research, exploitation, shell management and privilege escalation.

The main lesson was that good network testing depends on understanding what each exposed service is telling you. An open port is only the starting point. The real value comes from identifying the service, checking how it is configured, reviewing the available information and deciding what should be investigated next.

Several tools became central to my methodology:

- Nmap
- RustScan
- FFUF
- Gobuster
- Hydra
- Evil-WinRM
- Chisel
- BloodHound
- dig
- [Reverse Shell Generator](https://www.revshells.com/)

The most important improvement was learning not to rely on a single scan or result. Findings needed to be verified, compared and followed up with more focused enumeration. Saving scan output to files also made it easier to review results later and reduced the risk of overlooking something important.

Overall, this section strengthened my ability to move from initial reconnaissance to a more complete understanding of the target environment.

## Active Directory
#### Difficulty 3/10
Active Directory was the examination area I found easiest, largely because I already had a strong professional background in this area. I work as an Active Directory Subject Matter Expert and have more than 15 years of experience in the AD space, so I approached this section with considerably more confidence than the others.

That said, knowing Active Directory from an administrative and operational perspective is very different from knowing how to assess it during a penetration test. I understood the platform, its structure and its common behaviours, but I still had to learn the tools, attack paths/vectors and methodology used to test it from an offensive security perspective. Because of that, this section was still a significant learning curve for me, despite my existing experience.

The Jr Penetration Tester path still provided a useful offensive-security perspective by showing how familiar Active Directory concepts can be examined from an attacker’s point of view. It introduced the main principles needed to understand how users, groups, systems, permissions and authentication methods interact within a Windows domain. It covered:

- Active Directory fundamentals
- Domain users and groups
- Kerberos
- NTLM authentication
- Initial access
- Credential harvesting
- Domain enumeration
- Privilege relationships
- Lateral movement
- Remote administration
- Pivoting and proxying

The most useful part of this section was learning to view Active Directory as a connected environment rather than a collection of separate machines. A low-privileged user may appear unimportant at first, but group membership, delegated permissions, active sessions or reused credentials can create a path to a more privileged account or system.

All I will say is get familiar with the tools such as BloodHound and Evil-WinRM, these were particularly useful. BloodHound helped visualise relationships between users, groups, computers and permissions, while Evil-WinRM provided a practical way to access and enumerate Windows hosts when valid credentials were available.

I would recommend becoming familiar with the following topics and tools before attempting the Active Directory section, as they played an important part in understanding enumeration, credential attacks, lateral movement and attack-path analysis:

- Kerberoasting
- AS-REP Roasting    
- Pivoting with Ligolo-ng    
- Impacket    
- NetExec (`nxc`)    
- PowerView    
- SharpHound and BloodHound

This section also reinforced the importance of recording every username, password, hash and discovered privilege. A credential that appears limited on one system may provide access elsewhere, especially when several hosts are connected within the same domain.

Overall, Active Directory felt more logical once I began treating it as a series of relationships and attack paths rather than isolated findings. That shift in mindset made the section much easier to approach.

## Preparation Strategy
My main preparation consisted of completing the Jr Penetration Tester learning path. The path took me approximately 96 hours and introduced a large percentage of the subject matter for the first time. My strongest recommendation is to take detailed notes.

Notes should include more than copied commands. They should explain:

- What the command does
- Why it is being used
- What the output means    
- What should be investigated next    
- Any errors encountered    
- How the error was resolved    
- How the technique could apply to another target    

When a room is difficult, it is worth completing it again until the underlying technique is understood. Finishing a room once does not always mean that the subject has been mastered.

Repetition is particularly valuable for:

- Enumeration
- Burp Suite    
- Privilege escalation    
- Tunnelling    
- Pivoting    
- Active Directory attack paths    
- Web application testing    
- Shell management    

Learners should also avoid becoming overly focused on league points or room completion statistics. Progress on a leader board does not necessarily represent technical understanding. It is better to complete fewer rooms properly or more frequently, than to move quickly through content without retaining the methodology.

### Testing Environment  
Candidates should also organise their testing environment before beginning the examination.

Useful preparation includes:

- Updating the Kali Linux virtual machine    
- Confirming VPN connectivity    
- Testing the `tun0` interface    
- Creating a structured note template    
- Preparing folders for screenshots    
- Preparing folders for scan results    
- Testing commonly used tools    
- Keeping essential command references available    
- Reviewing the Rules of Engagement    
- Planning breaks and rest periods    

A useful folder structure could look like this:

```text
PT1/
├── notes/
├── screenshots/
├── scans/
├── web/
├── network/
├── active-directory/
├── exploits/
└── reports/
```

The examination should not be approached as a 48-hour continuous sprint, take strategic breaks as often as you feel the need to, even if its to clear you head, this can make it easier to recognise information that was previously overlooked.

### Learning Paths  
Knowing what I know now and how challenging the Web Application Pentest section was, before sitting PT1, I would make two significant changes to my preparation. 

1. [Jr Penetration Tester](https://tryhackme.com/path/outline/jrpenetrationtester)
2. [Web Application Pentesting](https://tryhackme.com/path/outline/webapppentesting)

### Cheat sheet  
[LaGarian Smith Repository: OSCP Cheat Sheet](https://gitlab.com/lagarian.smith/oscp-cheat-sheet/-/blob/master/OSCP_Notes.md)  
I found this OSCP cheat sheet to be a useful one-stop reference for common penetration testing commands, enumeration techniques and attack methodology. 

### TryHackMe Rooms  
These TryHackMe rooms are a good starting point for getting a feel for the different skills used throughout penetration testing. They provide practical exposure to areas such as privilege escalation, enumeration, web application security, port scanning, Active Directory and pivoting.

These rooms are not a replacement for completing the full learning paths, but they are a useful way to build confidence, revisit weaker areas and gain more hands-on experience before attempting PT1.

| TryHackMe Room                                                                 | TryHackMe Room                                                                         |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| [Linux Privilege Escalation: Basics](https://tryhackme.com/room/linprivbasics) | [Linux Privilege Escalation: Enumeration](https://tryhackme.com/room/linprivenum)      |
| [Basic Pentesting](https://tryhackme.com/room/basicpentestingjt)               | [Enumerating Active Directory](https://tryhackme.com/room/adenumeration)               |
| [RootMe](https://tryhackme.com/room/rrootme)                                   | [Interceptor](https://tryhackme.com/room/interceptor)                                  |
| [Watcher](https://tryhackme.com/room/watcher)                                  | [Nmap Post Port Scans](https://tryhackme.com/room/nmap04)                              |
| [JWT Security](https://tryhackme.com/room/jwtsecurity)                         | [Lateral Movement and Pivoting](https://tryhackme.com/room/lateralmovementandpivoting) |

## Final Thoughts and Next Steps
I would absolutely recommend both the Jr Penetration Tester learning path and the PT1 certification. The pathway provides a broad introduction to the major areas of penetration testing, while the examination requires candidates to apply those skills under pressure.

PT1 is not simply a test of whether someone can reproduce commands from a room or play Capture the Flag.

This requires the candidates to:

- Investigate unfamiliar targets    
- Connect separate pieces of evidence    
- Manage their time    
- Adapt when techniques fail    
- Document (all) vulnerabilities    
- Explain impact    
- Recommend remediation    
- Communicate findings professionally    

My main advice to future candidates is to take extensive notes, repeat difficult rooms and focus on understanding rather than accumulating points. Stay committed and give yourself time to determine which area of cyber security genuinely interests you.

Offensive and defensive security require different mindsets, and it is useful to experience both before deciding where to specialise. The certification has also given me a clearer direction for further development.

Passing PT1 was an important milestone, but it is not the end of the learning process. Penetration testing is a field in which tools, vulnerabilities and defensive technologies continually develop. The most valuable outcome of the journey has therefore been the creation of a stronger methodology and the confidence to approach unfamiliar technical problems independently.

---
[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/v4l1k4hn)  

**Powered on ☕ made with ❤️ by [V4L1K4HN](https://tryhackme.com/p/V4L1K4HN)**  
⭐ If this project is useful, consider starring it on GitHub.
