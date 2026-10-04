```
╔╦╗╔═╗╦  ╔╗╔╔═╗╔╦╗       ╔═╗┬ ┬┌┬┐┬ ┬┌─┐┌┐┌┌┬┐┬┌─┐┌─┐┌┬┐┬┌─┐┌┐┌
 ║ ║╣ ║  ║║║║╣  ║   ───  ╠═╣│ │ │ ├─┤├┤ │││ │ ││  ├─┤ │ ││ ││││
 ╩ ╚═╝╩═╝╝╚╝╚═╝ ╩        ╩ ╩└─┘ ┴ ┴ ┴└─┘┘└┘ ┴ ┴└─┘┴ ┴ ┴ ┴└─┘┘└┘
```
Find the user password in this TELNET session capture. [^1]

Solution
-----------------------------------------------------------------------------------------
Again, we open the network capture in wireshark and are able to spot *272* packets. As
we are familar with the *Analyze* feature, we follow the *TCP stream* [^2] and are able
to observe the following intercept with the password in clear text.
```
<--snip-->
OpenBSD/i386 (oof) (ttyp1)

login: .."........"ffaakkee
.
Password:[REDACTED]
.
Last login: Thu Dec  2 21:32:59 on ttyp1 from bam.zing.org
Warning: no Kerberos tickets issued.
OpenBSD 2.6-beta (OOF) #4: Tue Oct 12 20:42:32 CDT 1999

Welcome to OpenBSD: The proactively secure Unix-like operating system.

Please use the sendbug(1) utility to report bugs in the system.
Before reporting a bug, please try to reproduce it with the latest
version of the code.  With bug reports, please try to ensure that
enough information to reproduce the problem is enclosed, and if a
known fix for it exists, include that as well.

$ llss
.
$ llss  --aa
.
.         ..        .cshrc    .login    .mailrc   .profile  .rhosts
$ //ssbbiinn//ppiinngg  wwwwww..yyaahhoooo..ccoomm
.
PING www.yahoo.com (204.71.200.74): 56 data bytes
64 bytes from 204.71.200.74: icmp_seq=0 ttl=239 time=73.569 ms
64 bytes from 204.71.200.74: icmp_seq=1 ttl=239 time=71.099 ms
64 bytes from 204.71.200.74: icmp_seq=2 ttl=239 time=68.728 ms
64 bytes from 204.71.200.74: icmp_seq=3 ttl=239 time=73.122 ms
64 bytes from 204.71.200.74: icmp_seq=4 ttl=239 time=71.276 ms
64 bytes from 204.71.200.74: icmp_seq=5 ttl=239 time=75.831 ms
64 bytes from 204.71.200.74: icmp_seq=6 ttl=239 time=70.101 ms
64 bytes from 204.71.200.74: icmp_seq=7 ttl=239 time=74.528 ms
64 bytes from 204.71.200.74: icmp_seq=9 ttl=239 time=74.514 ms
64 bytes from 204.71.200.74: icmp_seq=10 ttl=239 time=75.188 ms
64 bytes from 204.71.200.74: icmp_seq=11 ttl=239 time=72.925 ms
...^C
.--- www.yahoo.com ping statistics ---
13 packets transmitted, 11 packets received, 15% packet loss
round-trip min/avg/max = 68.728/72.807/75.831 ms
$ eexxiitt
.
```
Note, that TCP in itself does not hide the password here since no additional encryption
layer is present. Further, we can discover the classic double characters in this TELNET
session capture. This is because both the client-side keystrokes and the server's echoed
characters are recorded for us to see. Since this packet capture recorded in both 
directions, we have characters appearing twice due to the echo.

[^1]: https://www.root-me.org/en/Challenges/Network/TELNET-authentication
[^2]: https://www.rfc-editor.org/info/rfc854/
