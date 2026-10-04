# Anonymous Challenge Description

Can you trace the anonymous guy?

*[Image: Challenge Description]*

## Overview

Open the PCAP file using *Wireshark*, and you will notice that there are many different protocols.

*[Image: 2]*

## FTP Protocol

We can see that there is FTP traffic, so we will use the `ftp` filter.

*[Image: 3]*

## Viewing the Packet Content

We will view the packet content using **Follow → FTP Stream**.

We can see the FTP authentication process, then a flag file, and finally some text encoded in Base64.
```bash

ZmxhZ3thbm9ueW1vdXNfdDBfdGgzX2VuZH0=

```

*[Image: 4]*

## Decoding Base64 and Getting the Flag

We will decode the text using [CyberChef](https://gchq.github.io/CyberChef/).

After decoding it, the flag will appear.

*[Image: 5]*

## Another Way

There is another way to do this by using the `strings` command on the PCAP file. It will show the encoded text.

```bash
strings anonymous.pcap
```
*[Image: 6]*

## Final Flag

The Flag is :

```bash

flag{anonymous_t0_th3_end}

```
