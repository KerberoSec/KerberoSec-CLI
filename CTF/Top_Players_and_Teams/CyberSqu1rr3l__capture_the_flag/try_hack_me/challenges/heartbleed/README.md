```                                                                                                          
 .-. .-.,---.    .--.  ,---.  _______ ,---.   ,-.    ,---.  ,---.   ,'|"\   
 | | | || .-'   / /\ \ | .-.\|__   __|| .-.\  | |    | .-'  | .-'   | |\ \  
 | `-' || `-.  / /__\ \| `-'/  )| |   | |-' \ | |    | `-.  | `-.   | | \ \ 
 | .-. || .-'  |  __  ||   (  (_) |   | |--. \| |    | .-'  | .-'   | |  \ \
 | | |)||  `--.| |  |)|| |\ \   | |   | |`-' /| `--. |  `--.|  `--. /(|`-' /
 /(  (_)/( __.'|_|  (_)|_| \)\  `-'   /( `--' |( __.'/( __.'/( __.'(__)`--' 
(__)   (__)                (__)      (__)     (_)   (__)   (__)               
```
In this THM room, we want to exploit a web server's OpenSSL implementation by finding the
*secure socket layer* (SSL) vulnerability. [^1]

Obtain the flag using a very well-known vulnerability.
-----------------------------------------------------------------------------------------
**Make sure you pay attention to all the information and errors displayed and to how web
servers are configured.**

The *Heartbleed* bug [CVE-2014-0160] is a critical vulnerability discovered in the
OpenSSL cryptographic library, affecting versions 1.0.1 through 1.0.1f. The flaw resides
in the implementation of the TLS heartbeat extension, where a missing bounds check
allows an attacker to request more data than was actually provided in a heartbeat
message. As a result, up to 64kb of memory can be leaked from a vulnerable server or
client in a single request, step-by-step. [^3]

Because OpenSSL was widely used to secure web servers, email services, VPNs, and other
internet-facing applications, Heartbleed had a global impact when it was disclosed in
2014. The leaked memory could contain highly sensitive information such as usernames,
passwords, session cookies, and even private encryption keys, potentially allowing
attackers to decrypt communications or impersonate affected services. One of the most
concerning aspects of the vulnerability was that exploitation typically left no traces
in application logs, making detection extremely difficult. [^2]

Upon accessing the web server, we are prompted with a static page showing a music video.
First, we scan the server with `nmap -sC -sV <TARGET_IP_ADDRESS>` and discover that there
is an OpenSSL instance running on port *443*. Next, we start the Metasploit `msfconsole`
and `search heartbleed`. The matching modules include
`auxiliary/scanner/ssl/openssl_heartbleed`, a module to exploit the OpenSSL Heartbeat
vulnerability. We can proceed to print `info 4` usage help about the module and thus
discover that we need to set *RHOSTS* with `set RHOSTS` followed by the target IP 
address. Further, we want to `set verbose true` and activate the module with `use 4`.
Finally, we can `run` the module and investigate the heartbeat response throughly. The
info leaked thus contains a user message with the flag.<br>
Alternatively, we can use the command line checker tool [^5] or Python PoC script [^4]
but we were not able to succeed this way. 

[^1]: https://tryhackme.com/room/heartbleed
[^2]: https://heartbleed.com/
[^3]: https://www.schneier.com/blog/archives/2014/04/heartbleed.html
[^4]: https://stackabuse.com/how-to-exploit-the-heartbleed-bug/
[^5]: https://github.com/FiloSottile/Heartbleed
