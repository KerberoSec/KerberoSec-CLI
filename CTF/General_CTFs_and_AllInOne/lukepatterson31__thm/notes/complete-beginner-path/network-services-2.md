# Network Services part 2

## NFS

What is NFS?

NFS stands for "Network File System" and allows a system to share directories and files with others over a network. By using NFS, users and programs can access files on remote systems almost as if they were local files. It does this by mounting all, or a portion of a file system on a server. The portion of the file system that is mounted can be accessed by clients with whatever privileges are assigned to each file.

How does NFS work?

Computer network: Vector stencils library | Computers ...

We don't need to understand the technical exchange in too much detail to be able to exploit NFS effectively- however if this is something that interests you, I would recommend this resource: https://docs.oracle.com/cd/E19683-01/816-4882/6mb2ipq7l/index.html

First, the client will request to mount a directory from a remote host on a local directory just the same way it can mount a physical device. The mount service will then act to connect to the relevant mount daemon using RPC.

The server checks if the user has permission to mount whatever directory has been requested. It will then return a file handle which uniquely identifies each file and directory that is on the server.

If someone wants to access a file using NFS, an RPC call is placed to NFSD (the NFS daemon) on the server. This call takes parameters such as:

     The file handle
     The name of the file to be accessed
     The user's, user ID
     The user's group ID

These are used in determining access rights to the specified file. This is what controls user permissions, I.E read and write of files.

What runs NFS?

Using the NFS protocol, you can transfer files between computers running Windows and other non-Windows operating systems, such as Linux, MacOS or UNIX.

A computer running Windows Server can act as an NFS file server for other non-Windows client computers. Likewise, NFS allows a Windows-based computer running Windows Server to access files stored on a non-Windows NFS server.

More Information:

Here are some resources that explain the technical implementation, and working of, NFS in more detail than I have covered here.

https://www.datto.com/library/what-is-nfs-file-share

http://nfs.sourceforge.net/

https://wiki.archlinux.org/index.php/NFS

### Enumerating NFS

NFS-Common

It is important to have this package installed on any machine that uses NFS, either as client or server. It includes programs such as: lockd, statd, showmount, nfsstat, gssd, idmapd and mount.nfs. Primarily, we are concerned with "showmount" and "mount.nfs" as these are going to be most useful to us when it comes to extracting information from the NFS share. If you'd like more information about this package, feel free to read: https://packages.ubuntu.com/jammy/nfs-common.

Mounting NFS shares

Your client’s system needs a directory where all the content shared by the host server in the export folder can be accessed. You can create
this folder anywhere on your system. Once you've created this mount point, you can use the "mount" command to connect the NFS share to the mount point on your machine like so:

sudo mount -t nfs IP:share /tmp/mount/ -nolock

Let's break this down
	
Tag 	Function
sudo 	Run as root
mount 	Execute the mount command
-t nfs 	Type of device to mount, then specifying that it's NFS
IP:share 	The IP Address of the NFS server, and the name of the share we wish to mount
-nolock 	Specifies not to use NLM locking

1st scan on target:
```
nmap -sT -A -p- 10.10.255.89    
Starting Nmap 7.93 ( https://nmap.org ) at 2022-11-04 14:19 GMT
Nmap scan report for 10.10.255.89
Host is up (0.011s latency).
Not shown: 65528 closed tcp ports (conn-refused)
PORT      STATE SERVICE  VERSION
22/tcp    open  ssh      OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 73928e04de40fb9c90f9cf4270c845a7 (RSA)
|   256 6d63d6b80a67fd86f122302b2d271eff (ECDSA)
|_  256 bd089779630f807c7fe850dc59cf395e (ED25519)
111/tcp   open  rpcbind  2-4 (RPC #100000)
| rpcinfo: 
|   program version    port/proto  service
|   100000  2,3,4        111/tcp   rpcbind
|   100000  2,3,4        111/udp   rpcbind
|   100000  3,4          111/tcp6  rpcbind
|   100000  3,4          111/udp6  rpcbind
|   100003  3           2049/udp   nfs
|   100003  3           2049/udp6  nfs
|   100003  3,4         2049/tcp   nfs
|   100003  3,4         2049/tcp6  nfs
|   100005  1,2,3      38763/udp6  mountd
|   100005  1,2,3      41237/udp   mountd
|   100005  1,2,3      54099/tcp6  mountd
|   100005  1,2,3      60395/tcp   mountd
|   100021  1,3,4      32841/tcp6  nlockmgr
|   100021  1,3,4      34657/udp6  nlockmgr
|   100021  1,3,4      46585/tcp   nlockmgr
|   100021  1,3,4      60082/udp   nlockmgr
|   100227  3           2049/tcp   nfs_acl
|   100227  3           2049/tcp6  nfs_acl
|   100227  3           2049/udp   nfs_acl
|_  100227  3           2049/udp6  nfs_acl
2049/tcp  open  nfs_acl  3 (RPC #100227)
46585/tcp open  nlockmgr 1-4 (RPC #100021)
49193/tcp open  mountd   1-3 (RPC #100005)
50339/tcp open  mountd   1-3 (RPC #100005)
60395/tcp open  mountd   1-3 (RPC #100005)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 16.57 seconds
```

