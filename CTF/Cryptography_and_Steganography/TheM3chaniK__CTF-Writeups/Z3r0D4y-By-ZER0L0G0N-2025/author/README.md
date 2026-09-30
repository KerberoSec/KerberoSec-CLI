# 🧩 Challenge: Author

**Category:** Forensics
**Points:** 100

---

### 🔖 **Challenge Description**

Can you find out about the author of this pdf?

---

### 📎 **Attachments**

> `chall.pdf`

---

### 🧭 **Initial Observations**

* Ouh I have to find the author of the pdf, definately I have to check the metadata

---

### 🛠 **Environment & Tools**

* OS: I use Arch Btw
* Tools: exiftool
* Assumptions: Find the author from the metadata

---

### 📂 **Evidence Inventory (what we actually have)**

* I got a `chall.pdf` pdf file, opening it at the last line I found `Authored by: *********`

---

### ⚙️ **Artifact Recovery & Decoding Steps**

* Step 1: Find the metadata
  * I use my best forensic tool to extract metadata. Do you know what is that?
  ......drumrollll its none other than `exiftool`

      ```bash
      $ exiftool chall.pdf
      ExifTool Version Number         : 13.36
      File Name                       : chall.pdf
      Directory                       : .
      File Size                       : 6.3 kB
      File Modification Date/Time     : 2025:11:01 23:45:29+05:30
      File Access Date/Time           : 2025:11:01 23:45:49+05:30
      File Inode Change Date/Time     : 2025:11:01 23:45:49+05:30
      File Permissions                : -rw-------
      File Type                       : PDF
      File Type Extension             : pdf
      MIME Type                       : application/pdf
      PDF Version                     : 1.4
      Linearized                      : No
      Create Date                     : 2025:10:30 10:15:09+00:00
      Creator                         : (unspecified)
      Modify Date                     : 2025:10:30 10:15:09+00:00
      Producer                        : ReportLab PDF Library - www.reportlab.com
      Subject                         : (unspecified)
      Trapped                         : False
      Page Mode                       : UseNone
      Page Count                      : 1
      XMP Toolkit                     : Image::ExifTool 13.25
      Title                           : Hello Peter
      Author                          : emVyb3tmb3VuZF95b3VfbXJfYXV0aG9yfQ=
      ```

* Step 2: Decoding the author
    * The `Author` field looks like base64: sneaky little author. Decode it properly :

      ```bash
      $ echo "emVyb3tmb3VuZF95b3VfbXJfYXV0aG9yfQ=" | base64 -d
      zero{found_you_mr_author}base64: invalid input
      ```

    * Result: `zero{found_you_mr_author}`: author found, dignity intact (mostly).

---

### 🔁 **Recovered Artifacts / Outputs**

* `chall.pdf`: original evidence file.
* `exiftool` output text (metadata dump) showing the `Author` field value.
* Decoded author string saved / reproduced via:

  ```bash
  echo "emVyb3tmb3VuZF95b3VfbXJfYXV0aG9yfQ=" | base64 -d
  zero{found_you_mr_author}base64: invalid input

  ```
* No other hidden payloads detected in metadata fields during quick triage.

---

### ✅ **Validation**

* The `Author` metadata explicitly contained a base64 string which decodes cleanly to the flag format `zero{...}`.
---

### 🏁 **Flag**

```
zero{found_you_mr_author}
```

---

### 💡 **Takeaways**

* Metadata is lazy and honest: people hide secrets there when they want to feel clever. Check it first. 🕵️‍♂️

---

**Solved by TheM3chanik: [contact@them3chanik.com](mailto:contact@them3chanik.com)**

