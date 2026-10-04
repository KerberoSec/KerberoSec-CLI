# Call to Action: PyExfil Community Contributions

PyExfil is an open research project. If you work in offensive security, red teaming, or covert channel research, there are concrete ways to help. Pick a task, open a PR, and link back to this file.

Before contributing, read [DOCUMENTATION.md](DOCUMENTATION.md) for the module writing guide and [ARCHITECTURE.md](ARCHITECTURE.md) for the class hierarchy reference.

---

## 1. Module Conversions (highest priority)

The modules below still use the old ad-hoc pattern (`Send()` function + `Broker` class or raw script). They need to be converted to inherit the right base class from `pyexfil/includes/base.py`. This makes them testable, stoppable, and consistent with the rest of the framework.

**How to convert a module:**
1. Identify the correct pillar (`NetworkModule`, `CommModule`, `PhysicalModule`, `StegaModule`).
2. Wrap the existing send logic in `_send_impl(self, data, **kwargs)`.
3. Wrap the existing listen/broker logic in `_listen_impl(self, callback, **kwargs)` and check `self._stop_event`.
4. For `CommModule`, also implement `_broadcast_impl`.
5. For `StegaModule`, implement `_encode_impl` and `_decode_impl` instead.
6. Set `MODULE_NAME` and `PROTOCOL` class attributes.
7. Add a test in `tests/`.

### Network modules → `NetworkModule`

| Module | File | Notes |
|--------|------|-------|
| ICMP exfiltration | `pyexfil/network/ICMP/icmp_exfiltration.py` | Raw socket, needs root; use `_icmp_checksum` from `general.py` |
| NTP timestamp exfil | `pyexfil/network/NTP/ntp_exfil.py` | Client-only; listener is a stub |
| QUIC client | `pyexfil/network/QUIC/quic_client.py` | Depends on `aioquic` |
| QUIC server | `pyexfil/network/QUIC/quic_server.py` | Depends on `aioquic` |
| POP3 client | `pyexfil/network/POP3/pop_exfil_client.py` | Uses `imaplib`/`poplib` |
| POP3 server | `pyexfil/network/POP3/pop_exfil_server.py` | Fake POP3 server |
| Slack client | `pyexfil/network/Slack/slack_client.py` | Needs migration to `slack-sdk` (drop `slackclient`) |
| Slack server | `pyexfil/network/Slack/slack_server.py` | Needs migration to `slack-sdk` |
| SpoofIP client | `pyexfil/network/SpoofIP/spoofIPs_client.py` | Raw IP with Scapy |
| SpoofIP server | `pyexfil/network/SpoofIP/spoofIPs_server.py` | Raw IP with Scapy |
| DNSQ | `pyexfil/network/DNSQ/__init__.py` | DNS query covert channel |
| Draft (HTTPS Draft) | `pyexfil/network/Draft/__init__.py` | Experimental HTTPS channel |
| UDP Source Port | `pyexfil/network/UDP_SPort/__init__.py` | Encodes data in UDP source port field |

### Comm modules → `CommModule`

| Module | File | Notes |
|--------|------|-------|
| ARP Broadcast | `pyexfil/Comm/ARPBroadcast/communicator.py` | Uses Scapy ARP; `_broadcast_impl` is the key method |
| AllJoyn | `pyexfil/Comm/AllJoyn/__init__.py` | UDP multicast over AllJoyn protocol |
| GQUIC | `pyexfil/Comm/GQUIC/__init__.py` | Google QUIC-based C2 |
| MDNS | `pyexfil/Comm/MDNS/__init__.py` | mDNS multicast covert channel |
| cert_exchange | `pyexfil/Comm/cert_exchange/__init__.py` | TLS certificate body as C2 channel |
| icmp_ttl | `pyexfil/Comm/icmp_ttl/__init__.py` | TTL field encodes data |
| packet_size | `pyexfil/Comm/packet_size/__init__.py` | Packet size encodes data |

### Physical modules → `PhysicalModule`

