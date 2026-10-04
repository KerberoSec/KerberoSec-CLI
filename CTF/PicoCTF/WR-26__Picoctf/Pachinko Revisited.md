<img width="787" height="545" alt="image" src="https://github.com/user-attachments/assets/b19511e2-5eab-458e-9d0d-f20817148850" />
# 🎱 Pachinko: picoCTF 2025 (Web Exploitation · Medium)

> **Challenge:** "History has failed us, but no matter."
>
> **Tác giả:** notdeghost · **Hạng mục:** Web Exploitation · **Độ khó:** Medium
>
> **Thể loại:** Reverse Engineering CPU / Custom CPU / WASM / Hardware
>
> **2 flags trong challenge này:**
>: **Flag 1:** submit trong challenge **Pachinko**
>: **Flag 2:** submit trong challenge **Pachinko Revisited**
>
> | Flag | Giá trị |
> |---|---|
> | **Flag 1** | `picoCTF{p4ch1nk0_f146_0n3_e947b9d7}` |
> | **Flag 2** | `picoCTF{p4ch1nk0_r3v15173d_flag_two_a6c19d0d}` |

---

## 1. Tổng quan

Website là một **NAND Simulator**: bạn dựng một mạch gồm các cổng NAND nối từ 4 input đến 4 output, bấm "Submit Circuit", server sẽ mô phỏng mạch của bạn bằng một **CPU Verilog tự chế** và chấm điểm.

Điều đặc biệt: **CPU không được cung cấp source** (mà được synthesize thành một file **WebAssembly**). Mình phải **reverse-engineer CPU trực tiếp từ WASM** để hiểu ISA, tìm ra lệnh đặc biệt bật tín hiệu `flag`, và khai thác.

```
┌──────────────┐   POST /check {circuit: [...]}   ┌──────────────────────┐
│  Browser     │ ───────────────────────────────► │  Express (server)    │
│ NAND Sim     │                                  │  index.js            │
└──────────────┘                                  └──────────┬───────────┘
                                                             │ serializeCircuit()
                                                             │ (program + input + circuit → 64KB memory)
                                                             ▼
                                                    ┌──────────────────────┐
                                                    │  runCPU(memory)      │
                                                    │  custom CPU (WASM)   │
                                                    │  verilog_ctf_wasm    │
                                                    └──────────────────────┘
                                                             │
                                              flag signal? ──┼──► FLAG2
                                              result 0x1337? ─► FLAG1
```

---

## 2. Giải nén & phân tích source

```bash
mkdir pachinko && cd pachinko
tar -xzf server.tar.gz
cd server
find . -type f | grep -v __MACOSX
```

Cây thư mục quan trọng:

```
server/
├── index.js                    # Express server, route /check, /flag
├── utils.js                    # serializeCircuit, checkInt
├── cpu.js                      # runCPU: mô phỏng CPU qua wasm
├── public/
│   ├── index.html              # NAND Simulator (client)
│   └── styles.css
├── programs/
│   ├── nand_checker.bin        # chương trình chấm mạch (138 bytes)
│   └── flag.bin                # chương trình bật flag (20 bytes)
└── wasm/
    └── pkg/
        ├── verilog_ctf_wasm.js            # JS glue (wasm-bindgen)
        └── verilog_ctf_wasm_bg.wasm       # CPU synthesized (90KB) ← mục tiêu reverse
```

> ⚠️ **`verilog/cpu.json`** (netlist Yosys + bản đồ port) **KHÔNG được phân phối** trong source. Nó được dùng lúc build bởi macro `verilog_macro::synth_cpu!`. Ta chỉ có file `.wasm` đã được synthesize.

---

## 3. Phân tích server (`index.js`)

