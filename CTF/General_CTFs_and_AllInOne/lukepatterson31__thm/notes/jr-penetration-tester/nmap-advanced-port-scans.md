# Nmap Advanced Port Scans

### TCP Null Scan, Fin Scan and Xmas Scan

**Null Scan**

`nmap -sN <TARGET-IP>`

Nmap sends a TCP packet with all flag bits set to zero, if the port is closed it will 
respond with an RST/ACK therefore if no response is received the port is open or filtered by 
a firewall.

**Fin Scan**

`nmap -sF <TARGET-IP>`

Nmap sends a TCP packet with the FIN bit set, if the port is closed it will respond with an 
RST/ACK therefore if no response is received the port is open or filtered by a firewall.

**Xmas Scan**

`nmap -sX <TARGET-IP>`

Nmap sends a TCP packet with URG, PSH and FIN bits set, if the port is closed it will 
respond with an RST/ACK therefore if no response is received the port is open or filtered by 
a firewall.

One scenario where these three scan types can be efficient is when scanning a target behind 
a stateless (non-stateful) firewall. A stateless firewall will check if the incoming packet 
has the SYN flag set to detect a connection attempt. Using a flag combination that does not 
match the SYN packet makes it possible to deceive the firewall and reach the system behind 
it. However, a stateful firewall will practically block all such crafted packets and render 
this kind of scan useless.

### TCP Maimon Scan

`nmap -sM <TARGET-IP>`

Nmap sends a TCP packet with the FIN and ACK bits set. The target should send an RST packet 
as a response. However, certain BSD-derived systems drop the packet if it is an open port 
exposing the open ports. This scan won’t work on most targets encountered in modern networks.

### TCP ACK, Window and Custom Scan

**TCP ACK Scan**

`nmap -sA <TARGET-IP>`

Nmap sends a TCP packet with the ACK bit set, if no firewall is present the target will 
respond with RST. If a firewall is present then any unblocked ports will respond with RST
showing as unfiltered ports.

**Window Scan**

`nmap -sW <TARGET-IP>`

The TCP window scan is almost the same as the ACK scan; however, it examines the TCP Window 
field of the RST packets returned. On specific systems, this can reveal that the port is 
open. If a firewall is present then any unblocked ports will respond with an RST showing as 
closed ports.

**Custom Scan**

`nmap --scanflags <URGACKPSHRSTSYNFIN>`

Nmap sends a TCP packet with the specified flags set

### Spoofing and Decoys

**Spoofing**

Using IP of an interface

`nmap -S <SPOOFED-IP> <TARGET-IP>`

Specify interface and disable ping scan

`nmap -e <NETWORK-INTERFACE> -Pn -S <SPOOFED-IP> <TARGET-IP>`

Crafts packets with the spoofed IP as src. Unless the network traffic is monitored the scan 
is useless. 

While on the same subnet as the target, Nmap can spoof your MAC address.

`--spoof-mac <SPOOFED-MAC>`

**Decoys**

`nmap -D <DECOY-IP>,RND,ME <TARGET-IP>`

Specify decoy or random IP's in addition to your own while scanning.

### Fragmented Packets

Use `-f` to fragment packets to disguise scans from Firewall and IDS. Each `-f` increases 
the size of the fragments by 8 bytes. The default value can be changed with `--mtu` but it 
must be a multiple of 8.

*[Image: IP Header]*

To reassemble on the recipient size, IP uses the Identification and Fragment Offset

### Idle/Zombie Scan

`nmap -sI <ZOMBIE-IP> <TARGET-IP>`

Nmap uses an idle host on the network to determine if a port is open or closed. It sends a 
TCP packet with the SYN and ACK bits set to the idle host (zombie) then notes the IP ID 
from the RST response from the zombie. The zombie's IP is then spoofed in a TCP packet with 
the SYN bit set that is sent to the target. The target then sends a response to the zombie, 
RST if the port is closed and SYN/ACK if it's open. The final step is for the attacker to 
send another SYN/ACK to the zombie and compare the IP ID of the RST response to the first 
packet's IP ID. If the difference is 1 then the port is closed or filtered, if the 
difference is 2 then port is open.

For this to work the host **must** be idle, otherwise the IP ID will change with the other 
requests and the results will be useless.

### Getting More Details

`--reason` Adds reasoning to the results, `-v` increases verbosity per `-v`, `-d` adds 
debugging.
