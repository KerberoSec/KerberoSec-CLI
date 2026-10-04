# ❌⭕ Cheating: CTF Writeup

<p align="center">
  <img src="https://img.shields.io/badge/Category-Reverse Engineering-blue?style=for-the-badge">
  <img src="https://img.shields.io/badge/Difficulty-Medium-orange?style=for-the-badge">
  <img src="https://img.shields.io/badge/Concept-Code%20Review%20%7C%20Game%20Logic-red?style=for-the-badge">
</p>

---

## 🧠 Challenge Description

> *Kisne kaha cheat hum nhi kr sakte ...*

---

## 🎮 How the Game Works

Board values:

| Value | Meaning |
|-------|---------|
| `'3'` | Empty cell |
| `0`   | Player (X) |
| `1`   | Computer (O) |

**The computer logic:**
- `imp` → important cells (blocking/winning moves)
- `p` → available moves

If you win → `end_game("Player")` → server contacted → **flag shown**.

---

## 🔎 Bug Analysis

### 🐞 Bug 1: Broken Move Filter

**Original code:**
```python
if b[i][j] == '3' and b[i][j] not in imp:
    p.append([i,j])
```

**❌ Problem:**
- `b[i][j]` is a **string** `'3'`
- `imp` contains **lists** like `[i, j]`
- So `'3' not in imp` is **always `True`**

**Result:** The AI does **NOT** properly avoid dangerous cells.

**✅ Correct version:**
```python
if b[i][j] == '3' and [i,j] not in imp:
```

Because of this bug, the computer doesn't block correctly.

---

### 🐞 Bug 2: Diagonal Condition Redundancy

The diagonal win conditions for the computer are **duplicated**.  
While messy, the key takeaway:

> **Player win detection works properly.**

So if you manage 3 in a row → **you win**.

---

## 🏆 Winning Strategy

Because the AI fails to block properly, a simple corner strategy works.

### ✅ Reliable Winning Sequence

1. Click **Top-Left** `(0,0)`
2. Let AI respond
3. Click **Top-Right** `(0,2)`
4. Click **Top-Middle** `(0,1)`

This forms:
```
X  X  X
O  ?  ?
?  ?  ?
```

Top row completed → **Player wins** → Flag triggered.

> Any basic 3-in-a-row works due to the broken defensive logic.

---

## 🌐 About the Server

The flag is fetched from:
```
http://172.23.1.105:5000/verify
```

This is a **local CTF infrastructure IP**.

To retrieve the real flag:
- You must be connected to the **same CTF network**
- Otherwise, the verification request will fail

---

## 🚩 Final Flag

```
cyros{M@yb3_4he_r3@!_tr3@5ur3_w@$_th3_bug$_w3_m@d3_@l0ng_4h3_w@y}
```

> *"Maybe the real treasure was the bugs we made along the way"* 🐛

---

## 🧩 Key Takeaways

- Logic bugs can completely break AI strategy
- Data type mismatches cause **silent failures**
- Code review is powerful in CTF challenges
- Client-side games can often be exploited

---

## 🛠 Skills Used

| Skill | Description |
|-------|-------------|
| 🔍 Code Review | Reading and understanding Python game logic |
| 🧠 Logic Analysis | Identifying type mismatch bugs |
| 💥 Bug Exploitation | Leveraging broken AI defense |
| 🎮 Game Strategy | Finding the optimal winning move sequence |