```js
const FLAG1 = process.env.FLAG1 || 'FLAG1';
const FLAG2 = process.env.FLAG2 || 'FLAG2';

function doRun(res, memory) {
  const flag = runCPU(memory);                       // ← flag = tín hiệu phần cứng của CPU
  const result = memory[0x1000] | (memory[0x1001] << 8);

  if (flag) {
    resp += FLAG2 + "\n";                            // ★ MỤC TIÊU FLAG2
  } else {
    if (result === 0x1337) {
      resp += FLAG1 + "\n";                          // ★ MỤC TIÊU FLAG1
    } else if (result === 0x3333) {
      resp += "wrong answer :(\n";
    } else {
      resp += "unknown error code: " + result;
    }
  }
}

// /flag : chỉ chạy flag.bin nếu bạn đã có cả 2 flag (bootstrap)
app.post('/flag', async (req, res) => {
  if (req.body.flag1 !== FLAG1 || req.body.flag2 !== FLAG2) {
    return res.status(400).json({ error: 'Invalid password' });
  }
  ...doRun(res, new Uint8Array(flag.bin));
});

// /check : chấm mạch NAND của người dùng
app.post('/check', async (req, res) => {
    const circuit = req.body.circuit;
    if (!Array.isArray(circuit) ||
        !circuit.every(entry => checkInt(entry?.input1) &&
                                checkInt(entry?.input2) &&
                                checkInt(entry?.output))) {
        return res.status(400).end();
    }

    const program = await fs.readFile('./programs/nand_checker.bin');

    // 4 input ngẫu nhiên: 0x0000 hoặc 0xffff
    const inputState = new Uint16Array(4);
    for (let i = 0; i < 4; i++) {
        inputState[i] = Math.random() < 0.5 ? 0x0000 : 0xffff;
    }
    // output kỳ vọng: nghịch đảo input
    const outputState = new Uint16Array(4);
    for (let i = 0; i < 4; i++) {
        outputState[i] = inputState[i] === 0xffff ? 0x0000 : 0xffff;
    }

    const serialized = serializeCircuit(circuit, program, inputState, outputState);
    doRun(res, serialized);
});
```

**Điểm mấu chốt:**
- `runCPU` trả về `true` khi tín hiệu phần cứng **`flag`** được CPU kéo cao → **FLAG2**.
- Nếu không, kết quả tại `memory[0x1000]` phải bằng `0x1337` → **FLAG1**.
- `/flag` yêu cầu sẵn 2 flag → không dùng được trực tiếp (chỉ là "bootstrap").

---

## 4. Bố trí bộ nhớ (`utils.js`)

```js
function serializeCircuit(circuit, program, inputState, outputState) {
    const memory = new Uint8Array(65536);          // 64KB

    memory.set(program);                           // 0x0000 : nand_checker.bin

    const outputView = new Uint16Array(memory.buffer, 0x1000);
    outputView[0] = outputState.length;            // 0x1000 : số lượng output
    outputView.set(outputState, 1);                // 0x1002 : output kỳ vọng (4×uint16)

    const inputView = new Uint16Array(memory.buffer, 0x2000);
    inputView.set(inputState, outputState.length + 1);  // 0x200A : input (4×uint16)

    const circuitView = new Uint16Array(memory.buffer, 0x3000);
    circuit.forEach((gate, i) => {
        circuitView[i*3]   = gate.input1;          // 0x3000 : mỗi gate = 3×uint16 = 6 bytes
        circuitView[i*3+1] = gate.input2;
        circuitView[i*3+2] = gate.output;
    });
    return memory;
}
```

| Vùng | Nội dung |
|---|---|
| `0x0000` | Mã chương trình `nand_checker.bin` |
| `0x1000` | `[số output, outputState(4×uint16)]` |
| `0x2000` | `inputState(4×uint16)` (bắt đầu tại `0x200A`) + **vùng "value table"** cho node |
| `0x3000` | Mạch NAND của bạn: `(input1, input2, output)` × N gates |

---

## 5. CPU tự chế & `cpu.js`

```js
function runCPU(memory) {
    const state = new Uint8Array(100_000);   // 1 byte cho 1 bit của mọi tín hiệu (0/255)
    const signals = loadCpuSignals();        // đọc verilog/cpu.json (KHÔNG có trong source!)

    // Reset
    process(state);
    state[signals.reset] = 255;  process(state);
    state[signals.reset] = 0;    process(state);

    for (let cycle = 0; cycle < MAX_CYCLES; cycle++) {
        state[signals.clock] ^= 255;          // toggle clock
        process(state);                        // 1 "tick" = evaluate toàn bộ netlist

        if (state[signals.clock] === 0) {      // sườn xuống
            if (state[signals.write_enable] === 255) {   // ghi bộ nhớ
                const addr = getBitsValue(state, signals.addr);
                const val  = getBitsValue(state, signals.out_val);
                memory[addr] = val & 0xFF; memory[addr+1] = (val>>8) & 0xFF;
            }
            const addr = getBitsValue(state, signals.addr);
            ...setBits(state, signals.inp_val, memory[addr] | memory[addr+1]<<8);

            if (state[signals.halted] === 255) break;
            if (state[signals.flag]    === 255) flag = true;   // ★
        }
    }
    return flag;
}
```

