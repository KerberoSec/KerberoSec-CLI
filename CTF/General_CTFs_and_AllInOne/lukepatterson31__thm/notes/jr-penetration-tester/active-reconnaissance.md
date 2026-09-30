# Active Reconnaissance

### Web Browser

Useful extensions:

- FoxyProxy

- User-Agent Switcher and Manager

- Wappalyzer

### Ping

Ping sends an ICMP Echo packaet to a remote system. If the remote system is online, and the 
ping packet was correctly routed and not blocked by any firewall, the remote system should 
send back an ICMP Echo Reply. Similarly, the ping reply should reach the first system if 
appropriately routed and not blocked by any firewall.

ICMP echo/type 8 -> ping 

ICMP echo reply/type 0 -> ping reply

### Traceroute

`traceroute` (Linux/macOS) or `tracert` (MS Windows) traces the route packets take from your 
system to another host. It finds the IP addresses of the routers or hops that a packaet 
traverses. It also reveals the number of routers between the two systems. Routes may change 
as many routers use dynamic routing protocols.

A `*` indicates that our system didn't receive an expected ICMP time exceeded in-transit 
message.

### Telnet

Telnet was used for communication with remote systems via CLI. It sends username and 
passwords in cleartext so has since been replaced by SSH. It relies on the TCP protocol so it
can be used to connect to any service and grab it's banner.

`telnet <TARGET-IP> <PORT>` to connect then `GET / HTTP/1.1` for the default index page.
Use `GET /page-name.html HTTP/1.1` to request other pages. To get a valid response input a 
value for host `host: example` and hit enter twice, providing the requested index page.

If we connect to a mail server, proper commands based on the protocol (SMTP or POP3) are 
required.

### Netcat

Use netcat as a client or server, it supports TCP and UDP. It can be used in a similar 
fashion to `telnet` to connect to TCP servers 

`nc <TARGET-IP> <PORT>`

As a server it can listen for connections on a specified port 

`nc -lnvp 80`

