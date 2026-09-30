
#Networking #Subscribers 

https://tryhackme.com/room/tsharkthebasics

TShark is an open-source command-line network traffic analyser. It is created by the Wireshark developers and has most of the features of Wireshark. It is commonly used as a command-line version of Wireshark. However, it can also be used like tcpdump. Therefore it is preferred for comprehensive packet assessments.

## CLI packet analysis

Command-Line Packet Analysis Hints

TShark is a text-based tool, and it is suitable for data carving, in-depth packet analysis, and automation with scripts. This strength and flexibility come out of the nature of the CLI tools, as the produced/processed data can be pipelined to additional tools. The most common tools used in packet analysis are listed below.

```
capinfos      provides details of specified capture file
grep 
cut
uniq
nl
sed
awk 
```

```
cd Desktop/exercise-files/

capinfos demo.pcapng

File name:           demo.pcapng
File type:           Wireshark/tcpdump/... - pcap
File encapsulation:  Ethernet
File timestamp precision:  microseconds (6)
Packet size limit:   file hdr: 65535 bytes
Number of packets:   43
File size:           25 kB
Data size:           25 kB
Capture duration:    30.393704 seconds
First packet time:   2004-05-13 10:17:07.311224
Last packet time:    2004-05-13 10:17:37.704928
Data byte rate:      825 bytes/s
Data bit rate:       6604 bits/s
Average packet size: 583.51 bytes
Average packet rate: 1 packets/s
SHA256:              25a72bdf10339f2c29916920c8b9501d294923108de8f29b19aba7cc001ab60d
RIPEMD160:           6ef5f0c165a1db4a3cad3116b0c5bcc0cf6b9ab7
SHA1:                3aac91181c3b7eb34fb7d2b6dd6783f4827fcf07
Strict time order:   True
Number of interfaces in file: 1
Interface #0 info:
                     Encapsulation = Ethernet (1 - ether)
                     Capture length = 65535
                     Time precision = microseconds (6)
                     Time ticks per second = 1000000
                     Number of stat entries = 0
                     Number of packets = 43

```

## TShark fundamentals 

### Command-Line Interface and Parameters  

TShark is a text-based (command-line) tool. Therefore, conducting an in-depth and consecutive analysis of the obtained results is easy. Multiple built-in options are ready to use to help analysts conduct such investigations. However, learning the parameters is essential; you will need the built-in options and associated parameters to keep control of the output and not be flooded with the detailed output of TShark. The most common parameters are explained in the given table below. Note that TShark requires superuser privileges to sniff live traffic and list all available interfaces.
```
tshark -h      help page
tshark -v      show version
tshark -D      list sniffing interfaces
tshark -i      capture live traffic
tshark         sniff traffic like tcpdump
```

### Sniffing  

Sniffing is one of the essential functionalities of TShark. A computer node can have multiple network interfaces that allow the host to communicate and sniff the traffic through the network. Specific interfaces might be associated with particular tasks/jobs. Therefore, the ability to choose a sniffing interface helps users decide and set the proper interface for sniffing.

```
tshark -D

1. ens5
2. lo (Loopback)
3. any
4. bluetooth-monitor
5. nflog
6. nfqueue
7. ciscodump (Cisco remote capture)
8. dpauxmon (DisplayPort AUX channel monitor capture)
9. randpkt (Random packet generator)
10. sdjournal (systemd Journal Export)
11. sshdump (SSH remote capture)
12. udpdump (UDP Listener remote capture)

tshark -i 1
tshark -i 2
```

```
tshark -r demo.pcapng      read input
tshark -c 10               packet count 
tshark -w capture.pcap     write/output of sniffed traffic
tshark -V demo.pcapng      verbose
tshark -q demo.pcapng      silent mode
tshark -x demo.pcapng      display packet bytes
```

```
Read the "demo.pcapng" file with TShark.
What are the assigned TCP flags in the 29th packet?

tshark -r demo.pcapng -c 29 | grep TCP
PSH, ACK

What is the "Ack" value of the 25th packet?

tshark -r demo.pcapng -c 25
Ack=12421

What is the "Window size value" of the 9th packet?

tshark -r demo.pcapng -c 9 | grep -i win
Win=9660

```

## capture fundamentals

Capture Condition Parameters

As a network sniffer and packet analyzer, TShark can be configured to count packets and stop at a specific point or run in a loop structure. The most common parameters are explained below.

```
# capture conditions for single run/loop STOP after condition

tshark -w test.pcap -a duration:1 
tshark -w test.pcap -a filesize:10
tshark -w test.pcap -a filesize:10 -a files:3 

# ring buffer control, infinite loop

tshark -w test.pcap -b duration:1 
tshark -w test.pcap -b filesize:10 
tshark -w test.pcap -b filesize:10 -b files:3 
```

