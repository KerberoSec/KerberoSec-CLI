# 🧠 Silent Whispers II: Steganography Writeup

**Category:** Steganography  
**Difficulty:** Medium  
**CTF:** Ecowas CTF  

---

## 📜 Description

We intercepted a suspicious message that appears normal at first glance. However, given past incidents, we suspect a hidden payload lies beneath the surface. The challenge requires us to "dig deeper" into the file's structure.

---

## 📂 Initial Analysis

We start by examining the provided text file `information_II.txt`.

```bash
file information_II.txt
cat information_II.txt
```

### Observations

- **Content:** A standard email from "Kwame Appiah" regarding meeting notes.
- **Visuals:** The file contains a massive amount of empty space at the end and between lines.
- **Hypothesis:** This is a classic case of **Whitespace Steganography**, where data is hidden using spaces and tabs.

---

## 🔓 Step 1: Revealing Hidden Characters

To confirm the presence of hidden data, we use `cat` with the `-A` flag to show non-printing characters.

```bash
cat -A information_II.txt
```

**Output Snippet:**
```text
Hi,^I      ^I        ^I  ^I ^I ^I  ^I^I  ^I $
   ^I   ^I   ^I      ^I      ^I      ^I   ^I   ^I      ^I    $
Attached are the meeting notes from last week.        ^I^I     ^I    $
```

- `^I` represents a **Tab**.
- ` ` represents a **Space**.
- `$` represents the **End of Line**.

The erratic mix of tabs and spaces confirms that a tool was used to inject data into the whitespace.

---

## 🧪 Step 2: Extraction

We use **stegsnow**, a specialized tool for hiding and extracting data from whitespace.

```bash
stegsnow -C information_II.txt
```

**Output:**
```text
UEsDBBQACQAIAIkGc1wipgyPIgAAABcAAAAIABwAZmxhZy50eHRVVAkAA8FIu2nBSLtpdXgLAAEE
6AMAAAToAwAAbys1ZQCkHajeMPRRt6JPLXcjBD7UvCtBkyOBMvdkdkVnt1BLBwgipgyPIgAAABcA
AABQSwECHgMUAAkACACJBnNcIqYMjyIAAAAXAAAACAAYAAAAAAABAAAAtIEAAAAAZmxhZy50eHRV
VAUAA8FIu2l1eAsAAQToAwAABOgDAABQSwUGAAAAAAEAAQBOAAAAdAAAAAAA
```

### Observation
The extracted string starts with `UEsDBB`. In the world of CTFs, this is the **Base64 signature for a ZIP file header**.

---

## 🛠️ Step 3: Decoding the Payload

We need to convert the Base64 string back into a binary ZIP archive.

```bash
echo "UEsDBB...[TRUNCATED]...AAAAAA" | base64 -d > secret.zip
file secret.zip
```

**Output:**
`secret.zip: Zip archive data, at least v2.0 to extract`

---

## 🔑 Step 4: Cracking the Archive

Attempting to unzip the file reveals it is password-protected.

```bash
unzip secret.zip
# [secret.zip] flag.txt password: 
```

Since no password was provided in the challenge description, we use **John the Ripper** with the `rockyou.txt` wordlist to perform a dictionary attack.

```bash
zip2john secret.zip > zip_hash
john --wordlist=/usr/share/wordlists/rockyou.txt zip_hash
```

**Cracking Result:**
`stealth123       (secret.zip/flag.txt)`

---

## 🎯 Step 5: Final Extraction

With the password `stealth123`, we can now extract the content of the archive.

```bash
unzip secret.zip
# Entering password: stealth123
cat flag.txt
```

---

## 🏁 Final Flag

```text
flag{l@y37s_0n_l@y3rs}
```

---

## 🧠 Key Takeaways

- **Visual Inspection:** Always check for trailing whitespace in text-based challenges.
- **Magic Numbers:** Recognizing `UEsDBB` as a ZIP file (Base64) saves significant time.
- **Layered Security:** Challenges often combine multiple techniques (Steganography + Encoding + Encryption).
- **Automation:** Tools like `stegsnow` and `john` are essential for efficient CTF solving.