List visible shares
```
usr/sbin/showmount -e 10.10.255.89
Export list for 10.10.255.89:
/home *
```

Mount share on local machine: 
`sudo mount -t nfs 10.10.255.89:/home /tmp/mount -nolock` 

found dir `cappucino` which looks like a home dir

found .ssh dir with id_rsa key

copied key to local machine, chmod 600

logged into machine with key and username `cappucino`

### Questions

How many ports open? 7

What port contains the service we're enumerating? 2049 

Name of visible share? /home

Folder name? cappucino

Folder that could give remote sccess? .ssh

Most useful key? id_rsa 

Can we login using ssh -i <key-file> <username>@<IP>? yes

### Exploiting NFS

We're done, right?

Not quite, if you have a low privilege shell on any machine and you found that a machine has an NFS share you might be able to use that to escalate privileges, depending on how it is configured.

What is root_squash?

By default, on NFS shares- Root Squashing is enabled, and prevents anyone connecting to the NFS share from having root access to the NFS volume. Remote root users are assigned a user “nfsnobody” when connected, which has the least local privileges. Not what we want. However, if this is turned off, it can allow the creation of SUID bit files, allowing a remote user root access to the connected system.
SUID

So, what are files with the SUID bit set? Essentially, this means that the file or files can be run with the permissions of the file(s) owner/group. In this case, as the super-user. We can leverage this to get a shell with these privileges!

Method

This sounds complicated, but really- provided you're familiar with how SUID files work, it's fairly easy to understand. We're able to upload files to the NFS share, and control the permissions of these files. We can set the permissions of whatever we upload, in this case a bash shell executable. We can then log in through SSH, as we did in the previous task- and execute this executable to gain a root shell!

The Executable

Due to compatibility reasons, we'll use a standard Ubuntu Server 18.04 bash executable, the same as the server's- as we know from our nmap scan. You can download it here. If you want to download it via the command line, be careful not to download the github page instead of the raw script. You can use wget https://github.com/polo-sec/writing/raw/master/Security%20Challenge%20Walkthroughs/Networks%202/bash.

Mapped Out Pathway:

If this is still hard to follow, here's a step by step of the actions we're taking, and how they all tie together to allow us to gain a root shell:

    NFS Access ->

        Gain Low Privilege Shell ->

            Upload Bash Executable to the NFS share ->

                Set SUID Permissions Through NFS Due To Misconfigured Root Squash ->

                    Login through SSH ->

                        Execute SUID Bit Bash Executable ->

                            ROOT ACCESS

What letter do we use to set SUID with chmod? +s

What permissions does the bash executable have? -rwsr-sr-x

Can we execute bash as root(./bash -p)? yes

Flag? THM{nfs_got_pwned}

## SMTP

What is SMTP?

SMTP stands for "Simple Mail Transfer Protocol". It is utilised to handle the sending of emails. In order to support email services, a protocol pair is required, comprising of SMTP and POP/IMAP. Together they allow the user to send outgoing mail and retrieve incoming mail, respectively.

The SMTP server performs three basic functions:

     It verifies who is sending emails through the SMTP server.
     It sends the outgoing mail
     If the outgoing mail can't be delivered it sends the message back to the sender

Most people will have encountered SMTP when configuring a new email address on some third-party email clients, such as Thunderbird; as when you configure a new email client, you will need to configure the SMTP server configuration in order to send outgoing emails.

POP and IMAP

POP, or "Post Office Protocol" and IMAP, "Internet Message Access Protocol" are both email protocols who are responsible for the transfer of email between a client and a mail server. The main differences is in POP's more simplistic approach of downloading the inbox from the mail server, to the client. Where IMAP will synchronise the current inbox, with new mail on the server, downloading anything new. This means that changes to the inbox made on one computer, over IMAP, will persist if you then synchronise the inbox from another computer. The POP/IMAP server is responsible for fulfiling this process.

