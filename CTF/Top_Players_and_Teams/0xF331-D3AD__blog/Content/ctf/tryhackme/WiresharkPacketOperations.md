
# Wireshark: Packet Operations

## *Statistics | Summary*

- Investigate the resolved addresses. What is the IP address of the hostname starts with "bbc"? 

In the Toolbar, "Statistics" -> "Resolved Addresses", search for bbc.

> 199.232.24.81

- What is the number of the TCP Data packets?

"Statistics" -> "Protocol Hierarchy"

> 1971

- What is the number of IPv4 conversations?

"Statistics" -> "Conversations", look at the number at "IPv4" tab

> 435

- How many bytes (k) were transferred from the "Micro-St" MAC address?

"Statistics" -> "Endpoints" and hit the "Name Resolution" checkbox.

> 7474

- What is the number of IP addresses linked with "Kansas City"?

> 4

- Which IP address is linked with "Blicnet" AS Organisation?

> 188.246.82.7

---

## *Statistics | Protocol Details*

- What is the most used IPv4 destination address?

"Statistics" -> "IPv4 Statistics" -> "Destination and ports"

> 10.100.1.33

- What is the max service request-response time of the DNS packets?

"Statistics" -> "DNS" -> "Service stats" -> "request-responce time" and convert
to seconds

> 0.467897

- What is the number of HTTP Requests accomplished by "rad[.]msn[.]com?

"Statistics" -> "HTTP" -> "Load distribution"

> 39

---

## *Packet Filtering | Protocol Filters*

- What is the number of IP packets?

1. Filter: `ip`
2. Staistics -> Protocol Hierarchy

> 81420

- What is the number of packets with a "TTL value less than 10"?

1. Filter: `ip.ttl < 10`
2. Staistics -> Protocol Hierarchy

> 66

- What is the number of packets which uses "TCP port 4444"?

1. Filter: `tcp.port == 4444`
2. Staistics -> Protocol Hierarchy

> 632

- What is the number of "HTTP GET" requests sent to port "80"?

1. Filter: `http.request.method == GET && tcp.port == 80`
2. Staistics -> Protocol Hierarchy

> 527

- What is the number of "type A DNS Queries"?

1. Filter: `dns.a`
2. Staistics -> Protocol Hierarchy

> 51

---

## *Advanced Filtering*

- Find all Microsoft IIS servers. What is the number of packets that did not originate from "port 80"?

1. Filter: `http.server contains "Microsoft" && tcp.port != 80`
2. Staistics -> Protocol Hierarchy

> 21

- Find all Microsoft IIS servers. What is the number of packets that have "version 7.5"?

1. Filter: `http.server contains "Microsoft" && http.server matches "7.5"`
2. Staistics -> Protocol Hierarchy

> 71

- What is the total number of packets that use ports 3333, 4444 or 9999?

1. Filter: `tcp.port in {3333,4444,9999}`
2. Staistics -> Protocol Hierarchy

> 2235

- What is the number of packets with "even TTL numbers"?

1. Filter: `string(ip.ttl) matches "[2,4,6,8,0]$"`
2. Staistics -> Protocol Hierarchy

> 77289

- Change the profile to "Checksum Control". What is the number of "Bad TCP Checksum" packets?

In "Edit" -> Prferences -> Protocols -> TCP, select "Validate checksum if possible";
Then "Analyze" -> "Expert Information"

> 34185

- Use the existing filtering button to filter the traffic. What is the number of displayed packets?

Filter: `http.response.code == 200 && (http.content_type matches "image(gif||jpg)")`

> 261

---
