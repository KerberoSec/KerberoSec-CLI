---
tags: [ctf, misc, esoteric, programming]
created: 2026-05-02
---

# 🎲 Misc / Programming / Esoteric Challenges

> หมวดของ "ทุกอย่างที่ไม่เข้า category อื่น": esoteric languages, programming puzzles, recreational, weird formats

---

## 🌀 Esoteric Programming Languages

CTF ชอบโจมตีด้วย esoteric languages: ภาษาที่ design มาให้ "weird" บางที minimal บางที joke

### Brainfuck
- 8 commands: `< > + - . , [ ]`
- Tape memory + pointer
- Turing-complete

#### Hello World
```brainfuck
++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]
>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.
```

#### Decode
- **bf interpreter**: `apt install bf`
- Online: copy.sh/brainfuck

```bash
echo "++++++++[>++++++++<-]>+." | bf
# → A
```

### Whitespace
- Only space, tab, LF: invisible code
- Detect with hex view
- **wspace** interpreter

### Befunge
- 2D programming language: instructions on grid
- Direction changes flow

### Piet
- Code = pixel art
- Colors + transitions = instructions

### Malbolge
- "Designed to be impossible to program"
- Self-modifying, hard to even output "Hello World"

### Other
- **Ook!**: orangutan version of Brainfuck (`Ook. Ook? Ook!`)
- **Chef**: code looks like recipes
- **Shakespeare**: code looks like plays
- **LOLCODE**
- **Whitespace**
- **JSFuck**: JS using only `[]()!+`
- **rot256**: increasing Caesar shift

### Identify online
- **dcode.fr** has detector for many esoteric languages
- **TIO** (Try It Online): tio.run: interpreters for >700 languages

---

## 💻 Programming Challenges

### Common types
- Decode given algorithm/format
- Implement protocol
- Solve math/logic puzzle
- Optimize complexity
- Reverse algorithm given inputs/outputs

### Tools
- **Python**: most CTF use
- **Sage**: for math
- **z3-solver** ⭐: SMT solver

```python
from z3 import *

# Find x, y such that...
x, y = Ints('x y')
s = Solver()
s.add(x + y == 100)
s.add(x * 2 + y * 5 == 350)
s.add(x > 0, y > 0)

if s.check() == sat:
    m = s.model()
    print(f"x = {m[x]}, y = {m[y]}")
```

z3 ใช้แก้:
- Constraint problems (find input satisfying conditions)
- Crackme reverse (find serial)
- Crypto with complex algebra

### angr: symbolic execution
สำหรับ binary reverse: ดู [../05-Reverse-Engineering/Anti-Debug-Tricks](../05-Reverse-Engineering/Anti-Debug-Tricks.md)

```python
import angr

proj = angr.Project('./binary')
state = proj.factory.entry_state(stdin=angr.SimFile('stdin', '\x00'*16))
sm = proj.factory.simulation_manager(state)
sm.explore(find=0x401234, avoid=[0x401300])

if sm.found:
    print(sm.found[0].posix.dumps(0))
```

---

## 🧩 Math / Logic Puzzles

### Number theory
- Modular arithmetic
- Discrete log
- Factorization
- Diophantine equations

### Graph theory
- Shortest path
- Hamiltonian / Eulerian
- Network flow

### Combinatorics
- Permutations / combinations
- Counting

### Tools
- **Sage**: sagecell.sagemath.org online
- **Python** with `sympy`
- **Wolfram Alpha**

---

## 🎮 Recreational

### Sudoku / N-queens
- Use z3 or backtracking

### QR Codes
- Reconstruct from corrupted
- Tools: zbar, qrtools (Python)

```python
from PIL import Image
import qrtools

qr = qrtools.QR()
qr.decode("qr.png")
print(qr.data)
```

### Barcodes
- Code 128, EAN, UPC
- Tools: zbarimg
```bash
zbarimg image.png
```

### ASCII Art
- Sometimes flag is in big ASCII art
- Try `figlet`, `cowsay`, font search

