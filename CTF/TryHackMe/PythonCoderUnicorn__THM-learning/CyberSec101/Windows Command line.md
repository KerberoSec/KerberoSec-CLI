#Windows 

https://tryhackme.com/r/room/windowscommandline

https://tryhackme.com/r/module/windows-and-active-directory-fundamentals

The purpose of this room is to teach you how to use MS Windows Command Prompt `cmd.exe`, the default command-line interpreter in the Windows environment. We will learn how to use the command line to:

- Display basic system information
- Check and troubleshoot network configuration
- Manage files and folders
- Check running processes

start Attackbox
```
ssh user@10.10.175.67        
user : Tryhackme123!

set          shows where commands will execute
			
			PUBLIC=C:\Users\Public
			SHELL=c:\windows\system32\cmd.exe
			SSH_CLIENT=10.10.220.144 57668 22
			SSH_CONNECTION=10.10.220.144 57668 10.10.132.19 22
			SSH_TTY=windows-pty

ver          determine the OS version
             Microsoft Windows [Version 10.0.20348.2655]

systeminfo   lists OS info

Microsoft Windows [Version 10.0.20348.2655]

Host Name:                 WINSRV2022-CORE
OS Name:                   Microsoft Windows Server 2022 Datacenter
OS Version:                10.0.20348 N/A Build 20348
OS Manufacturer:           Microsoft Corporation
OS Configuration:          Standalone Server
OS Build Type:             Multiprocessor Free
Registered Owner:          Windows User
Registered Organization:
Product ID:                00454-60000-00001-AA763
Original Install Date:     4/23/2024, 7:36:29 PM
System Boot Time:          1/3/2025, 9:29:43 PM
System Manufacturer:       Amazon EC2
System Model:              t3a.micro
System Type:               x64-based PC
Processor(s):              1 Processor(s) Installed.
BIOS Version:              Amazon EC2 1.0, 10/16/2017
Windows Directory:         C:\Windows
System Directory:          C:\Windows\system32

What is the OS version of the Windows VM?
10.0.20348.2655

What is the hostname of the Windows VM?
WINSRV2022-CORE
```

## network troubleshooting

```
ipconfig

   Connection-specific DNS Suffix  . : eu-west-1.compute.internal
   Link-local IPv6 Address . . . . . : fe80::9bd3:9fbf:6095:bbe0%5
   IPv4 Address. . . . . . . . . . . : 10.10.132.19
   Subnet Mask . . . . . . . . . . . : 255.255.0.0
   Default Gateway . . . . . . . . . : 10.10.0.1

ipconfig /all

ping example.com
tracert example.com
nslookup example.com 

netstat     display current network connections & ports 
-a  all established connections
-b  program associated with each listening port

netstat -abon

  TCP    [::]:22   [::]:0     LISTENING       1576   [sshd.exe]
  TCP    [::]:135  [::]:0     LISTENING       900    RpcEptMapper[svchost.exe]
  TCP    [::]:445  [::]:0     LISTENING       4      no information

```

## file & disk management

```
cd       shows pwd
dir 
dir /a   shows hidden files
dir /s   show pwd files and subdirectories
tree

mkdir newFolder;
rmdir newFolder;

type fileName

copy text1.txt text2.txt
copy *.md C:\Markdown\

move text2.txt 

del | erase text2.txt

cd c:\Treasure\Hunt
type flag.txt
	THM{CLI_POWER}
```

## tasks and process management 

```
tasklist          shows all services running 

tasklist /FI "imagename eq sshd.exe"      FI=file name equals

taskkill /PID target_pid
taskkill /PID 4567

tasklist /FI "imagename eq notepad.exe"
```

```
chkdsk      checks file system and volumes for errors
driverquery    installed device drivers
sfc /scannow   scans system files for corruption & repairs them 

/?  help

shutdown /? | more
shutdown /r  shuts down & restarts

```

