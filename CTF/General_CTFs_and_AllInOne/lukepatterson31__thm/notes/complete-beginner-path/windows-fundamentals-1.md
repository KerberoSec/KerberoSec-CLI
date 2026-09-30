# Windows Fundamentals part 1

### The File System

Modern versions use NTFS (New Technology File System). Before NTFS there was FAT16/FAT32 
(File Allocation Table) and HPFS (High Performance File System). FAT partitions are 
typically seen in USB devices, MicroSD cards etc.

NTFS is known as a journaling file system. In case of failure, the file system can 
automatically repair the files/folders on disk using information stored in a log file.
This function is not possible with FAT.

NTFS addresses the following limitations of the previous file systems:
- Supports files larger than 4GB
- Set specific permissions on files and folders
- File and Folder compression
- Encryption (Encryption File System or EFS)

Specific permissions for files and folders:

- Full control:
	Files: Permits reading, writing, changing and deletion of the file
	Folders: Permits reading, writing, changing and delteing of files and subfolders

- Modify:
	Files: Permits reading and writing of the file; allows deletion of the file
	Folders: Permits reading and writing of files and subfolders; allows deletion of the 
			folder

- Read & Execute:
	Files: Permits viewing and acessing of the files contents as well as executing the file
	Folders: Permits viewing and listing of files and subfolders as well as executing files;
			inherited by files and folders

- List folder contents: 
	Files: N/A
	Folders: Permits viewing and listing of files and subfolders as well as executing files;
			inherited by folders only

- Read:
	Files: Permits viewing or accessing of the file's contents
	Folders: Permits viewing and listing of files and subfolders

- Write:
	Files: Permits writing to a file
	Folders: Permits adding of files and subfolders

To view permissions or a file or folder:
	Right-click the file or folder, select Properties, click on the Security tab, in the 
	Group or user names list select the user, computer or group to view permissions

For Special Permissions refer to the Microsoft documentation (Windows server 2008 only?) 
https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-r2-and-2008/cc732880(v=ws.11)

### The Windows\System32 Folders

The environment variable for the Windows directory is `%windir%`

System32 holds the important files that are critical for the operating system.

Many tools covered in the Windows Fundamentals reside in the System32 folder.

### User Accounts, Profiles and Permissions

User accounts can be one of two types on a typical local Windows system: 
Administrator & Standard User. 

The user account type will determine what actions the user can perform on that specific 
Windows system. 

- An Administrator can make changes to the system: add users, delete users, modify groups, 
modify settings on the system, etc. 

- A Standard User can only make changes to folders/files attributed to the user & can't 
perform system-level changes, such as install programs.

We can run `lusrmgr.msc` to see the User's and Groups on the machine

### Task Manager

The Task Manager provides information about the applications and processes currently running 
on the system. Other information is also available, such as how much CPU and RAM are being 
utilized, which falls under Performance.

Shortcut: ctrl + shift + esc

In-depth blog post about task manager:
https://www.howtogeek.com/405806/windows-task-manager-the-complete-guide/

