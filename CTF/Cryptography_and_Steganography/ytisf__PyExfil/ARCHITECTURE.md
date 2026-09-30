# PyExfil Module Architecture

## Class Hierarchy

```
PyExfilModule          (abstract root: pyexfil/includes/base.py)
├── NetworkModule      socket/protocol exfiltration (DNS, ICMP, HTTP, FTP…)
├── CommModule         bidirectional C2 over network (ARP, NTP body, MDNS…)
├── PhysicalModule     one-way physical channel (audio tones, QR codes, ultrasonic…)
└── StegaModule        file-in / file-out steganography (PNG pixels, braille, DataMatrix…)
```

Every concrete module inherits from one of the four pillars, which in turn inherits from `PyExfilModule`.

---

## Public API

All modules expose the same surface regardless of pillar:

| Method | Description |
|--------|-------------|
| `send(data, **kwargs)` | Transmit data through the channel |
| `broadcast(data, **kwargs)` | One-to-many send (falls back to `send` if not overridden) |
| `listen(callback, blocking, **kwargs)` | Start the receive side; `blocking=False` returns a daemon thread |
| `receive(**kwargs)` | Synchronous single-shot receive |
| `stop()` | Signal the listener loop to exit gracefully |

`send` / `broadcast` return `bool`. `listen` returns `None` (blocking) or a `threading.Thread` (non-blocking). Exceptions inside `send` / `broadcast` are caught and logged: the method returns `False` instead of raising.

---

## Pillar Details

### NetworkModule

For socket-level exfiltration over standard network protocols.

**Constructor parameters** (in addition to base):

| Parameter | Type | Description |
|-----------|------|-------------|
| `host` | `str` | Target host (required) |
| `port` | `int` | Target port (required) |
| `enc_key` | `str` | Encryption key |
| `packet_delay` | `float` | Sleep between packets (default `0.05s`) |
| `max_packet_size` | `int` | Max bytes per packet (default `512`) |
| `verbose` | `bool` | Enable debug logging |

**Must implement:**
- `_send_impl(data, **kwargs) -> bool`
- `_listen_impl(callback, **kwargs) -> None`

**Example:**
```python
from pyexfil.includes.base import NetworkModule

class MyExfil(NetworkModule):
    MODULE_NAME = "MyExfil"
    PROTOCOL    = "udp"

    def _send_impl(self, data, **kwargs):
        # open socket, send data
        return True

    def _listen_impl(self, callback, **kwargs):
        # bind socket, loop while not self._stop_event.is_set()
        # call callback(payload_bytes, {"src": addr})
        pass
```

---

### CommModule

For bidirectional C2 channels where the same module both sends commands and receives data.

**Constructor parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `enc_key` | `str` | Encryption key |
| `on_message` | `Callable` | Application-level callback fired on receive |
| `verbose` | `bool` | Enable debug logging |

**Must implement:**
- `_send_impl(data, **kwargs) -> bool`
- `_broadcast_impl(data, **kwargs) -> bool`
- `_listen_impl(callback, **kwargs) -> None`

**Example:**
```python
from pyexfil.includes.base import CommModule

class MyComm(CommModule):
    MODULE_NAME = "MyComm"
    PROTOCOL    = "arp"

    def _send_impl(self, data, **kwargs):
        # unicast to specific peer
        return True

    def _broadcast_impl(self, data, **kwargs):
        # layer-2 broadcast
        return True

    def _listen_impl(self, callback, **kwargs):
        # sniff/listen loop; call callback(data, meta) on each message
        pass
```

---

### PhysicalModule

For covert channels that use physical media: audio, light, RF, visual codes.

**Constructor parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `verbose` | `bool` | Enable debug logging |

Physical modules are typically send-only. `listen()` and `receive()` raise `NotImplementedError` by default. Override `_receive_impl` if the module can also read back (e.g. a microphone listening for ultrasonic tones).

**Must implement:**
- `_send_impl(data, **kwargs) -> bool`

**Optionally override:**
- `_receive_impl(**kwargs)`: if the channel can be read back

**Example:**
```python
from pyexfil.includes.base import PhysicalModule

class MyPhysical(PhysicalModule):
    MODULE_NAME = "MyPhysical"
    PROTOCOL    = "audio-tones"

    def _send_impl(self, data, **kwargs):
        # encode data as audio tones and play
        return True
```

---

### StegaModule

For file-based steganography where data is hidden inside a carrier file.

The vocabulary is different from the other pillars:

