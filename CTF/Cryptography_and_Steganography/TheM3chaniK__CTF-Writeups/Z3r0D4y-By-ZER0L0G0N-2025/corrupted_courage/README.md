# 🧩 Challenge: Corrupted Courage

**Category:** Forensics
**Points:** 150

---

### 🔖 **Challenge Description**

> Courage tried to protect the flag… but corruption got to him. Can you recover what he was hiding before Muriel screams again?

---

### 📎 **Attachments**

> `courage.png`

---

### 🧭 **Initial Observations**

* Opening the PNG shows pure darkness: nothing but void.
* Guess that’s why it’s called *Corrupted Courage*… looks like the poor dog got hexed.

---

🛠 **Environment & Tools**

* **OS:** I use Arch, btw 🧠
* **Tools:** `file`, `xxd`, `dd`
* **Assumption:** If I can fix this cursed image, maybe I can save Courage’s flag before he runs off screaming “THE THINGS I DO FOR LOVE!”

---

🔬 **Static Forensic Triage**

* File identification:

  ```bash
  $ file courage.png
  courage.png: data
  ```

  Yup, definitely cursed. Even the `file` command refuses to recognize it.

---

### ⚙️ **Artifact Recovery & Decoding Steps**

Time to take a look inside the spooky house (aka the hex dump).

```bash
$ xxd courage.png
```

Here’s what I found: the **magic bytes** look as broken as Courage’s nerves.

```bash
00000000: 8950 0047 0d0a 1a0a 0000 000d 4900 0052  .P.G........I..R
```

Normally, a healthy PNG starts like this:

```bash
89 50 4E 47 0D 0A 1A 0A   → PNG signature
00 00 00 0D 49 48 44 52   → IHDR chunk
```

But ours? Yeah, looks like it’s been through Eustace’s mallet.

```bash
00000000: 89 50 00 47 0D 0A 1A 0A   ❌PNG signature
00000008: 00 00 00 0D 49 00 00 52   ❌ Something’s off here, Courage!
```

Alright, time to perform pixel CPR. 🩺

```bash
$ cp courage.png fixed.png
$ printf '\x4E' | dd of=fixed.png bs=1 seek=2 count=1 conv=notrunc
$ printf '\x48' | dd of=fixed.png bs=1 seek=13 count=1 conv=notrunc
$ printf '\x44' | dd of=fixed.png bs=1 seek=14 count=1 conv=notrunc
```

And with that, the corruption is exorcised.
Muriel would be proud. Eustace? Still unimpressed. 😤

---

### 🔁 **Recovered Artifacts / Outputs**

* Fixed file: `fixed.png`
* Opening it, the brave little doggo rewards us with the flag:
  `zero{courage_the_brave_dog}` 🐾

---

### ✅ **Validation**

* File now opens normally.
* Image renders correctly.
* Courage no longer corrupted.

---

### 🏁 **Flag**

```
zero{courage_the_brave_dog}
```

---

### 💡 **Takeaways**

* Always check magic bytes before panicking.
* Even corrupted files can be *rescued with courage*.
* And remember: **“The things I do for flags…”** 🐶

---

**Solved by TheM3chanik: [contact@them3chanik.com](mailto:contact@them3chanik.com)**

---
