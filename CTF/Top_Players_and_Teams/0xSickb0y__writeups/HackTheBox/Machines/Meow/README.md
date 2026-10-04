# Meow

> https://app.hackthebox.com/starting-point?tier=0

![capa](https://github.com/user-attachments/assets/9efcedf3-1a10-4d16-a0aa-de193dd0cd32)

## Table of Contents

* [About](#about)
* [References](#references)
* [Reconnaissance](#reconnaissance)
* [Username Enumeration](#username-enumeration)
* [Root Access](#root-access)
* [Conclusion](#conclusion)

## About

Meow was an introductory Linux machine that highlighted the importance of proper authentication controls. The challenge revolved around a publicly accessible Telnet service running with default settings. With basic username enumeration and no password authentication, it was possible to obtain a root shell directly through Telnet.

## References

* [Nmap](https://nmap.org/)
* [SecLists](https://github.com/danielmiessler/SecLists)
* [OpenVPN](https://openvpn.net/)
* [Telnet Protocol](https://en.wikipedia.org/wiki/Telnet)

## Reconnaissance

The port scan revealed a single TCP port open: a Telnet service running on port 23. Nmap OS detection confirmed that the target was a Linux-based system. The presence of Telnet suggested potential for plaintext authentication and weak access controls.

![image](https://github.com/user-attachments/assets/1c005af3-49fa-4136-b752-6cd03947865b)

## Username Enumeration

One of the HTB Starting Point tasks mentioned that the machine allowed login without a password. A username enumeration was performed using a small list of common names, which revealed that the `root` account was enabled and accessible without authentication.

The wordlist used was [top-usernames-shortlist.txt](https://github.com/danielmiessler/SecLists/blob/master/Usernames/top-usernames-shortlist.txt) from the SecLists repository.

![image-1](https://github.com/user-attachments/assets/04f174ee-3031-44b2-b051-2f25c6c6c3f7)

## Root Access

After confirming that the `root` user could log in without a password, a Telnet session was opened directly to the target. Upon connection, the system granted a root shell immediately, confirming the complete lack of access control on the service.

![image-2](https://github.com/user-attachments/assets/ba73ca4a-01d2-4227-94ea-a79c619c0e02)

## Conclusion

The Meow machine provided a straightforward path to root access and served as a reminder of the dangers of exposing insecure and outdated services like Telnet.

No authentication, combined with an exposed root account, resulted in a full compromise with minimal effort. The challenge emphasized the importance of basic service hardening and disabling unnecessary protocols in any real-world deployment.
