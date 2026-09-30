<div align="center">*[Image: Week 3: Cold Access]*</div>

---

# Week 3: Cold Access
## OffSec Arctic Howl CTF: Tundra Realm

---

## About the Event

**Arctic Howl: The Cascade Expanse**

The Cascade Expanse is no longer ruled by instinct alone. Ashka, an Arctic Wolf, was among the greatest cybersecurity hunters the Expanse had ever known: defending the Tundra Realm through instinct, reading subtle signals, sensing danger, and striking before threats could surface. When unusual activity rippled through the Tundra data center, Ashka moved to investigate but the adversary was already there. Two steps ahead. From the shadows, Ashka was struck down and taken. When the alarms faded, she was gone.

Her disappearance marked the beginning of a far greater threat. Throughout this Gauntlet season, challengers face an evolving adversary in a frozen cybersecurity battleground. Across increasingly difficult labs, competitors must adapt, learn, and outthink threats designed to punish stagnation and reward growth. As the season unfolds, challengers uncover the truth behind a missing guardian, a calculating adversary, and a chilling experiment that seeks to reshape instinct itself: blurring the line between hunter and machine.

**Only those who adapt will survive. Only those who endure will uncover the truth. And only the strongest will reach the heart of the storm.**

Welcome to Arctic Howl.

---

## Challenge Overview

**Scenario:** Cascade NGO Hub provided a packet capture and logs after suspicious endpoint behavior was observed after user email activity and web browsing.

**Objective:** Reconstruct the full browser exploitation chain from initial access to in-memory command execution, and validate each challenge answer with direct evidence.

**Deliverables:** Answer 10 forensic questions accurately with technical proof.

**Evidence Artifacts:**
- `initial_access.pcapng`
- extracted malicious page (`exploit.html`)

---

## Methodology (Step by Step)

### Step 1: Build a timeline from PCAP

1. Filter POP3 sessions to confirm email retrieval activity.
2. Identify suspicious HTTP session to attacker host `34.250.131.104`.
3. Correlate follow-up traffic (especially ICMP) after exploit page fetch.

### Step 2: Extract delivered exploit content

1. Parse HTTP 200 responses from PCAP.
2. Isolate the HTML response from the attacker-controlled host.
3. Save payload as `exploit.html` for static analysis.

### Step 3: Analyze exploit JavaScript and WASM

1. Inspect object confusion primitives (`DOMRect`, `AudioBuffer`).
2. Locate TrustedCage scan logic and dispatch marker (`0x1f8d`).
3. Extract `wasmBuffer` byte array and reconstruct executable shellcode chunks.

### Step 4: Disassemble reconstructed shellcode

1. Rebuild JIT chunk stream from `f64.const` immediate values.
2. Disassemble x64 instructions with Capstone.
3. Validate `WinExec` resolution, command offset, null-termination, and call sequence.

### Step 5: Verify every question with evidence

1. Map each question to at least one direct artifact (packets, code, disassembly line).
2. Avoid assumptions from public PoCs unless supported by local evidence.
3. Finalize answer set with explicit proof and sanity checks.

---

## Core Scripts and Code Used During Analysis

## 1) Extract exploit page from PCAP responses

```python
# extract_exploit_html.py
import re

pcap = open("initial_access.pcapng", "rb").read()
responses = pcap.split(b"HTTP/1.1 200 OK")

# Response index containing attacker HTML page
target = responses[3]
start = target.find(b"<html")
end = target.find(b"</html>", start)

with open("exploit.html", "wb") as f:
    f.write(target[start:end+7])

print("Saved exploit.html")
```

## 2) Extract wasmBuffer bytes from exploit script

```python
# extract_wasm.py
import re

data = open("exploit.html", "r", encoding="utf-8", errors="ignore").read()
m = re.search(r"wasmBuffer = new Uint8Array\(\[(.*?)\]\);", data)
nums = [int(x) for x in m.group(1).replace(" ", "").split(",") if x.isdigit()]

with open("payload.wasm", "wb") as f:
    f.write(bytes(nums))

print(f"payload.wasm bytes: {len(nums)}")
```

