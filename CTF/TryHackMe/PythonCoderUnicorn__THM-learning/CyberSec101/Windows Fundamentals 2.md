#Windows 

https://tryhackme.com/r/room/windowsfundamentals2x0x

The **System Configuration** utility (`MSConfig`) is for advanced troubleshooting, and its main purpose is to help diagnose startup issues.

https://docs.microsoft.com/en-us/troubleshoot/windows-client/performance/system-configuration-utility-troubleshoot-configuration-errors

**Note**: You need local administrator rights to open this utility. 

The utility has five tabs across the top. Below are the names for each tab. We will briefly cover each tab in this task. 
1. General
2. Boot: boot options for the OS
3. Services: list of all services configured running/stopped (runs in background)
4. Startup: `taskmgr` to manage (enable/disable) startup items
5. Tools: various utilities 

```
What is the name of the service that lists Systems Internals as the manufacturer?

PsShutdown

What is the command for Windows Troubleshooting?

C:\Windows\System32\control.exe /name Microsoft.Troubleshooting

What command will open the Control Panel? (The answer is  the name of .exe, not the full path)

control.exe
```

change UAC
- User Account Control (keep on)
```
What is the command to open User Account Control Settings?

UserAccountControlSettings.exe
```

computer management 
**Computer Management** (`compmgmt`) utility has three primary sections: System Tools, Storage, and Services and Applications.

**System Tools**

Let's start with **Task Scheduler**. Per Microsoft, with Task Scheduler, we can create and manage common tasks that our computer will carry out automatically at the times we specify.

A task can run an application, a script, etc., and tasks can be configured to run at any point. A task can run at log in or at log off. Tasks can also be configured to run on a specific schedule, for example, every five mins.

**Event Viewer**.

Event Viewer allows us to view events that have occurred on the computer. These records of events can be seen as an audit trail that can be used to understand the activity of the computer system. This information is often used to diagnose problems and investigate actions executed on the system.

Event Viewer has three panes.
1. The pane on the left provides a hierarchical tree listing of the event log providers. (as shown in the image above)
2. The pane in the middle will display a general overview and summary of the events specific to a selected provider.
3. The pane on the right is the actions pane.

5 event types in event logging
- error
- warning
- information
- success audit
- failure audit

event logs 
- application log
- security log
- system log
- customlog

https://tryhackme.com/r/room/windowseventlogs

**Shared Folders** 

where you will see a complete list of shares and folders shared that others can connect to.
under Shares, are the default share of Windows, `C$`, and default remote administration shares created by Windows, such as `ADMIN$`.

**Sessions**, you will see a list of users who are currently connected to the shares.

**Performance**, you'll see a utility called **Performance Monitor** (`perfmon`)

**Device Manager** allows us to view and configure the hardware, such as disabling any hardware attached to the computer.

Under Storage is **Windows Server Backup** and **Disk Management**.

Disk Management is a system utility in Windows that enables you to perform advanced storage tasks.  Some tasks are:

- Set up a new drive
- Extend a partition
- Shrink a partition
- Assign or change a drive letter (ex. E:)

**Windows Management Instrumentation** (WMI) service.
Windows Management Instrumentation (WMI) is the infrastructure for management data and operations on Windows-based operating systems

```
What is the command to open Computer Management?
compmgmt.msc

```

Tools that are available through the System Configuration panel.  

What is the **System Information** (`msinfo32`) tool?
_Windows includes a tool called Microsoft System Information (Msinfo32.exe)_ 

 information in **System Summary** is divided into three sections:
- **Hardware Resources**
- **Components**: various drivers ports USB etc
- **Software Environment**: system drivers, network connections

get to environmental variables
```
Control Panel > System and Security > System > Advanced system settings > Environment Variables

Settings > System > About > system info > Advanced system settings > Environment Variables
```

```
system summary
L components
  L Network
    L Adapter
        IP address       Not Available

What is the command to open System Information?

msinfo32.exe

Under Environment Variables, what is the value for ComSpec?

%SystemRoot%\system32\cmd.exe
```

 Tools that are available through the System Configuration panel.

Resource Monitor `resmon` 
_Resource Monitor displays per-process and aggregate CPU, memory, disk, and network usage information, in addition to providing details about which processes are using individual file handles and modules._ 

 Resmon has four sections:
- **CPU**
- **Disk**
- **Network**
- **Memory**

## cmd 

- A-Z of Windows CMD commands  https://ss64.com/nt/
- 
```
hostname
whoami
ipconfig

# help  /? 
ipconfig /?

cls     clear screen

netstat   display the TCP/IP network connections

In System Configuration, what is the full command for Internet Protocol Configuration?

C:\Windows\System32\cmd.exe /k %windir%\system32\ipconfig.exe

For the ipconfig command, how do you show detailed information?

ipconfig/all
```

**Windows Registry** (per Microsoft) is a central hierarchical database used to store information necessary to configure the system for one or more users, applications, and hardware devices.

The registry contains information that Windows continually references during operation, such as:

- Profiles for each user
- Applications installed on the computer and the types of documents that each can create
- Property sheet settings for folders and application icons
- What hardware exists on the system
- The ports that are being used.

**Warning**: The registry is for advanced computer users. Making changes to the registry can affect normal computer operations.
https://docs.microsoft.com/en-us/troubleshoot/windows-server/performance/windows-registry-advanced-users

```
What is the command to open the Registry Editor?

regedt32.exe
```

