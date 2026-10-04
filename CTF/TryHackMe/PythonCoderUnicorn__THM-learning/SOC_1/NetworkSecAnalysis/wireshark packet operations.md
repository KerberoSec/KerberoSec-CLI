
#Subscribers 
https://tryhackme.com/room/wiresharkpacketoperations

In this room, we will cover the fundamentals of packet analysis with Wireshark and investigate the event of interest at the packet-level. 

>[!info] Note that this is the second room of the Wireshark room trio, and it is suggested to visit the first room ([**Wireshark: The Basics**](https://tryhackme.com/room/wiresharkthebasics)) to practice and refresh your Wireshark skills before starting this one.

In the first room, we covered the basics of the Wireshark by focusing on how it operates and how to use it to investigate traffic captures. In this room, we will cover advanced features of the Wireshark by focusing on packet-level details with Wireshark statistics, filters, operators and functions.

Now start the given VM, open the Wireshark, load the "`Exercise.pcapng`" file and go through the walkthrough.

## statistics | summary 

This menu provides multiple statistics options ready to investigate to help users see the big picture in terms of the scope of the traffic, available protocols, endpoints and conversations, and some protocol-specific details like DHCP, DNS and HTTP/2. For a security analyst, it is crucial to know how to utilize the statical information. This section provides a quick summary of the processed pcap, which will help analysts create a hypothesis for an investigation. You can use the **"Statistics"** menu to view all available options. 

**Resolved Addresses**

This option helps analysts identify IP addresses and DNS names available in the capture file by providing the list of the resolved addresses and their hostnames. Note that the hostname information is taken from DNS answers in the capture file. Analysts can quickly identify the accessed resources by using this menu. Thus they can spot accessed resources and evaluate them according to the event of interest. You can use the **"Statistics --> Resolved Addresses"** menu to view all resolved addresses by Wireshark.

**Protocol Hierarchy**

This option breaks down all available protocols from the capture file and helps analysts view the protocols in a tree view based on packet counters and percentages. Thus analysts can view the overall usage of the ports and services and focus on the event of interest. The golden rule mentioned in the previous room is valid in this section; you can right-click and filter the event of interest. You can use the **"Statistics --> Protocol Hierarchy"** menu to view this info.

**Conversations**

Conversation represents traffic between two specific endpoints. This option provides the list of the conversations in five base formats; ethernet, IPv4, IPv6, TCP and UDP. Thus analysts can identify all conversations and contact endpoints for the event of interest. You can use the "Statistic --> Conversations" menu to view this info.

Endpoints

The endpoints option is similar to the conversations option. The only difference is that this option provides unique information for a single information field (Ethernet, IPv4, IPv6, TCP and UDP ). Thus analysts can identify the unique endpoints in the capture file and use it for the event of interest. You can use the "Statistics --> Endpoints" menu to view this info.

Wireshark also supports resolving MAC addresses to human-readable format using the manufacturer name assigned by IEEE. Note that this conversion is done through the first three bytes of the MAC address and only works for the known manufacturers. When you review the ethernet endpoints, you can activate this option with the **"Name resolution"** button in the lower-left corner of the endpoints window.

Name resolution is not limited only to MAC addresses. Wireshark provides IP and port name resolution options as well. However, these options are not enabled by default. If you want to use these functionalities, you need to activate them through the **"Edit --> Preferences --> Name Resolution"** menu. Once you enable IP and port name resolution, you will see the resolved IP address and port names in the packet list pane and also will be able to view resolved names in the "Conversations" and "Endpoints" menus as well.

Besides name resolution, Wireshark also provides an IP geolocation mapping that helps analysts identify the map's source and destination addresses. But this feature is not activated by default and needs supplementary data like the GeoIP database. Currently, Wireshark supports MaxMind databases, and the latest versions of the Wireshark come configured MaxMind DB resolver. However, you still need MaxMind DB files and provide the database path to Wireshark by using the "Edit --> Preferences --> Name Resolution --> MaxMind database directories" menu. Once you download and indicate the path, Wireshark will automatically provide GeoIP information under the IP protocol details for the matched IP addresses.

>[!info] Note: 
>You need an active internet connection to view the GeoIP map. The lab machine doesn't have an active internet connection!

```
Investigate the resolved addresses. What is the IP address of the hostname starts with "bbc"? ("Resolved Addresses" can help)

199.232.24.81  bbc.map.fastly.net

What is the number of IPv4 conversations? ("Conversations" can help)

435

How many bytes (k) were transferred from the "Micro-St" MAC address?
("Endpoints" and "Name Resolution" can help)

bytes 7474

What is the number of IP addresses linked with "Kansas City"? ("Endpoints" can help)

4

Which IP address is linked with "Blicnet" AS Organisation? ("Endpoints" can help)

turn off name resolution
188.246.82.7   Blicnet d.o.o
```

## statistics | protocol details 

IPv4 and IPv6  

Up to here, almost all options provided information that contained both versions of the IP addresses. The statistics menu has two options for narrowing the statistics on packets containing a specific IP version. Thus, analysts can identify and list all events linked to specific IP versions in a single window and use it for the event of interest. You can use the "Statistics --> IPvX Statistics" menu to view this info.

DNS  

This option breaks down all DNS packets from the capture file and helps analysts view the findings in a tree view based on packet counters and percentages of the DNS protocol. Thus analysts can view the DNS service's overall usage, including rcode, opcode, class, query type, service and query stats and use it for the event of interest. You can use the "Statistics --> DNS" menu to view this info.

HTTP  

This option breaks down all HTTP packets from the capture file and helps analysts view the findings in a tree view based on packet counters and percentages of the HTTP protocol. Thus analysts can view the HTTP service's overall usage, including request and response codes and the original requests. You can use the "Statistics --> HTTP" menu to view this info.

```
What is the most used IPv4 destination address? ("IPv4 Statistics" can help)

10.100.1.33

What is the max service request-response time of the DNS packets? ("DNS Statistics" can help)

0.467897

What is the number of HTTP Requests accomplished by "rad[.]msn[.]com? ("HTTP Statistics" can help)

HTTP > load distribution
39
```

## packet filtering principles

Packet Filtering  

In the previous room ([**Wireshark | The Basics**](https://tryhackme.com/room/wiresharkthebasics)), we covered packet filtering and how to filter packets without using queries. In this room, we will use queries to filter packets. As mentioned earlier, there are two types of filters in Wireshark. While both use similar syntax, they are used for different purposes. Let's remember the difference between these two categories.

```
Capture Filters

This type of filter is used to save only a specific part of the traffic. It is set before capturing traffic and not changeable during the capture.

Display Filters

This type of filter is used to investigate packets by reducing the number of visible packets, and it is changeable during the capture.

Note:
You cannot use the display filter expressions for capturing traffic and vice versa.
```

The typical use case is capturing everything and filtering the packets according to the event of interest. Only experienced professionals use capture filters and sniff traffic. This is why Wireshark supports more protocol types in display filters. Please ensure you thoroughly learn how to use capture filters before using them in a live environment. Remember, you cannot capture the event of interest if your capture filter is not matching the specific traffic pattern you are looking for.

Capture Filter Syntax  

These filters use byte offsets hex values and masks with boolean operators, and it is not easy to understand/predict the filter's purpose at first glance. The base syntax is explained below:  

- Scope: host, net, port and portrange.
- Direction: src, dst, src or dst, src and dst,
- Protocol: ether, wlan, ip, ip6, arp, rarp, tcp and udp.
- Sample filter to capture port 80 traffic: `tcp port 80`

You can read more on capture filter syntax from [here](https://www.wireshark.org/docs/man-pages/pcap-filter.html) and [here](https://gitlab.com/wireshark/wireshark/-/wikis/CaptureFilters#useful-filters). A quick reference is available under the **"Capture --> Capture Filters"** menu.

Display Filter Syntax  

This is Wireshark's most powerful feature. It supports 3000 protocols and allows conducting packet-level searches under the protocol breakdown. The official "[Display Filter Reference](https://www.wireshark.org/docs/dfref/)" provides all supported protocols breakdown for filtering.

- Sample filter to capture port 80 traffic: `tcp.port == 80`  

Wireshark has a built-in option (Display Filter Expression) that stores all supported protocol structures to help analysts create display filters. We will cover the "Display Filter Expression" menu later. Now let's understand the fundamentals of the display filter operations. A quick reference is available under the **"Analyze --> Display Filters"** menu.

**Comparison Operators**

You can create display filters by using different comparison operators to find the event of interest. The primary operators are shown in the table below.

```
ip.src == 10.10.10.100
ip.src != 10.10.10.100
ip.ttl > 250
ip.ttl < 10
ip.ttl >= 0xFA
ip.ttl <= 0xA
```

**Logical Expressions**

Wireshark supports boolean syntax. You can create display filters by using logical operators as well.

```
(ip.src == 10.10.10.100) AND (ip.src == 10.10.10.111)
(ip.src == 10.10.10.100) OR (ip.src == 10.10.10.111)
!(ip.src == 10.10.10.222)
```

Packet Filter Toolbar

The filter toolbar is where you create and apply your display filters. It is a smart toolbar that helps you create valid display filters with ease. Before starting to filter packets, here are a few tips:  

- Packet filters are defined in lowercase.
- Packet filters have an autocomplete feature to break down protocol details, and each detail is represented by a "dot".
- Packet filters have a three-colour representation explained below.

## packet filtering | protocol filters

As mentioned in the previous task, Wireshark supports 3000 protocols and allows packet-level investigation by filtering the protocol fields. This task shows the creation and usage of filters against different protocol fields. 

IP Filters

IP filters help analysts filter the traffic according to the IP level information from the packets (Network layer of the OSI model). This is one of the most commonly used filters in Wireshark. These filters filter network-level information like IP addresses, version, time to live, type of service, flags, and checksum values.

The common filters are shown in the given table.

```
# show all IP packets
ip  

# show all packet matching IP
ip.addr == 10.10.10.111

# all packets containing IP addresses from 10.10.10.0/24 subnet.
ip.addr == 10.10.10.0/24

# all packets originated from 10.10.10.111
ip.src == 10.10.10.111

# all packets sent to 10.10.10.111
ip.dst == 10.10.10.111

```

TCP and UDP Filters

TCP filters help analysts filter the traffic according to protocol-level information from the packets (Transport layer of the OSI model). These filters filter transport protocol level information like source and destination ports, sequence number, acknowledgement number, windows size, timestamps, flags, length and protocol errors.

```
tcp.port == 80
udp.port == 53

tcp.srcport == 1234
udp.srcport == 1234

tcp.dstport == 80
udp.dstport == 5353

```

Application Level Protocol Filters | HTTP and DNS

Application-level protocol filters help analysts filter the traffic according to application protocol level information from the packets (Application layer of the OSI model ). These filters filter application-specific information, like payload and linked data, depending on the protocol type.

```
http
dns

http.response.code == 200
dns.flags.response == 0

http.request.method == "GET"
dns.flags.response == 1

http.request.method == "POST"
dns.qry.type == 1

```

Display Filter Expressions

As mentioned earlier, Wireshark has a built-in option (Display Filter Expression) that stores all supported protocol structures to help analysts create display filters. When an analyst can't recall the required filter for a specific protocol or is unsure about the assignable values for a filter, the Display Filter Expressions menu provides an easy-to-use display filter builder guide. It is available under the "Analyze --> Display Filter Expression" menu.

It is impossible to memorize all details of the display filters for each protocol. Each protocol can have different fields and can accept various types of values. The Display Filter Expressions menu shows all protocol fields, accepted value types (integer or string) and predefined values (if any). Note that it will take time and require practice to master creating filters and learning the protocol filter fields.

>[!info] Note: 
>The [first room](https://tryhackme.com/room/wiresharkthebasics) introduced the "Colouring Rules" (Task-2). Now you know how to create display filters and filter the event of interest. You can use the "View --> Coloring Rules" menu to assign colours to highlight your display filter results.

```
What is the number of IP packets?

ip
81420 (bottom bar)

What is the number of packets with a "TTL value less than 10"?

ip.ttl < 10
66 (bottom bar)

What is the number of packets which uses "TCP port 4444"?

tcp.port==4444
632 (bottom bar)

What is the number of "HTTP GET" requests sent to port "80"?

http.request.method =="GET" and tcp.port==80
527 (bottom bar)

What is the number of "type A DNS Queries"?

51
```

## advanced filtering

So far, you have learned the basics of packet filtering operations. Now it is time to focus on specific packet details for the event of interest. Besides the operators and expressions covered in the previous room, Wireshark has advanced operators and functions. These advanced filtering options help the analyst conduct an in-depth analysis of an event of interest.

**Filter: "contains"**

```
filter        contains
type          comparison operator
description   value inside packets
example       find all "Apache" servers
workflow      list all HTTP packets 
usage         http.server contains "Apache"
```

Filter: "matches"

```
filter       matches
type         comparison operator
description  pattern of regular expression
example      find all php and html pages
workflow     list all HTTP packets  .php .html
usage        http.host matches "\.(php|html)"
```

Filter: "in"
```
filter       in
type         set membership
description  search a value or field
example      find all packets for ports 80,443,8080
workflow     list all TCP packets that match
usage        tcp.port in {80 443 8080}
```

Filter: "upper"
```
filter       upper
type         function
description  convert string to uppercase
example      find all "APACHE"
workflow     convert all HTTP packets that are uppercase Apache
usage        upper(http.server) contains "APACHE"
```

Filter: "lower"
```
filter       lower
type         function
description  convert string to lowercase
example      find all "apache"
workflow     convert all HTTP packets that are lowercase Apache
usage        upper(http.server) contains "apache"
```

Filter: "string"
```
filter       string
type         function
description  convert non-string to string
example      find all frames with odd numbers
workflow     convert all frame number fields
usage        string(frame.number) matches "[13579]$"
```

Bookmarks and Filtering Buttons  

We've covered different types of filtering options, operators and functions. It is time to create filters and save them as bookmarks and buttons for later usage. As mentioned in the previous task, the filter toolbar has a filter bookmark section to save user-created filters, which helps analysts re-use favourite/complex filters with a couple of clicks. Similar to bookmarks, you can create filter buttons ready to apply with a single click. 

Creating and using bookmarks.

Profiles  

Wireshark is a multifunctional tool that helps analysts to accomplish in-depth packet analysis. As we covered during the room, multiple preferences need to be configured to analyze a specific event of interest. It is cumbersome to re-change the configuration for each investigation case, which requires a different set of colouring rules and filtering buttons. This is where Wireshark profiles come into play. You can create multiple profiles for different investigation cases and use them accordingly. You can use the **"Edit --> Configuration Profiles"** menu or the **"lower right bottom of the status bar --> Profile"** section to create, modify and change the profile configuration.

```
Find all Microsoft IIS servers. What is the number of packets that did not originate from "port 80"? ("contains" operator can help)

http.server contains "Microsoft"
21

Find all Microsoft IIS servers. What is the number of packets that have "version 7.5"? ("matches" operator can help)

71

What is the total number of packets that use ports 3333, 4444 or 9999? ("in" operator can help)

tcp.port in {333 4444 9999}
2235

"string" and "matches" operators can help. Convert the TTL field to string with the "string" operator and filter the "[02468]$" regex value with the "matches" operator to find the even TTL numbers.

What is the number of packets with "even TTL numbers"?

string(ip.ttl) matches "[02468]$"
77289

This new profile is customised to detect checksum errors. Bad TCP checksums are shown in red and black colours. Use the "Packet List Pane" details or the "Display Filter Expression" menu to create the required filter.
Change the profile to "Checksum Control". What is the number of "Bad TCP Checksum" packets?

tcp.checksum.status==0
34185 (bottom bar)

Use the existing filtering button to filter the traffic. What is the number of displayed packets? (The button is available in the "Checksum Control" profile.)

261

```

