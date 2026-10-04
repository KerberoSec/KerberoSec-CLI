
#wireshark
https://tryhackme.com/r/room/wiresharkthebasics

Wireshark is an open-source, cross-platform network packet analyser tool capable of sniffing and investigating live traffic and inspecting packet captures (PCAP). It is commonly used as one of the best packet analysis tools. In this room, we will look at the basics of Wireshark and use it to perform fundamental packet analysis.

There are two capture files given in the VM. You can use the “http1.pcapng” file to simulate the actions shown in the screenshots. Please note that you need to use the “Exercise.pcapng” file to answer the questions.

﻿**Use Cases**  

Wireshark is one of the most potent traffic analyser tools available in the wild. There are multiple purposes for its use:  

- Detecting and troubleshooting network problems, such as network load failure points and congestion.
- Detecting security anomalies, such as rogue hosts, abnormal port usage, and suspicious traffic.
- Investigating and learning protocol details, such as response codes and payload data. 

Note: Wireshark is not an Intrusion Detection System (IDS). It only allows analysts to discover and investigate the packets in depth. It also doesn't modify packets; it reads them. Hence, detecting any anomaly or network problem highly relies on the analyst's knowledge and investigation skills.

![[Pasted image 20250115090739.png]]

Statistics > capture file properties 
```
Flag: TryHackMe_Wireshark_Demo 

What is the total number of packets?
58620

What is the **SHA256 hash** value of the capture file?

Hash (SHA256):
f446de335565fb0b0ee5e5a3266703c778b2f3dfad7efeaeccb2da5641a6d6eb

```

**Packet Dissection**

