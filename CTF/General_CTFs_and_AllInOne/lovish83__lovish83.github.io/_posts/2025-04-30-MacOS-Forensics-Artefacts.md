---
title: 'TryHackMe: MacOS Forensics Artefacts'
author: Hui_0_07
categories: [TryHackMe]
tags: [Red Teaming, Cyber Forensics, macOS Forensics, Digital Forensics, Python, Command Line, Disk Image Analysis, apfs-fuse, plistutil, DB Browser]
render_with_liquid: false
media_subpath: /images/MacOS_Forensics_Artefacts/
image:
  path: intro.webp
---

In this walkthrough, we'll focus on forensic artefacts in macOS, their locations, and how they aid in investigations.

#### Learning Objectives  
- Identify forensic artefacts in macOS.  
- Locate these artefacts.  
- Understand their role in investigations.

#### Prerequisites  
Complete [macOS Forensics: The Basics](https://tryhackme.com/room/macosforensicsbasics) and have a basic knowledge of Linux/Unix command line. This room involves working with live systems and macOS disk images in a Linux environment.

>**All answers have been provided along with the `commands` needed to obtain the answers.**
{: .prompt-info}

*[Image: Tryhackme Room Link]*{: width="600" height="150" .shadow }
_<https://tryhackme.com/room/macosforensicsartefacts>_

## Task 1: Introduction

### ✅ Answer 1  
**Q: What command can be used to mount the image named mac-disk.img to the directory ~/mac in the attached VM, making sure the Data volume is mounted?**  
**Ans: `apfs-fuse -v 4 mac-disk.img ~/mac`**  
> The answer to this question can be easily found in [macOS Forensics: The Basics](https://tryhackme.com/room/macosforensicsbasics)
{: .prompt-tip}

## Task 2: Before We Begin

### ✅ Answer 1  
**Q: In the attached VM, which utility can we use to parse plist files?**  
**Ans: `plistutil`**

## Task 3: System Information

### ✅ Answer 1  
**Q: When was the OS installed on the disk image present in the attached VM?**  
**Ans: `2024-12-08 17:42:28`**  
```
$ stat ./private/var/db/.AppleSetupDone
```

### ✅ Answer 2  
**Q: What is the country code for this machine?**  
**Ans: `AE`**  
```
$ plistutil -p ./Library/Preferences/.GlobalPreferences.plist
```

### ✅ Answer 3  
**Q: When was the last time this machine booted up?**  
**Ans: `2025-01-19 15:47:05`**  
```
$ grep BOOT_TIME ./private/var/log/system.log
``` 
> convert the Unix epoch time using `date -d @1737301625`.

## Task 4: Network Information

### ✅ Answer 1  
**Q: What is the name of the machine's built-in network interface?**  
**Ans: `en0`**  
```
$ cat Library/Preferences/SystemConfiguration/NetworkInterfaces.plist
```

### ✅ Answer 2  
**Q: What is the IP address of the router this machine was last connected to?**  
**Ans: `192.168.64.1`**  
```
$ cat private/var/db/dhcpclient/leases/en0.plist
```

## Task 5: Account Activity

### ✅ Answer 1  
**Q: What is the name of the last logged in user?**  
**Ans: `thm`**  
```
$ plistutil -p  Library/Preferences/com.apple.loginwindow.plist
```

### ✅ Answer 2  
**Q: What is the password hint for the user?**  
**Ans: `count to 5`**  
```
$ plistutil -p private/var/db/dslocal/nodes/Default/users/thm.plist
```

### ✅ Answer 3  
**Q: When was the last time a user logged out of the machine?**  
**Ans: `Jan 19 07:52:43`**  
```
$ grep DEAD_PROCESS private/var/log/system.log
```

## Task 6: Evidence of Execution

### ✅ Answer 1  
**Q: What was the last command executed by the user on the machine?**  
**Ans: `vim creds.txt`**  
```
$ cat Users/thm/.zsh_history
```

### ✅ Answer 2  
**Q: What is the GUID of the terminal session in which this command was executed?**  
**Ans: `452AEA93-AEE7-420B-871E-C57053E15DD0`**  
```
$ cat Users/thm/.zsh_sessions/*.history
```

### ✅ Answer 3  
**Q: When was the last time the user closed the terminal?**  
**Ans: `2025-01-19 15:52:33`**  

### ✅ Answer 4  
**Q: For how many seconds was the terminal in focus during this session?**  
**Ans: `176`**  
> For both answers (Answer 3 and Answer 4), execute the query in **DB Browser** after opening the `KnowledgeC.db` file located at `/Users/<user>/Library/Application\ Support/Knowledge/knowledgeC.db`.
{: .prompt-tip}

```sql
SELECT
      DATETIME(ZOBJECT.ZSTARTDATE+978307200,'UNIXEPOCH') AS "START", 
      DATETIME(ZOBJECT.ZENDDATE+978307200,'UNIXEPOCH') AS "END",
      ZOBJECT.ZVALUESTRING AS "BUNDLE ID", 
      (ZOBJECT.ZENDDATE - ZOBJECT.ZSTARTDATE) AS "USAGE IN SECONDS",
      (ZOBJECT.ZENDDATE - ZOBJECT.ZSTARTDATE)/60.00 AS "USAGE IN MINUTES",  
      ZSOURCE.ZDEVICEID AS "DEVICE ID (HARDWARE UUID)", 
     ZCUSTOMMETADATA.ZNAME AS "NAME",
     ZCUSTOMMETADATA.ZDOUBLEVALUE AS "VALUE",
      CASE ZOBJECT.ZSTARTDAYOFWEEK 
         WHEN "1" THEN "Sunday"
         WHEN "2" THEN "Monday"
         WHEN "3" THEN "Tuesday"
         WHEN "4" THEN "Wednesday"
         WHEN "5" THEN "Thursday"
         WHEN "6" THEN "Friday"
         WHEN "7" THEN "Saturday"
      END "DAY OF WEEK",
      ZOBJECT.ZSECONDSFROMGMT/3600 AS "GMT OFFSET",
      DATETIME(ZOBJECT.ZCREATIONDATE+978307200,'UNIXEPOCH') AS "ENTRY CREATION", 
      ZOBJECT.ZUUID AS "UUID",
      ZSTRUCTUREDMETADATA.ZMETADATAHASH,
      ZOBJECT.Z_PK AS "ZOBJECT TABLE ID" 
   FROM ZOBJECT
         LEFT JOIN
         ZSTRUCTUREDMETADATA 
         ON ZOBJECT.ZSTRUCTUREDMETADATA = ZSTRUCTUREDMETADATA.Z_PK 
      LEFT JOIN
         ZSOURCE 
         ON ZOBJECT.ZSOURCE = ZSOURCE.Z_PK 
       LEFT JOIN Z_4EVENT
      ON ZOBJECT.Z_PK = Z_4EVENT.Z_11EVENT
    LEFT JOIN ZCUSTOMMETADATA
      ON Z_4EVENT.Z_4CUSTOMMETADATA = ZCUSTOMMETADATA.Z_PK
   WHERE
      ZSTREAMNAME = "/app/usage" 
```

## Task 7: File System Activity

### ✅ Answer 1  
**Q: What are the viewing options for the Users/thm folder?**  
**Ans: `Open in list view`**  
```
$ python3 parse.py ../../ubuntu/mac/ root/Users/.DS_Store
```

### ✅ Answer 2  
**Q: What is the last directory visited by the user using the Finder application?**  
**Ans: `Recents`**  
```
$ plistutil -p Users/thm/Library/Preferences/com.apple.finder.plist
```

## Task 8: Connected Devices

### ✅ Answer 1  
**Q: Which stream in the KnowledgeC database contains information about connected Bluetooth devices?**  
**Ans: `Bluetooth/isConnected`**  
> This information can be readily obtained by reviewing the details provided in the task itself.
{: .prompt-tip}

## Task 9: Conclusion

Forensics on macOS devices has been explored in depth, covering various forensic artefacts like system data, network activity, user actions, and device connections. This knowledge enhances the ability to perform thorough investigations on macOS systems.

### ✅ Answer 1  
**Q: Yoohoo! I loved exploring macOS Forensics!**<br>
**Ans: `No answer needed`**