How does SMTP work?

Email delivery functions much the same as the physical mail delivery system. The user will supply the email (a letter) and a service (the postal delivery service), and through a series of steps- will deliver it to the recipients inbox (postbox). The role of the SMTP server in this service, is to act as the sorting office, the email (letter) is picked up and sent to this server, which then directs it to the recipient.

We can map the journey of an email from your computer to the recipient’s like this:

```
User ---> SMTP Server ---> The Wider Internet
                                    /
Recipient <--- POP/IMAP Server   <-- 
```

1. The mail user agent, which is either your email client or an external program. connects to the SMTP server of your domain, e.g. smtp.google.com. This initiates the SMTP handshake. This connection works over the SMTP port- which is usually 25. Once these connections have been made and validated, the SMTP session starts.

2. The process of sending mail can now begin. The client first submits the sender, and recipient's email address- the body of the email and any attachments, to the server.

3. The SMTP server then checks whether the domain name of the recipient and the sender is the same.

4. The SMTP server of the sender will make a connection to the recipient's SMTP server before relaying the email. If the recipient's server can't be accessed, or is not available- the Email gets put into an SMTP queue.

5. Then, the recipient's SMTP server will verify the incoming email. It does this by checking if the domain and user name have been recognised. The server will then forward the email to the POP or IMAP server, as shown in the diagram above.

6. The E-Mail will then show up in the recipient's inbox.

This is a very simplified version of the process, and there are a lot of sub-protocols, communications and details that haven't been included. If you're looking to learn more about this topic, this is a really friendly to read breakdown of the finer technical details- I actually used it to write this breakdown:

https://computer.howstuffworks.com/e-mail-messaging/email3.htm

What runs SMTP?

SMTP Server software is readily available on Windows server platforms, with many other variants of SMTP being available to run on Linux.

More Information:

Here is a resource that explain the technical implementation, and working of, SMTP in more detail than I have covered here.

https://www.afternerd.com/blog/smtp/

### Enumerating SMTP

Enumerating Server Details

Poorly configured or vulnerable mail servers can often provide an initial foothold into a network, but prior to launching an attack, we want to fingerprint the server to make our targeting as precise as possible. We're going to use the "smtp_version" module in MetaSploit to do this. As its name implies, it will scan a range of IP addresses and determine the version of any mail servers it encounters.

Enumerating Users from SMTP

