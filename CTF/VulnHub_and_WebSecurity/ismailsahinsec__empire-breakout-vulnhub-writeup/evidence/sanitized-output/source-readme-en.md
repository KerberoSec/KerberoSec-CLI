# Empire: Breakout: VulnHub Write-up

[🇹🇷 Türkçe sürüm](../../README_TR.md)

> Step-by-step write-up of the **Empire: Breakout** VulnHub machine, solved on **Kali Linux**.
>
> This repository is not just a command dump. It was prepared to show the **reasoning process**, **pivot logic**, and **service correlation** used during the solution.

---

## Table of Contents

- [About the Project](#about-the-project)
- [Target Machine](#target-machine)
- [Objective](#objective)
- [Methodology Summary](#methodology-summary)
- [Tools Used](#tools-used)
- [Step-by-Step Walkthrough](#step-by-step-walkthrough)
- [Key Takeaways](#key-takeaways)
- [Lessons Learned](#lessons-learned)
- [Repository Structure](#repository-structure)
- [Legal and Ethical Note](#legal-and-ethical-note)

---

## About the Project

This repository documents the solution process for the intentionally vulnerable **Empire: Breakout** virtual machine published on **VulnHub**.

The goal of this write-up is not only to show the final result, but also to explain:

- why a specific command was used
- what each output revealed
- how information from one service was reused in another
- how a real pentest thought process develops step by step

Because of that, this repo focuses not only on commands, but also on **interpretation** and **decision-making**.

---

## Target Machine

- **Machine:** Empire: Breakout
- **Platform:** VulnHub
- **Category:** Boot2Root / Pentest Lab
- **Attack Environment:** Kali Linux

---

## Objective

The objective of this machine was to identify exposed services, determine the correct entry point, and validate access by correlating findings across multiple services.

The critical part of the solution was this:

> Instead of getting stuck on a single service, I combined a clue found on the web side with SMB enumeration results and used that chain to reach the correct management panel.

---

## Methodology Summary

The solution followed this logic:

1. Identify the target device on the local network
2. Confirm exposed services
3. Extract the clue hidden in the web page source
4. Decode the hidden value
5. Enumerate SMB to discover valid user information
6. Validate the username and password combination
7. Test the correct management panel for successful login

### Attack Chain

```text
Web → Hidden clue → SMB → Username → Panel → Login
```

---

## Tools Used

- `ip a`
- `nmap`
- `netdiscover`
- `curl`
- `gobuster`
- `smbclient`
- `enum4linux`
- web browser

---

## Step-by-Step Walkthrough

### 1. Identify local network information

First, I checked the attacker machine's IP address:

```bash
sudo su
ip a
```

Then I identified the network range and discovered live hosts:

```bash
nmap -sn <LOCAL_SUBNET>
```

Alternative:

```bash
netdiscover -r <LOCAL_SUBNET>
```

---

### 2. Confirm the web service

To verify whether the target web service was alive, I checked the HTTP headers:

```bash
curl -I http://<TARGET_IP>
```

This confirmed that **Apache** was running.

Then I fetched the full page content:

```bash
curl http://<TARGET_IP>
```

At first glance it looked like a default Apache page, but the page source contained a hidden HTML comment.

---

### 3. Extract the hidden clue from the HTML comment

The page contained an intentionally hidden value inside a comment.

This was important because:

- the page looked empty at first
- the real clue was in the source code
- visible content was less valuable than the hidden content

---

### 4. Decode the hidden value

The encoded text appeared to be **Brainfuck-like** and was decoded into a credential candidate.

At that stage, the value was not immediately obvious. It could have been:

- a password
- a path
- another kind of access token

Instead of jumping to conclusions, I treated it as a candidate credential and tested it in context.

---

### 5. Perform directory discovery

To check for hidden paths or entry points, I ran:

```bash
gobuster dir -u http://<TARGET_IP> -w /usr/share/seclists/Discovery/Web-Content/common.txt
gobuster dir -u http://<TARGET_IP> -w /usr/share/seclists/Discovery/Web-Content/big.txt
```

The results showed standard Apache-related files and directories, but no real entry point under the web root.

This told me that:

- the web root was not the final path in
- I needed to pivot to another exposed service

---

### 6. Test protected endpoints

I also checked endpoints such as `server-status`:

```bash
curl -I http://<TARGET_IP>/server-status
curl -H "X-Forwarded-For: 127.0.0.1" http://<TARGET_IP>/server-status
```

The attempt failed, but it still provided useful information:

- the endpoint existed
- simple spoofing was not enough to bypass access control

---

### 7. Pivot to SMB

Next, I moved to SMB enumeration:

```bash
smbclient -L //<TARGET_IP> -N
enum4linux -a <TARGET_IP>
```

This revealed two important details:

- anonymous SMB access appeared to be possible
- a valid system user existed

Now the hidden web clue and the SMB enumeration results started to connect.

---

### 8. Validate the credential

I tested the discovered username together with the decoded value:

```bash
smbclient //<TARGET_IP>/IPC$ -U <USERNAME>
```

The authentication succeeded, confirming that the decoded value was indeed a valid credential.

Even though the `IPC$` share itself did not provide useful file content, two critical facts were confirmed:

- the username was correct
- the password was correct

This was one of the most important turning points in the machine.

---

### 9. Check the management panels

Then I investigated the exposed management services:

```bash
curl -I http://<TARGET_IP>:10000
curl -I http://<TARGET_IP>:20000
```

Both appeared to be **MiniServ-based** panels, and both required HTTPS.

Correct targets:

```text
https://<TARGET_IP>:10000
https://<TARGET_IP>:20000
```

Login failed on port `10000`, but the credential worked on port `20000`.

This showed that:

- valid credentials may not work across every service
- after confirming a credential, the correct target service still needs to be identified

---

## Key Takeaways

The success of this machine did not come from a single exploit. It came from **linking information together**.

Main logic:

- the web service alone was not enough
- SMB alone was not enough
- the management panel alone was not enough
- but once the clues were combined, the correct attack chain became clear

This makes the machine especially valuable for beginners who want to practice **enumeration-driven thinking**.

---

## Lessons Learned

- Default-looking pages may still contain important clues
- Source code inspection can reveal more than visible content
- Information from one service can unlock another
- Failed attempts still reduce uncertainty
- Pentesting is not only about memorizing commands: it is about interpreting outputs correctly

---

## Repository Structure

```text
empire-breakout-vulnhub-writeup/
├── README.md
├── ../../README_TR.md
├── images/
│   ├── 01-target-overview.png
│   ├── 02-html-comment.png
│   ├── 03-smb-enum.png
│   └── 04-panel-login.png
├── notes/
│   └── sanitized-notes.txt
└── LICENSE
```

---

## Legal and Ethical Note

This repository was created **strictly for educational purposes** in the context of an intentionally vulnerable lab machine published on VulnHub.

The information here is:

- not intended for unauthorized use against real systems
- only meant for controlled lab and learning environments

Always obtain proper authorization before testing any real target.

---

## Final Thoughts

This machine was not just about reaching a panel.

It was about understanding one important idea:

> In pentesting, the real skill is not just using tools: it is understanding what each result is telling you.

