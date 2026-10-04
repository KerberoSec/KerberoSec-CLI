# Common Linux Privesc

### Understanding Privesc

Prvilege Escalation is going from a lower permission to a higher permission. It's the 
exploitation of a vulnerability, design flaw or configuration oversight in an OS or app to
gain unauthorized access to resources that are usually restricted from users.

### Direction of Privilege Escalation

Horizontal Privilege Escalation:

Taking over another user with the same privilege level as you

Vertical Privilege Escalation:

Taking over a user with a higher privilege level than you.

### Enumeration

#### What is LinEnum?

LinEnum is a bash script that performs common commands related to privilege escalation.

### Abusing SUID/GUID files

SUID:

rws-rwx-rwx

GUID:

rwx-rws-rwx

Find SUID binaries with `find / -perm -u=s -type f 2>/dev/>null`

### Exploiting Writable /etc/passwd

#### Understanding /etc/passwd format

  1  2 3 4   5     6     7
test:x:0:0:root:/root:/bin/bash

1. Username: Should be between 1 and 32 chars

2. Password: An x indicates that encrypted password is stored in /etc/shadow. You need to 
use the passwd command to compute the hash of a password typed at the CLI or to store/update 
the hash of the password in /etc/shadow file,

3. User ID (UID): Each user must be assigned a UID. UID 0 is root and UIDs 1-99 are reserved 
for predefined accounts. UID 100-999 are reserved by the system for admin and system 
accounts/groups.

4. Group IP (GID): Primary group ID stored in /etc/group

5. User ID Info: Comment field for user info e.g full name, phone number etc.

6. Home dir: Absolute path of the user's home dir. If this dir doesn't exist then user's dir 
becomes /

7. Command/shell: Absolute path of a command or shell

#### How to exploit a writable /etc/passwd

Write a new line entry according to the above formula and create a new user. You need to add
a password hash of your choice and set the UID and GID to root.

Generate a password hash:

`openssl passwd -1 -salt <SALT> <PASSWORD>`

username:passwordhash:0:0:root:/root:/bin/bash

### Escaping Vi Editor

Use `sudo -l` to list commands your user is allowed to run as a super user

Misconfigured binaries can be exploited to gain root access. Use GTFOBins to find how to 
exploit them.

https://gtfobins.github.io/

### Exploiting Crontab

View active Cronjobs with `cat /etc/crontab`

#### Format of a Cronjob

\# = ID

m = minute

h = hour

dom = day of month

mon = month

dow = day of the week

user = user the command runs as

command = what the command is

If any cronjobs are running with higher privileges than we currently have and we can edit 
them then we can replace the job with a malicious payload.

### Exploiting PATH variable

We can exploit the path by imitating executables that are called by SUID binaries. If we 
edit the PATH variable to include our malicious imitation executable it will be executed 
with elevated privileges instead of the original.

In this example the `./script` file has the SUID bit set. It calls `ls` so we can exploit it

Create malicious imitation of ls

`echo "/bin/bash" > /tmp/ls`

Add the directory to the start of the PATH variable

`export PATH=/tmp:$PATH`

Run script and execute a root shell with our imitation ls

`./script`

### Expanding Your Knowledge

Good checklists for CTF/pentesting:

- https://github.com/netbiosX/Checklists/blob/master/Linux-Privilege-Escalation.md

- https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Methodology%20and%20Resources/Linux%20-%20Privilege%20Escalation.md

- https://sushant747.gitbooks.io/total-oscp-guide/privilege_escalation_-_linux.html

- https://payatu.com/guide-linux-privilege-escalation
