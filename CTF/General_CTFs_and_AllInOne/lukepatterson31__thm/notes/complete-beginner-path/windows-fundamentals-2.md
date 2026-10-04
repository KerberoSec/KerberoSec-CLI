# Windows Fundamentals part 2

### System Configuration

`msconfig` is for advanced troubleshooting, and its main purpose is to help diagnose startup 
issues. 

### Computer Management

`compmgmt.msc` has three primary sections: System tools, Storage and Services and 
Applications.

#### System tools

Task Scheduler: Create and manage common tasks to carry out automatically at specified times.

Event Viewer: View events that have occurred on the computer. These records of events can be 
seen as an audit trail that can be used to understand the activity of the computer system. 
This information is often used to diagnose problems and investigate actions executed on the 
system. 

Shared Folders: Complete list of shares and folders shared that others can connect to. Default
shares are `ADMIN$1`, `C$` and `IPC$`.

Local Users and Groups: `lusrmgr.msc` Users and Groups

Performance: `perfmon` is used to view performance data either in real-time or from a log 
file. This utility is useful for troubleshooting performance issues on a computer system, 
whether local or remote. 

Device Manager: View and configure the hardware.

##### Storage

Windows Server Backup: Backup important files, apps or entire servers to a locally attached 
device or a network share.

Disk Management: Perform various advanced storage tasks (set up a new drive, extend a 
partition, shrink a partition, assign or change a drive letter etc.)

#### Services and Applications

Routing and Remote Access: Configure the routing and remote access server

Services: View services and enable, disable and view their properties.

WMI Control: WMI Control configures and controls the Windows Management Instrumentation (WMI) 
service. The WMIC tool is deprecated in Windows 10, version 21H1. Windows PowerShell 
supersedes this tool for WMI. 

### System Information

`msinfo32` gathers information about your computer and displays a comprehensive view of your 
hardware, system components, and software environment, which you can use to diagnose computer 
issues.

Hardware Resources: Refer to official docs https://docs.microsoft.com/en-us/windows-hardware/drivers/kernel/hardware-resources#:~:text=Hardware%20resources%20are%20the%20assignable,of%20bus%2Drelative%20memory%20addresses.

Components: Specific information about the hardware devices installed on the computer.

Software Environment: Environment variables, drivers, print jobs, network connections, 
running tasks, loaded modules, services, program groups, startup programs, OLE registration, 
Windows error reporting)

### Resource Monitor

`resmon` displays per-process and aggregate CPU, memory, disk, and network usage information, 
in addition to providing details about which processes are using individual file handles and 
modules. Advanced filtering allows users to isolate the data related to one or more processes 
(either applications or services), start, stop, pause, and resume services, and close 
unresponsive applications from the user interface. It also includes a process analysis 
feature that can help identify deadlocked processes and file locking conflicts so that the 
user can attempt to resolve the conflict instead of closing an application and potentially 
losing data.

### Command Prompt

`cmd` opens the command prompt

Useful commands:

`hostname` displays name of the machine
`whoami` displays account logged in
`ipconfig` shows and configures network address settings
`netstat` displays protocol statistics and current TCP/IP network connections
`net` used to manage network resources.

### Registry Editor

`regedt32` is a central hierarchical database used to store information necessary to 
configure the system for one or more users, applications, and hardware devices.

The registry contains information that Windows continually references during operation, such 
as:

- Profiles for each user
- Applications installed on the computer and the types of documents that each can create
- Property sheet settings for folders and application icons
- What hardware exists on the system
- The ports that are being used.
