# Entropy

**Category:** Misc | **Difficulty:** Hard (500 pts) | **Flag:** `IIITL{K4l31d05c0p3_M4z3_M4573r_9921_n0_3y35_2535abf3befa}`

## TL;DR

A 51x51 ANSI terminal maze that morphs every ~5 seconds and resets you to the start. The trick: parse the maze walls from xterm-256 color codes, BFS the shortest path, then blast the entire key sequence in one `sendall()`: you literally cannot afford one keystroke per round-trip against a 5-second time limit.

## What We're Given

Just a netcat service:

```
nc 34.131.216.230 1340
```

And a flavor text that, in retrospect, was actually telling us the whole story:

> "Order is a fleeting delusion. The pattern is the cage. The cage is the pattern. Submit to the chaos or define it."

That word "chaos" is doing real work there. The maze doesn't stay still. The "entropy" in the title isn't just aesthetic: the maze is literally changing state on you.

Connecting with `nc` dumps a wall of terminal color codes to your screen. What renders visually is a 51x51 grid of cells, each showing a two-character hex value (`A3`, `7F`, `00`, etc.), colored with a dark or light background. Somewhere in the grid is your player marker (`><`) and a target marker (`▓▓`). Goal: navigate from `(1, 1)` to `(49, 49)`.

## Initial Recon

First thing we did was connect manually and look at what the server was sending. The raw bytes look like:

```
\x1b[48;5;21m\x1b[30mAE\x1b[0m\x1b[48;5;228m\x1b[30m7F\x1b[0m...
```

This is xterm-256 ANSI escape sequences: specifically `\x1b[48;5;<N>m` which sets the **background color** to palette entry `N`. The two-character content after it is either a hex byte, the player `><`, or the target `▓▓`.

Key observation: the background color `N` is what determines walls vs. floors. Dark palette entries are walls, light ones are floors. The hex values shown inside each cell? Decorative noise. That's the "entropy" the title is talking about: every frame they flicker to new random values. They're not encoding the flag or the path; they're just there to look chaotic and tempt you into thinking they matter (more on that in the dead ends section).

We captured raw server output to `raw1.bin` and `full_run.bin` to analyze offline. Parsing the color palette across frames:

- **Walls (dark):** color values 17-24 (blues), 52-60 (purples), 232-240 (grays)
- **Floors (light):** color values 190-191, 214-216, 226-231, 250-251
- **Player:** color 46 (bright green)
- **Target:** color 196 (bright red)

Each frame is about 56 KB and the server sends roughly 2 frames per second. The maze is 51x51 = 2601 cells total.

## The Vulnerability / Trick

Here's where things got interesting. Watching the captured data across frames revealed something the challenge description was hinting at all along:

```
frame 1:  player=(1,1)  initial
frame 10: player=(1,1)  MAZE CHANGED (591 cell flips)
frame 23: player=(1,1)  MAZE CHANGED (590 cell flips)
frame 37: player=(1,1)  MAZE CHANGED (587 cell flips)
```

Every ~13 server frames (~5 seconds of real time), two things happen simultaneously:
1. About 580 out of 2601 cells flip wall-to-floor or floor-to-wall: roughly 22% of the maze rearranges.
2. The player snaps back to `(1, 1)` no matter where they are.

The server header even tells you this is coming: `WARNING: TEXTURE MAP COLLAPSE IN 5s`. It's not a warning you can do much about unless you're fast.

The path from `(1,1)` to `(49,49)` is roughly 96-176 steps depending on the maze layout. At a conservative 80ms per step with one key per round-trip, even the shortest path takes about 8 seconds. That's already longer than the morph cycle. You're mathematically guaranteed to get reset before you finish.

**The fix is obvious once you see it:** don't wait for server acknowledgment after each key. BFS the maze, convert the whole path to a string of `wasd` characters, and blast the entire thing with a single `socket.sendall()`. The server processes them all in sequence from its input buffer. If the path is 96 steps, you send 96 bytes at once. The server eats them in well under a second and you're at the target before the 5-second clock even gets nervous.

This is the "define it" part of the challenge description: you define the path ahead of time and commit to it all at once, rather than reacting step-by-step to the server's chaos.

## Building the Exploit

The winning script (`solve3.py`) has three main parts: a background reader thread, a frame parser, and the BFS + blast loop.

