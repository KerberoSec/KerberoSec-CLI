# Arena Snapshots

Remote: `nc REDACTED` (challenge host:port)

Custom 24-slot arena (`0x98` bytes/slot: 8-byte header + `0x90` payload).
Commands: `BUF`, `VIEW`, `PATCH`, `DROP`, `JOB`, `SNAP`, `ROLLBACK`, `RUN`, `QUIT`.

`JOB` can only create echo jobs (type `ASG` / `0x415347dc`) with a path that
cannot contain `/` or `flag`. `RUN` of type `0x4153b0d8` with path `/bin/sh`
spawns an interactive shell and dups the flag memfd to a high fd.

**Bug:** `SNAP` saves slot headers *and* payloads, but `ROLLBACK` only restores
used/type/gen/freelist and then bumps the epoch. Payloads are left as-is.

**Exploit:**
1. `JOB hello` then `SNAP`.
2. `DROP` + empty `BUF` on the same slot (payload leftover is still the job).
3. `VIEW` the buffer, invert the job hash (splitmix64) to recover the 64-bit secret.
4. `PATCH` a forged shell job (valid hash + FNV MAC) over the buffer.
5. `ROLLBACK` restores type=JOB / original gen; payload stays forged.
6. Forge a handle with `epoch+1` (XOR packing is not keyed) and `RUN`.
7. Read `/memfd:as-flag`.

Flag: `ASIS{SN4PSH07_SL33P_R0LB4CK_R3P347_b027d27dc0834f9f}`
