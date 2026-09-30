---
name: forensics
description: Forensics CTF: file carving, stego, memory, pcap, disk images, logs, deleted data recovery
---

# Forensics CTF

Layered artifacts. Expect: outer container → inner artifacts → hidden/deleted data → flag. Walk layers methodically; do not skip `file`/`binwalk` on anything.

## Triage (every artifact)

- `file <artifact>`, `binwalk <artifact>`, `exiftool <artifact>`, `strings -a -n4`, `hexdump -C | head`.
- If archive: extract first and inventory every extracted file before deepening.
- If disk/mostly anything with a filesystem: mount read-only (`mount -o ro,loop`) or use `7z x` on images that allow it.

## Classes

**PCAP / network**
- `tshark -r cap.pcap -Y 'http' -T fields -e http.host -e http.request.uri | sort -u`: externalize request flow.
- Follow streams: `tshark -r cap.pcap -qz follow,tcp,ascii,0`.
- Export objects: File → Export Objects in Wireshark, or `tshark --export-objects http,dir`.
- Credentials in clear protocols (FTP/HTTP basic auth/telnet): filter for USER/PASS/Authorization.
- DNS exfil / ICMP: look at subdomain lengths on DNS queries (base-ish strings); ICMP payload content.
- TLS: if keys provided, add to tshark (`-o tls.keys_list`); if a private key arrives inside the capture, carve it.

**Stego (images)**
- `file`, `exiftool` for metadata (comment/description fields).
- `zsteg -a img.png` (PNG LSB); `steghide extract -sf img.jpg` (password often in the description or challenge text).
- `binwalk img.png`; compare header/footer to extension; `pngcheck -vt`.
- Online fallback: CyberChef-style, AperiSolve-class processing per layer; extract per-channel bitplanes with Python/PIL.

**Audio**
- Visualize spectrogram (Audacity-style; in sandbox use `sox` / Python `scipy.signal.spectrogram` and render it); look for morse, DTMF, hidden text in the spectrogram; sonified text.

**Memory dumps**
- `volatility3 -f mem.dmp windows.info` if volatility3 baked in; otherwise install it: `pip install volatility3`.
- List processes, network (`netscan`), files (`filescan`), cmdlines (`cmdline`), dump the suspicious process address space; look for user/password registry hives and stored creds.

**Disk images**
- `7z x img.img` or `guestmount`/`mount -o ro,loop`.
- Look in: recently deleted inode slack (`photorec` / `extundelete`), bash history, browser profiles (`places.sqlite`, cookies), mail spools, `~/.ssh`, docker layers.
- Deleted-files recovery: `photorec` and `foremost -o out/`.

**Logs**
- Build a timeline first; then hunt anomalies: failed logins, new users, scheduled tasks, odd processes, unexpected outbound IPs.
- Remember that flags might be in: timestamps (encoded), usernames, user-agent strings, error messages, base64 strings, quoted-printable in mail.

**Files / archives**
- `7z x` handles almost everything; use it before custom extractors.
- Password-protected archives: `john` with the archive hash (`zip2john`, `rar2john`) → crack against wordlist in /home/pentester/tools/wordlists (rockyou).
- Office docs: `oletools` (`olevba` for macros), embedded objects, external-template injection indicators.
- PDF: `pdfid`, `pdf-parser`, embedded `/JavaScript`, `/OpenAction`, embedded files.

**USB / HID captures**
- Keystroke logs: map per spec (often keyboard capture in pcap), replay with a script; don't transcribe by hand.

## Deep dives (load on demand)

`forensics-stego`, `forensics-stego-advanced` (FFT/SSTV/DotCode), `forensics-disk`, `forensics-disk-memory` (Volatility/MFT), `forensics-disk-recovery` (LUKS/PRNG), `forensics-linux`, `forensics-windows` (evtx/registry/SAM), `forensics-network` (pcap/TLS keys), `forensics-network-advanced` (timing/USB HID), `forensics-signals` (VGA/hardware), `forensics-3d-printing` (G-code).

## Verification discipline

- Extract candidate string, regex-check format, then re-run extraction end to end from the original artifact with your solver script (the writeup reuses that script). If the flag only appears when you manually clicked, automate that click before submitting.
