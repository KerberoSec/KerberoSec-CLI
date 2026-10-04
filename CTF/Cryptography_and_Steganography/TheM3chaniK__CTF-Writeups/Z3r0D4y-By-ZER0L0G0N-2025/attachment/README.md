# 🧩 Challenge: Attachment

**Category:** General

**Points:** 100

---

### 🔖 Challenge Description

> Well Wishes

### Attachemnts
> [pumpkin.eml](./pumpkin.eml)

---

### 🧭 Initial Reconnaissance (aka "open the spooky mail")

- **Step 1**: I downloaded the [pumpkin.eml](./pumpkin.eml) file which is given in the challenge.
- **Step 2: Inspect EML:** You can read the eml file manually but who will do the hard work. So I used EML viewer [https://www.emlreader.com/](https://www.emlreader.com/) to render headers and attachments safely.
- **Step 3: Note metadata:** Email shows:
  - **Subject:** Flag where?
  - **To:** [flag@zerologon.co.in](mailto:flag@zerologon.co.in)
  - **From:** [amrik@zerologon.co.in](mailto:amrik@zerologon.co.in)
  - **Body:** "Stop sending me spooky images and give me the flag already."
  - **Attachment:** `flag.jpeg`

---

### 🔍 Analysis & Enumeration (a.k.a. "don’t trust unknown attachments, but flags love them")

- **Observation:** `pumpkin.eml` is a standard EML with an inline attachment reference to `flag.jpeg` an image file.
- **Hypothesis:** The attached JPEG likely contains the flag as visible text.
- **Tools:** So I download the extracted attachment from EML reader and open into the local image viewer to inspect `flag.jpeg`.
  You can see the image underneath

.

- Gotha. Find the flag.

---

### ⚙️ Exploitation Process (extract, open, celebrate)

1. **Approach:** Extract or download the `flag.jpeg` from the rendered EML and open it.
2. **Execution:** Use the EML reader to access attachments → save/open `flag.jpeg` with an image viewer.
3. **Confirmation:** The image displays the flag in plain text.

```text
# Files involved (anchored)
./pumpkin.eml
./flag.jpeg
```

---

### 💻 Code / Script Used

No custom code: just an EML renderer and an image viewer.

---

### 🏁 Flag

```
zero{happy_halloween}
```

---

### 💡 Takeaways (aka "lessons from the haunted inbox")

- EML files frequently hide attachments; always check MIME parts and attachments.
- Use web or local EML viewers to avoid manual MIME parsing.
- When in doubt, open the attachment in a sandboxed viewer: flags love images.

---

**Solved by TheM3chanik: [contact@them3chanik.com](mailto:contact@them3chanik.com)**
