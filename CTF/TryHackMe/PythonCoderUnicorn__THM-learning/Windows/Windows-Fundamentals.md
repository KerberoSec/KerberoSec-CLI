
use Remmina to connect remotely to computers

start the OVPN connection in Linux terminal

```
Start Machine

Start the OVPN in terminal

Open Remmina > + 

Machine IP :
Username: 
Password : 
Color depth: RemoteFX (32 bpp)

```

## File System 

Windows uses _New Technology File System_ (NFTS) (journaling file system)
- used to be FAT32 _File Allocation Table_ , still used in USB, MicroSD cards
- or used to be HPFS _High Performance File System_
- file attribute ADS _Alternate Data Streams_, every file has 1 or more data streams `$DATA` , can view in Powershell (malware hides in ADS)
- https://www.malwarebytes.com/blog/news/2015/07/introduction-to-alternate-data-streams
- 

```
File Explorer > This PC > Devices & Drives > right click > properties
File System: NTFS

File or Folder permissions:
right click > properties > security > select users
```

## Alternate Data Streams (ADS)

a file attribute only found in NTFS file system (composed of many attributes)
- one  attribute `$DATA` 
- another attribute is unnamed `""` data stream
- can be used to write hidden data 

## System32 Folders

`C:\Windows` folder that has the OS, 
```
This PC
 3D Objects
 Desktop
 Documents
 Downloads
 Music
 Pictures
 Videos
 Local Disk (C:)

This PC > Local Disk (C:) > Windows 
system environment variables %windir%

This PC > Local Disk (C:) > Windows > System32
system32 hold important file for the OS {caution!}

```

## User Accounts

- Administrator (add/ del users / modify groups/settings etc)
- Standard User (change file/ folders, no install programs)

determine which user accounts exits on the system
- Start Menu > Other Users 
- Local User and Group Management : Start Menu > `lusrmgr.msc`

## User Account Control  (AUC)

regular user doesn't need elevated privileges and any malware will run as user logged in

when user logs in as Admin, the *session does not run with elevated permissions*.

right click on app > Properties > Security tab = shows permissions

log in as regular user, look at `lusrmgr.msc` > `tryhackmebilly` > right click > properties
- ` TRY HACK ME : window$Fun1! `

## Task Manager

The Task Manager provides information about the applications and processes currently running on the system. Other information is also available, such as how much CPU and RAM are being utilized, which falls under **Performance**.

right click taskbar > Task Manager > more details 

---

Start Menu > system configuration
- general = select what devices & services to boot up: normal/ diagnostic/ selective
- boot = various boot options for OS
- services = app that runs in the background
- tools = config tools that run on system

System Configuration > Tools tab
```
Tool Name          Description
About Windows      Display WIndows version information
...

Selected command:
C:\Windows\system32\winver.exe

```

## Computer Management

Start Menu > Computer Management `compmgmt`

- system tools > Task Scheduler > create a common task (computer will automatically run)
```
System Tools
 Task Scheduler
 Event Viewer
 Shared Folders
 Local Users & Groups
 Performance
 Device Manager

Events:
- error
- warning
- info
- success audit
- failure audit

Logs:
- application
- security
- system
- CustomLog

https://tryhackme.com/room/windowseventlogs

```

- system tools > Shared Folders > Shares , Sessions, Open Files
```
Shared Folders > Shares

 Share Name    Folder Path     Type     Client Connections    Description
 ADMIN$        C:\Windows      Windows  0                     Remote Admin
 C$            C:\             Windows  0                     Default share
 IPC$                          Windows  0                     Remote IPC
 sh4r3dF0Ld3r  C:\Users\Admin  WIndows  0 

System Tools > Performance
 Monitoring Tools
	 Performance Monitor
 Data Collection Sets
 Reports

```

- **Device Manager** allows us to view and configure the hardware, such as disabling any hardware attached to the computer.
- Storage
```
Computer Management > Storage

Storage
 Windows Server Backup
	Local Backup
 Disk Management

Disk Management
- Set up a new drive
- Extend a partition
- Shrink a partition
- Assign or change a drive letter (ex. E:)

```

- Services and Applications 
```
Computer Management > Services & Apps
 Routing and Remote Access
 Services
 WMI Control  
 
Windows Management Instrumentation service= Powershell scripts to manage Windows locally & remotely, command line (WMIC) {deprectated}
```

## System Info