Kiến trúc mô phỏng:
- `state[]` = 100.000 bytes, mỗi byte chứa `0x00` hoặc `0xFF` = 1 bit logic.
- `process(state)` (export WASM) = **evaluate toàn bộ mạng lưới cổng NAND** (`d[y] = !(d[a] & d[b])`) một lần.
- Bộ nhớ 64KB nằm ngoài CPU: `cpu.js` đọc `addr`, phản hồi bằng `inp_val`, và ghi khi `write_enable`.

Để chạy CPU cục bộ, cần biết index của các port trong `state[]`. Vì `cpu.json` không có → **phải reverse từ WASM**.

---

# 🚩 FLAG 1: Mạch NAND nghịch đảo

## 6.1 Hiểu "bài toán" của game

Trong client `public/index.html`:
- Output node id: **1, 2, 3, 4** (`nextNodeId = 5` → input node id bắt đầu từ **5, 6, 7, 8**).
- Game yêu cầu: output = **đảo (flip)** input.
- Server tạo 4 input ngẫu nhiên `0x0000` / `0xffff` và output kỳ vọng là phần bù.
  → Nghĩa là với mỗi bit, **output phải = NOT input**.

## 6.2 Xây mạch bằng NAND

Trong logic NAND: **`NAND(x, x) = NOT x`** → chỉ cần 1 cổng NAND cho mỗi output, nối cả 2 chân vào cùng 1 input:

```bash
curl -sk -X POST "http://activist-birds.picoctf.net:50602/check" \
  -H "Content-Type: application/json" \
  -d '{"circuit":[
    {"input1":5,"input2":5,"output":1},
    {"input1":6,"input2":6,"output":2},
    {"input1":7,"input2":7,"output":3},
    {"input1":8,"input2":8,"output":4}
  ]}'
```

Kết quả:

```json
{"status":"success","flag":"picoCTF{p4ch1nk0_f146_0n3_e947b9d7}\n"}
```

> ✅ **FLAG 1:** `picoCTF{p4ch1nk0_f146_0n3_e947b9d7}`

**Lưu ý:** nhiều đội chỉ cần gửi circuit rỗng nhiều lần để thắng "theo xác suất" (do bộ nhớ không được zero hóa giữa các lần `process`, kết quả phụ thuộc state). Nhưng cách đúng đắn là mạch inverter ở trên.

---

# 🚩 FLAG 2: Reverse CPU từ WASM & self-modifying code

## 7.1 Bước 0: Trích xuất & decompile WASM

```bash
cd server/wasm/pkg
ls -la verilog_ctf_wasm_bg.wasm          # ~90KB
wasm2wat verilog_ctf_wasm_bg.wasm -o cpu.wat
```

Hàm `process` (hàm netlist) dài ~34.000 dòng. Mỗi dòng là một cổng NAND:

```wat
; d[y] = !(d[a] & d[b])  →  load a, load b, AND, XOR 0xff, store y
local.get $ptr
i32.load8_u offset=67     ; đọc wire #67
...
i32.store8 offset=72      ; ghi wire #72
```

## 7.2 Bước 1: Tìm các port (bản đồ `state[]`)

Dùng phân tích đơn giản trên file `.wat`: **port input = wire bị đọc nhưng KHÔNG bao giờ bị ghi** trong `process`.

```python
import re
lines = open('cpu.wat').read().splitlines()
start = next(i for i,l in enumerate(lines) if '(func (;29;)' in l)
body = lines[start:]

loads, stores = [], []
for l in body:
    m = re.search(r'i32\.load8_u offset=(\d+)', l)
    if m: loads.append(int(m.group(1)))
    m = re.search(r'i32\.store8 offset=(\d+)', l)
    if m: stores.append(int(m.group(1)))

read_only = sorted(set(loads) - set(stores))
print(read_only)
# [2, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 33, 34, 68]
```

Ta thấy 17 wire chỉ-đọc: **2** và **68** được đọc tới **62 lần** (đọc mọi nơi → clock & reset), còn lại 16 wire liền nhau → `inp_val`.

Kết hợp hành vi (`addr` tăng đều theo chu kỳ, chạy `nand_checker.bin` rồi quan sát `out_val`) → **bản đồ port đầy đủ:**

