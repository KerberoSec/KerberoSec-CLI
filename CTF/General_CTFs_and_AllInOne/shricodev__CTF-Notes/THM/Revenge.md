#RAW NOTES

# Revenge

users: Billy

nmap scan:

nmap -A -vv 10.10.71.121 -oN ~/Desktop/tryhackme/nmap                                                                                                         130 ⨯
Starting Nmap 7.91 ( [https://nmap.org](https://nmap.org/) ) at 2021-06-18 18:42 +0545
NSE: Loaded 153 scripts for scanning.
NSE: Script Pre-scanning.
NSE: Starting runlevel 1 (of 3) scan.
Initiating NSE at 18:42
Completed NSE at 18:42, 0.00s elapsed
NSE: Starting runlevel 2 (of 3) scan.
Initiating NSE at 18:42
Completed NSE at 18:42, 0.00s elapsed
NSE: Starting runlevel 3 (of 3) scan.
Initiating NSE at 18:42
Completed NSE at 18:42, 0.00s elapsed
Initiating Ping Scan at 18:42
Scanning 10.10.71.121 [2 ports]
Completed Ping Scan at 18:42, 0.20s elapsed (1 total hosts)
Initiating Parallel DNS resolution of 1 host. at 18:42
Completed Parallel DNS resolution of 1 host. at 18:42, 13.00s elapsed
Initiating Connect Scan at 18:42
Scanning 10.10.71.121 [1000 ports]
Discovered open port 22/tcp on 10.10.71.121
Discovered open port 80/tcp on 10.10.71.121
Increasing send delay for 10.10.71.121 from 0 to 5 due to 31 out of 101 dropped probes since last increase.
Completed Connect Scan at 18:43, 23.70s elapsed (1000 total ports)
Initiating Service scan at 18:43
Scanning 2 services on 10.10.71.121
Completed Service scan at 18:43, 6.44s elapsed (2 services on 1 host)
NSE: Script scanning 10.10.71.121.
NSE: Starting runlevel 1 (of 3) scan.
Initiating NSE at 18:43
Completed NSE at 18:43, 6.81s elapsed
NSE: Starting runlevel 2 (of 3) scan.
Initiating NSE at 18:43
Completed NSE at 18:43, 1.32s elapsed
NSE: Starting runlevel 3 (of 3) scan.
Initiating NSE at 18:43
Completed NSE at 18:43, 0.00s elapsed
Nmap scan report for 10.10.71.121
Host is up, received syn-ack (0.19s latency).
Scanned at 2021-06-18 18:42:29 +0545 for 51s
Not shown: 998 closed ports
Reason: 998 conn-refused
PORT   STATE SERVICE REASON  VERSION
22/tcp open  ssh     syn-ack OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 72:53:b7:7a:eb:ab:22:70:1c:f7:3c:7a:c7:76:d9:89 (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDBiHOfDlVoYCp0+/LM7BhujeUicHQ+HwAidwcp1yMZE3j6K/7RW3XsNSEyUR8RpVaXAHl7ThNfD2pmzGPBV9uOjNlgNuzhASOgQuz9G4hQyLh5u1Sv9QR8R9udClyRoqUwGBfdNKjqAK2Kw7OghAHXlwUxniYRLUeAD60oLjm4uIv+1QlA2t5/LL6utV2ePWOEHe8WehXPGrstJtJ8Jf/uM48s0jhLhMEewzSqR2w0LWAGDFzOdfnOvcyQtJ9FeswJRG7fWXXsOms0Fp4lhTL4fknL+PSdWEPagTjRfUIRxskkFsaxI//3EulETC+gSa+KilVRfiKAGTdrdz7RL5sl
|   256 43:77:00:fb:da:42:02:58:52:12:7d:cd:4e:52:4f:c3 (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBNNoSioP7IDDu4yIVfGnhLoMTyvBuzxILnRr7rKGX0YpNShJfHLjEQRIdUoYq+/7P0wBjLoXn9g7XpLLb7UMvm4=
|   256 2b:57:13:7c:c8:4f:1d:c2:68:67:28:3f:8e:39:30:ab (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEpROzuQcffRwKXCOz+JQ5p7QKnAQVEDUwwUkkblavyh
80/tcp open  http    syn-ack nginx 1.14.0 (Ubuntu)
|*http-favicon: Unknown favicon MD5: E859DC70A208F0F0242640410296E06A
| http-methods:
|*  Supported Methods: GET OPTIONS HEAD
|_http-server-header: nginx/1.14.0 (Ubuntu)
|_http-title: Home | Rubber Ducky Inc.
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

NSE: Script Post-scanning.
NSE: Starting runlevel 1 (of 3) scan.
Initiating NSE at 18:43
Completed NSE at 18:43, 0.00s elapsed
NSE: Starting runlevel 2 (of 3) scan.
Initiating NSE at 18:43
Completed NSE at 18:43, 0.00s elapsed
NSE: Starting runlevel 3 (of 3) scan.
Initiating NSE at 18:43
Completed NSE at 18:43, 0.00s elapsed
Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at [https://nmap.org/submit/](https://nmap.org/submit/) .
Nmap done: 1 IP address (1 host up) scanned in 52.11 seconds

---

**CEO
Vishas Shrinu**

### CFO

### Amanda Cummings

### Head of Sales

### Johnny Young

### VP Sales

### Karen Lee

---

dir enumeration usind 2,3-small.txt with txt and py extension

```
/products (Status: 200)
/index (Status: 200)
/contact (Status: 200)
/login (Status: 200)
/static (Status: 301)
/admin (Status: 200)
/app.py (Status: 200)
/requirements.txt (Status: 200)
```

+----+----------------------+--------------+--------------------------------------------------------------+
| id | email                | username     | _password                                                    |
+----+----------------------+--------------+--------------------------------------------------------------+
| 1  | [sadmin@duckyinc.org](mailto:sadmin@duckyinc.org)  | server-admin | $2a$08$GPh7KZcK2kNIQEm5byBj1umCQ79xP.zQe19hPoG/w2GoebUtPfT8a |
| 2  | [kmotley@duckyinc.org](mailto:kmotley@duckyinc.org) | kmotley      | $2a$12$LEENY/LWOfyxyCBUlfX8Mu8viV9mGUse97L8x.4L66e9xwzzHfsQa |
| 3  | [dhughes@duckyinc.org](mailto:dhughes@duckyinc.org) | dhughes      | $2a$12$22xS/uDxuIsPqrRcxtVmi.GR2/xh0xITGdHuubRF4Iilg5ENAFlcK |
+----+----------------------+--------------+--------------------------------------------------------------+

---

+----+---------------------------------+------------------+----------+--------------------------------------------------------------+----------------------------+
| id | email                           | company          | username | _password                                                    | credit_card                |
+----+---------------------------------+------------------+----------+--------------------------------------------------------------+----------------------------+
| 1  | [sales@fakeinc.org](mailto:sales@fakeinc.org)               | Fake Inc         | jhenry   | $2a$12$dAV7fq4KIUyUEOALi8P2dOuXRj5ptOoeRtYLHS85vd/SBDv.tYXOa | 4338736490565706           |
| 2  | [accountspayable@ecorp.org](mailto:accountspayable@ecorp.org)       | Evil Corp        | smonroe  | $2a$12$6KhFSANS9cF6riOw5C66nerchvkU9AHLVk7I8fKmBkh6P/rPGmanm | 355219744086163            |
| 3  | [accounts.payable@mcdoonalds.org](mailto:accounts.payable@mcdoonalds.org) | McDoonalds Inc   | dross    | $2a$12$9VmMpa8FufYHT1KNvjB1HuQm9LF8EX.KkDwh9VRDb5hMk3eXNRC4C | 349789518019219            |
| 4  | [sales@ABC.com](mailto:sales@ABC.com)                   | ABC Corp         | ngross   | $2a$12$LMWOgC37PCtG7BrcbZpddOGquZPyrRBo5XjQUIVVAlIKFHMysV9EO | 4499108649937274           |
| 5  | [sales@threebelow.com](mailto:sales@threebelow.com)            | Three Below      | jlawlor  | $2a$12$hEg5iGFZSsec643AOjV5zellkzprMQxgdh1grCW3SMG9qV9CKzyRu | 4563593127115348           |
| 6  | [ap@krasco.org](mailto:ap@krasco.org)                   | Krasco Org       | mandrews | $2a$12$reNFrUWe4taGXZNdHAhRme6UR2uX..t/XCR6UnzTK6sh1UhREd1rC | thm{br3ak1ng_4nd_3nt3r1ng} |
| 7  | [payable@wallyworld.com](mailto:payable@wallyworld.com)          | Wally World Corp | dgorman  | $2a$12$8IlMgC9UoN0mUmdrS3b3KO0gLexfZ1WvA86San/YRODIbC8UGinNm | 4905698211632780           |
| 8  | [payables@orlando.gov](mailto:payables@orlando.gov)            | Orlando City     | mbutts   | $2a$12$dmdKBc/0yxD9h81ziGHW4e5cYhsAiU4nCADuN0tCE8PaEv51oHWbS | 4690248976187759           |
| 9  | [sales@dollatwee.com](mailto:sales@dollatwee.com)             | Dolla Twee       | hmontana | $2a$12$q6Ba.wuGpch1SnZvEJ1JDethQaMwUyTHkR0pNtyTW6anur.3.0cem | 375019041714434            |
| 10 | sales@ofamdollar                | O!  Fam Dollar   | csmith   | $2a$12$gxC7HlIWxMKTLGexTq8cn.nNnUaYKUpI91QaqQ/E29vtwlwyvXe36 | 364774395134471            |
+----+---------------------------------+------------------+----------+--------------------------------------------------------------+----------------------------+

NOT COMPLETED☹️