```bash
figlet "test"
```

### MIDI / Music
- Notes encode characters
- Tools: MuseScore, Audacity (MIDI plugins)

---

## 🎯 Weird File Formats

### Less common formats CTF use:
- **PCAP** with custom protocol
- **SQLite** databases (recovered or planted)
- **Wireshark capture file** (.pcapng)
- **VMDK / VHD** disk images
- **ROM** files (NES, GBA, etc.)
- **Save files** of games
- **Document with macros** (.docm, .xlsm)
- **Old formats**: WordPerfect, Lotus 1-2-3, etc.

### Tool: file
```bash
file mystery.bin
# Tells you what format (or "data" if unknown)
```

### Tool: TrID
- More signatures than `file`
- Best-guess approach

---

## 📜 Custom Encoding / Cipher

CTF ชอบสร้าง custom encoding ที่:
- Look like base64 but use different alphabet
- Variable-length encoding
- Bit-packing

### Approach
1. Frequency analysis
2. Identify charset
3. Try base64/32/16 variants
4. Try CyberChef "Magic"
5. Reverse manually

### Example
```
flag charset = "_!@#$%^&*()abc..."
encoded: "##@!_!" 
→ map back to indices in charset → bytes → flag
```

---

## 🎲 Dice / Random / RNG

### Predict random
- Java Random: predictable LCG
- Python random: Mersenne Twister (predictable with 624 outputs)
- C rand(): also LCG predictable

ดู [../04-Cryptography/Hash-Attacks#PRNG](../04-Cryptography/Hash-Attacks.md#prng)

### Tool: randcrack (Python)
```python
from randcrack import RandCrack
rc = RandCrack()
for n in known_outputs:
    rc.submit(n)
print(rc.predict_getrandbits(32))
```

---

## 🎨 Visual Puzzles

### QR-like grids
- Reconstruct from partial
- ASCII grids of `#` and `.`

### Image overlay
- 2 images XOR → reveal hidden
- Difference

### Color-encoded
- Each pixel = 1 character
- RGB triplets = ASCII

```python
from PIL import Image
img = Image.open("img.png")
pixels = list(img.getdata())
chars = [chr(p[0]) for p in pixels]
print(''.join(chars))
```

### Animated
- Each frame = 1 character → frame extract → string

---

## 🐢 Slow / Patience Challenges

- "Solve 1000 captchas" → automate with OCR
- "Send pi digits forever" → write client
- "Math problems streaming" → script + arithmetic

### Tool: pwntools makes this easy
```python
from pwn import *

io = remote('host', 1337)
while True:
    line = io.recvline()
    if b'?' in line:
        # Parse question
        a, b = parse(line)
        io.sendline(str(a + b).encode())
    if b'flag' in line:
        print(line)
        break
```

---

## 🎯 Workflow

```
1. file <evidence>
2. strings <evidence> | grep -i flag
3. xxd <evidence> | head/tail
4. binwalk <evidence>

5. ระบุประเภท:
   - Code/text → identify language
   - Image → forensics + stego
   - Audio → audio stego
   - Binary → reverse engineering
   - Encoded → decoder

6. หา clue ใน description / filename / hints

7. ลองหลายเทคนิคจาก vault: Misc มัก crossover
```

---

## 🎓 Practice

- **CryptoCTF Misc**
- **HackTheBox Misc**
- **picoCTF General Skills + Misc**
- **CodingBat / LeetCode**: programming chops
- **Project Euler**: math + programming puzzles

---

## 🔗 ที่เกี่ยวข้อง

- [VM-Reversing](VM-Reversing.md)
- [Reverse](../05-Reverse-Engineering/RE-Intro.md)
- [../04-Cryptography/Classical-Ciphers](../04-Cryptography/Classical-Ciphers.md)

## 📚 References

- esolangs.org: wiki of esoteric langs
- tio.run: try any language online
- dcode.fr: decoders
- Project Euler: math puzzles

---

#ctf #misc #esoteric #programming