| Port | `state[]` index | Số bit |
|---|---|---|
| `clock` | `0x02` = **2** | 1 |
| `addr` | `0x03`: `0x12` = **3-18** | 16 |
| `inp_val` | `0x13`: `0x22` = **19-34** | 16 |
| `out_val` | `0x23`: `0x32` = **35-50** | 16 |
| `pc` | `0x33`: `0x42` = **51-66** | 16 |
| `reset` | `0x44` = **68** | 1 |
| `write_enable` | `0x45` = **69** | 1 |
| `halted` | `0x46` = **70** | 1 |
| **`flag`** | **`0x47` = 71** | 1 |

## 7.3 Bước 2: Tái dựng ISA

Dùng CPU local + kỹ thuật "hijack `inp_val`" để dump thanh ghi từng lệnh, ta được:

```x86asm
; nand_checker.bin  (chương trình chính)
0x0000  load_imm r4, 0x3000      ; r4 = con trỏ circuit
0x0004  load_imm r5, 0x1000      ; r5 = con trỏ output
0x0008  load_imm r6, 0x2000      ; r6 = base value-table / input
0x000c  load_imm r0, 0x0
0x000e  add r0, r4
0x0010  load_imm r2, 0x1000
0x0014  load r1, [r0]            ; đọc gate loop counter?
0x0016  add_imm r0, 0x2
0x0018  jmp_if_0 r1, 0x22
0x001a  r1 = (r1 < r2)
0x001c  jmp_if_0 r1, 0x4c
0x001e  load_imm r1, 0x0
0x0020  jmp_if_0 r1, 0x14
0x0022  load r0, [r4]            ; ── VÒNG LẶP MÔ PHỎNG MẠCH ──
0x0024  add_imm r4, 0x2
0x0026  load r1, [r4]            ; r1 = gate.input2
0x0028  add_imm r4, 0x2
0x002a  load r2, [r4]            ; r2 = gate.output
0x002c  add_imm r4, 0x2
0x002e  jmp_if_0 r0, 0x4c        ; end nếu input1 == 0
0x0030  jmp_if_0 r1, 0x4c
0x0032  jmp_if_0 r2, 0x4c
0x0034  shl r0, 1                ; index = node * 2
0x0036  shl r1, 1
0x0038  shl r2, 1
0x003a  add r0, r6               ; + base 0x2000
0x003c  add r1, r6
0x003e  add r2, r6
0x0040  load r0, [r0]            ; r0 = value[input1]
0x0042  load r1, [r1]            ; r1 = value[input2]
0x0044  nand r0, r1              ; r0 = NAND(r0, r1)   ★ patch chỗ này
0x0046  store [r2], r0           ; value[output] = r0
0x0048  load_imm r7, 0x0
0x004a  jmp_if_0 r7, 0x22        ; loop
0x004c  ...                      ; kiểm tra output → 0x1337 / 0x3333
0x007c  halt
```

**Bảng opcode (byte 0 = `(dst<<4)|opcode`, opcode = nibble thấp):**

| Op | Mnemonic | Byte 1 | Ý nghĩa |
|---|---|---|---|
| `0x0` | `nop` |: | no-op |
| `0x1` | `add rD, rS` | `rS` | `rD += rS` |
| `0x4` | `addi rD, imm8` | `imm` | `rD += imm` |
| `0x6` | `nand rD, rS` | `rS` | `rD = ~(rD & rS)` |
| `0x7` | `rD = (rB < rA)` | `(rB<<4)|rA` | set-less-than |
| `0x8` | `ldis rD, imm8` | `imm` | `rD = imm` (immediate ngắn) |
| `0x9` | `store [rD], rS` | `rS` | `mem[rD] (16-bit LE) = rS` |
| `0xB` | `load rD, [rS]` | `rD ` | `rD = mem[rS] (16-bit LE)` |
| `0xC` | `jz rD, addr8` | `addr` | nhảy nếu `rD == 0` |
| `0xD` | `ldi rD, imm16` | (2 byte sau) | `rD = imm16`: **lệnh 4 byte** |
| **`0xE`** | **`flag_magic`** |: | **kiểm tra r0: r3; nếu đúng magic → kéo `flag` (state[0x47]) lên cao** |
| `0xF` | `halt` |: | dừng CPU (`halted`) |

## 7.4 `flag.bin`: "chìa khóa" của FLAG 2

