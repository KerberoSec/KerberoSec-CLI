# 🧩 Challenge: Halloween in Parts

**Category:** Forensics
**Points:** 300

---

🔖 **Challenge Description**

> The flag was chopped into fine little pieces and scattered around like leftover Halloween candy. Can you gather them all before midnight? 🎃

---

📎 **Attachments**

> [Halloween.txt](./Halloween.txt)

---

🧭 **Initial Observations**

Running `cat` shows nothing but… *emptiness.* Just a void of blank spaces staring back at me.
Then I tried:

```bash
cat Halloween.txt | less
```

Boom: found something at the top:

> “Here is the beginning! Part1: `zero{4_`”

After that, a suspiciously huge amount of whitespace. 👻

“Wait a minute…” I thought. “What if this isn’t empty space, but **whitespace language** code hiding data?”
Before feeding it to a decoder, I trimmed off the visible text to avoid parser tantrums. Sadly, the decoder still failed: maybe the hidden data isn’t pure whitespace language but **binary disguised as spaces**.

---

🛠 **Environment & Tools**

* **OS:** I use Arch, btw 😎
* **Tools:** `python3`, `exiftool`, `file`, `zsteg`
* **Assumption:** The whitespace section is actually encoded binary, not a script in whitespace.

---

🔬 **Static Forensic Triage**

No readable data, suspicious blank areas, possible encoded payload.
Let’s dig deeper before the ghosts of bad encoders rise again. 👀

---

### ⚙️ **Artifact Recovery & Decoding Steps**

To decode the mysterious “invisible” data, I made a custom Python script: `decode_whitespace.py`.

Here’s how it works:

```text
| Step | What Happens           | Example Output     |
| ---- | ---------------------- | ------------------ |
| 1    | Load Halloween.txt     | raw bytes          |
| 2    | Find marker            | hidden data starts |
| 3    | Extract spaces/tabs    | 100110011010       |
| 4    | Convert bits → bytes   | 0x89 0x50 0x4E ... |
| 5    | Save binary            | decoded.bin        |
| 6    | Detect file type       | PNG / JPG / ZIP    |
| 7    | Save final file        | decoded.png        |
```

Running it:

```bash
$ python3 decode_whitespace.py
Length of whitespace section: 144016
Saved decoded data to decoded.bin (18002 bytes)
Possible output file: decoded.jpg
```

Checking the file type:

```bash
$ file decoded.bin
decoded.bin: JPEG image data, JFIF standard 1.01, resolution (DPI), density 120x120, segment length 16, comment: "Part3:_fl4g_in", baseline, precision 8, 299x168, components 3
```

Oh look! Not only is it a JPEG, it also leaks **Part3:** `_fl4g_in`.

Opening the image revealed another surprise: **Part2:** `really_long`.

Now we have three spooky candy pieces:

* Part1: `zero{4_`
* Part2: `really_long`
* Part3: `_fl4g_in`

---

Next, I tried `steghide`, because if something screams “hidden trick,” it’s stego.

```bash
$ steghide extract -sf decoded.bin
Enter passphrase:
wrote extracted data to "flag.txt".
```

Thankfully, no password this time (thanks, benevolent Halloween spirits).

The extracted [flag.txt](./flag.txt) said:

```text
Good Going !!
Your next destination is : https://privatebin.net/?7608b26a6c6455f8#8cAK4DRmX59WVkGocnbfrqE2bA6vUY1xPgkR6bdGRUXp
```

I followed the spooky URL, found a long base64 blob, downloaded it, and decoded it:

```bash
$ cat document-7608b26a6c6455f8.txt | base64 -d
PNG

IHDR'0tEXtCommentPart5:_f0r_youeIDATx{t\u~
@J,Ebl4G܎7:I<$fV{:t=+ȺikclmeÈRaM        PDQ P P w9쳿s
......
```

It’s binary again: this time, a PNG file. Dumping it into `dump.png`:

Opening the file revealed **Part4:** `_six_p4rts`.

Then I checked its metadata with `exiftool`:

```bash
$ exiftool dump.png
...
Comment : Part5:_f0r_you
...
```

Nice: now we have **Part5!**

Finally, the ultimate test: `zsteg`. Because who knows what other monsters lurk in those pixels…

```bash
$ zsteg dump.png
meta Comment        .. text: "Part5:_f0r_you"
b1,r,lsb,xy         .. text: "Part6:_t0_find}"
...
```

There it is: **Part6:** `_t0_find}`

---

### 🔁 **Recovered Artifacts / Outputs**

So far, we’ve unearthed all six haunted parts:

* Part1: `zero{4_`
* Part2: `really_long`
* Part3: `_fl4g_in`
* Part4: `_six_p4rts`
* Part5: `_f0r_you`
* Part6: `_t0_find}`

Combining them like Frankenstein assembling his monster:

```
zero{4_really_long_fl4g_in_six_p4rts_f0r_you_t0_find}
```

🎃 Boo-yah. The full flag lives!

---

### ✅ **Validation**

* File recovery confirmed.
* Stego extraction verified.
* Metadata & zsteg checks validated all flag parts.

---

### 🏁 **Flag**

```
zero{4_really_long_fl4g_in_six_p4rts_f0r_you_t0_find}
```

---

### 💡 **Takeaways**

* Whitespace isn’t always empty: sometimes it’s whispering secrets. 👻
* Always check metadata *and* pixel-level stego.
* When a file looks empty on Halloween night… it’s *definitely* hiding something evil.

---

**Solved by TheM3chanik: [contact@them3chanik.com](mailto:contact@them3chanik.com)**

---
