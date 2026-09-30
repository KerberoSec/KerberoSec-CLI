# TryHackMe Pre Security: Module 5: Operating Systems Basics

## Operating Systems: Introduction
Operating systems(OS) are how we, as users, are able to interact seamlessly with our hardware devices.

Without an OS, it's just not feasible to do anything on most devices. It coordinates everything, from the hardware, to the applications, to us being able to see what's going on through it's user interface.

It's the middleman between the hardware on the device and us.

### System Privilege Layers
Different parts of our computer have different levels of permission in regards to access to the device. Here are the 2 main categories:

Kernel Space: This is the core part of the OS that is locked down with unrestricted access to all the physical hardware and components. Due to this, this space has absolute top privilege and restricted access.

User Space: This is everything we see and can access on our end. Any communication between this code and the hardware is restricted. It has to go through the kernel space to do so. 

### Operating System duties 
Core responsibilities of an OS include:

* Process Management: Essentially how everything is run and processed. For example, deciding which processes get CPU time and for how long(CPU scheduling) as well as starting up, pausing, and terminating applications, etc. 
* Memory Management: Manages what's on the RAM and what's not. It also isolates applications to ensure they don't interfere with each other and cause problems
* File System Management: Manages and organize files and file paths with all the metadata, etc
* User Management: Our login to the machine, accounts, permissions, authentication, etc.
* Device Management: Manages devices connected to the computer like mouses, printers, external hard drives, etc

### Operating System Security
Each OS acts as its own security foundation before any sort of external security tool(firewall, antivirus, etc) is even introduced. 

At a basic level, the OS ensures security via elements like:

* Authentication: Logins through passwords or biometrics
* Permissions: Gives certain users access to specific files or applications
* Isolation: Isolates processes to ensure each "box" is protected properly without interference like the Kernel/User Spaces.
* System Protection: Which protects the core/crucial files from unauthorized alterations

### Interfaces

Interfaces are how we interact with the OS. There are two types in which we do so.

1) **Graphical User Interface(GUI)**: This is the neat, user-friendly visual interface in which we interact with our device. All the windows, applications, and most things we visually see when looking at our monitor is the GUI.
2) **Command Line Interface(CLI)**: These are commands we enter into the terminal. Rather than everything being programmed for us to see an interact with neatly, here we interact with the OS using the command line of our OS which gives us a lot more control and precision over the system without as much limitations.

### Operating System Landscape
Each kind of device will have different uses and applications and thus a different OS depending on the job of the device that is required.

5 main types:

**1.) Desktop**: Rich and user centered GUI made for personal computers and desktops 

- Windows, MacOS, Linux, etc.

Linux is a small core kernel software and "distributions"("distros") are the Operating Systems built on top of that kernel. Like Ubuntu, Debian, Fedora

**2.) Server**: Usually no GUI and made for maximum uptime as well as remote access. 

- Windows, Linux(Ubuntu Server, Debian, CentOS, Red Hat), Unix

**3.) Mobile**: Touchscreen, network connectivity, battery efficient, etc

- Android, IOS, etc

**4.) Embedded**: Small OS made for lightweight hardware.

- OpenWrt, Ubunutu Core, Yocto Project, etc, Real-Time OS(For apps in which guaranteed response times are required like aircraft controls or braking systems, etc)

**5.) Virtual/Cloud**: OS made for data centers or cloud services. 

- Hypervisors(For data centers & Hosting or streaming services. Ubuntu LTS, Amazon Linux, Rocky Linux). Container-optimized OS(Alpine Linux, Bottlerocket AWS, Flatcar Linux)

Each type here is optimized for the function that is required of that specific device. 

## Windows Basics
This lesson goes over all the basics of how to use the Window OS. Since these foundational lessons are already well integrated into most people's technicals baseline, I have chosen to omit notes for this lesson of the module 

However, in essence, it just went over authentication, how to navigate the OS, files, file hierarchy, menus, apps, apps updates and installation, OS updates, basic security like virus & threat protection, and window's firewall, etc.

The lab in this lesson allowed us to use a Windows VM and play with the security protection settings on that system. We ran a scan on the virus & threat protection software that comes with the OS and found a "threat", a program txt file which replicates by infecting other files.

