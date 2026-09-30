# Lab 5: Introduction to Networking

## Short Answer Questions

1. Does HTTP use TCP or UDP and why? How about Discord and Skype, why?

HTTP uses TCP becuase it is more reliable that it establishes a connection before sendign packets.

For Discord and Skype or any other streaming service where speed is traded off for reliability they uses UDP because it is much faster than TCP that it doesn't establish a connection beforehand `fire and forget`

2. Who manufactured the NIC with mac address dc:fb:48:21:7b:23?

Intel Corporate

3. How many distinct hosts can 127.0.0.0/8 contain?

Simple calculation:

- Subtract the netmask (/8) from the number IP address number of bits (e.g. 32): $32: 8 = 24$

- calculate $2^n$ where n is the number of remainig bits (e.g. 24): $2^{24} = 16,777,216$

Number of distinct hostst 127.0.0.0/8 contains is `16,777,216`

- What are three types of records you can get when you perform a DNS lookup of google.com using the dig command?

I got `A` (IPv4 address record) and `CNAME` (Canonical name record)

- Is the result of running ping enough to determine whether or not you can reach a server? Why or why not?

The simple answer after some searching is that ping uses ICMP echo request to the server, this request might be blocked by some firewalls, but this doesn't mean the server is not reachable via other services like HTTPS.