The SMTP service has two internal commands that allow the enumeration of users: VRFY (confirming the names of valid users) and EXPN (which reveals the actual address of user’s aliases and lists of e-mail (mailing lists). Using these SMTP commands, we can reveal a list of valid users

We can do this manually, over a telnet connection- however Metasploit comes to the rescue again, providing a handy module appropriately called "smtp_enum" that will do the legwork for us! Using the module is a simple matter of feeding it a host or range of hosts to scan and a wordlist containing usernames to enumerate.
Requirements

As we're going to be using Metasploit for this, it's important that you have Metasploit installed. It is by default on both Kali Linux and Parrot OS; however, it's always worth doing a quick update to make sure that you're on the latest version before launching any attacks. You can do this with a simple "sudo apt update", and accompanying upgrade- if any are required.

Alternatives

It's worth noting that this enumeration technique will work for the majority of SMTP configurations; however there are other, non-metasploit tools such as smtp-user-enum that work even better for enumerating OS-level user accounts on Solaris via the SMTP service. Enumeration is performed by inspecting the responses to VRFY, EXPN, and RCPT TO commands.

This technique could be adapted in future to work against other vulnerable SMTP daemons, but this hasn’t been done as of the time of writing. It's an alternative that's worth keeping in mind if you're trying to distance yourself from using Metasploit e.g. in preparation for OSCP.

nmap scan on target:
```
# Nmap 7.93 scan initiated Tue Nov  8 09:03:34 2022 as: nmap -sT -A -p- -oN thm/notes/complete-beginner-path/smtp-scan 10.10.240.81
Nmap scan report for 10.10.240.81
Host is up (0.014s latency).
Not shown: 65533 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 62a7031339085a07801ae527ee9b225d (RSA)
|   256 89d0409215093970176ec5de5b59eecb (ECDSA)
|_  256 567cd0c4952b77dd53d6e6739924f686 (ED25519)
25/tcp open  smtp    Postfix smtpd
|_ssl-date: TLS randomness does not represent time
|_smtp-commands: polosmtp.home, PIPELINING, SIZE 10240000, VRFY, ETRN, STARTTLS, ENHANCEDSTATUSCODES, 8BITMIME, DSN, SMTPUTF8
| ssl-cert: Subject: commonName=polosmtp
| Subject Alternative Name: DNS:polosmtp
| Not valid before: 2020-04-22T18:38:06
|_Not valid after:  2030-04-20T18:38:06
Service Info: Host:  polosmtp.home; OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Tue Nov  8 09:03:46 2022 -- 1 IP address (1 host up) scanned in 11.81 seconds
```

started Metasploit and used `auxiliary/scanner/smtp/smtp_version` against the target and found the system's mail name: `polosmtp.home`
found the MTA running the SMTP server: Postfix
```
[+] 10.10.240.81:25       - 10.10.240.81:25 SMTP 220 polosmtp.home ESMTP Postfix (Ubuntu)\x0d\x0a
[*] 10.10.240.81:25       - Scanned 1 of 1 hosts (100% complete)
[*] Auxiliary module execution completed
```
with telnet:
```
telnet <TARGET-IP> <SMTP-PORT>
Trying 10.10.240.81...
Connected to 10.10.240.81.
Escape character is '^]'.
220 polosmtp.home ESMTP Postfix (Ubuntu)
```

used `auxiliary/scanner/smtp/smtp_enum` against target and found the user `administrator`
```
*] 10.10.240.81:25       - 10.10.240.81:25 Banner: 220 polosmtp.home ESMTP Postfix (Ubuntu)
[+] 10.10.240.81:25       - 10.10.240.81:25 Users found: administrator
[*] 10.10.240.81:25       - Scanned 1 of 1 hosts (100% complete)
[*] Auxiliary module execution completed
```

Questions:

What port is SMTP running on?
25

How do you start Metasploit?
`msfconsole`

What's the full name of the `smtp_version` module?
auxiliary/scanner/smtp/smtp_version

How do you list options of the selected module?
`options`

What options do we need to set?
`RHOSTS`

What is the system's name found by the exploit?
`polosmtp.home`

What Mail Transfer Agent (MTA) is running the SMTP server?
Postfix (found with `telnet <TARGET-IP> <SMTP-PORT>`)

What's the full name of the `smtp_enum` module?
auxiliary/scanner/smtp/smtp_enum

### Exploiting SMTP

ran Hydra with username found through enumeration (administrator):
```
hydra -l administrator -t 16 -P /usr/share/wordlists/rockyou.txt -vV 10.10.215.207 ssh
[22][ssh] host: 10.10.215.207   login: administrator   password: alejandro
```

Questions:

What's the password of the user we found?
alejandro

What is the content of smtp.txt?
THM{who_knew_email_servers_were_c00l?}

## MySQL

What is MySQL?

In its simplest definition, MySQL is a relational database management system (RDBMS) based on Structured Query Language (SQL). Too many acronyms? Let's break it down:

Database:

A database is simply a persistent, organised collection of structured data

RDBMS:

A software or service used to create and manage databases based on a relational model. The word "relational" just means that the data stored in the dataset is organised as tables. Every table relates in some way to each other's "primary key" or other "key" factors.

SQL:

MYSQL is just a brand name for one of the most popular RDBMS software implementations. As we know, it uses a client-server model. But how do the client and server communicate? They use a language, specifically the Structured Query Language (SQL).

Many other products, such as PostgreSQL and Microsoft SQL server, have the word SQL in them. This similarly signifies that this is a product utilising the Structured Query Language syntax.

How does MySQL work?

MySQL, as an RDBMS, is made up of the server and utility programs that help in the administration of MySQL databases.

The server handles all database instructions like creating, editing, and accessing data. It takes and manages these requests and communicates using the MySQL protocol. This whole process can be broken down into these stages:

    MySQL creates a database for storing and manipulating data, defining the relationship of each table.
    Clients make requests by making specific statements in SQL.
    The server will respond to the client with whatever information has been requested.

What runs MySQL?

MySQL can run on various platforms, whether it's Linux or windows. It is commonly used as a back end database for many prominent websites and forms an essential component of the LAMP stack, which includes: Linux, Apache, MySQL, and PHP.

More Information:

Here are some resources that explain the technical implementation, and working of, MySQL in more detail than I have covered here:

https://dev.mysql.com/doc/dev/mysql-server/latest/PAGE_SQL_EXECUTION.html 

https://www.w3schools.com/php/php_mysql_intro.asp

## Enumerating MySQL

When you would begin attacking MySQL

MySQL is likely not going to be the first point of call when getting initial information about the server. You can, as we have in previous tasks, attempt to brute-force default account passwords if you really don't have any other information; however, in most CTF scenarios, this is unlikely to be the avenue you're meant to pursue.

The Scenario

Typically, you will have gained some initial credentials from enumerating other services that you can then use to enumerate and exploit the MySQL service. As this room focuses on exploiting and enumerating the network service, for the sake of the scenario, we're going to assume that you found the credentials: "root:password" while enumerating subdomains of a web server. After trying the login against SSH unsuccessfully, you decide to try it against MySQL.

Requirements

You will want to have MySQL installed on your system to connect to the remote MySQL server. In case this isn't already installed, you can install it using sudo apt install default-mysql-client. Don't worry- this won't install the server package on your system- just the client.

Again, we're going to be using Metasploit for this; it's important that you have Metasploit installed, as it is by default on both Kali Linux and Parrot OS.

Alternatives

As with the previous task, it's worth noting that everything we will be doing using Metasploit can also be done either manually or with a set of non-Metasploit tools such as nmap's mysql-enum script: https://nmap.org/nsedoc/scripts/mysql-enum.html or https://www.exploit-db.com/exploits/23081. I recommend that after you complete this room, you go back and attempt it manually to make sure you understand the process that is being used to display the information you acquire. 

nmap port scan
```
$ nmap -sT -p- -A 10.10.42.24
Starting Nmap 7.93 ( https://nmap.org ) at 2022-11-11 15:16 GMT
Nmap scan report for 10.10.42.24
Host is up (0.018s latency).
Not shown: 65533 closed tcp ports (conn-refused)
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 0636562ff0d4a4d2ab6a433ec0f99b2d (RSA)
|   256 30bdbe28bd32dcf6ff28b2575731d9cf (ECDSA)
|_  256 f23b824a5cd21819891fcd920ac7cf65 (ED25519)
3306/tcp open  mysql   MySQL 5.7.29-0ubuntu0.18.04.1
| mysql-info: 
|   Protocol: 10
|   Version: 5.7.29-0ubuntu0.18.04.1
|   Thread ID: 14
|   Capabilities flags: 65535
|   Some Capabilities: Support41Auth, DontAllowDatabaseTableColumn, Speaks41ProtocolNew, InteractiveClient, ConnectWithDatabase, SupportsTransactions, SupportsLoadDataLocal, LongColumnFlag, SwitchToSSLAfterHandshake, SupportsCompression, FoundRows, IgnoreSpaceBeforeParenthesis, LongPassword, ODBCClient, Speaks41ProtocolOld, IgnoreSigpipes, SupportsMultipleStatments, SupportsAuthPlugins, SupportsMultipleResults
|   Status: Autocommit
|   Salt: 9|j\x0E\x7F5pz1&      =scOBq7 "
|_  Auth Plugin Name: mysql_native_password
| ssl-cert: Subject: commonName=MySQL_Server_5.7.29_Auto_Generated_Server_Certificate
| Not valid before: 2020-04-23T10:13:27
|_Not valid after:  2030-04-21T10:13:27
|_ssl-date: TLS randomness does not represent time
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 13.66 seconds
```

nmap mysql-enum script scan
```
$ nmap --script=mysql-enum 10.10.42.24
Starting Nmap 7.93 ( https://nmap.org ) at 2022-11-11 15:22 GMT
Nmap scan report for 10.10.42.24
Host is up (0.010s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT     STATE SERVICE
22/tcp   open  ssh
3306/tcp open  mysql
| mysql-enum: 
|   Valid usernames: 
|     root:<empty> - Valid credentials
|     guest:<empty> - Valid credentials
|     web:<empty> - Valid credentials
|     user:<empty> - Valid credentials
|     netadmin:<empty> - Valid credentials
|     sysadmin:<empty> - Valid credentials
|     administrator:<empty> - Valid credentials
|     webadmin:<empty> - Valid credentials
|     admin:<empty> - Valid credentials
|     test:<empty> - Valid credentials
|_  Statistics: Performed 10 guesses in 1 seconds, average tps: 10.0

Nmap done: 1 IP address (1 host up) scanned in 0.40 seconds

```

conect to mysql server with previously found credentials (root:password)
mysql -h 10.10.42.24 -u root -p

use Metasploit module `mysql_sql` setting USERNAME, PASSWORD and RHOSTS
root, password, 10.10.42.24

run exploit with default values `select version()`

run exploit with `show databases`

### Manual/non-Metasploit enumeration

mysql enumeration
```
$ nmap --script=mysql-enum 10.10.42.24
Starting Nmap 7.93 ( https://nmap.org ) at 2022-11-11 15:22 GMT
Nmap scan report for 10.10.42.24
Host is up (0.010s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT     STATE SERVICE
22/tcp   open  ssh
3306/tcp open  mysql
| mysql-enum: 
|   Valid usernames: 
|     root:<empty> - Valid credentials
|     guest:<empty> - Valid credentials
|     web:<empty> - Valid credentials
|     user:<empty> - Valid credentials
|     netadmin:<empty> - Valid credentials
|     sysadmin:<empty> - Valid credentials
|     administrator:<empty> - Valid credentials
|     webadmin:<empty> - Valid credentials
|     admin:<empty> - Valid credentials
|     test:<empty> - Valid credentials
|_  Statistics: Performed 10 guesses in 1 seconds, average tps: 10.0

Nmap done: 1 IP address (1 host up) scanned in 0.40 seconds
```
show databases
```
$ nmap --script=mysql-databases --script-args=mysqluser=root,mysqlpass=password 10.10.42.24
Starting Nmap 7.93 ( https://nmap.org ) at 2022-11-11 15:32 GMT
Nmap scan report for 10.10.42.24
Host is up (0.0096s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT     STATE SERVICE
22/tcp   open  ssh
3306/tcp open  mysql
| mysql-databases: 
|   information_schema
|   mysql
|   performance_schema
|_  sys

Nmap done: 1 IP address (1 host up) scanned in 0.38 seconds
```

Questions:

What port is MySQL running on?
3306

What options do we need to set in Metasploit for the mysql_sql module?
password/rhosts/username

What does the default command give you?
5.7.29-0ubuntu0.18.04.1

How many databases are returned with the SQL option `show databases`?
4

## Exploiting MySQL

What do we know?

Let's take a sanity check before moving on to try and exploit the database fully, and gain more sensitive information than just database names. We know:

1. MySQL server credentials 
-> root:password

2. The version of MySQL running 
-> 5.7.29-0ubuntu0.18.04.1

3. The number of Databases, and their names.
-> information_schema
-> mysql
-> performance_schema
-> sys

Key Terminology

In order to understand the exploits we're going to use next- we need to understand a few key terms.

Schema:

    In MySQL, physically, a schema is synonymous with a database. You can substitute the keyword "SCHEMA" instead of DATABASE in MySQL SQL syntax, for example using CREATE SCHEMA instead of CREATE DATABASE. It's important to understand this relationship because some other database products draw a distinction. For example, in the Oracle Database product, a schema represents only a part of a database: the tables and other objects owned by a single user. 

Hashes:

Hashes are, very simply, the product of a cryptographic algorithm to turn a variable length input into a fixed length output.

In MySQL hashes can be used in different ways, for instance to index data into a hash table. Each hash has a unique ID that serves as a pointer to the original data. This creates an index that is significantly smaller than the original data, allowing the values to be searched and accessed more efficiently

However, the data we're going to be extracting are password hashes which are simply a way of storing passwords not in plaintext format.

search for and run Metasploit module `mysql_schemadump`

search for and run Metasploit module `mysql_hashdump`

retrieve password hash for non-default user `carl`

crack hash with john the ripper

try to login via ssh with credentials 

retrieve flag from MySQL.txt

Questions:

What's the `mysql_schemadump` module's full name?
auxiliary/scanner/mysql/mysql_schemadump

What's the name of the last table dumped?
x$waits_global_by_latency

What's the `mysql_hashdump` module's full name?
auxiliary/scanner/mysql/mysql_hashdump

What non-default username stands out from the exploit results?
carl

Whats the user/hash combination?
`carl:*EA031893AA21444B170FC2162A56978B8CEECE18`

Using john the ripper against the hash, what is the password?
doggie

What's the contents of MySQL.txt?
THM{congratulations_you_got_the_mySQL_flag}

## Further learning

Reading

Here's some things that might be useful to read after completing this room, if it interests you:

     https://web.mit.edu/rhel-doc/4/RH-DOCS/rhel-sg-en-4/ch-exploits.html
     https://www.nextgov.com/cybersecurity/2019/10/nsa-warns-vulnerabilities-multiple-vpn-services/160456/
