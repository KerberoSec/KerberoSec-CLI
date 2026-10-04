# TryHackMe
Documenting my journey exploring TryHackMe

_Exploring TryHackMe to expand my hands on practice reinforcing technical capabilities with a pen test lens and its fun!_

[View My TryHackMe Profile](https://tryhackme.com/p/zcurry.zinc)

**Linux Commands**
- whoami: Returns the machine information
- echo: Returns a command
- ls: List what in the current folder
- cd: change directory or move into a folder
- cat: shows the contents of a file
- pwd: prints the working directory
- dirb: returns hidden pages [for example dirb www.BigBusiness.com returns unindexed admin pages] _Helpful in capture the flag to find unprotected pages_
- find: search for files [for example find -name passwords.txt]
- grep: searches inside for text [for example grep "password123" passwords.txt]
- &: Runs commands and does not wait
- &&: Runs commands and waits for the first to finish
- ">": Used to redirect output and over writes the file
- ">>": The redirector does the same thing, but instead of overwriting, it will just add the output to the bottom of the file

# SOC Simulator 
**Step 1:** Find all true positives</br>
**Step 2:** Read the documentation</br>
**Step 3:** Investigate the alert queue</br>
**Step 4:** Take ownership of an alert</br>
**Step 5:** Deep dive into the SIEM [Splunk]</br>

## Attempt 1: Introduction
**Results:** [100%](https://tryhackme.com/zcurry.zinc/badges/soc-sim-100-percent-true-positive-rate?utm_campaign=social_share&utm_medium=social&utm_content=badge&utm_source=copy&sharerId=6a6e830155dbdfd620eeb0aa)</br>

**Alert 1:** Inbound Email Containing Suspicious External Link</br>
Decision: True Positive</br>
Explanation: The link within the email is to another company impersonating Human Resources to our employee redirecting them to an external website.</br>

**Alert 2:** Access to Blacklisted External URL Blocked by Firewall</br>
Decision: True Positive</br>
Explanation: Known malicious IP: Escalate for further review as to why our IP tried to access was it by accident, a phishing breach, or an inside threat.</br>

**Alert 3:** Inbound Email Containing Suspicious External Link </br>
Decision: True Positive</br>
Explanation: The sender and external link are impersonating Microsoft.</br>

## Attempt 2: Scenario Unfolding
**Results:** [94.44%](https://tryhackme.com/soc-sim/public-summary/995098a35d4d0b022e6940be038e0a4d8f307bbee339a6e0d810565492b85d1774a2c6060cc470b203159d14b12684ca): Currently 1st Place!</br>
_Placing me in the top 45% on TryHackMe_</br>

<img width="1315" height="459" alt="image" src="https://github.com/user-attachments/assets/14e9a9be-df5e-4b73-bed8-de933c6c57ab" />
<img width="1293" height="297" alt="image" src="https://github.com/user-attachments/assets/4f2bfbaf-cc29-437a-925b-f662d6c38f16" />

**Description**
Dive into the heat of a live phishing attack as it unfolds within the corporate network. In this high-pressure scenario, your role is to meticulously analyze and document each phase of the breach as it happens. Can you piece together the attack chain in real-time and prepare a comprehensive report on the malicious activities?
Scenario objectives

**Monitor and analyze real-time alerts as the attack unfolds.**
Identify and document critical events such as PowerShell executions, reverse shell connections, and suspicious DNS requests.
Create detailed case reports based on your observations to help the team understand the full scope of the breach.

**Actions Taken:**
The CCNA Cybersecurity labs, studying, and knowledge helped me through this one for sure!
At first there are a few simple phishing/spam emails then you get a few tickets of uncommon subprocesses which on their own could be false positives until you receive an indicator of attack (no spoilers here: IYKYK). Then over 30 tickets rush in requiring you to investigate via Splunk (it does allow you to select your preferred SIEM when starting). It quickly becomes apparent there is an external threat actor poking your network and then it happens: They begin exfiltrating data.
It is important to both prioritize priority of tickets as the attack escalates but also keep a timeline in your mind as you investigate each ticket to provide accurate reporting.</br>

**Lessons Learned**
TryHackMe does NOT want you to mark spam emails as Phishing and they want specifically Phishing emails only to be marked threats.

</br></br>

# Take Over Challenge

## Attempt 1
**Results:** Failed </br>
Updated my host file with the IP and URL but was unable to obtain the x509 cert. Tried FFuF but it didn't work. Used the entire hour and will retire again in the near future.</br>
_It said Fuffy Wuffy, Wasn't Fuffy Was He? And I said... Let me get back to you._

**What I am learning through this exercise:**
- ffuf Takes dirb (mapping unlisted pages) further by scanning the sites entire DNS configuration for both pages [HOST/pages] and subdomains [Private.HOST] this is very relevant as I have personally setup DNS servers to include subdomains for internal training sites.
- The ability to bypass security by adding host files on your own device by tricking domains who maintain a self-signed certificate.