Capture condition parameters only work in the "capturing/sniffing" mode. You will receive an error message if you try to read a pcap file and apply the capture condition parameters. The idea is to save the capture files in specific sizes for different purposes during live capturing. If you need to extract sorts of packets from a specific capture file, you will need to use the read&write options discussed in the previous task.

```
# Start sniffing the traffic and stop after 2 seconds, and save the dump into 5 files, each 5kb.

tshark -w autostop-demo.pcap -a duration:2 -a filesize:5 -a files:5
```

## packet filtering 

Packet Filtering Parameters | Capture & Display Filters  

There are two dimensions of packet filtering in TShark; live (capture) and post-capture (display) filtering. These two dimensions can be filtered with two different approaches; using a predefined syntax or Berkeley Packet Filters (BPF). TShark supports both, so you can use Wireshark filters and BPF to filter traffic. As mentioned earlier, TShark is a command-line version of Wireshark, so we will need to use different filters for capturing and filtering packets.

```
capture filters
	live filtering options, purpose is to save only specific part of the traffic and is not changeable during live capture 

display filters
	post-capture filtering, purpose is to investigate packets by reducing the number of visible packets
```

 the purpose is to implement a scope by range, protocol, and direction filtering. This might sound like bulk/raw filtering, but it still provides organised capture files with reasonable file size. The display filters investigate the capture files in-depth without modifying the packet.
```
-f   capture filters same as BPF syntax and Wireshark
-Y   display filters same as Wireshark
```

### capture filters 

Wireshark's capture filter syntax is used here. The basic syntax for the Capture/BPF filter is shown below. You can read more on capture filter syntax [here](https://www.wireshark.org/docs/man-pages/pcap-filter.html) and [here](https://gitlab.com/wireshark/wireshark/-/wikis/CaptureFilters#useful-filters). Boolean operators can also be used in both types of filters.

```
# filter: IP , hostnames, IP ranges & port numbers

tshark -f "host 10.10.10.10"
tshark -f "net 10.10.10.0/24"  network range
tshark -f "port 80"
tshark -f "portrange 80-100"

# direction: either is default , src|dst

tshark -f "src host 10.10.10.10"
tshark -f "dst host 10.10.10.10"

# target protocol  arp|either|icmp|ip|tcp|udp

tshark -f "tcp"
tshark -f "either host F8:DB:C5:A2:5D:81"    MAC address
tshark -f "ip proto 1"                       icmp
```

```
# host filtering

curl tryhackme.com
tshark -f "host tryhackme.com"

# IP filtering

nc 10.10.10.10 4444 -vw 5       verbose for 5 seconds
tshark -f "host 10.10.10.10"

# port forwarding

nc 10.10.10.10 4444 -vw 5
tshark -f "port 4444"

# protocol filtering 

nc -u 10.10.10.10 4444 -vw 5    UDP verbose 5 seconds
tshark -f "udp"
```

## display filters 

Display Filters  

Wireshark's display filter syntax is used here. You can use the official [**Display Filter Reference**](https://www.wireshark.org/docs/dfref/) to find the protocol breakdown for filtering. Additionally, you can use Wireshark's build-in "Display Filter Expression" menu to break down protocols for filters. Note that Boolean operators can also be used in both types of filters. Common filtering options are shown in the given table below.

**Note:** Using single quotes for capture filters is recommended to avoid space and bash expansion problems. Once again, you can check the [Wireshark: Packet Operations](https://tryhackme.com/room/wiresharkpacketoperations) room (Task 4 & 5) if you want to review the principles of packet filtering.

```
# Filtering an IP without specifying a direction.  

tshark -Y 'ip.addr == 10.10.10.10'
tshark -Y 'ip.addr == 10.10.10.0/24'      network range 
tshark -Y 'ip.src == 10.10.10.10' 
tshark -Y 'ip.dst == 10.10.10.10' 

# protocol TCP 

tshark -Y 'tcp.port == 80'
tshark -Y 'tcp.srcport == 80'

# protocol HTTP

tshark -Y 'http'
tshark -Y "http.response.code == 200"

# protocol DNS 

tshark -Y 'dns'
tshark -Y 'dns.qry.type == 1'

tshark -r demo.pcapng -Y 'ip.addr == 145.253.2.203'
tshark -r demo.pcapng -Y 'http'
```

```
What is the number of packets with a "65.208.228.223" IP address?

tshark -r demo.pcapng -Y 'ip.addr ==65.208.228.223' | wc
34

What is the number of packets with a "TCP port 3371"?
tshark -r demo.pcapng -Y 'tcp.port==3371'
7

What is the number of packets with a "145.254.160.237" IP address as a source address?
tshark -r demo.pcapng -Y 'ip.src==145.254.160.237' | wc 

37

```

