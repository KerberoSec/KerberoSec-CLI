# After The Swarm

**Category:** pcap forensics **File:** `mirai_revenge.pcap` (1.3GB, 18M packets, ~8h9m of capture)

## tl;dr

```
grodno{armv6l_51370_50178_11_13_4_6}
```

## First problem: the file is just _big_

Before touching the actual puzzle I had to deal with the fact that this pcap is enormous: 18 million packets, 1.3GB, spanning about 29,372 seconds of traffic. `tshark` with a display filter tries to fully dissect every single packet, and on a file this size that's a death sentence (multiple runs got killed by the time limit before finishing).

The fix was to stop asking Wireshark to _understand_ every packet and just ask `tcpdump` to _grep_ for the ones I cared about first, using raw BPF filters. `tcpdump -r file.pcap 'tcp port X'` doesn't dissect anything, it just matches bytes, so it tears through the whole file in a couple of seconds. Only after narrowing down to a small pcap did I bring `tshark` back in to actually parse fields.

Also handy: background long-running jobs with `setsid ... &` instead of a plain `&`. Each tool call in my sandbox is its own process group, so a backgrounded job started with a bare `&` gets reaped the moment the call returns. `setsid` detaches it properly so I could kick something off, check back a minute later, and it'd still be chugging along.

## Stage 1: find the wave

The challenge wants "the start of the first mass propagation wave on 8081/tcp." I pulled every packet touching port 8081 and looked at the very first one:

```
tcpdump -r mirai_revenge.pcap -w port8081.pcap 'tcp port 8081'
```

Turns out almost the _entire_ capture (1.37GB of the 1.38GB file) is 8081 traffic: this device spends basically its whole life scanning. The very first 8081 packet is frame **2971**, timestamp `2019-02-28 19:50:48.186215` (17.32s into the capture): a burst of SYNs to a couple hundred distinct IPs, all with the same source port, fired off in rapid-fire succession. That's the moment the bot binary finishes executing and kicks off its scanner: the start of the wave.

## Stage 2: the "only" HTTP object

This is where it got confusing for a while. Before the wave even starts, the device is already busy hammering `134.209.72.171:80` for architecture binaries: classic Mirai loader behavior, trying every arch until one actually executes:

```
GET /mips, /mipsel, /sh4, /x86, /armv7l   ← all before the wave starts
GET /armv6l, /i686, /powerpc, /i586, /m68k, /sparc, /armv4l, /armv5l, /440fp
                                            ← all technically *after* t=17.32s
```

That's nine requests after the wave start, not one, so "the only HTTP object" clearly isn't just "everything with a later timestamp." I confirmed with a whole-file byte-level scan (`tcp[...] = 0x47455420` for `"GET "` at the payload offset, again via BPF so it finishes in seconds instead of hours) that these 14 requests are genuinely _all_ the HTTP requests in the entire 8-hour capture. Nothing hides later in the file.

The trick was to also look at the 4554/tcp C2 traffic in parallel. There's a first C2 connection attempt (source port 50174) that starts basically the same instant as the wave, but it just retries a SYN forever and never gets a reply. The _first connection that actually completes a handshake and exchanges data_ is on source port 50178, and its SYN doesn't go out until right after the `/armv6l` request. Every other architecture download (`i686` onward) happens _after_ that control session is already established.

So the real ordering is:

```
wave starts (17.32s)
  → GET /armv6l           (the one request sitting in the gap)
    → SYN on 50178 → handshake completes → first real C2 data
      → GET /i686, /powerpc, ... (everything else, too late to matter)
```

`/armv6l` is the only HTTP object that lands in the window between the wave starting and the first successful control-exchange: which is exactly what the challenge is asking for. Source port of that request: **51370**.

## Stage 3: the control session

Pulling the 50178↔4554 stream out of `port4554.pcap` gives a clean little handshake-then-chat pattern:

```
SYN → SYN/ACK → ACK
client → 11 bytes   (first client payload)
server → 13 bytes   (first server payload)
   ... time passes ...
server →  4 bytes   (second server payload)
server →  6 bytes   (third server payload)
```

Same source/destination pair keeps reappearing every ~60s for the rest of the capture (looks like a periodic beacon), but we only need the _first_ exchange.

## Putting it together

|Piece|Value|
|---|---|
|Wave start|frame 2971, `19:50:48.186215`|
|Late HTTP object|`armv6l`|
|HTTP request source port|`51370`|
|C2 session source port|`50178`|
|First client payload|`11` bytes|
|First 3 server payloads|`13`, `4`, `6` bytes|

```
grodno{armv6l_51370_50178_11_13_4_6}
```

## Lessons for next time

- On huge pcaps, **BPF filters via tcpdump beat display filters via tshark** by orders of magnitude: dissection is the expensive part, not I/O.
- `setsid cmd &` to survive across sandboxed tool calls when a job needs more than a minute or two.
- When a puzzle says "the only X after Y," don't assume Y is the most obvious/loudest event: check what _comes right after X_ too. The real constraint here was defined by the _next_ event (the C2 session), not just a raw timestamp cutoff.