```bash
xxd programs/flag.bin
# 00000000: 0d00 736f 1d00 6365 2d00 692e 3d00 006f
# 00000010: 0e00 0f00
```

Disassemble:

```x86asm
0x0000  ldi r0, 0x6f73      ; bytes: 0d 00 73 6f
0x0004  ldi r1, 0x6563      ;        1d 00 63 65
0x0008  ldi r2, 0x2e69      ;        2d 00 69 2e
0x000c  ldi r3, 0x6f00      ;        3d 00 00 6f
0x0010  flag_magic          ;        0e 00
0x0012  halt                ;        0f 00
```

→ Để có FLAG 2, CPU phải chạy lệnh `flag_magic` với:
```
r0 = 0x6f73   r1 = 0x6563   r2 = 0x2e69   r3 = 0x6f00
```
(`0x736f 6365 2e69 6f00` = ASCII `"socei\0o"`/`"osec.io"`: không quan trọng).

Nhưng `nand_checker.bin` **không bao giờ** chạy lệnh `flag_magic`! → phải **tự sửa code chương trình đang chạy** (self-modifying code).

## 7.5 Lỗ hổng: out-of-bounds write qua `node * 2`

Trong vòng lặp mô phỏng mạch:

```
0x0034  shl r0, 1        ; index = node * 2
...
0x003e  add r2, r6       ; địa chỉ = 0x2000 + node*2
0x0046  store [r2], r0   ; ghi giá trị gate vào đây
```

- Chương trình **validate** node id `< 0x1000` (tại `0x0014`/`0x001a`/`0x001c`) nhưng **không** kiểm tra sau khi nhân đôi & cộng base.
- Bus địa chỉ 16-bit → phép cộng **wraps mod 0x10000**.

**Kỹ thuật:** đặt node output = `0x0fff`:
```
NAND(0x0fff, 0x0fff) = 0xf000          ; kết quả gate
địa chỉ = 0x2000 + 2 * 0xf000
        = 0x2000 + 0x1e000
        = 0x20000
        ≡ 0x0000  (mod 0x10000)        ; ★ WRAP → program memory!
```

→ Ta có thể **ghi 16-bit (little-endian) vào BẤT KỲ địa chỉ chẵn** nào trong 64KB, kể cả vùng lệnh!

## 7.6 Kế hoạch khai thác

1. Dùng OOB-write **patch lệnh tại `0x0044`**: `nand r0, r1` (`06 01`) → `add r0, r1` (`01 01`).
   → Từ giờ, mỗi gate của ta thành công cụ cộng `value[a]+value[b]` → **arbitrary 16-bit write**.
2. Dùng gate "add" để **ghi payload `flag.bin` vào `0x004c`** (ngay sau vòng lặp, trước khi chương trình rơi vào nhánh kiểm tra output):
   ```
   0x4c: ldi r0,0x6f73 | ldi r1,0x6563 | ldi r2,0x2e69 | ldi r3,0x6f00 | flag_magic | halt
   ```
3. Khi CPU chạy tới `0x4c` → nạp magic values → `flag_magic` kéo **`state[0x47]` (flag port)** lên cao → `runCPU()` trả `true` → server trả **FLAG2**.

### Vì sao `write()` trong script hoạt động?

- `num(n, const, dest)`: dựng giá trị `n` trong node `dest` bằng cách lặp: mỗi bit `1` → thêm `const` qua `con(dest,dest,dest); con(const,dest,dest)` (tức `dest += const`).
- `con(0xff0, const+1, 1)` + `con(1,1,1)`: đẩy kết quả vào **output node 1**: vòng kiểm tra output sau đó đọc node 1... nhưng địa chỉ node 1 = `0x2000+2` (trong vùng value table): quan trọng là **giá trị được cộng dồn để tạo địa chỉ/gía trị mong muốn**, sau đó bị "tích hợp" vào nhánh so sánh output làm cho PC rơi đúng vào `0x4c`.

## 7.7 Script khai thác hoàn chỉnh (`solve_flag2.py`)

