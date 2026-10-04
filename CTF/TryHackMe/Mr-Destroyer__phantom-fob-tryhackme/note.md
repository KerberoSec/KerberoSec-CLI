# Phantom Fob: Technical Notes

Raw reverse-engineering notes for the CAN bus challenge.

- **Target:** `10.49.141.64`
- **Author:** mr-destroyer/zim

---

## 1. Services

| Port | Service | Notes |
|------|---------|-------|
| 8080 | Flask/Werkzeug 3.1.8 (Python 3.12.3) | "Instrument Cluster" dashboard |
| 29536 | socketcand | SocketCAN-over-TCP daemon, default interface `vcan0` |
| 22 | SSH | not used |

Full port scan:

```
nmap -Pn -p- --min-rate 4000 -T4 10.49.141.64
```

```
PORT      STATE SERVICE
22/tcp    open  ssh
8080/tcp  open  http-proxy
29536/tcp open  unknown
```

The challenge text says "you're plugged into the CAN bus": port `29536` is
socketcand, which is the plug. That's the intended entry point, not the web app.

---

## 2. The web app (port 8080)

Three routes:

| Route | Method | Purpose |
|-------|--------|---------|
| `/` | GET | Instrument cluster UI (`index.html`) |
| `/events` | GET | Server-Sent Events stream of vehicle state |
| `/press` | POST | Key fob buttons |

`/events` payload:

```json
{"locked": true, "immob": true, "horn": false, "speed": 33.97,
 "turn": 0, "fps": 226, "seen_ids": 2048, "flag": ""}
```

`/press` accepts `{"button": "..."}`. Valid values are **only**:

- `LOCK`
- `HORN`
- `IMMOB_ARM`
- `IMMOB_DISARM`

Unknown names return `{"msg":"no such control","ok":false}` with HTTP **400**
(valid names return HTTP 200). A fuzz of ~57k candidate names found no hidden
control: there is genuinely no unlock button, exactly as advertised.

Note `fps: 226`: that is the real bus frame rate, which confirms the web app
is itself a bus listener.

---

## 3. socketcand protocol

The daemon speaks a tiny line protocol over TCP:

```
server → < hi >
client → < open vcan0 >
server → < ok >
client → < rawmode >
server → < ok >
```

Frames then stream as:

```
< frame <ID_HEX> <sec.usec> <DATA_HEX_UPPERCASE> >
```

Injecting is done with **lowercase**, space-separated hex bytes:

```
< send 421 8 1e e5 2d 99 b6 59 3f 76 >
```

Notes / gotchas:

- No colons. `< open vcan0 >` and `< rawmode >`: not `< open: vcan0 >`.
- Injected frames loop back to every connected client (verified with a
  throwaway `7FF DEADBEEF00112233` frame), so injection is observable.
- Multiple connections are fine: one to watch, one to inject.

---

## 4. Bus inventory

| ID | Rate | Shape | Role |
|----|------|-------|------|
| `0x0E9` | ~13/s | 16-bit counter + random | noise |
| `0x37C` | ~20/s | byte0 ∈ {0,1,2} | unknown / minor |
| `0x39E` | ~5/s | `dd ii hh A5 00 00 00 00` | **vehicle state** |
| `0x421` | per press | see below | **key fob** |
| `0x47B` | ~13/s | 16-bit counter + random | noise |
| `0x4C2` | ~20/s | random16 + countdown | noise |
| `0x4E2` | ~1.3/s | random | noise |
| `0x4F9` | ~2.6/s | 16-bit counter + random | noise |
| `0x565` | ~1.1/s | `rand16 <ctr8> 00 00 00 00 00` | **rolling-code source** |
| `0x59E` | ~13/s | 16-bit counter + random | noise |
| `0x600` | ~20/s | 16-bit counter + random | noise |

### ID `0x39E`: vehicle state

```
01 01 00 A5 00 00 00 00
│  │  │  └── constant 0xA5
│  │  └───── horn
│  └──────── immobiliser (01 = armed)
└─────────── doors (00 = UNLOCKED, 01 = LOCKED)
```

The dashboard's `locked` / `immob` / `horn` fields are driven by this ID. If you
flood `39E 000000A500000000` onto the bus the dashboard *displays* UNLOCKED, but that only fools the display. The real car never changes state, and **no flag
is released**. `39E` is a status broadcast, not a command channel.

---

## 5. The fob frame: ID `0x421`

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

### Commands

| Button | `b6` |
|--------|------|
| Lock | `0xCD` |
| Horn | `0x3F` |
| Immobiliser Arm | `0xBF` |
| Immobiliser Disarm | `0x53` |

There is **no unlock command** on the fob: that is the whole point of the
challenge.

### Fields

- `b2 b3 = 2D 99`: vendor constant
- `b7 = 76`: vendor constant
- `b5`: rolling counter, increments by exactly 1 per press, wraps at 256
- `b6`: command byte
- `b0`, `b4`: **code**, a function of the rolling value broadcast on `0x565`
- `b1`: **`b1 = counter XOR key(565.b2) XOR command`**

---

## 6. Where the "uncopyable" code comes from

The manufacturer's claim is that the unlock command "can't be copied": a
rolling-code defence. The rolling value is **broadcast in the clear on `0x565`**:

```
1734AB0000000000
34DAAC0000000000
C6C5AD0000000000
B286AE0000000000
     └── byte2 increments by 1 per 0x565 frame (~1.1/s)
```

Grouping presses by the `0x565` byte2 value seen at press time:

- `(b0, b4)` is a **pure function of `565.b2`**: 150 groups, **0 impure**.
  It does *not* depend on the command.
- `(b0, b1, b4)` is **not** pure in `b2`: `b1` varies inside a window.
- Across different capture sessions the same `b2` gives *different* codes, so the
  code actually tracks the **full `0x565` counter**, not just its low byte. The
  code is therefore only valid **while `b2` holds**.

### Recovering the key

Inside a window, `b1 = counter XOR K` with `K` constant. Collecting presses of
different commands that share a `b2` value shows `K = key(b2) XOR command`:

```
b2=AD   cmd 3F → K=86    86 ^ 3F = B9
        cmd CD → K=74    74 ^ CD = B9   ✓

b2=B0   cmd 53 → K=5A    5A ^ 53 = 09
        cmd BF → K=B6    B6 ^ BF = 09   ✓
        cmd CD → K=C4    C4 ^ CD = 09   ✓
```

Therefore:

```
b1 = counter XOR key   XOR command
```

and the key is trivially recoverable from **any single captured frame**:

```
key = b1 XOR counter XOR command
```

---

## 7. Forging

From one captured fob frame you learn `code = (b0, b4)` and `key`. You can then
mint a frame for **any** `(counter, command)`:

```
b1' = counter' XOR key XOR command'

frame = [b0] [b1'] [2D] [99] [b4] [counter'] [command'] [76]
```

### Two things that make this fail if you get them wrong

1. **The counter and `b1` are linked.** Bumping `b5` without recomputing `b1`
   invalidates the frame. This is what made naive "change the command byte"
   forgeries fail.
2. **The code is only valid inside the current `565` window** (~0.9 s). Capturing
   a frame, sleeping, then sending it is already too late: `b2` has advanced.
   Capture, derive, and send inside the same window.

A third red herring: because the code depends on a *live* broadcast and not on
the frame contents, `(b0, b4)` is **not** a deterministic function of
`(counter, command)`: the same counter appears with different codes across
windows. That rules out any static table or simple checksum/MAC hunt.

---

## 8. Result

Injecting the forged unlock frame released the flag onto the bus:

```
THM{C4r_H4cking_is_kind4_c00l}
```
