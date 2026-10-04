source : [here](https://youtu.be/IyKWSc7s760?si=iNNylxO6qR_nOdNU)

## What is File System?

Operating System stores and manage data on disk or partitions using a structure called __Filesystem__.  

__FileSystem__ includes files, directories and it's related permissions.

---
The root ```(/)``` of the filesystem is at the top of the tree, and the following are the most important subdirectories to know:  
```/root```:The home directory of all-powerful root user.  
```/etc```: Generally contains the linux configuration files---files that control when and how program start up. 
```/home```: The user's home directory.  
```/mnt```: Where other filesystems are attached or mounted to the filesystem.  
```/bin```: Where application binaries (the equivalent of executables in Microsoft Windows) reside.  
```/lib```: Where can find libraries (shared programs that are similar to Windows DLL's)  
```/boot```: Contains files needed for the system to boot, such as bootloader and kernel  
```/dev```: Contains device files that represents hardware devices on the system.  
```/opt```: Contains additional software package installed on the system.  
```/proc```: A virtual file system that provides information about running processes and system configuration.  
```/sbin```: Contains system binary file used for system administrator.  
```/sys```: A virtual file system that provides information about system hardware and configuration.  
```/tmp```: Contains temporary file created by system and user processes.  
```/usr```: Contains user binaries, libraries, documentation and other files.  
```/var```: Contains variable files, such as log files, email and temporary files used by system and user processes.

---

### Linux file system stores data in hierarchy of directories and files.

Location/path format  
- Windows  
        - ```C:\Program Files\Java```  
- Linux   
        - ```/home/centos/Desktop```  

### Types of File System
- ext3  (Third Extended File System)
- ext4  (Fourth Extended File System)
- XFS  (Extended File System)
        - [Ubuntu, Debian, Fedora, CentOS, RedHat]  
- BtrFS (B-Tree FS)  
        - [OpenSUSE and SUSE linux Enterprise Server]  
- FAT   (File Allocation Table)
- vFAT  (Virtual File Allocation Table)
- squashFS ( Squashed File System, compressed read-only file system )

__How to check Linux File System?__
- ```lsblk -f```  
- ```df -Th```  
- ```cat /etc/fstab```  

## XFS vs EXT4:
- XFS  
Optimized for large files and volumes, offering superior
performance and scalability.

- EXT4  
- Performs well across various file sizes but less efficient with extremely large files.  

For high-throughput and extensive parellel processing capabilities, XFS is typically more effecyive than ext4.  

## What is inode?  
An inode in Linux is a data structure that stores metadata about a file or directory.  
The filesystem uses the inode number to locate the inode, which then contains pointers to the data blocks here the actual file data is stored.    
example: ```ls -li```  

---

## File System in details  

The Linux filesystem starts at the root directory, denoted by a single slash ```/```, from which all other files and directories branch out.  

- ```/bin```: Contains essential user binaries (executables)/code/logic, such as common command like ```ls```, ```cp```, etc.  
- ```/etc```: This is similar like windows's C drives program file. Holds system configuration files.  

__Example:__  

- ```/etc/passwd``` Information about user account
- ```/etc/group``` Information about Group
- ```/etc fstab``` Infomation about file system mounting
- ```/etc/hostname``` Name of the System     

---
        
- ```/home```: Contains the personal directories of all users.  
- ```/root```:The home directory for the root user(administrator).  
- ```/var```: Where variable data such as logs and databases are stored.  

Example:

         /var/log Collect,s log files about system.  
         /var/spool Collect,s data about printers and mail servers.  
         /var/www Collects data about web server.  
         
- ```/tmp```:Temporary files created by system and users.  
- ```/boot```: Holds files needed for system boot-up, including the linux kernel, an initial RAM disk image, bootloader configuration (like GRUB).  
- ```/dev```: This directory contains device files which represent and provide access to hardware devices such as hard drives, sounds devices etc.  
                Example: ```df -h```

         /dev/sda -> First Hardisk
         /dev/tty -> Terminal Device
         /dev/null -> For discarding data

  
- ```/lib```, ```/lib64```: These directories contain essential shared libraries and kernel modules that are needed to boot the system and run the commands in the root filesystem. The ```/lib64``` directory exists on systems that support 64-bit applications.  
- ```/media```: This is the mount point for removal media such as USB drivers, CD-ROMs, etc. When these devices are mounted, typically, directories corresponding to their mount points are created within ```/media```.  
- ```/mnt```: Similar to ```/media```, this is a traditional mount point where system administrators can mount temporary filesystems while using or configuring them.

         mount /dev/sdb1 /mnt -> /dev/sdb1 will mounted to/mnt folder

  
- ```/opt```: Intended for the installation of add-on application software packages. Large software packages that are not part of the default installation can be placed here to avoid cluttering the system directories.  
- ```/proc```: A virtual and dynamic directory as it only exists in memory. It does not use disk space. It contains information about system resources, hardware, and running processes. It,s a pseudo-filesystem that provides an interface to kernel data structures.  

Example:
  
                        cat /proc/cpuinfo -> Information about CPU
                        cat /proc/meminfo -> Infomation about memory
                                
- ```/run```: A temporary filesystem that stores transiesnt state files, like process ID,s or lock files, since it is cleared and recreated at every boot.   
- ```/sbin```: Contains binary (executable) files that are mostly needed by the system administrator. These include system management commands like ```fdisk``` , ```shutdown``` , ```ip``` etc.  
                Example:
   
                        ls sbin/ | grep fdisk
                        ls bin/ | grep fdisk
  
- ```/srv```: Contains data which servers hosted on the system may need, such as web pages served by a web server.  
- ```/sys```: Similar to ```/proc```, this is another virtual filesystem that provides an interface to the kernal, It contains information and settings about the system's devices.  

  Example:
  
        cat /sys/class/block/sda/size
        cat /sys/class/block/sda1/size

- ```/usr```: usr full form is Unix System Resource. Considered the secondary hierarchy because it contains all user applications and a variety of other things for day-to-day operations, including libraries, documentation, and much more. Subdirectories include ```/usr/bin```, ```/usr/local``` and ```/usr/share```/ among others.

