# **Eavesdrop: 300 pts**

### Key points

- Packet Analysis

---

## **Contents**

- [Overview](#overview)
- [Solution](#solution)
- [Flag](#flag)

---

## Overview

### Description

> Download this packet capture and find the flag.

We are given a packet capture. The hint says that the capture includes a chat conversation and a file transfer.

## Solution

Let's open the packet capture in Wireshark.

Opening `Statistics > Protocol Hierarchy`, we see there is some TCP data transmitted. Right-click the data and `Apply as Filter > Selected`.

Right-click the first packet and `Follow > TCP Stream`. The following conversation is revealed:

```
Hey, how do you decrypt this file again?
You're serious?
Yeah, I'm serious
*sigh* openssl des3 -d -salt -in file.des3 -out file.txt -k supersecretpassword123
Ok, great, thanks.
Let's use Discord next time, it's more secure.
C'mon, no one knows we use this program like this!
Whatever.
Hey.
Yeah?
Could you transfer the file to me again?
Oh great. Ok, over 9002?
Yeah, listening.
Sent it
Got it.
You're unbelievable
```

Looks like one person is sending a file with an encrypted message to another person. They conveniently exposed the decrypt command:

```console
$ openssl des3 -d -salt -in file.des3 -out file.txt -k supersecretpassword123
```

Let's check port 9002. Apply the following filter:

```ts
tcp.port == 9002;
```

Right-click and follow the TCP stream again.

The default ASCII dump shows a salted encrypted message, as we expected:

```
Salted__..5C.C}H.......Fy..P;U.v..aY);.|.Q..\J.L
```

But we cannot simply copy that! Wireshark replaces non-ASCII characters as `'.'`, so to ensure we copy everything correctly, let's copy the hex dump:

```
53 61 6c 74 65 64 5f 5f  bf 1f 35 43 c1 43 7d 48   Salted__ ..5C.C}H
9a c5 c7 00 f4 80 91 46  79 9c 9d 50 3b 55 14 76   .......F y..P;U.v
a3 f0 61 59 29 3b ee 7c  9e 51 83 fb 5c 4a 18 4c   ..aY);.| .Q..\J.L
```

Use a hex editor to insert these bytes and save it to `file.des3`.

Now simply run the provided command and read the output file:

```console
$ openssl des3 -d -salt -in file.des3 -out file.txt -k supersecretpassword123
*** WARNING : deprecated key derivation used.
Using -iter or -pbkdf2 would be better.
bad decrypt
139634175546688:error:06065064:digital envelope routines:EVP_DecryptFinal_ex:bad decrypt:../crypto/evp/evp_enc.c:610:
$ cat file.txt
picoCTF{nc_73115_411_0ee7267a}
```

Looks like we got a bad decrypt, but we get the flag anyways.

---

## Flag

> `picoCTF{nc_73115_411_0ee7267a}`
