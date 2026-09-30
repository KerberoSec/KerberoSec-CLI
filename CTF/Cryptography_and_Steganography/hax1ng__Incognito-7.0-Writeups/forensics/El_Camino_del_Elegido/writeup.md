# El Camino del Elegido

**Category:** Forensics | **Difficulty:** 250 pts | **Flag:** `iiitl{1h3re_i5_4lways_4_p41h_w4i1ing_t0_b3_d1scov3red}`

## TL;DR

A 1-million-node graph hides a secret path through nodes whose IDs are multiples of 1337 (the determinant of a matrix given in `echo.png`). The edge weights between consecutive chosen nodes are ASCII values that spell the flag.

## What We're Given

The challenge directory contains four artifacts:

- **`rules.txt`**: a short poem, the "flavor text" for the challenge
- **`echo.png`**: an image showing a 3x3 matrix M
- **`nodes.json`**: a 458 MB graph with 1,000,000 nodes on a 1000×1000 coordinate grid
- **The directory name itself**: `YSBtb2QgYiA9IDA`

That last one is easy to miss. It's sitting right there as the folder name, but most solvers probably never thought to look at it.

The challenge description's flavor text (from `rules.txt`) reads:

```
In the lattice of six-fold grace, a million souls reside.
Most wander lost in fractured space, where false connections hide.

The path of triumph, a slender thread, is not for all to see.
It follows a rhythm, a constant creed.

A numerical echo, a hidden key, unlocks the narrow way.
Ignore the noise, and you will be free, to see the light of day.
```

Three phrases immediately stand out: "lattice of a million souls" (the graph), "numerical echo, a hidden key" (the matrix), and "a constant creed" (a modular condition). The poem is basically giving us the solve path if we read it right: we just didn't know what the numbers meant yet.

## Initial Recon

### The Directory Name

Before touching any files, let's look at that folder name. `YSBtb2QgYiA9IDA` looks like base64 (alphanumeric, length is a multiple of 4, ends cleanly).

```bash
$ echo "YSBtb2QgYiA9IDA" | base64 -d
a mod b = 0
```

There it is: the filtering condition. Some `a mod b = 0`. We need to figure out what `a` and `b` are.

### The Matrix Image

![Matrix M with values [[7,233,95],[0,191,-4],[7,233,96]]](echo.png)

The image shows:

```
    ⎛  7   233   95 ⎞
M = ⎜  0   191   -4 ⎟
    ⎝  7   233   96 ⎠
```

The challenge calls it an "echo" and describes it as a "hidden key." The natural thing to compute for a matrix is its determinant. Let's do that via cofactor expansion along the first row:

```
det(M) = 7 * (191*96 - (-4)*233)
       - 233 * (0*96 - (-4)*7)
       + 95 * (0*233 - 191*7)

       = 7 * (18336 + 932) - 233 * (0 + 28) + 95 * (0 - 1337)
       = 7 * 19268 - 233 * 28 + 95 * (-1337)
       = 134876 - 6524 - 127015
       = 1337
```

**1337.** As in "leet." That's not an accident: that's the challenge authors telling you exactly what number to use. Combined with the base64 hint `a mod b = 0`, the condition we need is:

```
node_id % 1337 == 0
```

### The Graph

`nodes.json` is 458 MB: not something you want to eyeball manually. Each node entry looks like:

```json
{
  "id": 42,
  "coords": [x, y],
  "neighbors": [
    {"to": 17, "weight": 105},
    {"to": 83, "weight": 73},
    ...
  ]
}
```

Nodes sit on a 1000×1000 grid and most have between 7-12 neighbors. The poem says "six-fold grace" (likely 6-connectivity base) plus diagonal and bonus connections to create the noise.

Crucially, 10 nodes in the entire graph have **exactly 12 neighbors**: slightly more connected than the rest. These turn out to all satisfy `node_id % 1337 == 0`. That's one of the signals pointing toward the right modulus if the determinant approach didn't tip you off.

## The Vulnerability / Trick

This is a **hidden-path-in-a-graph** challenge. The trick has three layers:

1. **Finding the key number (1337)**: via the matrix determinant in `echo.png`
2. **Understanding the filter condition**: via the base64-encoded directory name (`a mod b = 0`)
3. **Reading the flag**: the edge weights between consecutive 1337-multiples encode ASCII characters