Start Menu > System Information
```
System Summary
 Hardware Resources
 Components
 Software Environment
	 System Drivers
	 Environment variables
	 Print Jobs
	 Network Connections
	 Running Tasks
	 Loaded Modules
	 Services
	 Program Groups
	 startup Programs
	 OLE Registration
	 Windows Error Reporting

- - - - - 
Software Enviro > Enviro variables

- Control Panel > System and Security > System > Advanced system settings > Environment Variables
- Settings > System > About > system info > Advanced system settings > Environment Variables
- - - - - 

System Info > Components > Network > Adapter 

```

## Resource Monitor

Start Menu > resource monitor

`resmon.exe`

## Command prompt

Start Menu > command prompt

```
hostname

whoami

ipconfig

help manual 
<command> /?

clear screen 
cls

display protocol stats TCP/IP network connections
netstat

LIST OF ALL WINDOWS CMD 
https://ss64.com/nt/

```

## Registry Editor

Windows registry is hierarchical database used to store info necessary to config the system for users, apps and hardware devices

- Profiles for each user
- Applications installed on the computer and the types of documents that each can create
- Property sheet settings for folders and application icons
- What hardware exists on the system
- The ports that are being used.

**Warning**: The registry is for advanced computer users. Making changes to the registry can affect normal computer operations.

- https://learn.microsoft.com/en-us/troubleshoot/windows-server/performance/windows-registry-advanced-users

---

## Window Updates

Windows Update is a service provided by Microsoft to provide security updates, feature enhancements, and patches for the Windows operating system and other Microsoft products, such as Microsoft Defender. 

Updates are typically released on the 2nd Tuesday of each month. This day is called **Patch Tuesday**. That doesn't necessarily mean that a critical update/patch has to wait for the next Patch Tuesday to be released. If the update is urgent, then Microsoft will push the update via the Windows Update service to the Windows devices.

`CMD: control /name Microsoft.WindowsUpdate`

## Windows Security

Current threats **Scan options**

- **Quick scan**: Checks folders in your system where threats are commonly found.
- **Full scan**: Checks all files and running programs on your hard disk. This scan could take longer than one hour.
- **Custom scan**: Choose which files and locations you want to check.

**Virus & Threat protection Manage settings** 

- **Real-time protection**: Locates and stops malware from installing or running on your device.
- **Cloud-delivered protection**: Provides increased and faster protection with access to the latest protection data in the cloud.
- **Automatic sample submission**: Send sample files to Microsoft to help protect you and others from potential threats. 
- **Controlled folder access**: Protect files, folders, and memory areas on your device from unauthorized changes by unfriendly applications.
- **Exclusions**: Windows Defender Antivirus won't scan items that you've excluded.
- **Notifications**: Windows Defender Antivirus will send notifications with critical information about the health and security of your d

scan any file or folder > right click > Scan with microsoft defender

FIREWALL
- **Domain**: _The domain profile applies to networks where the host system can authenticate to a domain controller._ 
- **Private**: _The private profile is a user-assigned profile and is used to designate private or home networks._
- **Public**: _The default profile is the public profile, used to designate public networks such as Wi-Fi hotspots at coffee shops, airports, and other locations._

leave Firewall enabled
`WF.msc`

App & Browser control
- **Windows Defender SmartScreen** helps protect your device by checking for unrecognized apps and files from the web
- Exploit protection is built into Windows 10 (and, in our case, Windows Server 2019) to help protect your device against attacks.

Core isolation
- **Memory Integrity**: Prevents attacks from inserting malicious code into high-security processes. (leave on default settings)

TPM = trusted platform module, security chip, secure crypto-processor 

BITLOCKER
- "_BitLocker Drive Encryption is a data protection feature that integrates with the operating system and addresses the threats of data theft or exposure from lost, stolen, or inappropriately decommissioned computers_".
- "_BitLocker provides the most protection when used with a Trusted Platform Module (TPM) version 1.2 or later. The TPM is a hardware component installed in many newer computers by the computer manufacturers. It works with BitLocker to help protect user data and to ensure that a computer has not been tampered with while the system was offline_".

## Volume shadow copy

Volume Shadow Copy Service (VSS) coordinates the required actions to create a consistent shadow copy (also known as a snapshot or a point-in-time copy) of the data that is to be backed up.

If VSS is enabled (**System Protection** turned on), you can perform the following tasks from within **advanced system settings**. 

- **Create a restore point**
- **Perform system restore**
- **Configure restore settings**
- **Delete restore points**

security perspective, malware writers know of this Windows feature and write code in their malware to look for these files and delete them.

