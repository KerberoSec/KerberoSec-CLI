# Cyber Advent 2022: Day 4 [<span style="color:red;">Scanning</span>] [Scanning through the snow]

Day 4 of [tryhackme](https://tryhackme.com)'s [Advent of Cyber for 2022](https://tryhackme.com/christmas)! This challenge involves learning about various scanning techniques, particularly with network scanning tools.  

### Learning Objectives
- What is Scanning?
- Scanning types
- Scanning techniques
- Scanning tools

#### What is the name of the HTTP server running on the remote host?

To figure out the name of the HTTP server running on the remote host, we will use the nmap tool. The command that we are interested in is `nmap -sV MACHINE_IP` which will return a list of running services on a live host. See output below:

```bash
user@hostName:~$ nmap -sV MACHINE_IP
Starting Nmap 7.80 ( https://nmap.org ) at 2022-12-04 20:12 EST
Nmap scan report for MACHINE_IP
Host is up (0.099s latency).
Not shown: 996 closed ports
PORT    STATE SERVICE     VERSION
22/tcp  open  ssh         OpenSSH 7.6p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
80/tcp  open  http        Apache httpd 2.4.29 ((Ubuntu))
139/tcp open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
445/tcp open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
Service Info: Host: IP-MACHINE_IP; OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

**Answer:**
```
Apache
```

#### What is the name of the service running on port 22 on the QA server?

To determine the name of the service that we are interested in we can observe the output from the above question and we notice that the service running on port 22 is `ssh`: 

```bash
PORT    STATE SERVICE     VERSION
22/tcp  open  ssh         OpenSSH 7.6p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
```

**Answer:**
```
ssh
```

#### What flag can you find after successfully accessing the Samba service?

To retrieve the flag can be accomplshed in a variety of different ways. I attempted to access the Samba share through the terminal however I could not gain access to the folder of interest. Therefore I went through THM's AttackBox to accomplish the next 2 tasks. 

1. Open the file explorer on the AttackBox
2. Enter `smb://MACHINE_IP` in the address/path bar, next to `Location:`
3. Select Registered User
4. Enter the following credentials (we left the domain as is):
```
username: ubuntu
password: S@nta2022
```
5. Click `connect`
6. Navigate to the `admins` folder
7. Open flag.txt to retrieve the flag

*[Image: smb-login]*

**Answer:**
```
{THM_SANTA_SMB_SERVER}
```

#### What is the password for the username santahr?

From within the `admins` folder that we accessed in the above question, open the `userlist.txt` and retrieve the password from the user `santahr`.

**Answer:**
```
santa25
```

## Authors

- [Shanks](https://github.com/HunterShanks)