Packet dissection is also known as protocol dissection, which investigates packet details by decoding available protocols and fields. Wireshark supports a long list of protocols for dissection, and you can also write your dissection scripts. You can find more details on dissection [**here**](https://github.com/boundary/wireshark/blob/master/doc/README.dissector).

**Packet Details**

You can click on a packet in the packet list pane to open its details (double-click will open details in a new window). Packets consist of 5 to 7 layers based on the OSI model. We will go over all of them in an HTTP packet from a sample capture. The picture below shows viewing packet number 27.

```
Frame (layer 1)
	Interface id: 0
	Encapsulation type: Ethernet
	Arrival Time: May 13, 2004 10:17:11.266912000
	...
	
[MAC] Source (layer 2)
	Destination: Xerox_00:00::00
	Source:
	Type: IPv4

[IP] (layer 3)
	0100 .... = Version: 4
	.... 0101 = Header Length: 28 bytes (5)
	Differentiated Services Field
	Total Length
	Identification
	Flags: 0x0000
	Fragment offset
	Time to live: 55
	Protocol: TCP (6)
	Header checksum
	Source: 

Protocol (layer 4)
	Source Port: 80
	Destination Port: 3371
	...
Protocol Errors (layer 4)
	[Frame: 26, payload: 0-1429 (1430 bytes)]

Application Layer (layer 5)
	Hypertext Transfer Protocol
	HTTP/1.1 200 OK\r\n
	Content-Type: text/html; charset=ISO-8859-1\r\n
Application Layer (layer 5)
	<html><head><style>
```

```
View packet number 38. Which markup language is used under the HTTP protocol?

eXtensible Markup Language

What is the arrival date of the packet? (Answer format: Month/Day/Year)

05/13/2004

What is the TTL value?

47

What is the TCP payload size?

424 bytes

What is the e-tag value?

Hypertext Transfer Protocol > HTTP/1.1 > [Expert Info]
ETag: "9a01a-4696-7e354b00"

```

Menu > Go > Go to Packet > 27 

Find Packets

Apart from packet number, Wireshark can find packets by packet content. You can use the **"Edit --> Find Packet"** menu to make a search inside the packets for a particular event of interest. This helps analysts and administrators to find specific intrusion patterns or failure traces.

There are two crucial points in finding packets. The first is knowing the input type. This functionality accepts four types of inputs (Display filter, Hex, String and Regex). String and regex searches are the most commonly used search types. Searches are case insensitive, but you can set the case sensitivity in your search by clicking the radio button.

The second point is choosing the search field. You can conduct searches in the three panes (packet list, packet details, and packet bytes), and it is important to know the available information in each pane to find the event of interest. For example, if you try to find the information available in the packet details pane and conduct the search in the packet list pane, Wireshark won't find it even if it exists.

`Menu > Find Packet > search term `

Mark Packets

Marking packets is another helpful functionality for analysts. You can find/point to a specific packet for further investigation by marking it. It helps analysts point to an event of interest or export particular packets from the capture. You can use the "Edit" or the "right-click" menu to mark/unmark packets.

Marked packets will be shown in black regardless of the original colour representing the connection type. Note that marked packet information is renewed every file session, so marked packets will be lost after closing the capture file.

Packet Comments

Similar to packet marking, commenting is another helpful feature for analysts. You can add comments for particular packets that will help the further investigation or remind and point out important/suspicious points for other layer analysts. Unlike packet marking, the comments can stay within the capture file until the operator removes them.

Export Packets

Capture files can contain thousands of packets in a single file. As mentioned earlier, Wireshark is not an IDS, so sometimes, it is necessary to separate specific packages from the file and dig deeper to resolve an incident. This functionality helps analysts share the only suspicious packages (decided scope). Thus redundant information is not included in the analysis process. You can use the **"File"** menu to export packets.

Export Objects (Files)

Wireshark can extract files transferred through the wire. For a security analyst, it is vital to discover shared files and save them for further investigation. Exporting objects are available only for selected protocol's streams (DICOM, HTTP, IMF, SMB and TFTP).

Time Display Format

Wireshark lists the packets as they are captured, so investigating the default flow is not always the best option. By default, Wireshark shows the time in "Seconds Since Beginning of Capture", the common usage is using the UTC Time Display Format for a better view. You can use the "View --> Time Display Format" menu to change the time display format.

![[Screen Shot 2025-01-15 at 9.45.42 AM.png]]

```
Search the "r4w" string in packet details. What is the name of artist 1?

r4w8173

Go to packet 12 and read the comments. What is the answer?

Go > Go to Packet > 12
Stats > capture file properties

TryHackMe_Wireshark_Demo 

Go to packet number 39765
Look at the "packet details pane". Right-click on the JPEG section and "Export packet bytes". This is an alternative way of extracting data from a capture file. What is the MD5 hash value of extracted image?

Frame 27: comment
JPEG File Interchange Format > Export packet bytes > jpeg

cd Desktop
md5sum jpeg

911cd574a42865a956ccde2d04495ebf 

There is a ".txt" file inside the capture file. Find the file and read it; what is the alien's name?

Go > Go to Packet > .txt
note.txt

File > Export Objects > HTTP > note.txt

packetmaster

Look at the expert info section. What is the number of warnings?

Analyze > Expert Info
1636
```

Packet Filtering  

Wireshark has a powerful filter engine that helps analysts to narrow down the traffic and focus on the event of interest. Wireshark has two types of filtering approaches: capture and display filters. Capture filters are used for **"capturing"** only the packets valid for the used filter. Display filters are used for **"viewing"** the packets valid for the used filter. We will discuss these filters' differences and advanced usage in the next room. Now let's focus on basic usage of the display filters, which will help analysts in the first place.

Filters are specific queries designed for protocols available in Wireshark's official protocol reference. While the filters are only the option to investigate the event of interest, there are two different ways to filter traffic and remove the noise from the capture file. The first one uses queries, and the second uses the right-click menu. Wireshark provides a powerful GUI, and there is a golden rule for analysts who don't want to write queries for basic tasks: **"If you can click on it, you can filter and copy it"**.

right click > apply as filter

Conversation filter 

When you use the "Apply as a Filter" option, you will filter only a single entity of the packet. This option is a good way of investigating a particular value in packets. However, suppose you want to investigate a specific packet number and all linked packets by focusing on IP addresses and port numbers. In that case, the "Conversation Filter" option helps you view only the related packets and hide the rest of the packets easily. You can use the"right-click menu" or "**Analyse --> Conversation Filter**" menu to filter conversations.

Colourise Conversation

This option is similar to the "Conversation Filter" with one difference. It highlights the linked packets without applying a display filter and decreasing the number of viewed packets. This option works with the "Colouring Rules" option ad changes the packet colours without considering the previously applied colour rule.

Prepare as Filter 

Similar to "Apply as Filter", this option helps analysts create display filters using the "right-click" menu. However, unlike the previous one, this model doesn't apply the filters after the choice. It adds the required query to the pane and waits for the execution command (enter) or another chosen filtering option by using the **".. and/or.."** from the "right-click menu".

Apply as Column  

By default, the packet list pane provides basic information about each packet.

Follow Stream  

Wireshark displays everything in packet portion size. However, it is possible to reconstruct the streams and view the raw traffic as it is presented at the application level. Following the protocol, streams help analysts recreate the application-level data and understand the event of interest. It is also possible to view the unencrypted protocol data like usernames, passwords and other transferred data.

Once you follow a stream, Wireshark automatically creates and applies the required filter to view the specific stream. Remember, once a filter is applied, the number of the viewed packets will change. You will need to use the "**X** **button**" located on the right upper side of the display filter bar to remove the display filter and view all available packets in the capture file.

```
Go to packet number 4. Right-click on the "Hypertext Transfer Protocol" and apply it as a filter. Now, look at the filter pane. What is the filter query?
HTTP

What is the number of displayed packets?
1089

Go to packet number 33790 and follow the stream. What is the total number of artists?
3

What is the name of the second artist?
Blad3

```

https://medium.com/@huglertomgaw/thm-wireshark-the-basics-9d5fa3c9a60e

