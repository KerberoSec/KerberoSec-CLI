## 🧠 HTB Crypto Challenge: BabyEncryption

-  **Category:** Crypto
- **Difficulty:** VERY EASY  
- **Tools Used:** `Python`,`Hex Viewer`
-  **Flag:** `HTB{l00k_47_y0u_r3v3rs1ng_3qu4710n5_c0ngr475}`
- **Platform:** Hack The Box  

---

### 📝 CHALLENGE DESCRIPTION

You are after an organised crime group which is responsible for the illegal weapon market in your country. As a secret agent, you have infiltrated the group enough to be included in meetings with clients. During the last negotiation, you found one of the confidential messages for the customer. It contains crucial information about the delivery. Do you think you can decrypt it?

---

### 📁 Challenge Files

```bash
BabyEncryption.zip
├── chall.py
└── msg.enc
```

---

### 🔍 Step-by-Step Writeup

#### 🔓 Unzipping the challenge archive

**Command:**

```bash
unzip BabyEncryption.zip
```

**Output:**

```
Archive:  BabyEncryption.zip
[BabyEncryption.zip] chall.py password:
  inflating: chall.py
  inflating: msg.enc
```

---

#### 🧠 Analyzing the encryption script

**Command:**

```bash
cat chall.py
```

**Output:**

```python
import string
from secret import MSG

def encryption(msg):
    ct = []
    for char in msg:
        ct.append((123 * char + 18) % 256)
    return bytes(ct)

ct = encryption(MSG)
f = open('./msg.enc','w')
f.write(ct.hex())
f.close()
```

**Observations:**

- The encryption function applies:
    
    ```python
    cipher = (123 * char + 18) % 256
    ```
    
- Result is hex-encoded and saved as `msg.enc`.
    

---

#### 🧾 Viewing the ciphertext

**Command:**

```bash
cat msg.enc
```

**Output:**

```
6e0a9372ec49a3f6930ed8723f9df6f6720ed8d89dc4937222ec7214d89d1e0e352ce0aa6ec82bf622227bb70e7fb7352249b7d893c493d8539dec8fb7935d490e7f9d22ec89b7a322ec8fd80e7f8921
```

---

#### 🔓 Decrypting the message

**Idea:** Reverse the formula:

```python
cipher = (123 * plain + 18) % 256
```

Since calculating a modular inverse under mod 256 is tricky, we brute-force all printable ASCII values.

**Command:**

```bash
nano Decrypt.py
```

**Content of `Decrypt.py`:**

```python
encrypted_txt = "6e0a9372ec49a3f6930ed8723f9df6f6720ed8d89dc4937222ec7214d89d1e0e352ce0aa6ec82bf622227bb70e7fb7352249b7d893c493d8539dec8fb7935d490e7f9d22ec89b7a322ec8fd80e7f8921"
result = ""

ct = bytes.fromhex(encrypted_txt)

for char in ct:
    for val in range(33, 126):
        if ((123 * val + 18) % 256) == char:
            result += chr(val)
            break

print(result)
```

---

#### ▶️ Running the decryption script

**Command:**

```bash
python3 Decrypt.py
```

**Output:**

```
Th3nucl34rw1ll4rr1v30nfr1d4y.HTB{l00k_47_y0u_r3v3rs1ng_3qu4710n5_c0ngr475}
```

---

### 🏁 Final Flag

```
HTB{l00k_47_y0u_r3v3rs1ng_3qu4710n5_c0ngr475}
```

---

### 🧰 Tools & Techniques Used

- Python scripting
    
- Hex decoding
    
- Modular arithmetic
    
- Brute-force on printable ASCII
    

---

### 🧾 Summary

The challenge used a simple linear encryption scheme applied to ASCII characters under mod 256. Since computing the inverse of 123 under mod 256 isn't trivial, we brute-forced each byte against all printable ASCII characters to recover the plaintext.

Once decrypted, the complete message and flag were revealed successfully.

---

### 🏷️ Tags

#htb #crypto #python #modular_arithmetic #reversing #writeup #bruteforce #obfuscation

---
[[Crypto]]