## 3) Reconstruct JIT shellcode chunks

```python
# reconstruct_shellcode.py
# In this payload, byte 0x44 marks f64.const in WASM function body.
data = open("payload.wasm", "rb").read()
chunks = []
i = 0
while i < len(data):
    if data[i] == 0x44:  # f64.const opcode
        chunks.append(data[i+1:i+9])
        i += 9
    else:
        i += 1

with open("sc.bin", "wb") as f:
    f.write(b"".join(chunks))

for idx, c in enumerate(chunks):
    print(f"Chunk {idx}: {c.hex()}")
```

Observed final chunk (critical evidence):
```text
Chunk 15: 70696e6720646200
```
ASCII decode: `ping db\0`

## 4) Disassemble shellcode with Capstone

```python
# disasm_sc.py
import capstone

md = capstone.Cs(capstone.CS_ARCH_X86, capstone.CS_MODE_64)
code = open("sc.bin", "rb").read()
for insn in md.disasm(code, 0):
    print(hex(insn.address), insn.mnemonic, insn.op_str)
```

Key disassembly output:
```text
mov edx, 0x252
add rcx, rdx
mov byte ptr [rcx + 8], 0
sub rsp, 0x28
call rax
...
jo 0xe3
outsb dx, byte ptr [rsi]
and byte ptr [edx], ah
```

The tail bytes decode to the command string (`ping db\0`) not executable instructions.

---

## Exploit Code Walkthrough (From Delivered Script)

### Vulnerability primitive

From `exploit.html`:
```javascript
var domRect = new DOMRect(1.1,2.3,3.3,4.4);
var node = new AudioBuffer({length: 3000, sampleRate: 30000, numberOfChannels : 2});
var channel = node.getChannelData(0);
```

The exploit abuses confusion between `DOMRect` and `AudioBuffer`-related memory to pivot into arbitrary read/write.

### TrustedCage dispatch scan

```javascript
//dispatch_table_from_imports address
var trustedCage = intView[1];

function findImportTarget(startAddr) {
  var dispatchMap = 0x1f8d;
  ...
}
var startAddr = 0x40600;
```

This locates the import/dispatch table entry (`dispatch_table_from_imports`) by scanning for marker `0x1f8d` from offset `0x40600`.

### JIT execution pivot

```javascript
var code = i32tof(startAddr + codeIdx * 4 + 0xc, trustedCage);
domRect.x = code;
node.copyFromChannel(dst, 0, 0);
intView[0] = intView[0] + 0xe + 0x100;
node.copyToChannel(dst, 0, 0);
exported();
exported();
```

The exploit overwrites dispatch-linked code flow to redirect execution to sprayed shellcode.

---

## Challenge Questions & Analysis-Backed Answers

### Question 1: Initial attack vector
**Q:** What was the initial attack vector used by the adversary, and through which protocol was it delivered?

**Answer:**
```text
The attack began with a phishing email retrieved via POP3 that contained a malicious link.
Following the link directed the victim to an adversary-controlled page hosted over HTTP at
http://34.250.131.104/
```

**Analysis:**
- The packet sequence shows mailbox interaction over POP3 before the malicious browsing event, indicating email-delivered lure activity rather than drive-by exploitation.
- Shortly after POP3 activity, the victim issues an HTTP request to `34.250.131.104`, where the malicious HTML/JS exploit is delivered.
- This ordering (POP3 -> user click -> HTTP exploit fetch) supports phishing as the initial vector and HTTP as the exploit delivery protocol.

**Key Indicators:**
- POP3 session activity preceding exploit traffic.
- HTTP GET to attacker-hosted page at `http://34.250.131.104/`.
- Temporal correlation between email retrieval and malicious page access.

---

### Question 2: Protocol used to notify exploitation success
**Q:** What protocol has been used to notify that the exploit was successful?