We were also able to take a look at the firewall as well as the inbound and outband rules being used. 

## Linux CLI Basics

To reiterate, the CLI is how we navigate through and operate our device using the terminal rather than the standard GUI. 

In this context, we start off in a specific file path and can navigate the directories to browse the file paths. 

Some Linux CLI commands:

`pwd` - Tells us exactly where we are in our device

`ls` - This stands for "list" and thus "lists" the files and folders in the current directory we are in

`ls -l` - "List Long". This gives us a more in detail list of all the files within the directory we are currently in.

`ls -al` - This reveals all hidden files in the directory in detail. Hidden files are any files whose name begins with a `.`. These are usually critical system files, or caches, configuration files, logs, etc. The `-a` stands for "all" 

`cd` -> `cd <directory>` This is how we move forward through the file systems. It stands for "Change Directory" 

`cd ..` - This is how we go back to the previous file system in the hierarchy.

`find` - This command finds files within our system. The format is `find <starting_point> -name <filename>` It begins it's search from the criteria you listed as the starting point. `~` starts from the home directory. `.` searches from the current directory you are in. `/` searches from the root of your system and thus searches your entire system for it. 

`cat` - This stands for concatenate and is used to display the contents in the file for us to read

TryHackMe gave us a VM to use for the Linux CLI as practice. We were able to play around with the commands and browse through the machine using the CLI before it gave us the task of finding a specific file within the home directory.

<img width="1155" height="839" alt="Find File via Linux CLI" src="https://github.com/user-attachments/assets/a2007fc5-b839-44e7-9382-d3488b56e7af" />

After this, the lesson gave us a few more commands in regards to finding out more information about our device. It also gave us the task of finding out said information as well as another file for practice. 

`whoami` - Tells us our username 

`uname -a` - Stands for "Unix Name"  + all and gives us detailed information about our system. As an example, the output from our VM in this lesson is as follows:

`Linux tryhackme 6.14.0-1018-aws #18~24.04.1-Ubuntu SMP Mon Nov 24 19:46:27 UTC 2025 x86_64 x86_64 x86_64 GNU/Linux`

1) Kernel: `Linux`
2) Hostname: `tryhackme(The local network's name of our device)`
3) Kernel Release: `6.14.0-1018-aws`
4) Kernel Version and Built Date: `#18~24.04.1-Ubuntu SMP Mon Nov 24 19:46:27 UTC 2025`
5) The architecture of our CPU: `x86_64`
6) The OS: `GNU/Linux`

`uname` alone would give us our OS name

`df -h` - Stands for "Disk Free" + human readable(otherwise it would display the data in raw numer blocks). This gives us data on the storage space of our device. The output from our VM looks like:

```
Filesystem      Size  Used Avail Use% Mounted on

/dev/root        68G   11G   58G  16% /

tmpfs           969M     0  969M   0% /dev/shm

tmpfs           388M  1.2M  387M   1% /run

tmpfs           5.0M     0  5.0M   0% /run/lock

tmpfs           194M  188K  194M   1% /run/user/1000

tmpfs           194M  172K  194M   1% /run/user/114
```

"Mounted on" tells us exactly where that file system is located or attached to. `/` is our root directory which means that this drive is where our main hard drive is located and we can thus see the storage information on it. 

All the `tmpfs` types are on the RAM.

To get more info on our distribution if `uname` is not sufficient, we can also head to the `os-release` file within the `/etc` directory(which itself is where a bunch of configuration and information data is located). The output by using the `cat` command gets us the following:

```
PRETTY_NAME="Ubuntu 24.04.1 LTS"

NAME="Ubuntu"

VERSION_ID="24.04"

VERSION="24.04.1 LTS (Noble Numbat)"

VERSION_CODENAME=noble

ID=ubuntu

ID_LIKE=debian

HOME_URL="https://www.ubuntu.com/"

SUPPORT_URL="https://help.ubuntu.com/"

BUG_REPORT_URL="https://bugs.launchpad.net/ubuntu/"

PRIVACY_POLICY_URL="https://www.ubuntu.com/legal/terms-and-policies/privacy-policy"

UBUNTU_CODENAME=noble

LOGO=ubuntu-logo

```

## Windows CLI Basics
The Command Prompt in Windows works in the  same way as the Linux terminal. It's just that the commands are different but the premise itself is the same. 