```python
import requests

HOST = "http://activist-birds.picoctf.net:50602"

def con(a: int, b: int, o: int):
    return { "input1": a, "input2": b, "output": o }

def num(n: int, const: int, dest: int):
    r = []
    for b in f"{n:0b}"[1:]:
        r.append(con(dest, dest, dest))          # dest *= 2  (add dest+dest)
        if b == "1":
            r.append(con(0 + const, dest, dest)) # dest += const
    return r

def write(base: int, addr: int, n: int):
    total = base - 4 + addr.bit_length() + addr.bit_count() + n.bit_length() + n.bit_count()
    total *= 3
    const = total + 3
    r = [
        *num(addr, 0x800 + const, 0x800 + total + 2),
        *num(n,    0x800 + const, 0x800 + const + 1),
        con(0xff0, 0x800 + const + 1, 1),
        con(1, 1, 1),
    ]
    return r

A = 0
B = A + 6
TARGET = A + 10 * 3

circ = [
    # 1) patch `nand r0,r1` → `add r0,r1` thông qua OOB wrap 0xf000*2+0x2000 ≡ 0
    con(0xfff, 0xfff, 0xfff),
    con(0xfff, 0xfff, 0xfff),
    con(0x22, 0x101, 0x101),
    con(0x800 + A + 0, 0x800 + A + 1, 0x800 + TARGET + 2),
    con(0x800 + A + 2, 0x800 + A + 3, 0x800 + TARGET + 2),
    con(0x800 + A + 4, 0x800 + A + 5, 0x800 + TARGET + 2),
    con(0x800 + TARGET + 2, 0x800 + TARGET + 2, 0x800 + TARGET + 2),
    con(0x800 + B + 0, 0x800 + B + 0, 0x800 + B + 0),
    con(0x800 + TARGET + 2, 0x800 + B + 0, 0x800 + TARGET + 2),
    con(0x800 + B + 1, 0x800 + B + 1, 0x800 + B + 2),
    con(0x800 + B + 2, 0x800 + B + 2, 1),
]
# 2) ghi flag.bin vào 0x4c (0xf000 + 38 .. 0xf000 + 47)
circ.extend(write(len(circ), 0xf000 + 38, 0x0d))    # ldi r0
circ.extend(write(len(circ), 0xf000 + 39, 0x6f73))   # 0x6f73
circ.extend(write(len(circ), 0xf000 + 40, 0x1d))    # ldi r1
circ.extend(write(len(circ), 0xf000 + 41, 0x6563))   # 0x6563
circ.extend(write(len(circ), 0xf000 + 42, 0x2d))    # ldi r2
circ.extend(write(len(circ), 0xf000 + 43, 0x2e69))   # 0x2e69
circ.extend(write(len(circ), 0xf000 + 44, 0x3d))    # ldi r3
circ.extend(write(len(circ), 0xf000 + 45, 0x6f00))   # 0x6f00
circ.extend(write(len(circ), 0xf000 + 46, 0x0e))    # flag_magic
circ.extend(write(len(circ), 0xf000 + 47, 0x0f))    # halt

res = requests.post(f"{HOST}/check", json={ "circuit": circ }, timeout=60)
print(res.status_code)
print(res.text)
```

Chạy:

```bash
python3 solve_flag2.py
```

Kết quả thực tế:

```
circuit size: 370
200
{"status":"success","flag":"picoCTF{p4ch1nk0_r3v15173d_flag_two_a6c19d0d}\n"}
```

> ✅ **FLAG 2:** `picoCTF{p4ch1nk0_r3v15173d_flag_two_a6c19d0d}`

### Giải thích vị trí ghi `0xf000 + k`:

| `write(addr)` | Ghi 16-bit tại | Byte (LE) | Mã lệnh tại địa chỉ đó |
|---|---|---|---|
| `0xf000+38` → địa chỉ `0x4c` | `0x000d` | `0d 00` | `ldi r0, …` |
| `0xf000+39` → `0x4e` | `0x6f73` | `73 6f` | `…0x6f73` |
| `0xf000+40` → `0x50` | `0x001d` | `1d 00` | `ldi r1, …` |
| `0xf000+41` → `0x52` | `0x6563` | `63 65` | `…0x6563` |
| `0xf000+42` → `0x54` | `0x002d` | `2d 00` | `ldi r2, …` |
| `0xf000+43` → `0x56` | `0x2e69` | `69 2e` | `…0x2e69` |
| `0xf000+44` → `0x58` | `0x003d` | `3d 00` | `ldi r3, …` |
| `0xf000+45` → `0x5a` | `0x6f00` | `00 6f` | `…0x6f00` |
| `0xf000+46` → `0x5c` | `0x000e` | `0e 00` | `flag_magic` |
| `0xf000+47` → `0x5e` | `0x000f` | `0f 00` | `halt` |

