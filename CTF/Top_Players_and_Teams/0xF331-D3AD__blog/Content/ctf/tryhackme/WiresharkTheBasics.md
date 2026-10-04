
# Wireshark: The Basics

## *Introduction*

- Which file is used to simulate the screenshots?

> http1.pcapng

- Which file is used to answer the questions?

> Exercise.pcapng

---

## *Tool overview*

Find "Statistics" in the Toolbar, click and select "Capture File Properties".
Use it to answer the following questions:

![statistics](https://i.postimg.cc/Xqvh9hNN/statistics.png)

- Read the "capture file comments". What is the flag?

> TryHackMe_Wireshark_Demo

- What is the total number of packets?

> 58620

- What is the SHA256 hash value of the capture file?

> f446de335565fb0b0ee5e5a3266703c778b2f3dfad7efeaeccb2da5641a6d6eb

---

## *Packet Dissection*

- View packet number 38. Which markup language is used under the HTTP protocol? 

Apply this `frame.number == 38` filter to find the packet. Right-click on it
and choose Follow > HTTP Stream:

![packet38-http-stream](https://i.postimg.cc/26zmKr7C/packet-38-stream.png)

> extensible markup language

- What is the arrival date of the packet? (Answer format: Month/Day/Year)

You can find it the "Frame" section in packet details.

> 05/13/2004

- What is the TTL value?

This one is under "Time to Live", section "Internet Protocol" 

> 47

- What is the TCP payload size?

The "Length" property in "Transmission Control Protocol"

> 424

- What is the e-tag value?

Look at the screensot above and find ETag header in HTTP Response

> 9a01a-4696-7e354b00

---

## *Packet Navigation*

Go to Edit -> Find packet, input "r4w" and select "Packet Details" in dropdown.

- Search the "r4w" string in packet details. What is the name of artist 1?

> r4w8173

- Go to packet 12 and read the comments. What is the answer?

Comment says to find another packet ( `frame.number == 39765` ), go to "Packet Details"
section, export bytes and compute md5.

> 911cd574a42865a956ccde2d04495ebf

- There is a ".txt" file inside the capture file. Find the file and read it; what is the 
alien's name?

Simply search for .txt. It appears that there's a file called "note.txt". Clear the 
filter and search again for note.txt. Find the response for GET request to /note.txt
and export bytes to file. Use `cat` command to reveal alien's name:

![alien-name](https://i.postimg.cc/wvTpW8CK/alien-name.png)

> packetmaster

- Look at the expert info section. What is the number of warnings?

Go to "Analyze" at the Toolbar and pick "Expert information" at the bootom of
dropdown

> 1636

---

## *Packet filtering*

- Go to packet number 4. Right-click on the "Hypertext Transfer Protocol" and apply it 
as a filter. Now, look at the filter pane. What is the filter query?

> http

- What is the number of displayed packets?

To answer this question, apply the `http` filter, then go to "Statistics" -> "Capture 
File Properties". You'll see the "Displayed" column in the "statistics" subsection

> 1089

- Go to packet number 33790 and follow the stream. What is the total number of artists?

> 3

- What is the name of the second artist?

> Blad3