Here are the first few commands in this lesson:

`cd` - This is similar to the `pwd` command in Linux. It shows us where we are in the system. Adding a file path/folder after it allows us to navigate through our device.

`cd <directory>` - Just like Linux, this is how we navigate through the directories. We can also type the path of a file with multiple extentions to jump straight to it rather than going through one directory at a time. 

`cd ..` - Goes back one level to the "previous" directory in the hierarchy 

`dir` - This is the Linux `ls` equivalent. It lists the contents of the directory we are currently in.

`dir /a` - This gives us all the hidden files within the directory

`dir /s <filename>` - This searches for a file in all subfolders from the directory that we are currently in

`type <filename>` - This is the `cat` of the Windows CLI. It prints the file for us to read.

Just like the Linux lab, this lesson gave us a Windows VM to play around with the command prompt. It also gave us a simple task of finding a file through the CLI, which ended up looking like this:

<img width="1169" height="801" alt="Find File via Windows CLI" src="https://github.com/user-attachments/assets/e53b2119-f1b3-4441-8f08-84ef77b52bdd" />

The next lesson also taught us more commands in regards to finding out more information about our system.

`whoami` - Tells us which user account we are currently using

`hostname` - Displays our local network's device name

`systeminfo` - This gives us very detailed information on our OS as well as system information

`ipconfig` - This gives us IP data of our network. Including the subnet mask, default gateway, our IP, etc, 

## Operating Systems Security 

Our devices are filled with private data that needs to be protected. From passwords, to bank login information, to private photos and emails, and more. If this data got into the wrong hands, they could be maliciously used and lives can be ruined. 

Operating systems use the "CIA" Triad as a guide in understanding how to secure and protect said data. 

### CIA: Confidentiality, Integrity, Availability

**Confidentiality:** This ensures that **only** the people that should have access to the data will have access to the data

**Integrity:** This ensures that no file is tampered with or changed without authorization.

**Availability:** This ensures the device/data is available for use whenever needed by the authorized user. 

### Common Exploited Weaknesses 

#### 1.) Authentication and Weak Passwords

Authentication is how we verify our identity so a device knows we have authorized access to the data within. Authentication can be achieved using 3 main confirmation methods:

1) Something you know (Like a password)
2) Something you are (Like your fingerprint)
3) Something you have (Like your phone via a code sent through text message)

Passwords are the most common form of authentication and also the most attacked. Weak passwords can thus be an easily exploitable attack vector.

So its important to ensure a password is not easily guessable. Whether it's a common phrase or sequence that's simple to type or an easily guessable piece of personal information used as a password. 

#### 2.) Weak File Permissions

Confidentiality and Integrity can be attacked here. 

It's important to ensure that ONLY the people who should have access to specific pieces of data can access that data. Permission levels that allow anyone else to access it is an inherent security compromise. 

For example, I may only want the accounting department in an organization to have access to specific financial data. So privilege needs to be set to ensure only this department can access this data. 

#### 3.) Access to Malicious Programs

More types of these malicious programs will be explored in my Sec+ study. However, these are just programs that can gain unauthorized access into a system and can potentially compromise the entire CIA triad.

#### Lab: Practice an Authentication Attack Vector using the Linux CLI

A couple more commands taught in this lesson via the lab:

`ssh <username@IP/DomainName>` - This allows you to command and control a seperate device over an encrypted connection. 

`history` - This gives us a list of the previous commands previously used on the terminal.

Also, a System's Administrator account within a system has unrestricted access to that system. In Android, Apple, and Linux, this account is called `root` while it's called `administrator` on Windows. 

This lab had us acting as security, presumably on the red team, testing the security of the organization’s system. We "found" a sticky note with the words "sammie" and "dragon" on a computer screen

Via the `ssh` command, we were able to login to sammie's account with that password. 

We also guessed the password of "Johnny" and were able to login to his account due to his weak password formulation. After doing so, we used the `history` command to see his past entries and found an odd "command" which was really his password to his root account.

Due to his error, we were able to gain access into his systems administrator account. 

This labs displays the importance of keeping passwords secure and also complexly formulated such that it's not easily guessed. Don't leave passwords out and always double check where we are typing our password into. 
