## Explosion HackTheBox
#### About this room
Cool room about explosive contents.
*JK*, This room is about RDP. Remote Desktop Protocol. which is like SSH with GUI. Really cool and handy when you use mouse more than keyboard.

**Stuffs Needed:**
- Nmap
- Remmina

___

#### Step `0ne`: Network Scan
Ahh yes, the good old nmap again. Let's see what's inside.
Nmap command:
```bash
nmap -v -A -sV --privileged -T4 10.129.1.13 -p- -O -sC -Pn
```
We got tons of ports open here.
|PORT|STATE|SERVICE|VERSION|
|---|---|---|---|
|135/tcp|open|msrpc|Microsoft Windows RPC|
|139/tcp|open|netbios-ssn|Microsoft Windows netbios-ssn|
|445/tcp|open|microsoft-ds?|X|
|3389/tcp|open|ms-wbt-server|Microsoft Terminal Services|
|5985/tcp|open|http|Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)|
|47001/tcp|open|http|Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)|

Other ports are just not so interesting to me.

***For Port 3389***
```terminal
3389/tcp  open  ms-wbt-server Microsoft Terminal Services
| ssl-cert: Subject: commonName=Explosion
| Issuer: commonName=Explosion
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2024-07-01T06:32:16
| Not valid after:  2024-12-31T06:32:16
| MD5:   7f8b:045c:8958:3b23:9f09:d5ac:481e:efce
|_SHA-1: 9c56:2dc9:c36f:6132:42be:b145:c7b6:9f86:7928:b828
| rdp-ntlm-info: 
|   Target_Name: EXPLOSION
|   NetBIOS_Domain_Name: EXPLOSION
|   NetBIOS_Computer_Name: EXPLOSION
|   DNS_Domain_Name: Explosion
|   DNS_Computer_Name: Explosion
|   Product_Version: 10.0.17763
|_  System_Time: 2024-07-02T07:01:24+00:00
|_ssl-date: 2024-07-02T07:01:33+00:00; -1s from scanner time.
```

As you can see there is an RDP open here. So I tried to find something more in it using nmap:
```bash
# namp command
nmap -p 3389 --script rdp-enum-encryption <ip> -v

# result
PORT     STATE SERVICE
3389/tcp open  ms-wbt-server
| rdp-enum-encryption: 
|   Security layer
|     CredSSP (NLA): SUCCESS
|     CredSSP with Early User Auth: SUCCESS
|_    RDSTLS: SUCCESS

```
Let's get into it.

___
#### Step `Tw0`: Lemmi in
As we now know what to do, we will do what we need to do. The best way to get into a **RDP** is to use some RDP tool. In this case I've use ***Remmina**.

Free tool on kali linux just you gotta install it with:
`sudo apt install remmina -y`

then type `remmina` on your terminal and it will open a window for you. Put your IP and press **Enter**.

You will be asked for credentials. But wait a moment!

we don't have any.

so just like others, I've tried default ones. First I tried `admin:admin`. But no luck. Then I remebered, this is a ***Windows*** machine and almost every windows has a default user called `administrator`. So I tried it without any pass and **ta-da**. I'M IN.

So that's all. hope y'all got into the machine and get your flag.
