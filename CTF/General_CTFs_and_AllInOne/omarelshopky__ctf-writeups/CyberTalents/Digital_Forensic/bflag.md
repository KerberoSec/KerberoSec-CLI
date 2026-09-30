# Challenge Name:
 [*bflag*](https://cybertalents.com/challenges/forensics/bflag)
 
# Challenge Description
All of us started from the bottom. Now it's your turn.

Link: [https://hubchallenges.s3-eu-west-1.amazonaws.com/Forensics/bflag.pcap](https://hubchallenges.s3-eu-west-1.amazonaws.com/Forensics/bflag.pcap)

## Answer
* Download the pcap file
* Open Wireshark to analyze the packets
* Open pcap file in wireshark then from statistics->Protocol Hierarchy
* There is 9 packet from type line based text data in http protocol
* Filter the packets to show online http protocol
* Scroll down will watch info details of packets there is one with '/f14g/analyze_packet_for_fun' it seem that is the flag, lets try
* You got the Flag

 ## The Flag
 > analyze_packet_for_fun
