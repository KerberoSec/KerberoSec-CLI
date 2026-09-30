```
╷╭─╴╭┬╮╭─╮   ╭─╮╭─╮╷ ╷╷  ╭─╮╭─╮╶┬╮
││  │││├─╯   ├─╯├─┤╰┬╯│  │ │├─┤ ││
╵╰─╴╵ ╵╵     ╵  ╵ ╵ ╵ ╰─╴╰─╯╵ ╵╶┴╯
```
This challenge comes from the 18th DEFCON CTF’s qualification. Note, that an information
is hidden in the capture of ICMP packets and the validation password is a MD5 hash. [^1]

Solution
-----------------------------------------------------------------------------------------
After opening the challenge resource in `wireshark ch6.pcap`, we can observe *34* ICMP
packets that were intercepted from the network. They all seem to feature a ping request 
and reply from the source IP `192.168.0.2` to the destination IP `192.168.0.1`. Next, we
analyze the ICMP contents for every packet but can not observe anything abnormal or
interesting. Also, we filter all the *MD5* hashes from the payloads and attempt to find
any collisions through a hash lookup [^2] but without any success. Since all the ICMP
messages are very uniform too, we can not discover any interesting error codes either. 
[^3] Next, we analyze that the *17* ICMP echo replies just repeat what the request sent
and can thus be disregarded with the filter `icmp.type == 8` [^4]. Looking at the payload
sizes of these packets, we can now see that *16* packets contain 256 bytes and only one
has a data length of 129 bytes. Since the payload data appears to repeat itself, we now
attempt to find those bytes unique to individual packets and then combine them. With the
help of other writeups [^6], we finally find out that the final clue is to try out all
256 byte shifts on it and check for a 32-character hexadecimal results, which resembles
an alphanumeric MD5 hash. With this, we are able to construct the script 
`extract_payload.py` and obtain a likely MD5 hash.
Finally, we can attempt to find the plaintext behind the MD5 hash with one of the online
tools, such as [^5] and find out that it is known `Supercalifragilisticexpialidocious!`.

[^1]: https://www.root-me.org/en/Challenges/Network/ICMP-payload-107
[^2]: https://inventivehq.com/tools/security/hash-lookup
[^3]: https://learningnetwork.cisco.com/s/article/Understanding-the-ICMP-Protocol-with-Wireshark-in-Real-Time
[^4]: https://en.wikipedia.org/wiki/Internet_Control_Message_Protocol
[^5]: https://hashes.com/en/decrypt/hash
[^6]: https://blog.stalkr.net/2010/05/defcon-18-ctf-quals-writeup-packet-100.html
