# CTF Writeup: MD5 Hash Crack

## 1. Identify the MD5 Hash

**Hash to crack:**  
```
24bb5c555b8f32d27eaeec9c5522b576
```

We suspect this is a common word or phrase.

---

## 2. Use an Online Hash Cracking Database

A fast way (especially in a CTF) is to check online MD5 databases. Two popular examples:

1. **Crackstation:** [https://crackstation.net/](https://crackstation.net/)  
2. **Hashes.com:** [https://hashes.com/](https://hashes.com/)

Simply paste the MD5 hash into the search bar and click “Crack” or “Search.”

---

## 3. Observe the Result

Both Crackstation and Hashes.com return the same plaintext for this hash:

```
24bb5c555b8f32d27eaeec9c5522b576 → iloveyouall
```

---

## 4. Insert into Flag Format

The challenge requests we wrap the plaintext in the format `DDC{...}`, so the final answer is:

```
DDC{iloveyouall}
```

---

### Why This Works

- **MD5** is a one-way hashing function, so you cannot directly “reverse” it mathematically.
- However, common words or phrases (especially shorter ones) often appear in large public hash databases (like Crackstation). This approach is essentially a dictionary attack, where the service has precomputed (hash -> plaintext) pairs.

---

## 5. Simple & Fast Steps Overview

1. **Copy** the MD5 hash.
2. **Paste** into an online cracking tool.
3. **Obtain** the original string (`iloveyouall`).
4. **Wrap** it in the required format → `DDC{iloveyouall}`.

That’s all you need for a quick solve in most CTFs!
