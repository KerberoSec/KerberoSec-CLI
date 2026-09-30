# 👨‍💻 HTB Challenge: The Last Dance Write-up

- **Category:** Crypto
    
- **Difficulty:** Very Easy
    
- **Flag:** `HTB{und3r57AnD1n9_57R3aM_C1PH3R5_15_51mPl3_a5_7Ha7}`
    
- **Tools Used:** `Python`, `os`, `Crypto.Cipher.ChaCha20`
    
- **Platform:** Hack The Box
    

---

## 📂 Step 1: Unzip the Archive

**Input:**

```bash
The Last Dance.zip
```

---

**Input:**

```bash
unzip The\ Last\ Dance.zip
```

**Output:**

```bash
Archive:  The Last Dance.zip
   creating: crypto_the_last_dance/
[The Last Dance.zip] crypto_the_last_dance/out.txt password: hackthebox
  inflating: crypto_the_last_dance/out.txt  
  inflating: crypto_the_last_dance/source.py
```

---

**Input:**

```bash
ls
```

**Output:**

```bash
crypto_the_last_dance  The Last Dance.zip
```

---

## 📁 Step 2: Navigate and Check Files

**Input:**

```bash
cd crypto_the_last_dance
ls
```

**Output:**

```bash
out.txt  source.py
```

---

## 🔍 Step 3: Inspect the Encrypted Data

**Input:**

```bash
cat out.txt
```

**Output:**

```bash
c4a66edfe80227b4fa24d431
7aa34395a258f5893e3db1822139b8c1f04cfab9d757b9b9cca57e1df33d093f07c7f06e06bb6293676f9060a838ea138b6bc9f20b08afeb73120506e2ce7b9b9dcd9e4a421584cfaba2481132dfbdf4216e98e3facec9ba199ca3a97641e9ca9782868d0222a1d7c0d3119b867edaf2e72e2a6f7d344df39a14edc39cb6f960944ddac2aaef324827c36cba67dcb76b22119b43881a3f1262752990
7d8273ceb459e4d4386df4e32e1aecc1aa7aaafda50cb982f6c62623cf6b29693d86b15457aa76ac7e2eef6cf814ae3a8d39c7
```

---

## 🔎 Step 4: Review the Source Code

**Input:**

```bash
cat source.py
```

**Output:**

```python
from Crypto.Cipher import ChaCha20
from secret import FLAG
import os

def encryptMessage(message, key, nonce):
    cipher = ChaCha20.new(key=key, nonce=iv)
    ciphertext = cipher.encrypt(message)
    return ciphertext

def writeData(data):
    with open("out.txt", "w") as f:
        f.write(data)

if __name__ == "__main__":
    message = b"Our counter agencies have intercepted your messages and a lot "
    message += b"of your agent's identities have been exposed. In a matter of "
    message += b"days all of them will be captured"

    key, iv = os.urandom(32), os.urandom(12)

    encrypted_message = encryptMessage(message, key, iv)
    encrypted_flag = encryptMessage(FLAG, key, iv)

    data = iv.hex() + "\n" + encrypted_message.hex() + "\n" + encrypted_flag.hex()
    writeData(data)
```

---

## 🧠 Step 5: Decrypt the Flag

We need to decrypt the flag by utilizing the known plaintext (message) and XORing the encrypted message with it.

**Input:**

```bash
nano Decrypt.py
```

**Output:**

```python
def hex_xor(hex1, hex2):
    min_length = min(len(hex1), len(hex2))
    bytes1 = bytes.fromhex(hex1[:min_length])
    bytes2 = bytes.fromhex(hex2[:min_length])
    xor_result = ''.join(f"{b1 ^ b2:02x}" for b1, b2 in zip(bytes1, bytes2))
    return xor_result

known_plaintext = b"Our counter agencies have intercepted your messages and a lot of your agent's identities have been exposed. In a matter of days all of them will be captured"
known_hex = known_plaintext.hex()

encrypted_message = "7aa34395a258f5893e3db1822139b8c1f04cfab9d757b9b9cca57e1df33d093f07c7f06e06bb6293676f9060a838ea138b6bc9f20b08afeb73120506e2ce7b9b9dcd9e4a421584cfaba2481132dfbdf4216e98e3facec9ba199ca3a97641e9ca9782868d0222a1d7c0d3119b867edaf2e72e2a6f7d344df39a14edc39cb6f960944ddac2aaef324827c36cba67dcb76b22119b43881a3f1262752990"
encrypted_message_part = encrypted_message[:len(known_hex)]

keystream = hex_xor(known_hex, encrypted_message_part)
print("Keystream:", keystream)

encrypted_flag = "7d8273ceb459e4d4386df4e32e1aecc1aa7aaafda50cb982f6c62623cf6b29693d86b15457aa76ac7e2eef6cf814ae3a8d39c7"
decrypted_flag_hex = hex_xor(keystream, encrypted_flag)

try:
    decrypted_flag = bytes.fromhex(decrypted_flag_hex).decode('utf-8')
    print("Decrypted Flag:", decrypted_flag)
except Exception as e:
    print("Error decoding the flag:", str(e))
    print("Decrypted Flag Hex:", decrypted_flag_hex)
```

---

**Input:**

```bash
python3 Decrypt.py
```

**Output:**

```bash
Keystream: 35d631b5c13780e74a58c3a2405eddaf93259fcaf73fd8cfa985177387587b5c62b7840b629b1bfc121db00dcd4b9972ec0ebad26a66cbcb1232696996ee14fdbdb4f13f3035e5a8cecc3c3641ffd4904400ec8a8ea7acc987a52cea4a5b73fbbcf10fa93c7434b1b09513fd3f572cda7fdcf8a40f521b6e2c589123c4fa6019a10b5db070273fe63eb7b4f6617074cf4
Decrypted Flag: HTB{und3r57AnD1n9_57R3aM_C1PH3R5_15_51mPl3_a5_7Ha7}
```

---

## 🏁 Final Flag

```
HTB{und3r57AnD1n9_57R3aM_C1PH3R5_15_51mPl3_a5_7Ha7}
```

---

## 🛠️ Tools Used

- `Python`
    
- `os`
    
- `Crypto.Cipher.ChaCha20`
    
- `nano` (for editing Python script)
    

---

## 📌 Summary

This was a simple Crypto challenge where we decrypted the flag by leveraging the ChaCha20 stream cipher and known plaintext. By XORing the encrypted message with the known plaintext, we were able to extract the keystream, which we then used to decrypt the flag.

---

## 🏷️ Tags

#Crypto #ChaCha20 #XOR #StreamCipher #HackTheBox #CTF

[[Crypto]]