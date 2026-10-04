![header](https://capsule-render.vercel.app/api?type=blur&height=300&color=gradient&customColorList=0,2,2,8,30&text=Order-TryHackMe&fontAlign=50&rotate=0&fontAlignY=50&textBg=false&animation=twinkling)

<div><p align="left"> <img src="https://komarev.com/ghpvc/?username=sadbattery&label=PageViews:"/></p></div>

# 🔐 Order: TryHackMe | Walkthrough & Flag Extraction

While solving a CTF-style puzzle, I came across a suspicious-looking string:

```
1a0d0c302d3b2b1a292a3a38282c2f222d2a112d282c31202d2d2e24352e60
```

I ran this through [CrackStation](https://crackstation.net/) and it identified the string as **Hex encoded**.

---

## 🔁 Attempting Repeating-Key XOR Decryption

I suspected this could be **repeating-key XOR**, so I tried using the word `sneaky` as a key (based on some earlier clues). It did give me partial readable output.

Using `sneaky` as the key for the above hex string, I got:

```
THE FLAG IS NOT HERE KEEP LOOKING
```

At this point, I realized there’s **another hex string** to decrypt. So I moved on.

---

## 🧩 The Second Hex String

This is the second hex-encoded string I had:

```
1c1c01041963730f31352a3a386e24356b3d32392b6f6b0d323c22243f6373
```

When decrypted using the same method with key `sneaky`, the output was:

```
ORDER: give me the flag now or face the consequences
```

This created confusion: where's the **actual flag**?

---

## 🔍 Deep Dive with Raw Hex and ASCII View

I dumped the raw hex data with an ASCII view:

```
69 63 69 51 46 42 58 74 4c 4b 51 41 5b 42 4a 43  | iciQFBXtLKQA[BJC
46 53 62 43 4d 4d 5a 59 5e 43 4b 45 5e 57 13 6f  | FSbCMMZY^CKE^W.o
72 64 65 72 1a 00 61 54 54 41 43 4b 00 41 54 00  | rder..aTTACK.AT.
44 41 57 4e 0e 00 74 41 52 47 45 54 1a 00        | DAWN..tARGET..
```

That’s when things clicked: I saw fragments like:

```
ATTACK.AT.DAWN
TARGET
```

I realized the full message is likely encrypted with a **repeating-key XOR cipher** and needs a smarter way to decode.

---

## 🧠 Writing the Decryption Script (with GPT’s Help)

So I wrote the following Python script to automate the XOR decryption using a known plaintext attack:

```python
def xor_decrypt(hex_data, known_plaintext, show_key=True):
    """
    Decrypts a repeating-key XOR cipher using known-plaintext attack.
    """
    # Clean and convert hex string to bytes
    hex_data = hex_data.replace(" ", "").replace("\n", "")
    cipher_bytes = bytes.fromhex(hex_data)

    # Convert known plaintext to bytes
    known_bytes = known_plaintext.encode()

    # Recover repeating XOR key from known plaintext
    key = bytes([c ^ p for c, p in zip(cipher_bytes[:len(known_bytes)], known_bytes)])

    # Optional: show recovered key
    if show_key:
        key_str = ''.join(chr(k) if 32 <= k <= 126 else '.' for k in key)
        print(f"[+] Recovered XOR Key: {key_str}")

    # Decrypt entire message using repeating key
    decrypted = bytes([b ^ key[i % len(key)] for i, b in enumerate(cipher_bytes)])
    
    # Return decoded string (non-decodable chars will be replaced)
    return decrypted.decode(errors='replace')

# === Example Usage ===

hex_message = """
1c1c01041963730f31352a3a386e24356b3d32392b6f6b0d323c22243f6373
1a0d0c302d3b2b1a292a3a38282c2f222d2a112d282c31202d2d2e24352e60
"""

known_plaintext = "ORDER:"  # We know the message starts with this

# Run the decryption
plaintext = xor_decrypt(hex_message, known_plaintext)
print("\n[+] Decrypted Message:\n", plaintext)
```

---

## 🏁 Final Output

Running this script gave me:

```
[+] Recovered XOR Key: SNEAKY

[+] Decrypted Message:
ORDER: Attack at dawn. Target: THM{the_hackfinity_highschool}
```

And just like that, the flag was **recovered successfully**!

```
THM{the_hackfinity_highschool}
```

---

## ✅ Key Takeaways

- CrackStation is useful for identifying encoding.
- Repeating-Key XOR requires either brute force or a known-plaintext attack.
- If you can guess the starting structure of a message (like `ORDER:`), you can use that to recover the key.
- Don't ignore the format of the data: ASCII views can reveal hidden gems.

---

Feel free to use this script in your own CTF adventures. Happy hacking! 🔓
