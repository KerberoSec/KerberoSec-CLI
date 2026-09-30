# Challenge Name:
 [*ARP Storm*](https://cybertalents.com/challenges/network/arp-storm)
 
# Challenge Description
An attacker in the network is trying to poison the arp table of 11.0.0.100, the admin captured this PCAP.

Link: [https://hubchallenges.s3-eu-west-1.amazonaws.com/Forensics/ARP+Storm.pcap](https://hubchallenges.s3-eu-west-1.amazonaws.com/Forensics/ARP+Storm.pcap)

## Answer
* Download the file and open it with **wireshark**
```sh
wireshark ARP+Storm.pcap
```
* Take overview of the baskets each one contain special letter and the last one contain '=' sign which may implies that it is base64 encode
* Lets extract its content and decode it
```sh
echo ZmxhZ3tnckB0dWl0MHVzXzBwY09kZV8xc19BbHdAeXNfQTZ1U2VkX3QwX3AwMXMwbn0= | base64 -d
```
* You got the Flag

 ## The Flag
 > flag{gr@tuit0us_0pcOde_1s_Alw@ys_A6uSed_t0_p01s0n}
