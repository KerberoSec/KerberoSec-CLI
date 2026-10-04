
#Linux #Subscribers 
https://tryhackme.com/room/linuxforensics

Linux is very common in servers that host different services for enterprises. 

In an Enterprise environment, the two most common entry points for an external attacker are either through public-facing servers or through endpoints used by individuals. Since Linux can be found in any of these two endpoints, it is useful to know how to find forensic information on a Linux machine, which is the focus of this room.

## linux forensics

The Linux Operating System can be found in a lot of places. While it might not be as easy to use as Windows or macOS, it has its own set of advantages that make its use widespread. It is found in the Web servers you interact with, in your smartphone, and maybe, even in the entertainment unit of your car. One of the reasons for this versatility is that Linux is an open-source Operating System with many different flavors. It is also very lightweight and can run on very low resources. It can be considered modular in nature and can be customized as per requirements, meaning that only those components can be installed which are required. All of these reasons make Linux an important part of our lives.

For learning more about Linux, it is highly recommended that you go through the [Linux Fundamentals 1](https://tryhackme.com/room/linuxfundamentalspart1), [Linux Fundamentals 2](https://tryhackme.com/room/linuxfundamentalspart2), and [Linux Fundamentals 3](https://tryhackme.com/room/linuxfundamentalspart3) rooms on TryHackMe.

## Linux Distributions:![](https://tryhackme-images.s3.amazonaws.com/user-uploads/61306d87a330ed00419e22e7/room-content/799fc9e8ad7deaea041e24ad0ae56a2f.png)

Linux comes in many different flavors, also called distributions. There are minor differences between these distributions. Sometimes the differences are mostly cosmetic, while sometimes the differences are a little more pronounced. Some of the common Linux distributions include:

- Ubuntu
- Redhat
- ArchLinux
- Open SUSE
- Linux Mint
- CentOS
- Debian

For the purpose of this room, we will be working on the Ubuntu distribution. So let's move on to the next task to learn to perform forensics on Linux.

## OS and account info 

For a Linux system, everything is stored in a file. Therefore, to identify forensic artifacts, we will need to know the locations of these files and how to read them. Below, we will start by identifying System information on a Linux host.

```shell
# OS release
cat /etc/os-release
# user accounts
/etc/passwd | column -t -s :
# group info
/etc/group
```

In the above command, we can see the information for the user ubuntu. The username is ubuntu, its password information field shows `x`, which signifies that the password information is stored in the `/etc/shadow` file. The uid of the user is 1000. The gid is also 1000. The description, which often contains the full name or contact information, mentions the name Ubuntu. The home directory is set to `/home/ubuntu`, and the default shell is set to `/bin/bash`. We can see similar information about other users from the file as well.

### Sudoers List

A Linux host allows only those users to elevate privileges to `sudo`, which are present in the Sudoers list. This list is stored in the file `/etc/sudoers` and can be read using the `cat` utility. You will need to elevate privileges to access this file.

```
sudo cat /etc/sudoers
```

### Login information

In the `/var/log` directory, we can find log files of all kinds including `wtmp` and `btmp`. The `btmp` file saves information about failed logins, while the `wtmp` keeps historical data of logins. These files are not regular text files that can be read using `cat`, `less` or `vim`; instead, they are binary files, which have to be read using the `last` utility. You can learn more about the `last` utility by reading its man page.

```shell
sudo last -f /var/log/wtmp
```

### Authentication logs

Every user that authenticates on a Linux host is logged in the auth log. The auth log is a file placed in the location `/var/log/auth.log`. It can be read using the `cat` utility, however, given the size of the file, we can use `tail`, `head`, `more` or `less` utilities to make it easier to read.

```shell
cat /var/log/auth.log | tail
```

```
Which two users are the members of the group `audio`? (See group information)

cat /etc/group | grep audio
ubuntu,pulse

In the attached VM, there is a user account named tryhackme. What is the uid of this account? (See the /etc/passwd file)

cat /etc/passwd | column -t -s : | grep tryhackme
1001

A session was started on this machine on Sat Apr 16 20:10. How long did this session last? (Get this info from wtmp)

sudo last -f /var/log/wtmp
1:32 
```

## system configuration 

```shell
# hostname
cat /etc/hostname
# timezone
cat /etc/timezone
# network configuration 
cat /etc/network/interfaces

ip address show | grep inet

# active network connections
netstat -natp

# running processes 
ps aux

# DNS info
cat /etc/hosts

cat /etc/resolv.conf
```

```
What is the hostname of the attached VM?

cat /etc/hostname
Linux4n6

What is the timezone of the attached VM?

cat /etc/timezone
Asia/Karachi

What program is listening on the address 127.0.0.1:5901?

netstat -natp | grep 127.0.0.1
Xtigervnc

What is the full path of this program?

ps aux | grep Xtigervnc
usr/bin/Xtigervnc

```

## persistence mechanisms 

Knowing the environment we are investigating, we can then move on to finding out what persistence mechanisms exist on the Linux host under investigation. Persistence mechanisms are ways a program can survive after a system reboot. This helps malware authors retain their access to a system even if the system is rebooted. Let's see how we can identify persistence mechanisms in a Linux host.

```
# cron jobs
cat /etc/crontab

# service startup
ls /etc/init.d

# .bashrc - bash commands storage
cat ~/.bashrc

/etc/bash.bashrc
/etc/profile

```

```
In the bashrc file, the size of the history file is defined. What is the size of the history file that is set for the user Ubuntu in the attached machine?

cat ~/.bashrc | grep -i histfile
2000

```

## evidence of execution

Knowing what programs have been executed on a host is one of the main purposes of performing forensic analysis. On a Linux host, we can find the evidence of execution from the following sources.

sudo execution history
```shell
cat /var/log/auth.log* | grep -i command | tail
```

Bash history
```shell
cat ~/.bash_history
```
Any commands other than the ones run using `sudo` are stored in the bash history. Every user's bash history is stored separately in that user's home folder. Therefore, when examining bash history, we need to get the bash_history file from each user's home directory. It is important to examine the bash history from the root user as well, to make note of all the commands run using the root user as well.

files accessed using vim

The `Vim` text editor stores logs for opened files in `Vim` in the file named `.viminfo` in the home directory. This file contains command line history, search string history, etc. for the opened files. We can use the `cat` utility to open `.viminfo`.
```shell
cat ~/.viminfo
```

```
The user tryhackme used apt-get to install a package. What was the command that was issued?

sudo apt-get install apache2

What was the current working directory when the command to install net-tools was issued?

/home/ubuntu

```

## log files 

One of the most important sources of information on the activity on a Linux host is the log files. These log files maintain a history of activity performed on the host and the amount of logging depends on the logging level defined on the system. Let's take a look at some of the important log sources. Logs are generally found in the `/var/log` directory.

### Syslog

The Syslog contains messages that are recorded by the host about system activity. The detail which is recorded in these messages is configurable through the logging level. We can use the `cat` utility to view the Syslog, which can be found in the file `/var/log/syslog`. Since the Syslog is a huge file, it is easier to use `tail`, `head`, `more` or `less` utilities to help make it more readable.

```shell
cat /var/log/syslog* | head
```

The above terminal shows the system time, system name, the process that sent the log [the process id], and the details of the log. We can see a couple of cron jobs being run here in the logs above, apart from some other activity. We can see an asterisk(`*`) after the syslog. This is to include rotated logs as well. With the passage of time, the Linux machine rotates older logs into files such as syslog.1, syslog.2 etc, so that the syslog file doesn't become too big. In order to search through all of the syslogs, we use the asterisk(`*`) wildcard.

### Auth logs

We have already discussed the auth logs in the previous tasks. The auth logs contain information about users and authentication-related logs. The below terminal shows a sample of the auth logs.

```shell
cat /var/log/auth.log* | head
```

### Third-party logs

Similar to the syslog and authentication logs, the `/var/log/` directory contains logs for third-party applications such as webserver, database, or file share server logs. We can investigate these by looking at the `/var/log/` directory.

```shell
ls /var/log
```

```
Though the machine's current hostname is the one we identified in Task 4. The machine earlier had a different hostname. What was the previous hostname of the machine?

tryhackme
```

![[Pasted image 20250317130546.png]]

