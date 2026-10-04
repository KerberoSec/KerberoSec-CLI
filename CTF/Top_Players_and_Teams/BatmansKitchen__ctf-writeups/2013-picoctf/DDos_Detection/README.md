# DDos Detection

* Problem:

  It appears a SYN-flood style DDoS has been carried out on this system. Send us a list of the IP addresses of the attackers (in any order, separated by spaces), so we can track them down and stop them.

* Solution:

  Use CloudShark or open .pcap provided using wireshark
set filter `tcp.flags.syn==1`, 
we get a list of packets, eliminating the ip address that does send syn, ack, we get a list of ip addresses of attackers

* Answer:

  Answer is in SYN.txt

