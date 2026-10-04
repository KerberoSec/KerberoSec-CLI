# The Email Where It Happens

## Description

Howdy Truth Seekers! It seems that some malware that was strategically shared has begun to phone back home! We believe that this might have some very important information that could help lead us to finally getting to the bottom of this conspiracy regarding extraterrestrial life. Unfortunately the original developer of this _tool_ was recently promoted to customer status and is no longer on good terms with the organization. This means that we don't have any information on how to decode this traffic. Unfortunately all I have is a PCAP. Can you help us out here?

## Attachments

[intercepted_communication.pcap](https://github.com/rstacks/USCyberOpenSeasonIV-BeginnersGameRoom-writeup/blob/master/Forensics/TheEmailWhereItHappens/attachments/intercepted_communication.pcap)

## Solution

- I opened [Wireshark](https://www.wireshark.org/) with the provided PCAP file. This revealed a long list
of **DNS queries**. The challenge title and description suggest that an email is involved,
which most likely means said email was encoded and sent covertly over DNS.
- I did notice that each DNS query was made to an address that appeared to be encoded in some way. Within Wireshark,
I followed the UDP stream (click Analyze, then Follow, then UDP Stream) to get all of the DNS queries in one place. I then copied
the text and removed the periods, commas, and "x.meowcorp.cloud" strings, as these
didn't seem particularly important. The resulting cleaned data is available in [encoded_email.txt](https://github.com/rstacks/USCyberOpenSeasonIV-BeginnersGameRoom-writeup/blob/master/Forensics/TheEmailWhereItHappens/encoded_email.txt).
- I then took the data to [CyberChef](https://cyberchef.org/) and tried several decoding operations. Eventually, doing
a **base32** decode revealed a fully readable email, which contained the flag.

## Flag

SIVBGR{wh0_n33ds_32_b4s3s}