**Answer:**
```text
ICMP
```

**Analysis:**
- After loading the malicious page from `34.250.131.104`, the exploit reaches command execution through `WinExec` with embedded command string `ping db`.
- This command does not require HTTP callback or DNS exfiltration payload staging; instead, it generates direct ICMP echo traffic as a low-noise success beacon.
- In the packet timeline (`export.txt`), ICMP echo requests and replies appear immediately after the exploit execution phase, matching expected `ping` behavior.

**Key Indicators:**
- Victim host starts sending `Echo (ping) request` packets right after exploit trigger.
- Corresponding `Echo (ping) reply` packets confirm target reachability.
- Timing correlation between exploit execution and ICMP burst provides strong attribution of ICMP as the success notification channel.

---

### Question 3: Related CVE
**Q:** What CVE is related to this vulnerability?

**Answer:**
```text
CVE-2024-5830
```

**Analysis:**
- The delivered script contains a V8 renderer exploitation pattern based on object confusion and sandbox escape primitives, matching public technical characteristics of `CVE-2024-5830`.
- The chain uses memory corruption primitives, TrustedCage dispatch hunting, and WebAssembly-assisted execution redirection consistent with this CVE family.
- The exploit comment context and shellcode strategy further corroborate that mapping.

**Key Indicators:**
- `DOMRect` / `AudioBuffer` confusion primitives in JavaScript.
- TrustedCage dispatch map scan (`0x1f8d`) and import table pivot.
- WebAssembly and JIT-assisted payload execution flow.

---

### Question 4: Specific assembly instruction enabling final command string execution
**Q:** Which specific assembly instruction helps enable the execution of the final command string?

**Answer:**
```text
mov byte ptr [rcx + 8], 0
```

**Analysis:**
- The shellcode calculates the command pointer using `mov edx, 0x252` followed by `add rcx, rdx`, which places `rcx` at the command-string location.
- `WinExec` expects a null-terminated command string (`lpCmdLine`). If the terminator is missing, adjacent sprayed bytes can be interpreted as part of the command and break execution.
- The instruction `mov byte ptr [rcx + 8], 0` explicitly writes a null byte at the boundary of the 8-byte command region, ensuring safe and deterministic API parsing.
- This is why it is the instruction that helps enable successful execution of the final command string.

**Key Indicators:**
- Pointer setup sequence: `mov edx, 0x252` -> `add rcx, rdx`.
- Boundary write: `mov byte ptr [rcx + 8], 0`.
- Immediate follow-up execution path to `WinExec` via indirect `call rax`.

---

### Question 5: Final stage delivery technique
**Q:** What technique has been used to deliver the final stage of the payload within the exploit?

**Answer:**
```text
JIT Spraying
```

**Analysis:**
- The exploit stores payload bytes inside WebAssembly constants, then leverages JIT compilation to materialize those bytes in executable memory regions.
- Reconstructing immediate values from the WASM body yields contiguous x64 shellcode fragments, which is the hallmark behavior of JIT spraying.
- This technique enables in-memory staging of final code without writing an executable payload to disk.

**Key Indicators:**
- Repeating `f64.const` chunk pattern inside `wasmBuffer`.
- Reconstructed shellcode stream from 8-byte chunks.
- Direct transition from JS/WASM primitives to native instruction execution.

---

### Question 6: Function used to execute final command
**Q:** Which custom or native function has been called to execute the final command in the exploit?

**Answer:**
```text
WinExec
```

**Analysis:**
- Disassembly shows module discovery via PEB/LDR traversal, a common shellcode pattern for API resolution without import table dependencies.
- The shellcode computes an absolute function pointer by adding `0x707d0` to a discovered module base and then transfers control through `call rax`.
- Given the execution context and argument preparation sequence, this resolved target corresponds to `WinExec`.

**Key Indicators:**
- Pointer walk instructions against process loader structures.
- `add rax, 0x707d0` before final indirect call.
- Indirect invocation path (`call rax`) after command pointer setup.