**Background reader thread**: this is crucial. If you try to read-then-send-then-read in a loop, you're constantly fighting socket timeouts and missing frames. Instead, we spawn a thread that just hoovers bytes off the socket as fast as they arrive into a shared buffer:

```python
def reader(s):
    s.settimeout(0.1)
    while running:
        try:
            ch = s.recv(65536)
            if not ch: break
            with buf_lock:
                buf_data += ch
                if len(buf_data) > 2_000_000:
                    buf_data = buf_data[-1_000_000:]  # don't let RAM balloon
        except socket.timeout:
            continue
```

The main thread can snapshot the buffer at any time without blocking. This is what lets us parse "the most recent frame" rather than "whatever happened to arrive just now."

**Frame parser**: each frame starts with the ANSI cursor-home sequence `\x1b[H`. We split the buffer on that, walk backwards through the chunks (newest first), and take the first one that has all 2601 cells:

```python
def parse_latest_frame(buf):
    parts = buf.split(b'\x1b[H')
    for p in reversed(parts):
        if len(p) < 40000:
            continue
        cells = [(int(m.group(1)), m.group(2)) for m in CELL_RE.finditer(p)]
        if len(cells) < W*H:
            continue
        cells = cells[:W*H]
        # ... build grid, find player and target
```

The regex `CELL_RE` pulls out the background color number and the two-char content from each cell's escape sequence. `is_wall(c)` then checks which color range it falls in:

```python
def is_wall(c):
    return (17 <= c <= 24) or (52 <= c <= 60) or (232 <= c <= 240)
```

`0` in the grid means wall, `1` means walkable. Player and target cells are always walkable regardless of their color.

**BFS + blast**: standard breadth-first search from player position to target, returning the move sequence as a list of `w`/`a`/`s`/`d` characters. Then:

```python
keys = ''.join(path).encode()
s.sendall(keys)
```

That's the whole exploit. One line. After sending, we poll the buffer for `IIITL{` appearing in the stream: the server emits it when you reach the target.

**The main loop** keeps retrying: parse the latest frame, BFS it, blast the keys. If a morph hits mid-flight and the player resets, the next iteration grabs a fresh frame and re-plans. In practice it solved on the first attempt.

## Running It

```
$ python3 solve3.py
[*] connected
[attempt 1] player=(1, 1) target=(49, 49)
  path len 96, blasting keys
[FLAG] IIITL{K4l31d05c0p3_M4z3_M4573r_9921_n0_3y35_2535abf3befa}
```

96 keys, sent in one shot. Done. The flag name: "K4l31d05c0p3 M4z3 M4573r" (Kaleidoscope Maze Master): makes sense in hindsight. A kaleidoscope keeps shifting but there's always a pattern if you're fast enough to read it.

## Key Takeaways

**The core lesson: understand your time budget before writing the first line of code.** The moment we saw "morph every 5 seconds + player reset," we should have immediately done the math: path length / send rate > morph interval = guaranteed failure. We didn't, so we burned two script iterations on the slow per-step approach.

**Background reader threads are your friend for interactive sockets.** Anything that streams data at you continuously (games, menus, status updates) will be painful to handle with blocking reads. Spin up a reader thread that just accumulates into a buffer and let your logic work from snapshots. Much cleaner.

**`sendall()` vs one-byte-at-a-time is a massive performance difference.** Python's `socket.send()` may send partial data; `sendall()` guarantees the whole buffer goes. More importantly, batching removes the round-trip latency per key entirely. This is true for any interactive protocol where you have a pre-computed sequence of inputs.

**Decorative noise is a psychological red herring, not a clue.** The hex bytes flickering in each cell looked important. The name "Entropy" made it seem like they were encoding something. We spent real time trying to concatenate them along the path and decode the result. They were random. When a challenge says "entropy" and fills your screen with noise, that *is* the trick: it's trying to distract you from the actual mechanism (wall colors, morph timing).

**Dead ends worth remembering:**

- **Hex bytes along the BFS path:** We sampled 20 cells across 6 frames: values like `AE 79 23 50 69 F0` for a single cell across frames. Pure RNG. Concatenating path bytes gave gibberish.
- **Wrong flag prefix:** `solve.py` was searching for `ictf{` instead of `IIITL{`. Always double-check the flag format at the start. This could have caused us to discard a successful run.
- **Slow per-step navigation with 80ms sleep:** 176 steps × 80ms = ~14 seconds. Morph cycle is ~5 seconds. No amount of BFS optimization fixes a fundamental timing violation.