The "million souls" in the graph are noise. The real path threads through exactly 55 nodes: `1337, 2674, 4011, ..., 73535` (multiples of 1337 from 1×1337 to 55×1337). These 55 nodes form a linear chain: each one connects to the next multiple of 1337 with an edge whose weight is an ASCII character code.

Why does this work? Because the graph was constructed that way intentionally. The challenge designers built a massive graph, hid a chain of 55 specific nodes inside it, and used the determinant of a matrix as a "key" to identify which nodes matter. The other ~999,945 nodes are pure distraction.

## Building the Exploit

The solve script needs to:

1. Parse the 458 MB JSON (the slow part: stream it if you can)
2. Filter nodes where `node_id % 1337 == 0`
3. Sort those nodes by ID to get them in order (1337, 2674, ...)
4. For each consecutive pair, find the edge between them and read its weight
5. Convert weights to ASCII characters

Here's the core logic:

```python
import json

# Load the graph: this takes a while with 1M nodes
with open('nodes.json') as f:
    graph = json.load(f)

# Step 1: build a lookup dict for fast neighbor access
node_map = {node['id']: node for node in graph}

# Step 2: find all chosen nodes (id % 1337 == 0)
chosen = sorted(
    [node['id'] for node in graph if node['id'] % 1337 == 0]
)
# chosen = [1337, 2674, 4011, ..., 73535]: exactly 55 nodes

# Step 3: walk the chain and read edge weights
flag_chars = []
for i in range(len(chosen) - 1):
    src_id = chosen[i]
    dst_id = chosen[i + 1]
    
    src_node = node_map[src_id]
    
    # Find the edge from src to dst
    for edge in src_node['neighbors']:
        if edge['to'] == dst_id:
            flag_chars.append(chr(edge['weight']))
            break

flag = ''.join(flag_chars)
print(flag)
```

Breaking down the key parts:

- **`node['id'] % 1337 == 0`**: this is the filter. We're applying the `a mod b = 0` condition from the directory name, using 1337 (det(M)) as our `b`.
- **`sorted(...)`**: we sort ascending so we traverse the chain in order. The flag is encoded sequentially from node 1337 onward.
- **`chr(edge['weight'])`**: edge weights are ASCII codes. `chr(105)` is `'i'`, `chr(116)` is `'t'`, `chr(108)` is `'l'`, `chr(123)` is `'{'`, and so on.

The first few weights in the chain: `105, 105, 105, 116, 108, 123, ...` which decodes to `iiitl{...`: already looks right before we even finish.

The chain runs from node 1337 (= 1337 × 1) to node 73535 (= 1337 × 55). Fifty-five nodes, fifty-four edges, fifty-four ASCII characters. That's exactly the length of our flag.

## Running It

```
$ python3 solve.py
iiitl{1h3re_i5_4lways_4_p41h_w4i1ing_t0_b3_d1scov3red}
```

Note: loading `nodes.json` takes a noticeable amount of time due to its size (~458 MB). If you're impatient, you can use `ijson` to stream the file instead of loading it all at once, but given we only need to make one pass, the simple approach works fine.

## Key Takeaways

**The meta-puzzle structure here is worth studying.** The challenge gives you three separate clues pointing to the same answer, and you need to connect them:

- The poem hints at "a constant creed" → there's a modular pattern
- The matrix image → compute det(M) = 1337 → that's the modulus
- The folder name in base64 → `a mod b = 0` → confirms the filter type

Neither clue alone is sufficient. Each one tells you part of the story. This is a classic CTF pattern: scatter breadcrumbs across multiple artifacts and let the solver piece them together.

**Don't ignore metadata.** The directory name containing the base64 hint was hiding in plain sight. Always check filenames, folder names, metadata fields, and anything that looks like it might be encoded. `file`, `exiftool`, and a quick base64 decode attempt on any suspicious string are reflexes worth building.

**For graph challenges:** when a graph has 1M nodes, brute-force search is off the table. You need a filter. The challenge always gives you that filter: your job is to find it. Here, the filter was "multiples of 1337," derived from two external clues. The graph structure itself (10 nodes with 12 neighbors) was a secondary confirmation, but not the primary signal.

**1337 as a CTF constant:** if you ever see "leet" spelled out in a CTF, or a calculation that lands on 1337, treat it as a deliberate wink from the challenge author. It almost always means something.