| Module | File | Notes |
|--------|------|-------|
| Audio listener | `pyexfil/physical/audio/listener.py` | Pair to `audio/exfiltrator.py`; override `_receive_impl` |
| QR decoder | `pyexfil/physical/qr/decoder.py` | Pair to `qr/generator.py`; override `_receive_impl` |
| WiFi Payload client | `pyexfil/physical/wifiPayload/client.py` | Beacon frame payload |
| WiFi Payload server | `pyexfil/physical/wifiPayload/server.py` | Beacon frame sniffer |
| 3.5mm Jack | `pyexfil/physical/35jack/__init__.py` | Audio jack covert channel |
| Ultrasonic | `pyexfil/physical/ultrasonic/__init__.py` | Ultrasonic frequency exfil |

### Stega modules → `StegaModule`

| Module | File | Notes |
|--------|------|-------|
| Braille | `pyexfil/Stega/braille/txt2pdf/txt2pdf.py` | Encodes data as braille in a PDF; implement `_encode_impl` / `_decode_impl` |
| ConvertToText (BIP39) | `pyexfil/Stega/ConvertToText/bip39_encode.py` | Encodes binary as BIP39 word list |
| DataMatrix | `pyexfil/Stega/datamatrix/__init__.py` | 2D barcode steganography |
| PNG transparency | `pyexfil/Stega/png_transparency/__init__.py` | Alpha channel covert channel |
| Zipception | `pyexfil/Stega/zipception/__init__.py` | Data hidden in nested ZIP metadata |
| Video dict | `pyexfil/Stega/video_dict/vid_to_dict.py` | Frame-index dictionary encoding |

---

## 2. New Module Ideas

These channels are not yet implemented. Implementations must follow the class hierarchy from day one.

| Channel | Pillar | Description |
|---------|--------|-------------|
| DNS-over-HTTPS (DoH) | `NetworkModule` | Exfil encoded in DoH POST requests |
| HTTP/2 header fields | `NetworkModule` | Data in pseudo-headers or HPACK table |
| BGP communities | `NetworkModule` | Encode data in BGP community attributes |
| SMTP header injection | `NetworkModule` | Covert data in custom mail headers |
| LDAP queries | `CommModule` | C2 via crafted LDAP search requests |
| Bluetooth LE advertisements | `PhysicalModule` | BLE manufacturer data field |
| IEEE 802.11 probe requests | `PhysicalModule` | SSID field or IE data |
| IR LED (Raspberry Pi) | `PhysicalModule` | Infrared blaster as optical channel |
| PDF metadata | `StegaModule` | Hidden data in PDF XMP or object streams |
| MP3 ID3 tags | `StegaModule` | Payload in audio file metadata |
| JPEG EXIF fields | `StegaModule` | GPS or comment fields as covert channel |

---

## 3. Test Coverage

Every module that has been converted needs at minimum:

- Instantiation test (correct `MODULE_NAME`, `MODULE_TYPE`)
- `send()` returns `bool`
- `listen(blocking=False)` starts a live thread
- `stop()` terminates the thread cleanly within 5 seconds

Tests live in `tests/`. See [DOCUMENTATION.md](DOCUMENTATION.md) for a test skeleton.

---

## 4. Python 3 Modernisation

Modules not yet touched by the conversion effort may still contain Python 2 idioms. Things to fix:

- `print` statements → `print()` calls
- `except ExcType, e:` → `except ExcType as e:`
- `xrange` → `range`
- `urllib2` → `urllib.request` / `urllib.error`
- `from StringIO import StringIO` → `from io import BytesIO`
- `long` literals (`2208988800L`) → plain integers
- `import thread` → `import threading`
- `.next()` → `next()`
- `PyCrypto` imports → `PyCryptodome` (same import path, different package)

---

## 5. Documentation

- Add a per-module `README.md` inside each module folder describing the covert channel, its detection risk, required privileges, and a usage example.
- Update the module table in [ARCHITECTURE.md](ARCHITECTURE.md) when a conversion is complete.
- Cross-link new modules in [CALL_TO_ACTION.md](CALL_TO_ACTION.md) by removing them from the conversion list.

---

## Getting Started

1. Fork the repository.
2. Pick one module from the lists above.
3. Convert it following [DOCUMENTATION.md](DOCUMENTATION.md).
4. Add tests in `tests/`.
5. Open a pull request referencing the module name in the title.

Questions? Open an issue.
