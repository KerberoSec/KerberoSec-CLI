
#Subscribers 
https://tryhackme.com/room/tsharkcliwiresharkfeatures

## Command-Line Wireshark Features I | Statistics

At the beginning of this module, we mentioned that TShark is considered a command line version of Wireshark. In addition to sharing the same display filters, TShark can accomplish several features of Wireshark explained below.

Three important points when using Wireshark-like features:

- These options are applied to all packets in scope unless a display filter is provided.
- Most of the commands shown below are CLI versions of the Wireshark features discussed in Wireshark: Packet Operations (Task 2).
- TShark explains the parameters used at the beginning of the output line.

For example, you will use the `phs` option to view the protocol hierarchy. Once you use this command, the result will start with the "Packet Hierarchy Statistics" header.

```
# parameter 

tshark -r colour.pcap --color

-z  statistics

tshark -z help
tshark -z filter
tshark -z -q filter

```

Statistics | Protocol Hierarchy

Protocol hierarchy helps analysts to see the protocols used, frame numbers, and size of packets in a tree view based on packet numbers. As it provides a summary of the capture, it can help analysts decide the focus point for an event of interest. Use the `-z io,phs -q` parameters to view the protocol hierarchy.

```shell
tshark -r demo.pcapng -z io,phs -q

===================================================================
Protocol Hierarchy Statistics
Filter: 

eth                                      frames:43 bytes:25091
  ip                                     frames:43 bytes:25091
    tcp                                  frames:41 bytes:24814
      http                               frames:4 bytes:2000
        data-text-lines                  frames:1 bytes:214
          tcp.segments                   frames:1 bytes:214
        xml                              frames:1 bytes:478
          tcp.segments                   frames:1 bytes:478
    udp                                  frames:2 bytes:277
      dns                                frames:2 bytes:277
===================================================================

```

After viewing the entire packet tree, you can focus on a specific protocol as shown below. Add the `udp` keyword to the filter to focus on the UDP protocol.
```shell
tshark -r demo.pcapng -z io,phs,udp -q

===================================================================
Protocol Hierarchy Statistics
Filter: udp

eth                                      frames:2 bytes:277
  ip                                     frames:2 bytes:277
    udp                                  frames:2 bytes:277
      dns                                frames:2 bytes:277
===================================================================

```

Statistics | Packet Lengths Tree

The packet lengths tree view helps analysts to overview the general distribution of packets by size in a tree view. It allows analysts to detect anomalously big and small packets at a glance! Use the `-z plen,tree -q` parameters to view the packet lengths tree.

```shell
tshark -r demo.pcapng -z plen,tree -q
```

Statistics | Endpoints  

The endpoint statistics view helps analysts to overview the unique endpoints. It also shows the number of packets associated with each endpoint. If you are familiar with Wireshark, you should know that endpoints can be viewed in multiple formats. Similar to Wireshark, TShark supports multiple source filtering options for endpoint identification. Use the `-z endpoints,ip -q` parameters to view IP endpoints. Note that you can choose other available protocols as well.

Filters for the most common viewing options are explained below.
```
# filter 

eth   ethernet address
ip    IPv4 address
ipv6  IPv6
tcp   TCP (IPv4 and IPv6)
udp   UDP (IPv4 and IPv6)
wlan  IEEE 802.11

tshark -r demo.pcapng -z endpoints,ip -q
```

Statistics | Conversations

The conversations view helps analysts to overview the traffic flow between two particular connection points. Similar to endpoint filtering, conversations can be viewed in multiple formats. This filter uses the same parameters as the "Endpoints" option. Use the `-z conv,ip -q` parameters to view IP conversations.

```shell
tshark -r demo.pcapng -z conv,ip -q
```

  
Statistics | Expert Info  