---

### Question 7: Full command executed at the end
**Q:** What is the full command executed at the end of the exploit?

**Answer:**
```text
ping db
```

**Analysis:**
- The final reconstructed 8-byte payload chunk is `70 69 6e 67 20 64 62 00`.
- ASCII conversion gives `p i n g [space] d b \0`, i.e., `ping db` with explicit null termination.
- This command choice aligns with observed post-exploit ICMP activity, validating both static and behavioral evidence.

**Key Indicators:**
- Final shellcode chunk: `70696e6720646200`.
- Decoded command string: `ping db`.
- Runtime corroboration through ICMP ping traffic.

---

### Question 8: Offset added to retrieve command string
**Q:** What is the offset value added to a register to retrieve the command string?

**Answer:**
```text
0x252
```

**Analysis:**
- The shellcode loads `0x252` into `edx` and immediately applies it to the base command pointer register via `add rcx, rdx`.
- This is a direct offseting operation used to reference the embedded command-string region in memory.
- The subsequent null-termination and API call flow confirms this offset is specifically tied to command retrieval.

**Key Indicators:**
- `mov edx, 0x252`.
- `add rcx, rdx` command pointer derivation.
- Follow-on `mov byte ptr [rcx + 8], 0` and `call rax` sequence.

---

### Question 9: Structure searched for import/dispatch table
**Q:** Which structure/location does the exploit search to find the import/dispatch table?

**Answer:**
```text
dispatch_table_from_imports
```

**Analysis:**
- The exploit explicitly labels and searches for the dispatch/import target using `findImportTarget()`.
- It scans memory for marker `0x1f8d` starting at `0x40600`, which is used to locate the `dispatch_table_from_imports` region within the TrustedCage-related memory layout.
- This location is then used to redirect execution flow into attacker-controlled code paths.

**Key Indicators:**
- Commented reference to `dispatch_table_from_imports` in script.
- Marker-based scanning logic (`0x1f8d`).
- Start offset `0x40600` feeding dispatch pivot logic.

---

### Question 10: V8/DOM object confusion pair
**Q:** Which two V8/DOM object types does the exploit confuse?

**Answer:**
```text
DOMRect and AudioBuffer (Float32Array channel data)
```

**Analysis:**
- The payload instantiates `DOMRect` and `AudioBuffer`, then manipulates cross-object state to produce invalid type assumptions and memory aliasing.
- Channel-backed typed-array operations are used to read/write memory through corrupted object relationships.
- This confusion pair is the core primitive enabling the later TrustedCage and dispatch-table stages.

**Key Indicators:**
- Explicit `new DOMRect(...)` and `new AudioBuffer(...)` creation.
- `getChannelData(0)` and typed-array based memory manipulation.
- Cross-object pointer pivoting prior to dispatch redirection.

---

## Deep Technical Notes

## Why the command is not calc.exe

Many public browser exploit demos use `calc.exe` as visual proof. This challenge payload does not. Local artifact extraction from provided PCAP shows command bytes for `ping db`, and this matches observed ICMP behavior.

## Why call rax alone is not the answer to Question 4

`call rax` executes the resolved API function pointer, but the challenge asks for instruction that helps enable final command string execution. Here, `mov byte ptr [rcx + 8], 0` is the string-handling enabler because it ensures proper null termination before `WinExec` consumes `lpCmdLine`.

## Why this exploit is stealthy

- No dropped PE payload required.
- Browser renderer memory primitives and JIT pages carry execution.
- Success signal uses simple ICMP beaconing (`ping db`) for low-friction confirmation.

---

## Repro Checklist (Validation)

- [x] HTTP malicious page extracted from attacker host traffic
- [x] JS/WASM payload isolated
- [x] JIT chunks reconstructed to binary
- [x] x64 disassembly confirms command offset and API call flow
- [x] Command bytes decoded directly from payload
- [x] Network ICMP behavior corroborates command outcome
- [x] All 10 challenge answers validated against direct evidence