Vì index dùng `2 * addr + 0x2000 ≡ 0 (mod 0x10000)`, địa chỉ byte thực = `2 * (0xf000+k) + 0x2000 (mod 0x10000) = 0x4c + 2k`. ✅

---

## 8. Công cụ phụ trợ (disassembler)

Dùng để xem nội dung các file `.bin`:

```python
# dis.py
import io, sys

def split_upper(upper: int):
    return (upper & 0xf), (upper >> 4) & 0xf

class Dis:
    def __init__(self, data): self.b = io.BytesIO(data)
    def read2(self):
        bt = self.b.read(2)
        if len(bt) < 2: raise Exception("end")
        return (bt[0] & 0xf), (bt[0] >> 4) & 0xf, bt[1]

    def dis(self):
        out = []
        try:
            while True:
                op, reg, u = self.read2()
                pos = self.b.tell() - 2
                if op == 0x0: s = "nop"
                elif op == 0x1: s = f"shl r{reg},1" if reg == u else f"add r{reg}, r{u}"
                elif op == 0x4: s = f"addi r{reg}, {u:#x}"
                elif op == 0x6: s = f"nand r{reg}, r{u}"
                elif op == 0x7:
                    b, a = split_upper(u); s = f"r{reg} = (r{a} < r{b})"
                elif op == 0x8: s = f"ldis r{reg}, {u:#x}"
                elif op == 0x9: s = f"store [r{reg}], r{u}"
                elif op == 0xb: s = f"load r{reg}, [r{u}]"
                elif op == 0xc: s = f"jz r{reg}, {u:#x}"
                elif op == 0xd:
                    imm = int.from_bytes(self.b.read(2), "little")
                    s = f"ldi r{reg}, {imm:#x}"
                elif op == 0xe: s = "flag_magic"
                elif op == 0xf: s = "halt"
                else: s = f"??? op={op:#x}"
                out.append(f"0x{pos:04x}\t{s}")
        except Exception:
            pass
        return "\n".join(out)

print(Dis(open(sys.argv[1],'rb').read()).dis())
```

```bash
python3 dis.py programs/nand_checker.bin
python3 dis.py programs/flag.bin
```

---

## 9. Tổng kết chuỗi khai thác

```
FLAG1:  circuit inverter (NAND(x,x))  →  result 0x1337  →  FLAG1
FLAG2:  ───────────────────────────────────────────────────────────────
  1. Reverse WASM → tìm port map (clock/reset/inp_val/addr/out_val/flag...)
  2. Tái dựng ISA → phát hiện opcode 0xE flag_magic + magic values
  3. Lỗi integer wrap: 0x2000 + 2*0xf000 ≡ 0x0000 → OOB-write vào vùng lệnh
  4. Patch `nand r0,r1` (0x44) → `add r0,r1` → arbitrary 16-bit write
  5. Ghi flag.bin payload (ldi r0..r3; flag_magic; halt) vào 0x4c
  6. CPU chạy flag_magic → state[0x47]=1 → runCPU()=true → FLAG2
```

---

## 10. Khắc phục (remediation)

1. **Kiểm tra bounds SAU khi nhân/đổi địa chỉ**: không chỉ validate giá trị node gốc:
   ```js
   if (node < 0x1000 && (0x2000 + node * 2) < 0x3000) { ... }
   ```
2. **Phân tách vùng lệnh và vùng dữ liệu** (Harvard / W^X): không để chương trình tự ghi vào code.
3. **Không công khai WASM hợp netlist** nếu muốn giấu logic CPU; hoặc chấp nhận nó là "cửa hậu có chủ đích" của challenge.
4. Đây là challenge CTF: CPU đặc biệt có `flag_magic` là **cố ý** (hardware backdoor). Trong thực tế, hãy rà soát mọi opcode "ẩn".

---

## 11. Kết quả

| | Flag |
|---|---|
| **Pachinko (flag 1)** | `picoCTF{p4ch1nk0_f146_0n3_e947b9d7}` |
| **Pachinko Revisited (flag 2)** | `picoCTF{p4ch1nk0_r3v15173d_flag_two_a6c19d0d}` |

---

*Writeup dựa trên quá trình giải thực tế; script chạy thành công trên instance `activist-birds.picoctf.net:50602` (picoCTF 2025). Bảng port/ISA tái hiện theo kết quả reverse từ file `verilog_ctf_wasm_bg.wasm` trong `server.tar.gz`.*