The expert info view helps analysts to view the automatic comments provided by Wireshark. If you are unfamiliar with the "Wireshark Expert Info", visit task 4 in the [Wireshark: The Basics](https://tryhackme.com/room/wiresharkthebasics) room of the [Wireshark module](https://tryhackme.com/module/wireshark). Use the `-z expert -q` parameters to view the expert information.

```shell
tshark -r demo.pcapng -z expert -q
```

```
Use the "write-demo.pcap" to answer the questions.

Read the capture file and view the "Protocol Hierarchy" with "-z io,phs -q" parameters.
What is the byte value of the TCP protocol?

tshark -r write-demo.pcap -z io,phs -q
62

In which packet lengths row is our packet listed? (The "Packet Lengths Tree" can help.)

tshark -r write-demo.pcap -z plen,tree -q
40-79

What is the summary of the expert info?

tshark -r write-demo.pcap -z expert -q
Connection establish request (SYN): server port 80

Use the "demo.pcapng" to answer the question.

Cyberchef can defang. The "Conversations" can help.
List the communications. What is the IP address that exists in all IPv4 conversations?
Enter your answer in defanged format.

tshark -r demo.pcapng -z endpoints,ip -q

145[.]254[.]160[.]237

```

## command line features 2

Command-Line Wireshark Features II | Specific Filters for Particular Protocols

There are plenty of filters designed for multiple protocols. The common filtering options for specific protocols are explained below. Note that most of the commands shown below are CLI versions of the Wireshark features discussed in [Wireshark: Packet Operations](https://tryhackme.com/room/wiresharkpacketoperations) (Task 3)

  
Statistics | IPv4 and IPv6

This option provides statistics on IPv4 and IPv6 packets, as shown below. Having the protocol statistics helps analysts to overview packet distribution according to the protocol type. You can filter the available protocol types and view the details using the `-z ptype,tree -q` parameters.

```
tshark -r demo.pcapng -z ptype,tree -q

# filter IP
IPv4: -z ip_hosts,tree -q
IPv6: -z ipv6_hosts,tree -q

tshark -r demo.pcapng -z ip_hosts,tree -q

# filter all source and destination addresses

IPv4: -z ip_srcdst,tree -q
IPv6: -z ipv6_srcdst,tree -q

tshark -r demo.pcapng -z ip_srcdst,tree -q

# filter all outgoing traffic 

IPv4: -z dests,tree -q
IPv6: -z ipv6_dests,tree -q

tshark -r demo.pcapng -z dests,tree -q

```

Statistics | DNS

This option provides statistics on DNS packets by summarising the available info. You can filter the packets and view the details using the `-z dns,tree -q` parameters.

```shell
tshark -r demo.pcapng -z dns,tree -q
```

Statistics | HTTP

This option provides statistics on HTTP packets by summarising the load distribution, requests, packets, and status info. You can filter the packets and view the details using the parameters given below.

Packet and status counter for HTTP: -z http,tree -q
Packet and status counter for HTTP2: -z http2,tree -q
Load distribution: -z http_srv,tree -q
Requests: -z http_req,tree -q
Requests and responses: -z http_seq,tree -q

```shell
tshark -r demo.pcapng -z http,tree -q
```

```
Use the "demo.pcapng" to answer the questions.

Cyberchef can defang. The "ip_hosts" statistics can help.
Which IP address has 7 appearances?
Enter your answer in defanged format.

tshark -r demo.pcapng -z ip_hosts,tree -q

216[.]239[.]59[.]99    7

The "ip_srcdst" statistics can help.
What is the "destination address percentage" of the previous IP address?

tshark -r demo.pcapng -z ip_srcdst,tree -q

6.98%   (not 9.30% ?)

Cyberchef can defang. The "dests" statistics can help.
Which IP address constitutes "2.33% of the destination addresses"?
Enter your answer in defanged format.

tshark -r demo.pcapng -z ip_srcdst,tree -q
145[.]253[.]2[.]203 

What is the average "Qname Len" value? (The "dns" statistics can help.)

tshark -r demo.pcapng -z dns,tree -q

29.00

```

## command line features 3

Command-Line Wireshark Features III | Streams, Objects and Credentials

There are plenty of filters designed for multiple purposes. The common filtering options for specific operations are explained below. Note that most of the commands shown below are CLI versions of the Wireshark features discussed in the Wireshark module

Follow Stream

This option helps analysts to follow traffic streams similar to Wireshark. The query structure is explained in the table given below.
```
main parameter   -z follow
protocol         TCP  UDP  HTTP  HTTP2
view mode        HEX  ASCII
stream number    0 | 1 |2 | 3
add. param.      -q

TCP Streams: -z follow,tcp,ascii,0 -q
UDP Streams: -z follow,udp,ascii,0 -q
HTTP Streams: -z follow,http,ascii,0 -q

tshark -r demo.pcapng -z follow,tcp,ascii,1 -q
```

Export Objects

This option helps analysts to extract files from DICOM, HTTP, IMF, SMB and TFTP. The query structure is explained in the table given below.
```
main parameter    --export objects
protocol          DICOM  HTTP  IMF  SMB  TFTP
target folder     target folder to save files
add. param.       -q

--export-objects http,/home/ubuntu/Desktop/extracted-by-tshark -q

# Extract the files from HTTP traffic.
tshark -r demo.pcapng --export-objects http,/home/ubuntu/Desktop/extracted-by-tshark -q

'ads%3fclient=ca-pub-2309191948673629&random=1084443430285&lmt=1082467020&format=468x60_as&output=html&url=http%3A%2F%2Fwww.ethereal.com%2Fdownload.html&color_bg=FFFFFF&color_text=333333&color_link=000000&color_url=666633&color_border=666633'
download.html  <----- Etherial Bitcoin page

```

Credentials

This option helps analysts to detect and collect cleartext credentials from FTP, HTTP, IMAP, POP and SMTP. You can filter the packets and find the cleartext credentials using the parameters below.

- `-z credentials -q`

```shell
tshark -r credentials.pcap -z credentials -q
```

```
Use the "demo.pcapng" to answer the questions.

Follow the "UDP stream 0".
What is the "Node 0" value? Enter your answer in defanged format.

tshark -r demo.pcapng -z follow,udp,ascii,0 -q
Node 0: 145[.]254[.]160[.]237:3009

Follow the "HTTP stream 1".
What is the "Referer" value? Enter your answer in defanged format.

tshark -r demo.pcapng -z follow,http,ascii,1 -q | grep "Referer"

Referer: http://www.ethereal.com/download.html
hxxp[://]www[.]ethereal[.]com/download[.]html

Use the "credentials.pcap" to answer the question.
The "nl" command can help. Exclude the banner lines!
What is the total number of detected credentials?

tshark -r credentials.pcap -z credentials -q

75
```

## advanced filtering options 

Advanced Filtering Options | Contains, Matches and Extract Fields

Accomplishing in-depth packet analysis sometimes ends up with a special filtering requirement that cannot be covered with default filters. TShark supports Wireshark's "contains" and "matches" operators, which are the key to the advanced filtering options. You can visit the Wireshark: Packet Operations room (Task 6) if you are unfamiliar with these filters. 

A quick recap from the Wireshark: Packet Operations room:

```
# filter

contains     search a value, case sensitive
matches      search pattern, supports regex, case insensitive

no integer values can be used for contains and matches, use HEX and regex instead

```

Extract Fields

This option helps analysts to extract specific parts of data from the packets. In this way, analysts have the opportunity to collect and correlate various fields from the packets. It also helps analysts manage the query output on the terminal. The query structure is explained in the table given below.

```
main filter      -T fields
target field     -e <field name>      use for each field to display
show field name  -E header=y

-T fields -e ip.src -e ip.dst -E header=y

tshark -r demo.pcapng -T fields -e ip.src -e ip.dst -E header=y -c 5

tshark -r demo.pcapng -T fields -e ip.src -e ip.dst -E header=y
```

Filter: "contains"
```
filter         contains
Type	       Comparison operator
Description	   Search a value, case-sensitive and provides similar 
Example	       Find all "Apache" servers.
Workflow	   List all HTTP packets field contains "Apache"
Usage	       http.server contains "Apache"

tshark -r demo.pcapng -Y 'http.server contains "Apache"'
```

Filter: "matches"
```
filter          matches
Type	        Comparison operator
Description	    Search a pattern: regular expression, case-insensitive
Example	        Find all .php and .html pages.
Workflow	    List all HTTP packets: matches  "GET" or "POST".
Usage	        http.request.method matches "(GET|POST)"

tshark -r demo.pcapng -Y 'http.request.method matches "(GET|POST)"'

tshark -r demo.pcapng -Y 'http.request.method matches "(GET|POST)"' -T fields -e ip.src -e ip.dst -e http.request.method -E header=y
```

```
Use the "demo.pcapng" to answer questions.

The "contains" filter can help.
What is the HTTP packet number that contains the keyword "CAFE"?

tshark -r demo.pcapng -Y 'http.server contains "CAFE"'

27

The "matches" and "extract fields" filters can help. Also, the "-T fields -e frame.time" can help.
Filter the packets with "GET" and "POST" requests and extract the packet frame time.
What is the first time value found?

tshark -r demo.pcapng -Y 'http.request.method matches "(GET|POST)"' -T fields -e frame.time

May 13, 2004 10:17:08.222534000 UTC
```

## use cases 

Use Cases

When investigating a case, a security analyst should know how to extract hostnames, DNS queries, and user agents to hunt low-hanging fruits after viewing the statistics and creating an investigation plan. The most common four use cases for every security analyst are demonstrated below. If you want to learn more about the mentioned protocols and benefits of the extracted info, please refer to the [Wireshark Traffic Analysis](https://tryhackme.com/room/wiresharktrafficanalysis) room.

  
Extract Hostnames
```
# extract hostnames from DHCP packets.

tshark -r hostnames.pcapng -T fields -e dhcp.option.hostname

tshark -r hostnames.pcapng -T fields -e dhcp.option.hostname | awk NF | sort -r | uniq -c | sort -r

tshark -r dns-queries.pcap -T fields -e dns.qry.name | awk NF | sort -r | uniq -c | sort -r

sed -n '101,200p' your_file.txt
```

Extract User Agent
```
tshark -r user-agents.pcap -T fields -e http.user_agent | awk NF | sort -r | uniq -c | sort -r
```

```
Use the "hostnames.pcapng" to answer the questions.
What is the total number of unique hostnames?

tshark -r hostnames.pcapng -T fields -e dhcp.option.hostname | awk NF | sort -r | uniq -c | sort -r | wc -l

30

What is the total appearance count of the "prus-pc" hostname?

12

Use the "dns-queries.pcap" to answer the question.
What is the total number of queries of the most common DNS query?

tshark -r dns-queries.pcap -T fields -e dns.qry.name | awk NF | sort -r | uniq -c | sort -r

472

Use the "user-agents.pcap" to answer questions.
What is the total number of the detected "Wfuzz user agents"?

tshark -r user-agents.pcap -T fields -e http.user_agent | awk NF | sort -r | uniq -c | sort -r

12

Cyberchef can defang. Extract the "User-Agent" field as shown in the task. Enhance the query by adding the "HTTP hostname" information with the "http.host" option.
What is the "HTTP hostname" of the nmap scans?
Enter your answer in defanged format.

tshark -r user-agents.pcap -T fields -e http.user_agent http.host | grep nmap
Mozilla/5.0 (compatible; Nmap Scripting Engine; https://nmap.org/book/nse.html)

tshark -r user-agents.pcap -T fields -e http.host

172[.]16[.]172[.]129

```

## conclusion

Congratulations! You just finished the TShark: CLI Wireshark Features room. In this room, we covered how to implement Wireshark GUI's features into the TShark CLI, advanced filtering options, and use case examples.

Now, we invite you to complete the TShark challenge rooms:

- [TShark Challenge I: Teamwork](https://tryhackme.com/r/room/tsharkchallengesone)
- [TShark Challenge II: Directory](https://tryhackme.com/r/room/tsharkchallengestwo)

![[Pasted image 20250314101937.png]]
144 points