---

## Key Techniques & Observations

### Evasion and execution techniques used in this exploit chain

1. **Phishing-to-browser pivot:** Initial access uses social engineering (email lure) rather than binary delivery, reducing endpoint signature opportunities.

2. **In-browser exploitation path:** The chain stays inside browser renderer context and leverages JavaScript + WebAssembly primitives before native API invocation.

3. **TrustedCage dispatch abuse:** The exploit scans memory for a dispatch marker (`0x1f8d`) and pivots execution by manipulating import/dispatch structures.

4. **JIT spraying for shellcode staging:** Shellcode bytes are embedded as WASM immediates and materialized in executable JIT memory, avoiding traditional dropped payload artifacts.

5. **Runtime API resolution:** The shellcode resolves `WinExec` dynamically using loader structure traversal and an RVA add (`+0x707d0`), reducing static IOC exposure.

6. **Minimal proof command design:** The command `ping db` is compact, null-terminated in memory, and behaviorally verifiable through ICMP without requiring noisy second-stage download traffic.

### Investigation-specific observations

1. **Evidence-first validation is critical:** Public exploit assumptions (for example, `calc.exe`) were incorrect for this artifact. Byte-level extraction from provided PCAP gave the true command.

2. **Command extraction requires reconstruction:** The final command is not obvious in raw script text due to JIT/WASM encoding flow; chunk reconstruction and disassembly are necessary.

3. **Behavioral corroboration strengthens confidence:** Static shellcode decoding (`ping db`) matched dynamic network outcome (ICMP burst), closing the loop across host and network perspectives.

---

## Lessons Learned

1. **Browser exploit investigations need both web and RE skillsets.** Traditional packet review alone can miss decisive payload semantics unless paired with script/WASM reverse engineering.

2. **Do not infer from “typical PoC behavior.”** Challenge and real-world payloads often modify final command behavior while preserving broader exploit structure.

3. **Short commands can be intentional OPSEC.** Compact commands like `ping db` can provide execution confirmation with minimal artifacts and lower detection surface.

4. **Instruction-level context matters for answer accuracy.** Distinguishing between execution transfer (`call rax`) and string-enabling logic (`mov byte ptr [rcx + 8], 0`) is essential.

5. **Cross-layer correlation improves confidence.** POP3 + HTTP + JS/WASM + disassembly + ICMP timeline produced a defensible, end-to-end narrative.

### Defensive Takeaways

1. **Monitor suspicious email-to-browser pivots.** Alert when POP3/IMAP retrieval is followed by outbound browsing to newly seen or low-reputation hosts.

2. **Hunt for abnormal browser exploitation signals.** Correlate sudden renderer instability, unusual WASM-heavy pages, and anomalous post-page network behavior.

3. **Detect low-noise success beacons.** ICMP bursts to internal hostnames immediately after suspicious web sessions can indicate exploit proof execution.

4. **Strengthen web isolation and exploit mitigations.** Keep browser versions current, enforce isolation/sandbox hardening, and reduce direct endpoint exposure to untrusted web content.

5. **Use layered detections, not single indicators.** Combine network telemetry, script analysis, memory behavior, and timeline analytics for browser exploit response.

---

## Track Conclusion

<div align="center">*[Image: Week 3 Track Conclusion]*</div>

> The access channel was not idle.  
> Synchronization heartbeat patterns matched Ashka, confirming she was alive.

An exposed coordinate led to a hidden portal beyond an icy waterfall, where Ashka appeared altered and weaponized.

**The experiment reached confrontation stage. The final battle began.**

_Beyond the logs:_ the OffSec Legends emerged as the last line before total loss.

---

*Writeup completed: March 19, 2026*  
*Event: OffSec Arctic Howl: Tundra Realm*  
*Challenge: Week 3: Cold Access*  
*Score: 10/10 questions correct*