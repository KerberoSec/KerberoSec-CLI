# [On The Wire CTF Challenge](https://tiberianorder.com/contracts/on-the-wire/) | Created By Tiberian Order 💀

<br>
<img width="433" src="https://user-images.githubusercontent.com/104733166/189721636-13284aef-136d-474e-ab52-38250b84785b.jpg">

## CTF Writeup 📝 <br>

#OSINT #TiberianOrder #CTF #Writeup #Wireshark

## Level 🎚️

**Tiberian Order** classed the difficulty level as: **Medium**

# CTF Task | Mission 🕵️

Greetings Special Agent K. One of our field agents in Malaysia managed to physically breach the office of a corrupt politician. Doubling as a mole for a Chinese criminal enterprise, mostly smuggling endangered animals. In this case their evil business involves shark fin trade and other exotic food items.

During the breach, our agent successfully obtained several pieces of information on the organization. Currently this does not include their name, as they only communicate using anonymous messages and codenames.

We hope that the information, which includes pictures, floorplans, data dumps and packet captures. Will lead to a more complete picture of this organization. We know that the Malaysian government will be exceptionally happy to get this criminal enterprise out of its borders.

All data has been divided over several agents. Your segment for this contract is the analysis of a packet capture file. Figure out what is being communicated and find the message that matters. This message will lead to your Contract Card.

As always. Special Agent K, the contract is yours, if you choose to accept.

# Wireshark 🦈

The file to analyse was a  `.pcapng` file. <br> 
A  `.pcapng` file is a **Packet Capture Next Generation data file**.

The .pcapng file format is related to captured data packets over the network. The Packet Capture Next Generation file or the .pcapng file is a standard format for storing captured data.

The usual thing to to do to analyze a .pcapng file for many people is to open it with wireshark and then search within wirehsark.

Wireshark is not user-friendly in my opinion, trying to find something with Wireshark can take hours or days.

# Analysing Endpoints in Wireshark 🎯

With **GeoIP2**, data can be gathered on all the IP adresses that are present on the packet capture file.
Viewing all the endpoints is important and can bring some good intelligence.

Here is a few screenshots of what GeoIP2 combined with Wireshark can do.
We can see below that we can now see geolocation information on IP adresses, city, country, ASN, which is something Wireshark doesn't do without GeoIP2.

<img width="633" src="https://user-images.githubusercontent.com/104733166/189054394-b712f58f-f5ad-466a-92d1-fab0ee7e6354.png">

<img width="633" src="https://user-images.githubusercontent.com/104733166/189053880-1b9f43c4-eb46-47d1-970d-98e71ddadcd6.png">

# Viewing on a Map 🗺️
This is fantastic and helps understanding better the full IP architecture of the .PCAPNG file.
This is also a feature of *GeoIP2*

<img width="633" src="https://user-images.githubusercontent.com/104733166/189055352-ec439296-5d1f-4e7c-8575-9347016858ca.png">

# How I got the Flag 🏴‍☠️

As I stated above, I hate analysing .pcapng files with Wireshark, it's not user friendly, it can take hours to find something.
With APackets Analyser, you get a better view and understanding of the packet capture file, it's then much easier to find some good intelligence.

Below this is what it looks like, yes it is much sexier than Wireshark ! 

- I opened the file with Apackets
- Went to DNS Detection from Intercepted Traffic
- Found the Pastebin
- Got the bit.ly link to download the Contract card. 

Many people think that only Wireshark can analyse .pcapng files, and that's why it takes them such a long time to figure things out.

<img width="633" src="https://user-images.githubusercontent.com/104733166/189057649-731b2055-f3c3-4243-836e-3ad2e9a8bae9.png">

<img width="633" src="https://user-images.githubusercontent.com/104733166/189057716-e991e578-0305-4a26-a89e-eb9305d41e7c.png">

# Contract Card 🃏

<img width="333" src="https://user-images.githubusercontent.com/104733166/189060185-509d00ae-5478-43b6-ae17-1c9728f3c615.png">

# Final thoughts 💭
Very Good CTF put together by Tiberian Order: https://tiberianorder.com

<p align="center">
<img width="233" src="https://user-images.githubusercontent.com/104733166/189060766-99ef7734-5ed2-4df1-baca-99c418777ac2.png"/><img width="233" src="https://user-images.githubusercontent.com/104733166/189107979-85b316ef-78eb-45d3-8019-e7f6ff02a2dc.png"/></p>