| StegaModule method | What it does |
|--------------------|--------------|
| `encode(carrier, payload, output)` | Hides `payload` inside `carrier`, writes result to `output` |
| `decode(carrier, stego, output)` | Extracts hidden data from `stego`, writes to `output` |
| `send([carrier, payload, output])` | Alias for `encode` (uniform API compatibility) |
| `receive(carrier=, stego=, output=)` | Alias for `decode` |

**Constructor parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `verbose` | `bool` | Enable debug logging |

**Must implement:**
- `_encode_impl(carrier, payload, output, **kwargs) -> bool`
- `_decode_impl(carrier, stego, output, **kwargs) -> bool`

**Example:**
```python
from pyexfil.includes.base import StegaModule

class MyStega(StegaModule):
    MODULE_NAME = "MyStega"
    PROTOCOL    = "png-lsb"

    def _encode_impl(self, carrier, payload, output, **kwargs):
        # open carrier image, embed payload in LSBs, save to output
        return True

    def _decode_impl(self, carrier, stego, output, **kwargs):
        # open stego image, extract LSBs, write to output
        return True
```

---

## Threading Model

`listen(blocking=False)` spawns a daemon thread named `<MODULE_NAME>-listener`. The thread runs `_listen_impl` and checks `self._stop_event` to know when to exit.

Inside `_listen_impl`, the canonical pattern is:

```python
def _listen_impl(self, callback, **kwargs):
    sock = socket.socket(...)
    sock.settimeout(1.0)          # short timeout so stop_event is checked
    while not self._stop_event.is_set():
        try:
            data, addr = sock.recvfrom(4096)
        except socket.timeout:
            continue              # loop back and re-check stop_event
        callback(data, {"src": addr})
```

Call `module.stop()` to set the event and join the thread (5 s timeout).

---

## Class Attributes

Set these on every concrete class:

```python
class MyModule(NetworkModule):
    MODULE_NAME = "MyModule"    # shown in logs and repr()
    PROTOCOL    = "dns/udp"    # transport label (free-form string)
```

`MODULE_TYPE` is inherited from the pillar and should not be overridden.

---

## Imports

```python
# One import covers the whole hierarchy
from pyexfil.includes.base import (
    PyExfilModule,
    NetworkModule,
    CommModule,
    PhysicalModule,
    StegaModule,
)

# Crypto / encoding helpers
from pyexfil.includes.encryption_wrappers import AESEncryptOFB, AESDecryptOFB, RC4
from pyexfil.includes.prepare import PrepFile, PrepString, DecodePacket, RebuildFile
```

---

## Existing Modules

| Module | Class | Pillar | Protocol |
|--------|-------|--------|----------|
| `network/DNS` | `DNSExfil` | NetworkModule | dns/udp |
| `network/ICMP` | `ICMPExfil` | NetworkModule | icmp |
| `network/HTTPS` | `HTTPSExfil` / `HTTPSExfiltrationServer` | NetworkModule | https/tcp |
| `network/HTTP_Cookies` | `HTTPCookieExfil` | NetworkModule | http/tcp |
| `network/FTP` | `FTPExfiltrator` | NetworkModule | ftp/tcp |
| `network/BGP` | `BGPExfil` | NetworkModule | bgp/tcp |
| `network/NTP` | `NTPExfil` | NetworkModule | ntp/udp |
| `network/HTTPResp` | `HTTPRespExfil` | NetworkModule | http/tcp |
| `network/QUIC` | `QUICClient` / `QUICServer` | NetworkModule | quic/udp |
| `network/POP3` | `POP3Exfil` / `POP3Server` | NetworkModule | pop3/tcp |
| `network/Slack` | `SlackExfiltrator` / `SlackListener` | NetworkModule | slack-api |
| `network/SpoofIP` | `SpoofIPExfil` / `SpoofIPServer` | NetworkModule | ip/raw |
| `Comm/ARPBroadcast` | `Broker` | CommModule | arp/l2 |
| `Comm/NTP_Body` | `NTPComm` (client) / `Broker` (server) | CommModule | ntp-body/udp |
| `Comm/DNSoTLS` | `DNSoTLSComm` / `DNSoTLSServer` | CommModule | dns-over-tls |
| `Comm/DB_LSP` | `DB_LSP` | CommModule | db-lsp |
| `Comm/jetdirect` | `Broker` | CommModule | jetdirect/tcp |
| `physical/audio` | `AudioExfil` | PhysicalModule | audio-tones |
| `physical/qr` | `QRExfil` / `QRDecoder` | PhysicalModule | qr-visual |
| `physical/wifiPayload` | `WiFiPayloadExfil` | PhysicalModule | wifi-beacon |
| `Stega/binoffset` | `BinOffsetStega` | StegaModule | png-pixel-offset |
| `Stega/video_dict` | `VideoDictStega` | StegaModule | video-dict |
