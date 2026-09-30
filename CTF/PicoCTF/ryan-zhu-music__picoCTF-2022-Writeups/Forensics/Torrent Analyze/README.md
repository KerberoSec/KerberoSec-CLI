# **Torrent Analyze: 500 pts**

### Key points

- Packet Analysis
- BitTorrent protocol

---

## **Contents**

- [Overview](#overview)
- [Solution](#solution)
- [Flag](#flag)

---

## Overview

### Description

> SOS, someone is torrenting on our network. One of your colleagues has been using torrent to download some files on the company’s network. Can you identify the file(s) that were downloaded? The file name will be the flag, like `picoCTF{filename}`.

BitTorrent is a communications protocol that enables peer-2-peer file sharing (uploading, downloading, etc.).

The [article](https://www.techworm.net/2017/03/seeds-peers-leechers-torrents-language.html) in the hint may be of some use. I am not going to explain the BitTorrent protocol in depth here, but you can do some research on your own.

---

## Solution

Open the packet capture in WireShark.
Make sure the BT-DHT protocol is enabled: Analyze > Enabled Protocols > BT-DHT

If you look around in the packets, you will find packet 332 contains a movie download. While this is not important, it does give us a clue for what we are looking for. If you search up the `info_hash` parameter, you will find a Pirate site with the movie in the packet. **DO NOT VISIT THE PIRATE SITE!**

The author of the challenge wouldn't include a pirate site as part of the solution.

Let's see if there are any other `info_hash`es for us to find. Apply the filter:

```ts
bt - dht.bencoded.string == "info_hash";
```

Sure enough, there are more. Looking each of them up, one of them is in fact a `.iso` file, as the hint suggests.

The hash: [`e2467cbf021192c241367b892230dc1e05c0580e`](https://linuxtracker.org/index.php?page=torrent-details&id=e2467cbf021192c241367b892230dc1e05c0580e)

---

## Flag

> `picoCTF{ubuntu-19.10-desktop-amd64.iso}`

---
