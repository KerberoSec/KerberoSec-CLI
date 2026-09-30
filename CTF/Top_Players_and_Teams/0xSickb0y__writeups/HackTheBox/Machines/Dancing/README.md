# Dancing

> [https://app.hackthebox.com/starting-point?tier=0](https://app.hackthebox.com/starting-point?tier=0)

![CAPA](https://github.com/user-attachments/assets/f4f799ec-18f5-4e82-aa54-f0bdf771a9a3)

## Table of Contents

* [About](#about)
* [References](#references)
* [Reconnaissance](#reconnaissance)
* [SMB Shares](#smb-shares)
* [Conclusion](#conclusion)

## About

Dancing was an introductory Windows machine that served as a walkthrough for interacting with SMB file shares. The objective was to identify exposed shares, access them, and retrieve sensitive information without needing credentials.

## References

* [Clock Skew](https://en.wikipedia.org/wiki/Clock_skew)
* [HackTricks: SMB](https://book.hacktricks.wiki/en/network-services-pentesting/pentesting-smb/index.html)
* [NTP: Network Time Protocol](https://en.wikipedia.org/wiki/Network_Time_Protocol)
* [SMB Protocol Overview](https://learn.microsoft.com/en-us/windows/win32/fileio/microsoft-smb-protocol-and-cifs-protocol-overview)

## Reconnaissance

The port scan revealed 4 open TCP ports: 135 (MS RPC), 139 (NetBIOS-SSN), 445 (SMB), and 5985 (HTTP). The presence of port 445 indicated SMB services, which became the primary target for enumeration.

The SMB clock skew was reported as 3h59m59s. To avoid issues caused by time desynchronization, the system clock was adjusted to match the target’s time.

![image](https://github.com/user-attachments/assets/8dd06dbb-83b1-436f-beb6-5ac187264ead)

## SMB Shares

Initial attempts to enumerate shares using [nxc](https://github.com/Pennyw0rth/NetExec) failed, but the scan revealed the NetBIOS hostname: `DANCING`. This was added to the local _/etc/hosts_ file to resolve the hostname properly.

![image-1](https://github.com/user-attachments/assets/37abcf9d-8e9e-4ec6-8f5c-ec30388eb567)

smbclient revealed four available shares. Three of them were default administrative shares (ADMIN\$, C\$, IPC\$), while one non-standard share stood out: `WorkShares`.

![image-2](https://github.com/user-attachments/assets/e3435675-6783-4e51-969e-75a008b75de2)

Accessing the share revealed two user directories: `Amy.J` and `James.P`. Within these, two files were found: _worknotes.txt_ and _flag.txt_.

The _worknotes.txt_ file contained operational notes:

``` 
- Start Apache server on the Linux machine
- Secure the FTP server
- Set up WinRM on Dancing
```

The mention of an FTP server was misleading, as no FTP service was accessible externally. The file appeared to be general instructions or placeholders rather than indicators of live services.

The _flag.txt_ file contained the required root flag for completing the challenge.

## Conclusion

The Dancing machine emphasized basic but essential concepts of Windows SMB enumeration. It reinforced the importance of host name resolution, anonymous access checks, and proper time synchronization.
