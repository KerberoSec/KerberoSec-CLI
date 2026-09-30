# Underpass

> https://app.hackthebox.com/machines/UnderPass

![alt text](https://github.com/user-attachments/assets/a0c014ca-fb4e-49e4-b030-979e3e58aa71)

## Table of Contents

- [About](#about)
- [References](#references)
- [Reconnaissance](#reconnaissance)
- [Web Access](#web-access)
- [Initial Access](#initial-access)
- [Privilege Escalation](#privilege-escalation)
- [Conclusion](#conclusion)

## About

Underpass was an Easy Linux machine that began with a default Apache Ubuntu page. This led to enumerating the machine's UDP ports for alternative attack vectors. Through SNMP enumeration, it was discovered that `DaloRADIUS` was running on the remote machine, and the operators panel could be accessed using default credentials. Inside the panel, the password hash for the user `svcMosh` was found and successfully cracked.

Login to the remote machine was then achieved using SSH with the obtained credentials. The user `svcMosh` was configured to run `mosh-server` as `root`, which allowed connection to the server from the local machine and interaction with the remote machine as the `root` user.

## References

- [DaloRADIUS GitHub Repository](https://github.com/lirantal/daloradius)
- [Mosh Official Website](https://mosh.org)
- [Ubuntu Manpages: mosh-client](https://manpages.ubuntu.com/manpages/focal/man1/mosh-client.1.html)
- [SNMP Protocol](https://en.wikipedia.org/wiki/Simple_Network_Management_Protocol)
- [Enumerating SNMP](https://book.hacktricks.wiki/en/network-services-pentesting/pentesting-snmp/index.html#enumerating-snmp)
- [Hash Cracking with Hashcat](https://hashcat.net/hashcat/)

## Reconnaissance

The port scan revealed two ports listening on TCP (22/80): OpenSSH and the Apache web server.

Since nothing was found on the web server initially, a UDP scan was conducted on the box which revealed an SNMP service and other RADIUS services.

![0](https://github.com/user-attachments/assets/af691dda-10ca-414d-b422-6270493596f2)

The `snmp-check` tool was used to gather more information about the service and the machine itself. From the output, it was discovered that the application was running a [DaloRADIUS](https://github.com/lirantal/daloradius) application.

![1](https://github.com/user-attachments/assets/e4f6f1b0-f4da-4422-bc5d-c20773d972c7)

From https://github.com/lirantal/daloradius :

_"daloRADIUS is an advanced RADIUS web management application for managing hotspots and general-purpose ISP deployments. It features user management, graphical reporting, accounting, a billing engine, and integrates with OpenStreetMap for geolocation. The system is based on FreeRADIUS with which it shares access to the backend database._

_daloRADIUS is written using the PHP programming language and uses a database abstraction layer (DAL) for database access."_

## Web Access

Knowing that the web server was hosting _DaloRADIUS_, I cloned the repository locally to find the path to the __operators__ login panel.

![2](https://github.com/user-attachments/assets/e11139bb-1df2-4e95-93cc-7991c97e986e)

The application was still using the default credentials: `administrator:radius`.

Under ___Management___, a user listing was found with the username ___svcMosh___ (hinting at a service user related to _MOSH: The mobile shell_) and a password hash.

![3](https://github.com/user-attachments/assets/a8f531ff-f1b1-4272-bb1a-78f8d04160e5)

## Initial Access

The previously obtained MD5 hash was quickly cracked using the _rockyou.txt_ wordlist.

![4](https://github.com/user-attachments/assets/b757b88d-6d38-424d-b7db-76980f600188)

The SSH service running on the box accepted password authentication for the __svcMosh__ user. After a session was established, the user's privileges were listed and it was noticed that it could run `/usr/bin/mosh-server` as all users with no password required.

![5](https://github.com/user-attachments/assets/4f0be86d-3672-43dc-8f2e-5039b040a45f)

## Privilege Escalation

From https://mosh.org
: ___Mosh (mobile shell)___ _is a remote terminal application that allows roaming, supports intermittent connectivity, and provides intelligent local echo and line editing of user keystrokes. Mosh is a replacement for interactive SSH terminals. It's more robust and responsive, especially over Wi-Fi, cellular, and long-distance links._

After I read documentation and the learned the tool usage, I spawned a new mosh server. The output showed a key and the port number on which the new server was running.

From the https://manpages.ubuntu.com/manpages/focal/man1/mosh-client.1.html : _The 22-byte base64 session key given by mosh-server is supplied in the MOSH_KEY environment variable. This represents a 128-bit AES key that protects the integrity and confidentiality of the session._

After that, I established a connection to the server by setting the given key as an environment variable and a root shell was obtained.

![6](https://github.com/user-attachments/assets/bb29a602-44fa-45de-bc17-7b38e6190639)

## Conclusion

The Underpass machine demonstrated a classic enumeration-to-privilege-escalation attack path. The key lessons learned from this machine included:

- **UDP enumeration was critical**: When TCP services didn't yield results, UDP scanning revealed additional attack vectors like SNMP

- **Default credentials remained a major vulnerability**: The DaloRADIUS application used default credentials that provided immediate access

- **SNMP information disclosure occurred**: SNMP leaked sensitive information about running services and applications

- **Privilege escalation through legitimate tools was achieved**: The `mosh-server` binary, when misconfigured with sudo privileges, provided a direct path to root access
